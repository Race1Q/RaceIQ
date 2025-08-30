// src/results/results-ingest.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SupabaseService } from '../supabase/supabase.service';
import { RacesService } from '../races/races.service';
import { DriversService } from '../drivers/drivers.service';
import { ConstructorsService } from '../constructors/constructors.service';
import { RaceResult, ApiRace, ApiResponse } from './results.entity';

// Utility function to add a delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

@Injectable()
export class ResultsIngestService {
  private readonly logger = new Logger(ResultsIngestService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly supabaseService: SupabaseService,
    private readonly racesService: RacesService,
    private readonly driversService: DriversService,
    private readonly constructorsService: ConstructorsService,
  ) {}

  async fetchResultsFromAPI(season: string, round: string): Promise<ApiRace[]> {
    try {
      this.logger.log(`Fetching results from API for season ${season}, round ${round}`);
      const apiUrl = `https://api.jolpi.ca/ergast/f1/${season}/${round}/results.json`;
      const response = await firstValueFrom(this.httpService.get<ApiResponse>(apiUrl));
      
      const results = response.data.MRData.RaceTable.Races;
      this.logger.log(`Number of race results received: ${results.length}`);
      
      return results;
    } catch (error) {
      this.logger.error(`Failed to fetch results for season ${season}, round ${round}`, error.message);
      throw new Error('Failed to fetch race results data');
    }
  }

  async ingestAllRaceResults(): Promise<{ created: number; updated: number }> {
    let created = 0;
    let updated = 0;

    this.logger.log('Starting ingestion of all race results...');

    // Fetch all races, drivers, and constructors from your DB
    const allRaces = await this.racesService.getAllRaces();
    const allDrivers = await this.driversService.getAllDrivers();
    const allConstructors = await this.constructorsService.getAllConstructors();

    if (allRaces.length === 0 || allDrivers.length === 0 || allConstructors.length === 0) {
      this.logger.error('Missing required data in races, drivers, or constructors tables. Ingestion aborted.');
      throw new Error('Missing required data. Ingestion aborted.');
    }

    for (const race of allRaces) {
      this.logger.log(`Ingesting results for race: ${race.name} (Round ${race.round})`);
      
      try {
        const apiRaces = await this.fetchResultsFromAPI(race.season_id.toString(), race.round.toString());
        
        if (apiRaces.length > 0) {
          for (const apiResult of apiRaces[0].Results) {
            const result = await this.processResult(apiResult, race.id!, allDrivers, allConstructors);
            if (result === 'created') created++;
            if (result === 'updated') updated++;
          }
        }
      } catch (error) {
        this.logger.error(`Failed to ingest results for race ${race.name}:`, error.message);
      }
      
      // Add a 1-second delay to prevent hitting the API's rate limit
      await sleep(1000);
    }

    this.logger.log(`Ingestion complete: ${created} created, ${updated} updated.`);
    return { created, updated };
  }

  private async processResult(apiResult: any, sessionId: number, allDrivers: any[], allConstructors: any[]): Promise<'created' | 'updated'> {
    this.logger.log(`Processing result for position ${apiResult.position}`);

    // Use the api_id to find the corresponding local ID
    const driver = allDrivers.find(d => d.api_id === apiResult.Driver.driverId);
    const constructor = allConstructors.find(c => c.api_id === apiResult.Constructor.constructorId);

    if (!driver || !constructor) {
      this.logger.error('Driver or Constructor not found. Skipping result.');
      return 'created'; // Or throw an error if you want to stop
    }

    const resultData: RaceResult = {
      session_id: sessionId,
      driver_id: driver.id,
      constructor_id: constructor.id,
      position: parseInt(apiResult.position),
      points: parseFloat(apiResult.points),
      grid: parseInt(apiResult.grid),
      laps: parseInt(apiResult.laps),
      time_ms: apiResult.Time ? parseInt(apiResult.Time.millis) : null,
      status: apiResult.status,
    };

    const { data: existingResult, error: selectError } = await this.supabaseService.client
      .from('race_results')
      .select('id')
      .eq('session_id', resultData.session_id)
      .eq('driver_id', resultData.driver_id)
      .limit(1);

    if (selectError && selectError.code !== 'PGRST116') {
      this.logger.error(`Select error for result:`, selectError.message);
      throw new Error(`Select error: ${selectError.message}`);
    }

    if (existingResult && existingResult.length > 0) {
      const { error } = await this.supabaseService.client
        .from('race_results')
        .update(resultData)
        .eq('id', existingResult[0].id);

      if (error) {
        this.logger.error(`Failed to update race result`, error.message);
        throw new Error(`Update failed: ${error.message}`);
      }
      return 'updated';
    } else {
      const { error } = await this.supabaseService.client
        .from('race_results')
        .insert(resultData);

      if (error) {
        this.logger.error(`Failed to create race result`, error.message);
        throw new Error(`Creation failed: ${error.message}`);
      }
      return 'created';
    }
  }
}
