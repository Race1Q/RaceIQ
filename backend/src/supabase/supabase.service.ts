// src/supabase/supabase.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupabaseService {
  public client: SupabaseClient;
  private readonly logger = new Logger(SupabaseService.name);

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('SUPABASE_URL');
    const key = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!url || !key) {
      this.logger.error('Supabase URL or SERVICE_ROLE_KEY missing!');
      throw new Error('Supabase URL or SERVICE_ROLE_KEY missing!');
    }

    this.client = createClient(url, key);
    this.logger.log(`Supabase client initialized (key starts with: ${key.slice(0, 5)})`);
  }
}