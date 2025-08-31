// backend/src/constructors/constructors.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SupabaseService } from '../supabase/supabase.service';
import { Constructor } from './entities/constructors.entity';

interface ApiConstructor { constructorId: string; url: string; name: string; nationality: string; }
interface ApiResponse { MRData: { ConstructorTable: { Constructors: ApiConstructor[] } } }

@Injectable()
export class ConstructorsService {
  private readonly logger = new Logger(ConstructorsService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly httpService: HttpService,
  ) {}

  async ingestConstructors(): Promise<{ count: number }> {
    const startYear = 1950;
    const endYear = new Date().getFullYear();
    const uniqueConstructors = new Map<string, ApiConstructor>();
    this.logger.log('Starting constructors ingestion...');

    for (let season = startYear; season <= endYear; season++) {
      try {
        const apiUrl = `https://api.jolpi.ca/ergast/f1/${season}/constructors.json`;
        const response = await firstValueFrom(this.httpService.get<ApiResponse>(apiUrl));
        const constructors = response.data.MRData.ConstructorTable.Constructors;
        for (const cons of constructors) {
          if (!uniqueConstructors.has(cons.constructorId)) {
            uniqueConstructors.set(cons.constructorId, cons);
          }
        }
      } catch (error) { this.logger.error(`Failed to fetch constructors for season ${season}`, error.stack); }
      await new Promise(resolve => setTimeout(resolve, 250));
    }

    const toUpsert = Array.from(uniqueConstructors.values()).map(c => ({
      constructor_id: c.constructorId, name: c.name, nationality: c.nationality, url: c.url,
    }));

    const { error } = await this.supabaseService.client.from('constructors').upsert(toUpsert, { onConflict: 'constructor_id' });
    if (error) throw new Error(`Constructor upsert failed: ${error.message}`);
    
    this.logger.log(`Ingestion complete: Processed ${toUpsert.length} unique constructors.`);
    return { count: toUpsert.length };
  }

  async getAllConstructors(): Promise<Constructor[]> {
    const { data, error } = await this.supabaseService.client.from('constructors').select('*').order('name');
    if (error) throw new Error('Failed to fetch all constructors');
    return data;
  }
}