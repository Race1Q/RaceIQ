// backend/src/drivers/drivers.service.ts

import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { Driver } from './entities/driver.entity';

@Injectable()
export class DriversService {
  private readonly logger = new Logger(DriversService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async getAllDrivers(options: { limit?: number; offset?: number } = {}): Promise<Driver[]> {
    const { limit = 100, offset = 0 } = options;

    const { data, error } = await this.supabaseService.client
      .from('drivers')
      .select<string, Driver>('*')
      .range(offset, offset + limit - 1)
      .order('last_name', { ascending: true });

    if (error) {
      this.logger.error('Failed to fetch all drivers', error);
      throw new InternalServerErrorException('Failed to fetch all drivers');
    }
    return data ?? [];
  }

  async findActiveDrivers(): Promise<Driver[]> {
    const { data, error } = await this.supabaseService.client
      .from('drivers_with_full_name')
      // Corrected to select only the columns that exist in your view
      .select<string, Driver>('id, full_name, driver_number, country_code, date_of_birth, name_acronym')
      .gte('id', 2)
      .lte('id', 22)
      .order('last_name', { ascending: true });

    if (error) {
      this.logger.error('Failed to fetch active drivers', error);
      throw new InternalServerErrorException('Failed to fetch active drivers');
    }
    return data ?? [];
  }

  async searchDrivers(query: string): Promise<Driver[]> {
    const { data, error } = await this.supabaseService.client
      .from('drivers')
      .select<string, Driver>('*')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,name_acronym.ilike.%${query}%`)
      .order('last_name', { ascending: true });

    if (error) {
      this.logger.error('Failed to search drivers', error);
      throw new InternalServerErrorException('Failed to search drivers');
    }
    return data ?? [];
  }
}