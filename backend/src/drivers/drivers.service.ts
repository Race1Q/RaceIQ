import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export type DriverRow = {
  driver_id?: number;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  country_code: string | null;
  name_acronym: string | null;
  driver_number: number | null;
  broadcast_name: string | null;
  headshot_url: string | null;
  team_name: string | null;
  team_colour: string | null;
  season_year: number; // <-- NEW
};

@Injectable()
export class DriversService {
  private readonly logger = new Logger(DriversService.name);
  private supabase: SupabaseClient;

  constructor(private cfg: ConfigService) {
    this.supabase = createClient(
      // FIXED: Use the correct Supabase Project URL, not the database string.
      this.cfg.get<string>('SUPABASE_URL')!,
      this.cfg.get<string>('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );
  }
  

  async getAllForDiff(): Promise<DriverRow[]> {
    const { data, error } = await this.supabase
      .from('drivers')
      .select('*');
    if (error) throw error;
    return data ?? [];
  }

  async upsertMany(rows: DriverRow[]): Promise<void> {
    if (!rows.length) return;
    const { error } = await this.supabase
      .from('drivers')
      .upsert(rows, {
        onConflict: 'full_name,country_code,season_year', // <-- Updated
        ignoreDuplicates: false,
      });
    if (error) {
      this.logger.error(`Upsert failed: ${error.message}`, error);
      throw error;
    }
  }

  async list(limit = 100, offset = 0): Promise<DriverRow[]> {
    const { data, error } = await this.supabase
      .from('drivers')
      .select('*')
      .order('full_name', { ascending: true })
      .range(offset, offset + limit - 1);
    if (error) throw error;
    return data ?? [];
  }
}
