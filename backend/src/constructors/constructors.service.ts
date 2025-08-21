import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SupabaseService } from '../supabase/supabase.service';
import { Constructor } from './constructors.entity';

interface ApiConstructor {
  constructorId: string;
  url: string;
  name: string;
  nationality: string;
}

interface ApiResponse {
  MRData: {
    ConstructorTable: {
      Constructors: ApiConstructor[];
    };
  };
}

@Injectable()
export class ConstructorService {
  private readonly logger = new Logger(ConstructorService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async fetchConstructorsFromAPI(): Promise<ApiConstructor[]> {
    try {
      const apiUrl = 'https://api.jolpi.ca/ergast/f1/2025/constructors/?format=json';
      const response = await firstValueFrom(this.httpService.get<ApiResponse>(apiUrl));
      
      this.logger.log('API Response received');
      const constructors = response.data.MRData.ConstructorTable.Constructors;
      this.logger.log(`Number of constructors: ${constructors.length}`);
      
      if (constructors.length > 0) {
        this.logger.log('First constructor:', constructors[0]);
      }
      
      return constructors;
    } catch (error) {
      this.logger.error('Failed to fetch constructors from API', error);
      throw new Error('Failed to fetch constructors data');
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await this.supabaseService.client
        .from('constructors')
        .select('count')
        .limit(1);

      if (error) {
        this.logger.error('Supabase connection test failed:', error);
        return false;
      }
      
      this.logger.log('Supabase connection test successful');
      return true;
    } catch (error) {
      this.logger.error('Supabase connection test failed:', error);
      return false;
    }
  }

  async ingestConstructors(): Promise<{ created: number; updated: number }> {
    const apiConstructors = await this.fetchConstructorsFromAPI();
    let created = 0;
    let updated = 0;

    this.logger.log(`Processing ${apiConstructors.length} constructors`);

    for (const apiConstructor of apiConstructors) {
      try {
        await this.processConstructor(apiConstructor);
        created++;
      } catch (error) {
        this.logger.error(`Failed to process constructor ${apiConstructor.constructorId}:`, error);
        // Continue with next constructor even if one fails
      }
    }

    this.logger.log(`Ingested constructors: ${created} created, ${updated} updated`);
    return { created, updated };
  }

  private async processConstructor(apiConstructor: ApiConstructor): Promise<void> {
    this.logger.log(`Processing constructor: ${apiConstructor.constructorId}`);

    // Log field lengths for debugging
    this.logger.debug('Field lengths:', {
      constructorId: apiConstructor.constructorId?.length,
      nationality: apiConstructor.nationality?.length,
      name: apiConstructor.name?.length,
      url: apiConstructor.url?.length
    });

    // Create safe data with truncated fields
    const constructorData = {
      constructor_id: apiConstructor.constructorId?.substring(0, 50) || '',
      name: apiConstructor.name?.substring(0, 100) || '',
      nationality: apiConstructor.nationality?.substring(0, 50) || '',
      url: apiConstructor.url?.substring(0, 200) || ''
    };

    this.logger.debug('Creating constructor with safe data:', constructorData);

    // Check if constructor exists
    const { data: existingConstructor, error: selectError } = await this.supabaseService.client
      .from('constructors')
      .select('*')
      .eq('constructor_id', constructorData.constructor_id)
      .single();

    if (selectError && selectError.code !== 'PGRST116') { // PGRST116 is "not found" error
      this.logger.error(`Select error for ${constructorData.constructor_id}:`, selectError);
      throw new Error(`Select error: ${selectError.message}`);
    }

    if (existingConstructor) {
      this.logger.log(`Updating existing constructor: ${constructorData.constructor_id}`);
      // Update existing constructor
      const { error } = await this.supabaseService.client
        .from('constructors')
        .update(constructorData)
        .eq('constructor_id', constructorData.constructor_id);

      if (error) {
        this.logger.error(`Failed to update constructor ${constructorData.constructor_id}`, error);
        throw new Error(`Update failed: ${error.message}`);
      }
    } else {
      this.logger.log(`Creating new constructor: ${constructorData.constructor_id}`);
      // Create new constructor
      const { error } = await this.supabaseService.client
        .from('constructors')
        .insert(constructorData);

      if (error) {
        this.logger.error(`Failed to create constructor ${constructorData.constructor_id}`, error);
        throw new Error(`Creation failed: ${error.message}`);
      }
    }

    this.logger.log(`Successfully processed: ${constructorData.constructor_id}`);
  }

  async getAllConstructors(): Promise<Constructor[]> {
    const { data, error } = await this.supabaseService.client
      .from('constructors')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      this.logger.error('Failed to fetch constructors', error);
      throw new Error('Failed to fetch constructors');
    }

    return data.map(constructor => ({
      id: constructor.id,
      constructorId: constructor.constructor_id,
      name: constructor.name,
      nationality: constructor.nationality,
      url: constructor.url,
    }));
  }

  async getConstructorById(constructorId: string): Promise<Constructor | null> {
    const { data, error } = await this.supabaseService.client
      .from('constructors')
      .select('*')
      .eq('constructor_id', constructorId)
      .single();

    if (error) {
      this.logger.error(`Failed to fetch constructor ${constructorId}`, error);
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
      this.logger.error('Failed to search constructors', error);
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