// src/qualifyingResults/qualifyingResults.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { QualifyingResultRow } from './qualifyingResults.entity';

@Injectable()
export class QualifyingResultsService {
  private readonly logger = new Logger(QualifyingResultsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async getBySessionId(sessionId: number): Promise<QualifyingResultRow[]> {
    const { data, error } = await this.supabaseService.client
      .from('qualifying_results')
      .select('*')
      .eq('session_id', sessionId);

    if (error) {
      this.logger.error(`Failed to fetch qualifying_results for session_id ${sessionId}`, error);
      throw new Error(`Failed to fetch qualifying_results: ${error.message}`);
    }

    return data as QualifyingResultRow[];
  }
}


