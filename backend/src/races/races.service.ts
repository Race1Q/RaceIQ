// src/races/races.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { Race } from './races.entity';
// Import SeasonsService to get season data
import { SeasonsService } from '../seasons/seasons.service';

@Injectable()
export class RacesService {
  private readonly logger = new Logger(RacesService.name);

  // Inject the SeasonsService
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly seasonsService: SeasonsService,
  ) {}

  async testConnection(): Promise<boolean> {
    const { data } = await this.supabaseService.client.from('races').select('*').limit(1);
    return !!data;
  }

  async getAllRaces(): Promise<Race[]> {
    const { data, error } = await this.supabaseService.client
      .from('races')
      .select('*')
      .order('round', { ascending: true });

    if (error) {
      this.logger.error('Failed to fetch all races', error);
      throw new Error('Failed to fetch all races');
    }

    return data;
  }

  async searchRaces(query: string): Promise<Race[]> {
    const { data, error } = await this.supabaseService.client
      .from('races')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('name', { ascending: true });

    if (error) {
      this.logger.error('Failed to search races', error);
      throw new Error('Failed to search races');
    }

    return data;
  }

  /**
   * Retrieves all races for a given season year.
   * @param seasonYear The year of the season as a string (e.g., '2025').
   * @returns A promise of an array of Race objects.
   */
  async getRacesBySeason(seasonYear: string): Promise<Race[]> {
    // Find the season record using the SeasonsService
    const seasonRecord = await this.seasonsService.getSeasonByYear(seasonYear);

    if (!seasonRecord) {
      this.logger.warn(`Season '${seasonYear}' not found.`);
      return [];
    }

    // Use the retrieved season ID to query the races table
    const { data, error } = await this.supabaseService.client
      .from('races')
      .select('*')
      .eq('season_id', seasonRecord.id!)
      .order('round', { ascending: true });

    if (error) {
      this.logger.error(`Failed to fetch races for season ${seasonYear}`, error);
      throw new Error('Failed to fetch races by season');
    }
    
    return data;
  }
}
