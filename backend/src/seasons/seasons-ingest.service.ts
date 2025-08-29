// src/seasons/seasons-ingest.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { SupabaseService } from '../supabase/supabase.service';
import { ApiSeason, ApiResponse } from './seasons.entity';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SeasonIngestService {
  private readonly logger = new Logger(SeasonIngestService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly supabaseService: SupabaseService,
  ) {}

  /**
   * Fetches all season data from the Ergast API.
   * This function now handles pagination to retrieve all seasons.
   * @returns A promise of an array of ApiSeason objects.
   */
  async fetchSeasonsFromAPI(): Promise<ApiSeason[]> {
    const allSeasons: ApiSeason[] = [];
    let offset = 0;
    const limit = 30;
    let hasMore = true;

    try {
      while (hasMore) {
        const apiUrl = `https://api.jolpi.ca/ergast/f1/seasons.json?limit=${limit}&offset=${offset}`;
        this.logger.log(`Fetching seasons from API with offset: ${offset}`);
        const response = await firstValueFrom(this.httpService.get<ApiResponse>(apiUrl));
        
        const apiResponse = response.data;
        const seasons = apiResponse.MRData.SeasonTable.Seasons;
        const total = parseInt(apiResponse.MRData.total, 10);
        
        this.logger.log(`Received ${seasons.length} seasons (Total: ${total})`);
        
        allSeasons.push(...seasons);
        offset += limit;
        hasMore = offset < total;
      }
      this.logger.log(`Successfully fetched all ${allSeasons.length} seasons.`);
      return allSeasons;
    } catch (error) {
      this.logger.error('Failed to fetch seasons', error.message);
      throw new Error('Failed to fetch seasons data');
    }
  }

  /**
   * Main method to ingest all seasons.
   * This is an idempotent function, meaning it will create new seasons or update existing ones.
   * @returns A promise of an object with the count of created and updated seasons.
   */
  async ingestSeasons(): Promise<{ created: number; updated: number }> {
    const apiSeasons = await this.fetchSeasonsFromAPI();
    let created = 0;
    let updated = 0;

    this.logger.log(`Processing ${apiSeasons.length} seasons`);
    
    for (const apiSeason of apiSeasons) {
      try {
        const result = await this.processSeason(apiSeason);
        if (result === 'created') created++;
        if (result === 'updated') updated++;
      } catch (error) {
        this.logger.error(`Failed to process season ${apiSeason.season}`, error.message);
        // Continue with the next season even if one fails
      }
    }

    this.logger.log(`Ingestion complete: ${created} created, ${updated} updated.`);
    return { created, updated };
  }

  /**
   * Processes a single season from the API, either creating or updating it in Supabase.
   * @param apiSeason The season object from the API.
   * @returns A promise of either 'created' or 'updated'.
   */
  private async processSeason(apiSeason: ApiSeason): Promise<'created' | 'updated'> {
    this.logger.log(`Processing season: ${apiSeason.season}`);

    const seasonData = {
      // The `id` is auto-incrementing, so we only need to provide the `year`.
      year: parseInt(apiSeason.season, 10),
    };

    // Check if the season already exists by its 'year'
    const { data: existingSeason, error: selectError } = await this.supabaseService.client
      .from('seasons')
      .select('*')
      .eq('year', seasonData.year)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      this.logger.error(`Select error for season ${seasonData.year}:`, selectError.message);
      throw new Error(`Select error: ${selectError.message}`);
    }

    if (existingSeason) {
      this.logger.log(`Season ${seasonData.year} already exists.`);
      // We don't need to update since the year doesn't change
      return 'updated'; 
    } else {
      this.logger.log(`Creating new season: ${seasonData.year}`);
      const { error } = await this.supabaseService.client
        .from('seasons')
        .insert(seasonData);

      if (error) {
        this.logger.error(`Failed to create season ${seasonData.year}`, error.message);
        throw new Error(`Creation failed: ${error.message}`);
      }
      return 'created';
    }
  }
}
