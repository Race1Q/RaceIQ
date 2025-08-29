// src/pitStops/pitStops.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class PitStopsService {
  private readonly logger = new Logger(PitStopsService.name);

  constructor(private readonly supabase: SupabaseService) {}

  async getByRace(raceId: number) {
    const { data, error } = await this.supabase.client
      .from('pit_stops')
      .select('*')
      .eq('race_id', raceId)
      .order('lap_number', { ascending: true })
      .order('stop_number', { ascending: true });

    if (error) {
      this.logger.error('Failed to fetch pit stops', error);
      throw new Error('Failed to fetch pit stops');
    }
    return data;
  }
}


