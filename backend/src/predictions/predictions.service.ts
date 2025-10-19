import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { PythonShell } from 'python-shell';
import * as path from 'path';
import { PredictRequestDto } from './dto/predict-request.dto';
import { Race } from '../races/races.entity';
import { RaceResult } from '../race-results/race-results.entity';
import { DriverStandingMaterialized } from '../standings/driver-standings-materialized.entity';
import { ConstructorEntity } from '../constructors/constructors.entity';

@Injectable()
export class PredictionsService {
  private readonly logger = new Logger(PredictionsService.name);

  constructor(
    @InjectRepository(Race)
    private readonly raceRepository: Repository<Race>,
    @InjectRepository(RaceResult)
    private readonly raceResultRepository: Repository<RaceResult>,
    @InjectRepository(DriverStandingMaterialized)
    private readonly driverStandingsRepository: Repository<DriverStandingMaterialized>,
    @InjectRepository(ConstructorEntity)
    private readonly constructorRepository: Repository<ConstructorEntity>,
  ) {}

  /**
   * @deprecated Legacy POST endpoint. Use GET /predictions/:raceId.
   */
  async getPredictions(predictRequestDto: PredictRequestDto) {
    const { drivers } = predictRequestDto;
    if (drivers.length === 0) return [];

    // FIX: Map to the list structure the Python script expects
    const featuresList = drivers.map((d) => ({
      driver_id: parseInt(d.driverId), // Ensure driverId is a number
      ...d.features,
    }));

    const options = {
      mode: 'text' as const,
      scriptPath: path.join(__dirname, '../../ml-scripts'),
      pythonPath: path.join(__dirname, '../../ml-scripts/venv/bin/python3'),
    };

    try {
      const scriptArgs = [JSON.stringify(featuresList)];
      const results = await PythonShell.run('run_prediction.py', {
        ...options,
        args: scriptArgs,
      });
      const parsed = JSON.parse(results[0]);

      if (!parsed.success) {
        throw new Error(parsed.error);
      }
      return parsed.predictions;
    } catch (err: any) {
      this.logger.error(
        `Error executing Python script (legacy): ${err.message}`,
        err.stack,
      );
      throw new InternalServerErrorException(
        `Failed to make predictions: ${err.message}`,
      );
    }
  }

