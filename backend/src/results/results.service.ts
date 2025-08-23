// src/results/results.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { RaceResult } from './results.entity';

@Injectable()
export class ResultsService {
  private readonly logger = new Logger(ResultsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async getRaceResultsBySessionId(sessionId: number): Promise<RaceResult[]> {
    const { data, error } = await this.supabaseService.client
      .from('race_results')
      .select('*')
      .eq('session_id', sessionId);

    if (error) {
      this.logger.error(`Failed to fetch race results for session ID ${sessionId}`, error);
      throw new Error(`Failed to fetch race results: ${error.message}`);
    }

    return data;
  }
}
