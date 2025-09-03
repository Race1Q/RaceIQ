// src/drivers/drivers.service.ts
import { Injectable, Logger, InternalServerErrorException, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { 
  DriverResponseDto, 
  DriverStandingsResponseDto, 
  DriverDetailsResponseDto, 
  DriverPerformanceResponseDto 
} from './dto';

@Injectable()
export class DriversService {
  private readonly logger = new Logger(DriversService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  // The fields to select, including a computed full_name
  private get selectFields() {
    return 'id, driver_number, first_name, last_name, name_acronym, country_code, date_of_birth';
  }

  async getAllDrivers(): Promise<DriverResponseDto[]> {
    const { data, error } = await this.supabaseService.client
      .from('drivers')
      .select(this.selectFields);

    if (error) {
      this.logger.error('Failed to fetch all drivers', error);
      throw new InternalServerErrorException('Failed to fetch all drivers');
    }
    return (data as unknown as DriverResponseDto[]) || [];
  }

  async searchDrivers(query: string): Promise<DriverResponseDto[]> {
    const { data, error } = await this.supabaseService.client
      .from('drivers')
      .select(this.selectFields)
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,name_acronym.ilike.%${query}%`)
      .order('last_name', { ascending: true });

    if (error) {
      this.logger.error('Failed to search drivers', error);
      throw new InternalServerErrorException('Failed to search drivers');
    }
    return (data as unknown as DriverResponseDto[]) || [];
  }

  async findDriversByStandings(season: number): Promise<DriverStandingsResponseDto[]> {
    const { data, error } = await this.supabaseService.client
      .rpc('get_drivers_sorted_by_standings', { p_season: season });

    if (error) {
      this.logger.error('Failed to fetch drivers by standings', error);
      throw new InternalServerErrorException('Failed to fetch drivers by standings');
    }

    return data ?? [];
  }

  async findOneDetails(driverId: number): Promise<DriverDetailsResponseDto> {
    const { data, error } = await this.supabaseService.client
      .rpc('get_driver_details', { p_driver_id: driverId });

    if (error) {
      this.logger.error(`Failed to fetch details for driver ${driverId}`, error);
      throw new InternalServerErrorException('Failed to fetch driver details');
    }
    return data;
  }

  async findOnePerformance(driverId: number, season: string): Promise<DriverPerformanceResponseDto> {
    const seasonAsNumber = parseInt(season, 10); // Use parseInt for clarity
    
    // Ensure the parsed number is valid before making the database call
    if (isNaN(seasonAsNumber)) {
        this.logger.error(`Invalid season parameter: ${season}`);
        throw new BadRequestException('Invalid season parameter');
    }

    // Disallow future seasons to avoid backend 500s from empty datasets
    const currentYear = new Date().getFullYear();
    if (seasonAsNumber > currentYear) {
      throw new BadRequestException('Season not available yet');
    }

    // Fast existence check to avoid RPC errors when no data exists
    const existenceCheck = await this.supabaseService.client
      .from('driver_standings')
      .select('id', { count: 'exact', head: true })
      .eq('driver_id', driverId)
      .eq('season', seasonAsNumber);

    if (existenceCheck.error) {
      this.logger.warn(`Existence check failed for driver ${driverId}, season ${seasonAsNumber}: ${existenceCheck.error.message}`);
    } else if ((existenceCheck.count ?? 0) === 0) {
      throw new NotFoundException('No performance data found for driver and season');
    }

    const { data, error } = await this.supabaseService.client
      .rpc('get_driver_performance', { p_driver_id: driverId, p_season: seasonAsNumber }); // Pass the integer

    if (error) {
      this.logger.error(`Failed to fetch performance for driver ${driverId} in season ${season}`, error);
      // Map common Postgres operator mismatch to 404 if data likely absent
      if ((error as any).message?.includes('operator does not exist: bigint = text')) {
        throw new NotFoundException('No performance data found for driver and season');
      }
      throw new InternalServerErrorException('Failed to fetch driver performance');
    }
    if (!data) {
      throw new NotFoundException('No performance data found for driver and season');
    }
    return data as unknown as DriverPerformanceResponseDto;
  }
}