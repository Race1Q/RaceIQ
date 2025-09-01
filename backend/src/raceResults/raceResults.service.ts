// src/raceResults/raceResults.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { RaceResultRow } from './raceResults.entity';

@Injectable()
export class RaceResultsService {
  private readonly logger = new Logger(RaceResultsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async getBySessionId(sessionId: number): Promise<RaceResultRow[]> {
    const { data, error } = await this.supabaseService.client
      .from('race_results')
      .select('*')
      .eq('session_id', sessionId);

    if (error) {
      this.logger.error(`Failed to fetch race_results for session_id ${sessionId}`, error);
      throw new Error(`Failed to fetch race_results: ${error.message}`);
    }

    return data as RaceResultRow[];
  }

  async getByConstructor(constructorId: number): Promise<RaceResultRow[]> {
    const { data, error } = await this.supabaseService.client
      .from('race_results')
      .select('*')
      .eq('constructor_id', constructorId);

    if (error) {
      this.logger.error(`Failed to fetch race_results for constructor_id ${constructorId}`, error);
      throw new Error(`Failed to fetch race_results: ${error.message}`);
    }

    return data as RaceResultRow[];
  }

  async getConstructorStats(constructorId: number) {
    const results = await this.getByConstructor(constructorId);

    const totalRaces = results.length;
    const wins = results.filter(r => Number(r.position) === 1).length;
    const podiums = results.filter(r => Number(r.position) <= 3).length;
    const totalPoints = results.reduce((acc, r) => acc + Number(r.points), 0);

    return { totalRaces, wins, podiums, totalPoints };
  }
}


