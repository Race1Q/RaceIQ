// backend/src/races/races.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { Race } from './races.entity';
import { RaceResponseDto } from './dto';

@Injectable()
export class RacesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAllRacesFor2025(): Promise<RaceResponseDto[]> {
    // First, find the season ID for the year 2025
    const { data: seasonData, error: seasonError } = await this.supabaseService.client
      .from('seasons')
      .select('id')
      .eq('year', 2025)
      .single();

    if (seasonError || !seasonData) {
      throw new InternalServerErrorException('Could not find season data for 2025');
    }

    const seasonId = seasonData.id;

    // Now, fetch all races for that season ID
    const { data, error } = await this.supabaseService.client
      .from('races')
      .select('*')
      .eq('season_id', seasonId)
      .order('date', { ascending: true });

    if (error) {
      throw new InternalServerErrorException('Failed to fetch races for 2025');
    }
    
    // Convert Race[] to RaceResponseDto[] and ensure id is defined
    return (data ?? []).map(race => ({
      id: race.id!,
      season_id: race.season_id,
      circuit_id: race.circuit_id,
      round: race.round,
      name: race.name,
      date: race.date,
      time: race.time
    }));
  }

  // Method for other services that need races by season
  async getRacesBySeason(seasonYear: string): Promise<Race[]> {
    // Find the season record
    const { data: seasonData, error: seasonError } = await this.supabaseService.client
      .from('seasons')
      .select('id')
      .eq('year', parseInt(seasonYear))
      .single();

    if (seasonError || !seasonData) {
      return []; // Return empty array if season not found
    }

    const seasonId = seasonData.id;

    // Fetch races for that season
    const { data, error } = await this.supabaseService.client
      .from('races')
      .select('*')
      .eq('season_id', seasonId)
      .order('round', { ascending: true });

    if (error) {
      return []; // Return empty array on error
    }
    
    return data ?? [];
  }

  // Method for other services that need all races
  async getAllRaces(): Promise<Race[]> {
    const { data, error } = await this.supabaseService.client
      .from('races')
      .select('*')
      .order('round', { ascending: true });

    if (error) {
      return []; // Return empty array on error
    }
    return data ?? [];
  }
}
