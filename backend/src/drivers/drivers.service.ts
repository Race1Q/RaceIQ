// src/drivers/drivers.service.ts
import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { Driver } from './entities/driver.entity';

@Injectable()
export class DriversService {
  private readonly logger = new Logger(DriversService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  // The fields to select, including a computed full_name
  private get selectFields() {
    return 'id, driver_number, first_name, last_name, name_acronym, country_code, date_of_birth';
  }

  async getAllDrivers(): Promise<Driver[]> {
    const { data, error } = await this.supabaseService.client
      .from('drivers')
      .select(this.selectFields);

    if (error) {
      this.logger.error('Failed to fetch all drivers', error);
      throw new InternalServerErrorException('Failed to fetch all drivers');
    }
    return (data as unknown as Driver[]) || [];
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
    return (data as unknown as Driver[]) || [];
  }
}