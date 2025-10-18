import { Injectable, InternalServerErrorException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PythonShell } from 'python-shell';
import * as path from 'path';
import { PredictRequestDto } from './dto/predict-request.dto';
import { Race } from '../races/races.entity';
import { Session } from '../sessions/sessions.entity';
import { RaceResult } from '../race-results/race-results.entity';
import { Driver } from '../drivers/drivers.entity';
import { ConstructorEntity } from '../constructors/constructors.entity';

@Injectable()
export class PredictionsService {
  private readonly logger = new Logger(PredictionsService.name);

  constructor(
    @InjectRepository(Race)
    private readonly raceRepository: Repository<Race>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(RaceResult)
    private readonly raceResultRepository: Repository<RaceResult>,
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
    @InjectRepository(ConstructorEntity)
    private readonly constructorRepository: Repository<ConstructorEntity>,
  ) {}

  // Legacy POST endpoint support
  async getPredictions(predictRequestDto: PredictRequestDto) {
    const { drivers } = predictRequestDto;
    const options = {
      mode: 'text' as const,
      scriptPath: path.join(__dirname, '../../src/ml-scripts'),
      pythonPath: path.join(__dirname, '../../src/ml-scripts/venv/bin/python3'),
    };
    try {
      const predictionPromises = drivers.map((driver) => {
        const scriptArgs = [JSON.stringify(driver.features)];
        return PythonShell.run('run_prediction.py', { ...options, args: scriptArgs });
      });
      const results = await Promise.all(predictionPromises);
      const parsed = results.map((r) => JSON.parse(r[0]));
      return drivers.map((driver, index) => ({
        driverId: driver.driverId,
        prediction: parsed[index],
      }));
    } catch (err: any) {
      this.logger.error(`Error executing Python script (legacy): ${err.message}`, err.stack);
      throw new InternalServerErrorException(`Failed to make predictions: ${err.message}`);
    }
  }

