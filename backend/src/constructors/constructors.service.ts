// backend/src/constructors/constructors.service.ts

import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { Constructor } from './entities/constructors.entity';

@Injectable()
export class ConstructorsService {
  private readonly logger = new Logger(ConstructorsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(): Promise<Constructor[]> {
    const { data, error } = await this.supabaseService.client
      .from('constructors')
      .select('id, name, nationality')
      .order('name', { ascending: true });

    if (error) {
      this.logger.error('Failed to fetch constructors from Supabase.', error.stack);
      throw new InternalServerErrorException('Could not fetch constructors.');
    }

    return data;
  }
}