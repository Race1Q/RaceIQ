// backend/src/ingestion/openf1.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { SupabaseService } from '../supabase/supabase.service';
import { firstValueFrom } from 'rxjs';

// We can add more specific TypeScript interfaces for OpenF1 data as we go.
// For now, `any` is a placeholder.
type OpenF1Session = any; 

@Injectable()
export class OpenF1Service {
  private readonly logger = new Logger(OpenF1Service.name);
  private readonly apiBaseUrl = 'https://api.openf1.org/v1';

  constructor(
    private readonly httpService: HttpService,
    private readonly supabaseService: SupabaseService,
  ) {}

  /**
   * A generic, reusable helper function to fetch data from any OpenF1 endpoint.
   * It includes basic error handling.
   * @param endpoint The API endpoint path (e.g., '/sessions')
   * @returns A promise that resolves with the fetched data.
   */
  private async fetchOpenF1Data<T>(endpoint: string): Promise<T[]> {
    const url = `${this.apiBaseUrl}${endpoint}`;
    try {
      this.logger.log(`Fetching data from OpenF1 endpoint: ${endpoint}`);
      const response = await firstValueFrom(this.httpService.get<T[]>(url));
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch data from ${url}`, error.stack);
      // Return an empty array to prevent the entire ingestion from failing.
      return [];
    }
  }

  /**
   * The main orchestrator method for ingesting all OpenF1 data for a given season.
   * We will build out the logic within this method step-by-step.
   * @param seasonYear The year of the season to ingest (e.g., 2024).
   */
  public async ingestOpenF1DataForSeason(seasonYear: number) {
    this.logger.log(`Starting OpenF1 data ingestion for the ${seasonYear} season...`);

    // --- Step 1: Fetch all Sessions for the season ---
    // Sessions are the parent event for almost all other data (weather, stints, etc.),
    // so we always start here.
    const sessions = await this.fetchOpenF1Data<OpenF1Session>(
      `/sessions?year=${seasonYear}`
    );

    if (!sessions || sessions.length === 0) {
      this.logger.warn(`No OpenF1 sessions found for ${seasonYear}. Aborting.`);
      return;
    }

    this.logger.log(`Found ${sessions.length} sessions for ${seasonYear}.`);

    // --- Step 2: Process each session ---
    // In the next steps, we will loop through each session and do the following:
    // 1. Find the corresponding race_id from our database.
    // 2. Upsert the session data into our 'sessions' table.
    // 3. Use the session_key to fetch related data (weather, tire stints, race events).
    // 4. Save that related data to the database.

    // TODO: Implement session processing logic here.

    this.logger.log(`Completed OpenF1 data ingestion for the ${seasonYear} season.`);
  }
}