  // New GET /predictions/:raceId endpoint
  async getPredictionsByRaceId(raceId: number) {
    this.logger.log(`[PIPELINE] Starting predictions for race ID: ${raceId}`);
    try {
      // 1. Fetch race
      this.logger.log('[STEP 1] Fetching race...');
      const race = await this.raceRepository.findOne({ where: { id: raceId }, relations: ['season', 'circuit'] });
      if (!race) {
        this.logger.error('[STEP 1] Race not found');
        throw new NotFoundException(`Race with ID ${raceId} not found`);
      }
      this.logger.log(`[STEP 1] Found race: ${race.name}, Season: ${race.season_id}, Circuit: ${race.circuit_id}`);

      // 2. Fetch Race session
      this.logger.log('[STEP 2] Fetching race session...');
      const raceSession = await this.sessionRepository.findOne({ where: { race_id: raceId, type: 'Race' } });
      if (!raceSession) {
        this.logger.error('[STEP 2] Race session not found');
        throw new NotFoundException(`Race session not found for race ID ${raceId}`);
      }
      this.logger.log(`[STEP 2] Found race session ID: ${raceSession.id}`);

      // 3. Fetch race results (drivers)
      this.logger.log('[STEP 3] Fetching race results...');
      const raceResults = await this.raceResultRepository.find({ where: { session_id: raceSession.id }, relations: ['driver', 'team'] });
      if (!raceResults || raceResults.length === 0) {
        this.logger.error('[STEP 3] No race results found');
        throw new NotFoundException(`No race results found for race ID ${raceId}`);
      }
      this.logger.log(`[STEP 3] Found ${raceResults.length} drivers participating in this race`);

      // 4. Previous sessions in same season prior to this round
      this.logger.log('[STEP 4] Fetching previous sessions...');
      const previousSessions = await this.sessionRepository
        .createQueryBuilder('session')
        .innerJoin('session.race', 'race')
        .where('race.season_id = :seasonId', { seasonId: race.season_id })
        .andWhere('race.round < :round', { round: race.round })
        .andWhere('session.type = :type', { type: 'Race' })
        .select('session.id')
        .getMany();
      const previousSessionIds = previousSessions.map((s) => s.id);
      this.logger.log(`[STEP 4] Previous session IDs: ${JSON.stringify(previousSessionIds)}`);

      // 5. Feature calculation per driver
      this.logger.log('[STEP 5] Calculating features for each driver...');
      const driversFeatureData = await Promise.all(
        raceResults.map(async (result) => {
          const driverId = result.driver_id;
          const constructorId = result.constructor_id;
          const driver = result.driver;

          // Driver standings and points before race
          let driverStandingsPosition = 0;
          let driverPoints = 0;
          if (previousSessionIds.length > 0) {
            const driverStandings = await this.raceResultRepository
              .createQueryBuilder('rr')
              .select('SUM(rr.points)', 'total_points')
              .where('rr.driver_id = :driverId', { driverId })
              .andWhere('rr.session_id IN (:...sessionIds)', { sessionIds: previousSessionIds })
              .getRawOne();
            driverPoints = parseFloat(driverStandings?.total_points || '0');

            const allDriverPoints = await this.raceResultRepository
              .createQueryBuilder('rr')
              .select('rr.driver_id', 'driver_id')
              .addSelect('SUM(rr.points)', 'total_points')
              .where('rr.session_id IN (:...sessionIds)', { sessionIds: previousSessionIds })
              .groupBy('rr.driver_id')
              .getRawMany();
            const sortedDrivers = allDriverPoints
              .map((d) => ({ driver_id: d.driver_id, points: parseFloat(d.total_points || '0') }))
              .sort((a, b) => b.points - a.points);
            const driverIndex = sortedDrivers.findIndex((d) => d.driver_id === driverId);
            driverStandingsPosition = driverIndex >= 0 ? driverIndex + 1 : sortedDrivers.length + 1;
          }

          // Constructor standings and points before race
          let constructorStandingsPosition = 0;
          let constructorPoints = 0;
          if (previousSessionIds.length > 0) {
            const constructorStandings = await this.raceResultRepository
              .createQueryBuilder('rr')
              .select('SUM(rr.points)', 'total_points')
              .where('rr.constructor_id = :constructorId', { constructorId })
              .andWhere('rr.session_id IN (:...sessionIds)', { sessionIds: previousSessionIds })
              .getRawOne();
            constructorPoints = parseFloat(constructorStandings?.total_points || '0');

            const allConstructorPoints = await this.raceResultRepository
              .createQueryBuilder('rr')
              .select('rr.constructor_id', 'constructor_id')
              .addSelect('SUM(rr.points)', 'total_points')
              .where('rr.session_id IN (:...sessionIds)', { sessionIds: previousSessionIds })
              .groupBy('rr.constructor_id')
              .getRawMany();
            const sortedConstructors = allConstructorPoints
              .map((c) => ({ constructor_id: c.constructor_id, points: parseFloat(c.total_points || '0') }))
              .sort((a, b) => b.points - a.points);
            const constructorIndex = sortedConstructors.findIndex((c) => c.constructor_id === constructorId);
            constructorStandingsPosition = constructorIndex >= 0 ? constructorIndex + 1 : sortedConstructors.length + 1;
          }

          // Driver age at race date
          const driverAge = driver?.date_of_birth && race?.date
            ? (new Date(race.date).getTime() - new Date(driver.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
            : 0;

          // Avg points last 5 races for driver
          const driverLast5Races = await this.raceResultRepository
            .createQueryBuilder('rr')
            .innerJoin('rr.session', 'session')
            .innerJoin('session.race', 'race')
            .where('rr.driver_id = :driverId', { driverId })
            .andWhere('race.season_id = :seasonId', { seasonId: race.season_id })
            .andWhere('race.round < :round', { round: race.round })
            .andWhere('session.type = :type', { type: 'Race' })
            .orderBy('race.round', 'DESC')
            .limit(5)
            .select('rr.points')
            .getRawMany();
          const avgPointsLast5 = driverLast5Races.length
            ? driverLast5Races.reduce((sum, r) => sum + parseFloat(r.rr_points || '0'), 0) / driverLast5Races.length
            : 0;

          // Avg finish pos at this circuit
          const driverCircuitHistory = await this.raceResultRepository
            .createQueryBuilder('rr')
            .innerJoin('rr.session', 'session')
            .innerJoin('session.race', 'race')
            .where('rr.driver_id = :driverId', { driverId })
            .andWhere('race.circuit_id = :circuitId', { circuitId: race.circuit_id })
            .andWhere('race.id < :raceId', { raceId })
            .andWhere('session.type = :type', { type: 'Race' })
            .andWhere('rr.position IS NOT NULL')
            .select('rr.position')
            .getRawMany();
          const avgFinishAtCircuit = driverCircuitHistory.length
            ? driverCircuitHistory.reduce((sum, r) => sum + (r.rr_position || 20), 0) / driverCircuitHistory.length
            : 0;

          // Avg constructor points last 5 races
          const constructorLast5Races = await this.raceResultRepository
            .createQueryBuilder('rr')
            .innerJoin('rr.session', 'session')
            .innerJoin('session.race', 'race')
            .where('rr.constructor_id = :constructorId', { constructorId })
            .andWhere('race.season_id = :seasonId', { seasonId: race.season_id })
            .andWhere('race.round < :round', { round: race.round })
            .andWhere('session.type = :type', { type: 'Race' })
            .orderBy('race.round', 'DESC')
            .select('race.round', 'round')
            .addSelect('SUM(rr.points)', 'total_points')
            .groupBy('race.round')
            .limit(5)
            .getRawMany();
          const avgConstructorPointsLast5 = constructorLast5Races.length
            ? constructorLast5Races.reduce((sum, r) => sum + parseFloat(r.total_points || '0'), 0) / constructorLast5Races.length
            : 0;

          return {
            driver_id: driverId,
            driver_standings_position_before_race: driverStandingsPosition || 0,
            driver_points_before_race: driverPoints || 0,
            constructor_standings_position_before_race: constructorStandingsPosition || 0,
            constructor_points_before_race: constructorPoints || 0,
            driver_age: parseFloat(driverAge.toFixed(2)) || 0,
            avg_points_last_5_races: parseFloat(avgPointsLast5.toFixed(2)) || 0,
            avg_finish_pos_at_circuit: parseFloat(avgFinishAtCircuit.toFixed(2)) || 0,
            avg_constructor_points_last_5_races: parseFloat(avgConstructorPointsLast5.toFixed(2)) || 0,
          };
        })
      );
      this.logger.log('✅ Feature calculation complete for all drivers');
      this.logger.log(`📊 Data being sent to Python script: ${JSON.stringify(driversFeatureData, null, 2)}`);

      // 6. Call Python script
      const options = {
        mode: 'text' as const,
        scriptPath: path.join(__dirname, '../../src/ml-scripts'),
        pythonPath: path.join(__dirname, '../../src/ml-scripts/venv/bin/python3'),
      };
      const scriptArgs = [JSON.stringify(driversFeatureData)];
      this.logger.log('🐍 Executing Python prediction script...');
      this.logger.log(`Script path: ${options.scriptPath}`);
      this.logger.log(`Python path: ${options.pythonPath}`);
      const results = await PythonShell.run('run_prediction.py', { ...options, args: scriptArgs });
      this.logger.log(`📥 Raw result from Python script: ${JSON.stringify(results)}`);

      const resultJson = JSON.parse(results[0]);
      if (!resultJson.success) {
        throw new InternalServerErrorException(`Python script execution failed: ${resultJson.error || 'Unknown error'}`);
      }
      this.logger.log(`✅ Predictions generated successfully for ${resultJson.predictions.length} drivers`);

      // Enrich with names
      const enrichedResults = await Promise.all(
        resultJson.predictions.map(async (pred: any) => {
          const raceResult = raceResults.find((r) => r.driver_id === pred.driver_id);
          return {
            driverId: pred.driver_id,
            driverName: raceResult?.driver ? `${raceResult.driver.first_name} ${raceResult.driver.last_name}` : 'Unknown',
            constructorName: raceResult?.team?.name || 'Unknown',
            podiumProbability: pred.podium_probability,
          };
        })
      );

      return { raceId, raceName: race.name, predictions: enrichedResults };
    } catch (err: any) {
      this.logger.error(`❌ Error in getPredictionsByRaceId: ${err.message}`, err.stack);
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(`Failed to generate predictions for race ${raceId}: ${err.message}`);
    }
  }
}
