// backend/src/constructors/constructors.service.ts

import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { Constructor } from './entities/constructors.entity';

@Injectable()
export class ConstructorsService {
  private readonly logger = new Logger(ConstructorsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  private async fetchConstructorsFromAPI(season: number): Promise<ApiConstructor[]> {
    try {
      const apiUrl = `https://api.jolpi.ca/ergast/f1/${season}/constructors/?format=json`;
      const response = await firstValueFrom(this.httpService.get<ApiResponse>(apiUrl));
      const constructors = response.data.MRData.ConstructorTable.Constructors;
      this.logger.log(`Season ${season}: fetched ${constructors.length} constructors`);
      return constructors;
    } catch (error: any) {
      this.logger.error(`Failed to fetch constructors for season ${season}: ${error.message}`);
      return [];
    }
  }

  private async processConstructor(apiConstructor: ApiConstructor): Promise<void> {
    const constructorData = {
      constructor_id: apiConstructor.constructorId?.substring(0, 50) || '',
      name: apiConstructor.name?.substring(0, 100) || '',
      nationality: apiConstructor.nationality?.substring(0, 50) || '',
      url: apiConstructor.url?.substring(0, 200) || '',
    };

    const { data: existingConstructor, error: selectError } = await this.supabaseService.client
      .from('constructors')
      .select('*')
      .eq('constructor_id', constructorData.constructor_id)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      throw new Error(`Select error for ${constructorData.constructor_id}: ${selectError.message}`);
    }

    if (existingConstructor) {
      // Update existing constructor
      const { error } = await this.supabaseService.client
        .from('constructors')
        .update(constructorData)
        .eq('constructor_id', constructorData.constructor_id);

      if (error) throw new Error(`Update failed for ${constructorData.constructor_id}: ${error.message}`);
    } else {
      // Insert new constructor
      const { error } = await this.supabaseService.client
        .from('constructors')
        .insert(constructorData);

      if (error) throw new Error(`Insert failed for ${constructorData.constructor_id}: ${error.message}`);
    }
  }

  async ingestConstructors(): Promise<{ created: number; updated: number }> {
    const startYear = 1950;
    const endYear = 2025;
    const uniqueConstructors = new Map<string, ApiConstructor>();

    this.logger.log('Starting constructors ingestion');

    for (let season = startYear; season <= endYear; season++) {
      const constructors = await this.fetchConstructorsFromAPI(season);

      // Add unique constructors only
      for (const cons of constructors) {
        if (!uniqueConstructors.has(cons.constructorId)) {
          uniqueConstructors.set(cons.constructorId, cons);
        }
      }

      // Fixed delay to avoid 429 errors
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    let created = 0;
    let updated = 0;

    for (const cons of uniqueConstructors.values()) {
      try {
        // Check if constructor exists first
        const { data: existing, error: selectError } = await this.supabaseService.client
          .from('constructors')
          .select('*')
          .eq('constructor_id', cons.constructorId)
          .single();

        if (selectError && selectError.code !== 'PGRST116') {
          throw new Error(`Select error for ${cons.constructorId}: ${selectError.message}`);
        }

        if (existing) {
          // Update
          await this.processConstructor(cons);
          updated++;
        } else {
          // Insert
          await this.processConstructor(cons);
          created++;
        }
      } catch (error: any) {
        this.logger.error(`Failed to process constructor ${cons.constructorId}: ${error.message}`);
      }
    }

    this.logger.log(`Ingestion complete: ${created} created, ${updated} updated`);
    return { created, updated };
  }

  // Optional helper methods to fetch/search constructors
  async getAllConstructors(): Promise<Constructor[]> {
    const { data, error } = await this.supabaseService.client
      .from('constructors')
      .select('id, name, nationality')
      .order('name', { ascending: true });

    if (error) throw new Error(`Failed to fetch constructors: ${error.message}`);
    return data;
  }

  async getConstructorById(constructorId: string): Promise<Constructor | null> {
    const { data, error } = await this.supabaseService.client
      .from('constructors')
      .select('*')
      .eq('constructor_id', constructorId)
      .single();
  
    if (error) {
      this.logger.error(`Failed to fetch constructor ${constructorId}: ${error.message}`);
      return null;
    }
  
    return {
      id: data.id,
      constructorId: data.constructor_id,
      name: data.name,
      nationality: data.nationality,
      url: data.url,
    };
  }
  
  async searchConstructors(query: string): Promise<Constructor[]> {
    const { data, error } = await this.supabaseService.client
      .from('constructors')
      .select('*')
      .or(`name.ilike.%${query}%,nationality.ilike.%${query}%`)
      .order('name', { ascending: true });
  
    if (error) {
      this.logger.error('Failed to search constructors', error.message);
      throw new Error('Failed to search constructors');
    }
  
    return data.map(constructor => ({
      id: constructor.id,
      constructorId: constructor.constructor_id,
      name: constructor.name,
      nationality: constructor.nationality,
      url: constructor.url,
    }));
  }
  
}
