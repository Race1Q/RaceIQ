// src/laps/laps.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { Lap } from './laps.entity';

@Injectable()
export class LapsService {
  private readonly logger = new Logger(LapsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await this.supabaseService.client
        .from('laps')
        .select('id')
        .limit(1);

      if (error) {
        this.logger.error('Supabase connection test failed:', error);
        return false;
      }

      this.logger.log('Supabase connection test successful');
      return true;
    } catch (error) {
      this.logger.error('Supabase connection test failed:', error);
      return false;
    }
  }

  async getAllLaps(): Promise<Lap[]> {
    const { data, error } = await this.supabaseService.client
      .from('laps')
      .select('*')
      .order('race_id', { ascending: true })
      .order('lap_number', { ascending: true });

    if (error) {
      this.logger.error('Failed to fetch laps', error);
      throw new Error('Failed to fetch laps');
    }

    return data;
  }

  async getLapsByRace(raceId: number): Promise<Lap[]> {
    const { data, error } = await this.supabaseService.client
      .from('laps')
      .select('*')
      .eq('race_id', raceId)
      .order('lap_number', { ascending: true })
      .order('position', { ascending: true });

    if (error) {
      this.logger.error(`Failed to fetch laps for race ${raceId}`, error);
      throw new Error('Failed to fetch laps by race');
    }

    return data;
  }

  async getLapsByDriver(driverId: number): Promise<Lap[]> {
    const { data, error } = await this.supabaseService.client
      .from('laps')
      .select('*')
      .eq('driver_id', driverId)
      .order('race_id', { ascending: false })
      .order('lap_number', { ascending: true });

    if (error) {
      this.logger.error(`Failed to fetch laps for driver ${driverId}`, error);
      throw new Error('Failed to fetch laps by driver');
    }

    return data;
  }

  async getLapsBySeason(season: number): Promise<Lap[]> {
    // First fetch all race IDs for this season
    const { data: races, error: racesError } = await this.supabaseService.client
      .from('races')
      .select('id')
      .eq('season', season);
  
    if (racesError) {
      this.logger.error(`Failed to fetch races for season ${season}`, racesError);
      throw new Error('Failed to fetch races by season');
    }
  
    const raceIds = races.map(r => r.id);
    if (raceIds.length === 0) return [];
  
    const { data: laps, error: lapsError } = await this.supabaseService.client
      .from('laps')
      .select('*')
      .in('race_id', raceIds)
      .order('race_id', { ascending: true })
      .order('lap_number', { ascending: true });
  
    if (lapsError) {
      this.logger.error(`Failed to fetch laps for season ${season}`, lapsError);
      throw new Error('Failed to fetch laps by season');
    }
  
    return laps;
  }
  

  async searchLaps(query: string): Promise<Lap[]> {
    const { data, error } = await this.supabaseService.client
      .from('laps')
      .select('*')
      .or(`lap_number::text.ilike.%${query}%`)
      .order('race_id', { ascending: true });

    if (error) {
      this.logger.error('Failed to search laps', error);
      throw new Error('Failed to search laps');
    }

    return data;
  }
}

