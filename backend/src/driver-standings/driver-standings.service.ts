// src/driver-standings/driver-standings.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { DriverStanding } from './driver-standings.entity';

@Injectable()
export class DriverStandingsService {
  private readonly logger = new Logger(DriverStandingsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await this.supabaseService.client
        .from('drivers_standings')
        .select('count')
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

  async getAllDriverStandings(): Promise<DriverStanding[]> {
    const { data, error } = await this.supabaseService.client
      .from('drivers_standings')
      .select('*')
      .order('race_id', { ascending: true })
      .order('position', { ascending: true });

    if (error) {
      this.logger.error('Failed to fetch driver standings', error);
      throw new Error('Failed to fetch driver standings');
    }

    return data;
  }

  async getDriverStandingsByRace(raceId: number): Promise<DriverStanding[]> {
    const { data, error } = await this.supabaseService.client
      .from('drivers_standings')
      .select('*')
      .eq('race_id', raceId)
      .order('position', { ascending: true });

    if (error) {
      this.logger.error(`Failed to fetch driver standings for race ${raceId}`, error);
      throw new Error('Failed to fetch driver standings by race');
    }

    return data;
  }

  async getDriverStandingsByDriver(driverId: number): Promise<DriverStanding[]> {
    const { data, error } = await this.supabaseService.client
      .from('drivers_standings')
      .select('*')
      .eq('driver_id', driverId)
      .order('season', { ascending: false })
      .order('race_id', { ascending: false });

    if (error) {
      this.logger.error(`Failed to fetch driver standings for driver ${driverId}`, error);
      throw new Error('Failed to fetch driver standings by driver');
    }

    return data;
  }

  async getDriverStandingsBySeason(season: number): Promise<DriverStanding[]> {
    const { data, error } = await this.supabaseService.client
      .from('drivers_standings')
      .select('*')
      .eq('season', season)
      .order('position', { ascending: true });

    if (error) {
      this.logger.error(`Failed to fetch driver standings for season ${season}`, error);
      throw new Error('Failed to fetch driver standings by season');
    }

    return data;
  }

  async searchDriverStandings(query: string): Promise<DriverStanding[]> {
    // This would need to join with drivers table for meaningful search
    const { data, error } = await this.supabaseService.client
      .from('drivers_standings')
      .select('*')
      .or(`season::text.ilike.%${query}%`)
      .order('season', { ascending: false })
      .order('position', { ascending: true });

    if (error) {
      this.logger.error('Failed to search driver standings', error);
      throw new Error('Failed to search driver standings');
    }

    return data;
  }
}