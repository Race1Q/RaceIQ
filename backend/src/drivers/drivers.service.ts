// backend/src/drivers/drivers.service.ts

import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { Driver } from './entities/driver.entity';

@Injectable()
export class DriversService {
  private readonly logger = new Logger(DriversService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(options: { isActive?: boolean; limit?: number; offset?: number } = {}): Promise<any[]> { // Return type is now more generic
    const { isActive, limit = 100, offset = 0 } = options;

    let query = this.supabaseService.client
      .from('drivers_with_full_name')
      .select('id, full_name') 
      .order('full_name', { ascending: true });

    if (isActive !== undefined) {
      query = query.eq('is_active', isActive);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      this.logger.error(`Failed to fetch drivers. Error: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Could not fetch drivers.');
    }

    // Transform the data to the shape the frontend expects ({ id, name })
    const formattedData = (data || []).map(driver => ({
      id: driver.id,
      name: driver.full_name,
    }));

    return formattedData;
  }
  
  async upsertMany(rows: Driver[]): Promise<void> {
    if (!rows || rows.length === 0) {
      return;
    }
    const { error } = await this.supabaseService.client.from('drivers').upsert(rows, {
      onConflict: 'full_name,country_code,season_year',
      ignoreDuplicates: false,
    });
    if (error) {
      this.logger.error(`Upsert failed: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Could not upsert drivers.');
    }
  }
  
  async getAllForDiff(): Promise<Driver[]> {
    const { data, error } = await this.supabaseService.client.from('drivers').select('*');
    if (error) {
      this.logger.error(`Failed to fetch drivers for diff. Error: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Could not fetch drivers for diff.');
    }
    return data ?? [];
  }
}