  // --- PRIMARY METHOD ---
  async getPredictionsByRaceId(raceId: number) {
    const startTime = Date.now();
    this.logger.log(`[PIPELINE] Prediction requested for race ID: ${raceId}`);

    // --- STEP 1: Find the *actual* next race ---
    const step1Start = Date.now();
    const nextRace = await this.raceRepository.findOne({
      where: { date: MoreThan(new Date()) },
      order: { date: 'ASC' },
      relations: ['season', 'circuit'],
    });
    this.logger.log(`⏱️ [STEP 1] Completed in ${Date.now() - step1Start}ms`);

    if (!nextRace) {
      this.logger.error('[STEP 1] No upcoming races found on the calendar.');
      throw new NotFoundException('No upcoming races found on the calendar.');
    }

    // Check if season was loaded
    if (!nextRace.season) {
      throw new InternalServerErrorException(`Race ${nextRace.id} is missing its season relation.`);
    }

    // --- STEP 2: Validate the user's request ---
    if (nextRace.id !== raceId) {
      this.logger.warn(
        `[STEP 2] Bad request. Requested ID ${raceId} is not the next race (ID: ${nextRace.id})`,
      );
      throw new BadRequestException(
        `Predictions are only available for the next upcoming race: ${nextRace.name} (ID: ${nextRace.id}).`,
      );
    }

    const race = nextRace;
    this.logger.log(
      `[STEP 2] Request validated. Generating predictions for: ${race.name}, Season Year: ${race.season.year}`,
    );

    try {
      // --- STEP 3: Get driver list from 'driver_standings_materialized' ---
      const step3Start = Date.now();
      this.logger.log(
        `[STEP 3] Fetching driver lineup from driver_standings_materialized for season year ${race.season.year}...`,
      );
      const participatingDrivers = await this.driverStandingsRepository.find({
        where: { seasonYear: race.season.year },
      });
      this.logger.log(`⏱️ [STEP 3] Query completed in ${Date.now() - step3Start}ms`);

      if (!participatingDrivers || participatingDrivers.length === 0) {
        throw new NotFoundException(
          `No drivers found in driver_standings_materialized for season year ${race.season.year}.`,
        );
      }
      this.logger.log(
        `[STEP 3] Found ${participatingDrivers.length} drivers for the season.`,
      );

      // --- STEP 3.5: Fetch Constructors for ID matching ---
      const step3_5Start = Date.now();
      const constructors = await this.constructorRepository.find();
      this.logger.log(
        `[STEP 3.5] Fetched ${constructors.length} constructors for name matching.`,
      );
      this.logger.log(`⏱️ [STEP 3.5] Completed in ${Date.now() - step3_5Start}ms`);

      // --- STEP 4: Calculate features using the DB function (BATCHED) ---
      const step4Start = Date.now();
      this.logger.log(
        `[STEP 4] Calculating features for ${participatingDrivers.length} drivers using get_driver_ml_features()...`,
      );
      const driversFeatureData: any[] = [];
      const batchSize = 5; // Process 5 drivers at a time to avoid connection pool exhaustion

      for (let i = 0; i < participatingDrivers.length; i += batchSize) {
        const batch = participatingDrivers.slice(i, i + batchSize);
        this.logger.log(
          `[STEP 4] Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(participatingDrivers.length / batchSize)} (${batch.length} drivers)`,
        );

        const batchResults = await Promise.all(
          batch.map(async (driverInfo, batchIndex) => {
            const globalIndex = i + batchIndex;
            const driverStart = Date.now();
            this.logger.log(`⏱️ [STEP 4.${globalIndex + 1}] Processing driver ${driverInfo.driverId}...`);

            // Find the constructor ID from the name
            const constructor = constructors.find(
              (c) => c.name === driverInfo.constructorName,
            );
            if (!constructor) {
              this.logger.warn(
                `Could not find constructor ID for name: ${driverInfo.constructorName}`,
              );
            }
            const constructorId = constructor ? constructor.id : null;

            // Pass driverId, raceId, AND constructorId
            const queryResult = await this.raceResultRepository.query(
              'SELECT get_driver_ml_features($1, $2, $3) as features',
              [driverInfo.driverId, race.id, constructorId], // Pass 3 args
            );

            const features = queryResult[0].features;

            // --- MODIFIED ERROR CHECK ---
            if (features.error) {
              // Log the full error object from SQL
              this.logger.error(
                `SQL Function Error for driver ${driverInfo.driverId}: ${JSON.stringify(features)}`, // Log stringified object
              );
              // Throw using the main error message
              throw new InternalServerErrorException(
                `Failed to calculate features: ${features.error} (Details in logs)`,
              );
            }
            // ---------------------------

            this.logger.log(`⏱️ [STEP 4.${globalIndex + 1}] Driver ${driverInfo.driverId} completed in ${Date.now() - driverStart}ms`);

            return {
              driver_id: driverInfo.driverId,
              ...features,
            };
          }),
        );

        driversFeatureData.push(...batchResults);
      }
      this.logger.log(`✅ [STEP 4] Feature calculation complete. Total time: ${Date.now() - step4Start}ms`);
      this.logger.log(
        `📊 Data being sent to Python script: ${JSON.stringify(
          driversFeatureData,
          null,
          2,
        )}`,
      );

      // --- STEP 5: Call Python script ---
      const options = {
        mode: 'text' as const,
        scriptPath: path.join(__dirname, '../../ml-scripts'),
        pythonPath: path.join(__dirname, '../../ml-scripts/venv/bin/python3'),
      };
      const scriptArgs = [JSON.stringify(driversFeatureData)];
      const step5Start = Date.now();
      this.logger.log('🐍 [STEP 5] Executing Python prediction script...');
      
      try {
        const results = await PythonShell.run('run_prediction.py', {
          ...options,
          args: scriptArgs,
        });
        
      this.logger.log(`📥 Raw result from Python script: ${JSON.stringify(results)}`);
        this.logger.log(`⏱️ [STEP 5] Python script completed in ${Date.now() - step5Start}ms`);

      const resultJson = JSON.parse(results[0]);
      if (!resultJson.success) {
          throw new InternalServerErrorException(
            `Python script execution failed: ${
              resultJson.error || 'Unknown error'
            }`,
          );
        }
        this.logger.log(`✅ [STEP 5] Predictions generated successfully.`);

        // --- STEP 6: Enrich with names and return ---
        const enrichedResults = resultJson.predictions.map((pred: any) => {
          const driverInfo = participatingDrivers.find(
            (r) => r.driverId === pred.driver_id,
          );
          return {
            driverId: pred.driver_id,
            driverName: driverInfo?.driverFullName || 'Unknown',
            constructorName: driverInfo?.constructorName || 'Unknown',
            podiumProbability: pred.podium_probability,
          };
        });

        this.logger.log(`🎉 [COMPLETE] Total pipeline execution time: ${Date.now() - startTime}ms`);
      return { raceId, raceName: race.name, predictions: enrichedResults };

      } catch (err: any) {
        // --- THIS IS THE NEW LOGGING ---
        this.logger.error(`❌ PythonShell failed. Error: ${err.message}`);
        if (err.stderr) {
          this.logger.error(`🐍 Python stderr: ${err.stderr}`);
        }
        throw new InternalServerErrorException(
          `Failed to run prediction script: ${err.message}`,
        );
      }
    } catch (err: any) {
      this.logger.error(
        `❌ Error in getPredictionsByRaceId: ${err.message}`,
        err.stack,
      );
      if (err instanceof NotFoundException || err instanceof BadRequestException) {
        throw err;
      }
      throw new InternalServerErrorException(
        `Failed to generate predictions for race ${raceId}: ${err.message}`,
      );
    }
  }
}