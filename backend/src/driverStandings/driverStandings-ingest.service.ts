// src/driver-standings/driver-standing-ingest.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SupabaseService } from '../supabase/supabase.service';
import { ApiDriverStanding, ApiResponse } from './driverStandings.entity';

@Injectable()
export class DriverStandingIngestService {
  private readonly logger = new Logger(DriverStandingIngestService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async fetchDriverStandingsFromAPI(): Promise<{
    season: number;
    round: number;
    standings: ApiDriverStanding[];
  }> {
    try {
      const apiUrl = 'https://api.jolpi.ca/ergast/f1/2025/driverstandings/?format=json';
      const response = await firstValueFrom(this.httpService.get<ApiResponse>(apiUrl));
      
      this.logger.log('API Response received');
      
      const standingsList = response.data.MRData.StandingsTable.StandingsLists[0];
      const season = parseInt(standingsList.season);
      const round = parseInt(standingsList.round);
      const standings = standingsList.DriverStandings;
      
      this.logger.log(`Season: ${season}, Round: ${round}, Standings count: ${standings.length}`);
      
      if (standings.length > 0) {
        this.logger.log('First driver standing:', standings[0]);
      }
      
      return { season, round, standings };
    } catch (error) {
      this.logger.error('Failed to fetch driver standings from API', error);
      throw new Error('Failed to fetch driver standings data');
    }
  }

  private async getSeasonId(apiSeason: number): Promise<number | null> {
    try {
      this.logger.log(`Looking for season ID for API season: ${apiSeason}`);
      
      // Look up the internal season_id for the API season year
      const { data, error } = await this.supabaseService.client
        .from('seasons')
        .select('id')
        .eq('year', apiSeason)
        .single();

      if (error) {
        this.logger.error(`Failed to find season ID for year ${apiSeason}:`, error);
        return null;
      }

      this.logger.log(`Found season ID: ${data.id} for API season: ${apiSeason}`);
      return data.id;
    } catch (error) {
      this.logger.error(`Error finding season ID:`, error);
      return null;
    }
  }

  private async getRaceId(internalSeasonId: number, round: number): Promise<number | null> {
    try {
      this.logger.log(`Looking for race: season_id=${internalSeasonId}, round=${round}`);
      
      // Try to find the specific race using the internal season_id
      const { data, error } = await this.supabaseService.client
        .from('races')
        .select('id')
        .eq('season_id', internalSeasonId)
        .eq('round', round)
        .single();

      if (error) {
        this.logger.error(`Failed to find race for season_id ${internalSeasonId}, round ${round}:`, error);
        return null;
      }

      this.logger.log(`Found race ID: ${data.id} for season_id ${internalSeasonId}, round ${round}`);
      return data.id;
    } catch (error) {
      this.logger.error(`Error finding race ID:`, error);
      return null;
    }
  }

  private async getDriverId(driverNumber: string): Promise<number | null> {
    try {
      this.logger.log(`Looking for driver with number: ${driverNumber}`);
      
      const { data, error } = await this.supabaseService.client
        .from('drivers')
        .select('id')
        .eq('driver_number', driverNumber)
        .single();

      if (error) {
        this.logger.error(`Failed to find driver with number ${driverNumber}:`, error);
        return null;
      }

      this.logger.log(`Found driver ID: ${data.id} for driver number ${driverNumber}`);
      return data.id;
    } catch (error) {
      this.logger.error(`Error finding driver ID:`, error);
      return null;
    }
  }

  async ingestDriverStandings(): Promise<{ created: number; updated: number }> {
    const apiData = await this.fetchDriverStandingsFromAPI();
    let created = 0;
    let updated = 0;

    this.logger.log(`Processing ${apiData.standings.length} driver standings`);

    // First, get the internal season_id for API season 2025
    const internalSeasonId = await this.getSeasonId(apiData.season);
    if (!internalSeasonId) {
      this.logger.error(`No internal season ID found for API season ${apiData.season}`);
      return { created, updated };
    }

    // Then get race_id from races table using internal season_id
    const raceId = await this.getRaceId(internalSeasonId, apiData.round);
    if (!raceId) {
      this.logger.error(`No race found for internal season_id ${internalSeasonId}, round ${apiData.round}`);
      this.logger.error('Please ensure the races table is populated first');
      return { created, updated };
    }

    for (const apiStanding of apiData.standings) {
      try {
        const result = await this.processDriverStanding(apiStanding, raceId, apiData.season);
        if (result === 'created') created++;
        if (result === 'updated') updated++;
      } catch (error) {
        this.logger.error(`Failed to process driver standing for ${apiStanding.Driver.givenName} ${apiStanding.Driver.familyName}:`, error);
      }
    }

    this.logger.log(`Ingested driver standings: ${created} created, ${updated} updated`);
    return { created, updated };
  }

  private async processDriverStanding(
    apiStanding: ApiDriverStanding,
    raceId: number,
    season: number
  ): Promise<'created' | 'updated'> {
    const driverName = `${apiStanding.Driver.givenName} ${apiStanding.Driver.familyName}`;
    this.logger.log(`Processing driver standing: ${driverName}`);

    // Get driver_id from drivers table using driver number
    const driverId = await this.getDriverId(apiStanding.Driver.permanentNumber);
    if (!driverId) {
      throw new Error(`Driver not found with number ${apiStanding.Driver.permanentNumber}`);
    }

    const standingData = {
      race_id: raceId,
      driver_id: driverId,
      points: parseFloat(apiStanding.points),
      position: parseInt(apiStanding.position),
      season: season,
      wins: parseInt(apiStanding.wins)
    };

    this.logger.debug('Creating driver standing with data:', standingData);

    // Check if standing already exists - using the correct table name 'driver_standings'
    const { data: existingStanding, error: selectError } = await this.supabaseService.client
      .from('driver_standings') // CORRECTED TABLE NAME
      .select('*')
      .eq('race_id', raceId)
      .eq('driver_id', driverId)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      this.logger.error(`Select error for race ${raceId}, driver ${driverId}:`, selectError);
      throw new Error(`Select error: ${selectError.message}`);
    }

    if (existingStanding) {
      this.logger.log(`Updating existing driver standing: ${driverName}`);
      // Update existing standing
      const { error } = await this.supabaseService.client
        .from('driver_standings') // CORRECTED TABLE NAME
        .update(standingData)
        .eq('race_id', raceId)
        .eq('driver_id', driverId);

      if (error) {
        this.logger.error(`Failed to update driver standing ${driverName}`, error);
        throw new Error(`Update failed: ${error.message}`);
      }
      return 'updated';
    } else {
      this.logger.log(`Creating new driver standing: ${driverName}`);
      // Create new standing
      const { error } = await this.supabaseService.client
        .from('driver_standings') // CORRECTED TABLE NAME
        .insert(standingData);

      if (error) {
        this.logger.error(`Failed to create driver standing ${driverName}`, error);
        throw new Error(`Creation failed: ${error.message}`);
      }
      return 'created';
    }
  }
}
