// src/driver-standings/driver-standing-ingest.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SupabaseService } from '../supabase/supabase.service';
import { ApiDriverStanding, ApiResponse } from './driverStandings.entity';

@Injectable()
export class DriverStandingIngestService {
  private readonly logger = new Logger(DriverStandingIngestService.name);
  private readonly apiBaseUrl = 'https://api.jolpi.ca/ergast/f1';

  constructor(
    private readonly httpService: HttpService,
    private readonly supabaseService: SupabaseService,
  ) {}

  private async fetchSeasonStandings(season: number, offset = 0, limit = 30) {
    const apiUrl = `${this.apiBaseUrl}/${season}/driverstandings/?limit=${limit}&offset=${offset}&format=json`;
    try {
      const response = await firstValueFrom(this.httpService.get<ApiResponse>(apiUrl));
      const standingsLists = response.data.MRData.StandingsTable.StandingsLists || [];
      if (standingsLists.length === 0) return { standings: [], round: 1 };

      const round = parseInt(standingsLists[0].round);
      const standings = standingsLists[0].DriverStandings || [];
      return { standings, round };
    } catch (error) {
      this.logger.error(`Failed to fetch standings for season ${season}, offset ${offset}`, error);
      return { standings: [], round: 1 };
    }
  }

  private async getSeasonId(season: number): Promise<number | null> {
    const { data, error } = await this.supabaseService.client
      .from('seasons')
      .select('id')
      .eq('year', season)
      .single();

    if (error) {
      this.logger.error(`Failed to get season ID for ${season}`, error);
      return null;
    }
    return data.id;
  }

  private async getRaceId(seasonId: number, round: number): Promise<number | null> {
    const { data, error } = await this.supabaseService.client
      .from('races')
      .select('id')
      .eq('season_id', seasonId)
      .eq('round', round)
      .single();

    if (error) {
      this.logger.error(`Failed to get race ID for season ${seasonId}, round ${round}`, error);
      return null;
    }
    return data.id;
  }

  private normalizeDriverName(name: string): string {
    const variations: Record<string, string> = {
      'Nino Farina': 'Giuseppe Farina',
      // Add other known variations here if needed
    };
    return variations[name] || name;
  }

  private async getOrCreateDriver(driver: {
    givenName: string;
    familyName: string;
    permanentNumber?: string;
    code: string;
    nationality?: string;
    dateOfBirth: string;
  }): Promise<number | null> {
    const firstName = this.normalizeDriverName(driver.givenName);
    const lastName = this.normalizeDriverName(driver.familyName);

    // Try exact match first
    const { data: existingDriver } = await this.supabaseService.client
      .from('drivers')
      .select('*')
      .eq('first_name', firstName)
      .eq('last_name', lastName)
      .single();

    if (existingDriver) return existingDriver.id;

    // Insert new driver
    const countryCode = driver.nationality ? driver.nationality.substring(0, 3).toUpperCase() : null;
    const driverData = {
      driver_number: driver.permanentNumber ? parseInt(driver.permanentNumber) : null,
      first_name: firstName,
      last_name: lastName,
      name_acronym: driver.code,
      country_code: countryCode,
      date_of_birth: driver.dateOfBirth,
    };

    const { data: newDriver, error } = await this.supabaseService.client
      .from('drivers')
      .insert(driverData)
      .select('*')
      .single();

    if (error) {
      this.logger.error(`Failed to create driver ${firstName} ${lastName}`, error);
      return null;
    }

    this.logger.log(`Created new driver: ${firstName} ${lastName}`);
    return newDriver.id;
  }

  private async processDriverStanding(
    apiStanding: ApiDriverStanding,
    raceId: number,
    season: number,
  ): Promise<'created' | 'updated'> {
    const driverId = await this.getOrCreateDriver(apiStanding.Driver);
    if (!driverId) throw new Error(`Unable to resolve driver: ${apiStanding.Driver.givenName} ${apiStanding.Driver.familyName}`);

    const standingData = {
      race_id: raceId,
      driver_id: driverId,
      points: parseFloat(apiStanding.points),
      position: parseInt(apiStanding.position),
      season: season,
      wins: parseInt(apiStanding.wins),
    };

    const { data: existingStanding, error: selectError } = await this.supabaseService.client
      .from('driver_standings')
      .select('*')
      .eq('race_id', raceId)
      .eq('driver_id', driverId)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      throw new Error(`Select error: ${selectError.message}`);
    }

    if (existingStanding) {
      const { error } = await this.supabaseService.client
        .from('driver_standings')
        .update(standingData)
        .eq('race_id', raceId)
        .eq('driver_id', driverId);

      if (error) throw new Error(`Update failed: ${error.message}`);
      return 'updated';
    } else {
      const { error } = await this.supabaseService.client
        .from('driver_standings')
        .insert(standingData);

      if (error) throw new Error(`Insert failed: ${error.message}`);
      return 'created';
    }
  }

  public async ingestAllDriverStandings(): Promise<{ created: number; updated: number }> {
    let created = 0;
    let updated = 0;

    for (let season = 1950; season <= 2024; season++) {
      this.logger.log(`Fetching driver standings for season ${season}`);

      const seasonId = await this.getSeasonId(season);
      if (!seasonId) {
        this.logger.warn(`Skipping season ${season} - no season ID found`);
        continue;
      }

      let offset = 0;
      const limit = 30;
      let hasMore = true;

      while (hasMore) {
        const { standings, round } = await this.fetchSeasonStandings(season, offset, limit);
        if (standings.length === 0) break;

        const raceId = await this.getRaceId(seasonId, round);
        if (!raceId) {
          this.logger.warn(`Skipping standings for season ${season}, round ${round} - no race ID found`);
          break;
        }

        for (const standing of standings) {
          try {
            const result = await this.processDriverStanding(standing, raceId, season);
            if (result === 'created') created++;
            if (result === 'updated') updated++;
          } catch (error) {
            this.logger.error(`Error processing standing: ${standing.Driver.givenName} ${standing.Driver.familyName}`, error);
          }
        }

        offset += limit;
        hasMore = standings.length === limit;

        // Avoid hitting rate limit
        await new Promise(resolve => setTimeout(resolve, 400));
      }
    }

    this.logger.log(`Finished ingestion: ${created} created, ${updated} updated`);
    return { created, updated };
  }
}





