// src/pitStops/pitStops.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { PitStopRow } from './pitStops.entity';

@Injectable()
export class PitStopsService {
  private readonly logger = new Logger(PitStopsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async getByRaceId(raceId: number): Promise<PitStopRow[]> {
    const { data, error } = await this.supabaseService.client
      .from('pit_stops')
      .select('*')
      .eq('race_id', raceId)
      .order('lap_number', { ascending: true })
      .order('stop_number', { ascending: true });

    if (error) {
      this.logger.error(`Failed to fetch pit_stops for race_id ${raceId}`, error);
      throw new Error(`Failed to fetch pit_stops: ${error.message}`);
    }

    return data as PitStopRow[];
  }
}


