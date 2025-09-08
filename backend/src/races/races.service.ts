// backend/src/races/races.service.ts
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { Race } from './races.entity';
import { RaceResponseDto } from './dto';

@Injectable()
export class RacesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAllRacesForSeason(year: number): Promise<RaceResponseDto[]> {
    // Find the season ID for the given year
    const { data: seasonData, error: seasonError } = await this.supabaseService.client
      .from('seasons')
      .select('id')
      .eq('year', year)
      .single();

    if (seasonError || !seasonData) {
      throw new InternalServerErrorException(`Could not find season data for ${year}`);
    }

    const seasonId = seasonData.id;

    // Fetch all races for that season ID
    const { data, error } = await this.supabaseService.client
      .from('races')
      .select('*')
      .eq('season_id', seasonId)
      .order('date', { ascending: true });

    if (error) {
      throw new InternalServerErrorException(`Failed to fetch races for ${year}`);
    }
    
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

  async findRaceById(id: number): Promise<RaceResponseDto | null> {
    const { data, error } = await this.supabaseService.client
      .from('races')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new NotFoundException('Race not found');
    }

    if (!data) return null;

    return {
      id: data.id!,
      season_id: data.season_id,
      circuit_id: data.circuit_id,
      round: data.round,
      name: data.name,
      date: data.date,
      time: data.time,
    };
  }
}
