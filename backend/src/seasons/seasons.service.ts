// src/seasons/seasons.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { Season } from './seasons.entity';

@Injectable()
export class SeasonsService {
  private readonly logger = new Logger(SeasonsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async testConnection(): Promise<boolean> {
    const { data } = await this.supabaseService.client.from('seasons').select('*').limit(1);
    return !!data;
  }

  async getAllSeasons(): Promise<Season[]> {
    const { data, error } = await this.supabaseService.client
      .from('seasons')
      .select('*')
      .order('year', { ascending: true });

    if (error) {
      this.logger.error('Failed to fetch all seasons', error);
      throw new Error('Failed to fetch all seasons');
    }

    return data;
  }

  /**
   * Retrieves a single season by its year.
   * @param year The year of the season as a string or number.
   * @returns A promise of a single Season object or null if not found.
   */
  async getSeasonByYear(year: string): Promise<Season | null> {
    const parsedYear = parseInt(year, 10);
    const { data, error } = await this.supabaseService.client
      .from('seasons')
      .select('*')
      .eq('year', parsedYear)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No row found, which is a normal case for single()
        return null;
      }
      this.logger.error(`Failed to fetch season by year ${year}`, error);
      throw new Error(`Failed to fetch season by year: ${error.message}`);
    }

    return data;
  }
}
