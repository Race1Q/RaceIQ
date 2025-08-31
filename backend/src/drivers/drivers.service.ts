// src/drivers/drivers.service.ts
import { Injectable, Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { Driver } from './entities/driver.entity';
import { DriverStatsDto } from './dto/driver.dto';

@Injectable()
export class DriversService {
  private readonly logger = new Logger(DriversService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  // The fields to select, including a computed full_name
  private get selectFields() {
    return 'id, driver_number, first_name, last_name, name_acronym, country_code, date_of_birth';
  }



  private addComputedFields(drivers: any[]): Driver[] {
    return drivers.map(driver => ({
      ...driver,
      full_name: `${driver.first_name} ${driver.last_name}`,
    }));
  }

  async getAllDrivers(): Promise<Driver[]> {
    const { data, error } = await this.supabaseService.client
      .from('drivers')
      .select(this.selectFields)
      .order('last_name', { ascending: true });

    if (error) {
      this.logger.error('Failed to fetch all drivers', error);
      throw new InternalServerErrorException('Failed to fetch all drivers');
    }
    
    return this.addComputedFields(data || []);
  }

  async searchDrivers(query: string): Promise<Driver[]> {
    const { data, error } = await this.supabaseService.client
      .from('drivers')
      .select(this.selectFields)
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,name_acronym.ilike.%${query}%`)
      .order('last_name', { ascending: true });

    if (error) {
      this.logger.error('Failed to search drivers', error);
      throw new InternalServerErrorException('Failed to search drivers');
    }
    
    return this.addComputedFields(data || []);
  }

  async getDriverById(id: number): Promise<Driver> {
    const { data, error } = await this.supabaseService.client
      .from('drivers')
      .select(this.selectFields)
      .eq('id', id)
      .single();

    if (error) {
      this.logger.error(`Failed to fetch driver with id ${id}`, error);
      if (error.code === 'PGRST116') {
        throw new NotFoundException(`Driver with id ${id} not found`);
      }
      throw new InternalServerErrorException('Failed to fetch driver');
    }

    if (!data) {
      throw new NotFoundException(`Driver with id ${id} not found`);
    }

    return this.addComputedFields([data])[0];
  }



  async getDriverStats(id: number): Promise<DriverStatsDto> {
    // First verify the driver exists
    await this.getDriverById(id);

    // Get career statistics from race_results
    const { data: careerStats, error: careerError } = await this.supabaseService.client
      .from('race_results')
      .select(`
        position,
        points,
        session_id
      `)
      .eq('driver_id', id);

    if (careerError) {
      this.logger.error(`Failed to fetch career stats for driver ${id}`, careerError);
      throw new InternalServerErrorException('Failed to fetch driver statistics');
    }

    // Get qualifying results for pole positions
    const { data: qualifyingStats, error: qualifyingError } = await this.supabaseService.client
      .from('qualifying_results')
      .select('position')
      .eq('driver_id', id)
      .eq('position', 1);

    if (qualifyingError) {
      this.logger.error(`Failed to fetch qualifying stats for driver ${id}`, qualifyingError);
      throw new InternalServerErrorException('Failed to fetch driver statistics');
    }

    // Get current season stats (assuming current year is 2024)
    const currentYear = new Date().getFullYear();
    const { data: currentSeasonStats, error: currentSeasonError } = await this.supabaseService.client
      .from('race_results')
      .select(`
        position,
        points,
        session_id
      `)
      .eq('driver_id', id)
      .gte('session_id', currentYear * 1000) // Assuming session_id format includes year
      .lte('session_id', (currentYear + 1) * 1000 - 1);

    if (currentSeasonError) {
      this.logger.error(`Failed to fetch current season stats for driver ${id}`, currentSeasonError);
      throw new InternalServerErrorException('Failed to fetch driver statistics');
    }

    // Calculate statistics
    const totalPoints = careerStats?.reduce((sum, result) => sum + (result.points || 0), 0) || 0;
    const totalWins = careerStats?.filter(result => result.position === 1).length || 0;
    const totalPodiums = careerStats?.filter(result => result.position <= 3).length || 0;
    const totalRaces = careerStats?.length || 0;
    const totalPoles = qualifyingStats?.length || 0;
    const totalFastestLaps = 0; // This would need a separate table or calculation

    const currentSeasonPoints = currentSeasonStats?.reduce((sum, result) => sum + (result.points || 0), 0) || 0;
    const currentSeasonWins = currentSeasonStats?.filter(result => result.position === 1).length || 0;
    const currentSeasonPodiums = currentSeasonStats?.filter(result => result.position <= 3).length || 0;

    // Get current championship position
    const { data: currentStanding, error: standingError } = await this.supabaseService.client
      .from('driver_standings')
      .select('position')
      .eq('driver_id', id)
      .order('race_id', { ascending: false })
      .limit(1)
      .single();

    const currentPosition = standingError ? null : currentStanding?.position || null;

    return {
      total_points: totalPoints,
      total_wins: totalWins,
      total_podiums: totalPodiums,
      total_fastest_laps: totalFastestLaps,
      total_races: totalRaces,
      total_poles: totalPoles,
      current_position: currentPosition,
      current_season_points: currentSeasonPoints,
      current_season_wins: currentSeasonWins,
      current_season_podiums: currentSeasonPodiums,
    };
  }
}