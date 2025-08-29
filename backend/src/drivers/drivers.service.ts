// src/drivers/drivers.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface DriverRow {
  full_name: string;
  first_name: string;
  last_name: string;
  country_code: string;
  name_acronym: string;
  driver_number: number;
  broadcast_name: string;
  headshot_url: string;
  team_name: string;
  team_colour: string;
  season_year: number;
  is_active: boolean;
}

@Injectable()
export class DriversService {
  private readonly logger = new Logger(DriversService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async getAllDrivers(): Promise<DriverRow[]> {
    const { data, error } = await this.supabaseService.client.from('drivers').select('*');

    if (error) {
      this.logger.error('Failed to fetch all drivers', error);
      throw new Error('Failed to fetch all drivers');
    }

    return data;
  }

  async searchDrivers(query: string): Promise<DriverRow[]> {
    const { data, error } = await this.supabaseService.client
      .from('drivers')
      .select('*')
      .or(`full_name.ilike.%${query}%,country_code.ilike.%${query}%`)
      .order('full_name', { ascending: true });

    if (error) {
      this.logger.error('Failed to search drivers', error);
      throw new Error('Failed to search drivers');
    }

    return data;
  }
}