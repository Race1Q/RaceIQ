import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SupabaseService } from '../supabase/supabase.service';
import { Constructor } from './constructors.entity';

// --- Interfaces for external API data ---
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
export class ConstructorsService {
  private readonly logger = new Logger(ConstructorsService.name);

  // CORRECT: Added HttpService which was missing from the broken merge
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly httpService: HttpService,
  ) {}

  // --- START: Ingestion Logic (from main branch) ---

  private async fetchConstructorsFromAPI(season: number): Promise<ApiConstructor[]> {
    try {
      const apiUrl = `https://api.jolpi.ca/ergast/f1/${season}/constructors/?format=json`;
      const response = await firstValueFrom(this.httpService.get<ApiResponse>(apiUrl));
      return response.data.MRData.ConstructorTable.Constructors;
    } catch (error: any) {
      this.logger.error(`Failed to fetch constructors for season ${season}`, error.message);
      return [];
    }
  }

  async ingestConstructors(): Promise<{ created: number; updated: number }> {
    const startYear = 1950;
    const endYear = new Date().getFullYear(); // Use current year
    const uniqueConstructors = new Map<string, ApiConstructor>();

    this.logger.log('Starting constructors ingestion');

    for (let season = startYear; season <= endYear; season++) {
      const constructors = await this.fetchConstructorsFromAPI(season);
      for (const cons of constructors) {
        if (!uniqueConstructors.has(cons.constructorId)) {
          uniqueConstructors.set(cons.constructorId, cons);
        }
      }
      // Delay to avoid rate-limiting
      await new Promise(resolve => setTimeout(resolve, 250));
    }

    // Using upsert for cleaner and more efficient logic
    const toUpsert = Array.from(uniqueConstructors.values()).map(cons => ({
        constructor_id: cons.constructorId,
        name: cons.name,
        nationality: cons.nationality,
        url: cons.url,
    }));

    const { error } = await this.supabaseService.client
      .from('constructors')
      .upsert(toUpsert, { onConflict: 'constructor_id' });

    if (error) {
        this.logger.error('Failed to upsert constructors', error.message);
        throw new Error('Constructor upsert failed');
    }
    
    const count = uniqueConstructors.size;
    this.logger.log(`Ingestion complete: Processed ${count} unique constructors.`);
    // Note: A single upsert doesn't return created/updated counts, so we return the total processed.
    return { created: count, updated: 0 };
  }

  // --- END: Ingestion Logic ---


  // --- START: Data Fetching for UI (from your feature branch) ---

  async getAllConstructors(): Promise<Constructor[]> {
    // CORRECT: Removed the 'query' variable which caused a compilation error
    const { data, error } = await this.supabaseService.client
      .from('constructors')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      this.logger.error('Failed to fetch all constructors', error.message);
      throw new Error('Failed to fetch all constructors');
    }
    return data;
  }

  async getConstructorById(constructorId: string): Promise<Constructor | null> {
    const { data, error } = await this.supabaseService.client
      .from('constructors')
      .select('*')
      .eq('constructor_id', constructorId)
      .single();
  
    if (error) {
      // It's normal for .single() to error if no record is found, so we don't always throw an error.
      if (error.code !== 'PGRST116') { // PGRST116 is the "no rows found" error code
        this.logger.error(`Failed to fetch constructor ${constructorId}`, error.message);
      }
      return null;
    }
    return data;
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

  // --- END: Data Fetching for UI ---
}