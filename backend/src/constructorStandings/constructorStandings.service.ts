// src/constructor-standings/constructor-standings.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SupabaseService } from '../supabase/supabase.service';

interface ApiConstructor {
  name: string;
  nationality?: string;
  url: string;
}

interface ApiConstructorStanding {
  position: number;
  points: number;
  wins: number;
  Constructor: ApiConstructor;
}

interface ApiResponse {
  MRData: {
    total: string;
    limit: string;
    offset: string;
    ConstructorTable: {
      Constructors: ApiConstructorStanding[];
    };
  };
}

@Injectable()
export class ConstructorStandingsService {
  private readonly logger = new Logger(ConstructorStandingsService.name);
  private readonly apiBaseUrl = 'https://api.jolpi.ca/ergast/f1';

  constructor(
    private readonly httpService: HttpService,
    private readonly supabaseService: SupabaseService,
  ) {}

  /*** --- GET FUNCTIONALITY --- ***/
  async getConstructorStandings(season: number) {
    const { data, error } = await this.supabaseService.client
      .from('constructor_standings')
      .select('*, constructor_id (*)')
      .eq('season', season)
      .order('position', { ascending: true });

    if (error) {
      this.logger.error(`Failed to fetch constructor standings for ${season}`, error.message);
      throw new Error(error.message);
    }

    return data;
  }

  /*** --- INGEST FUNCTIONALITY --- ***/
  private async fetchConstructorStandings(season: number, offset = 0, limit = 30) {
    const apiUrl = `${this.apiBaseUrl}/${season}/constructorstandings/?format=json&limit=${limit}&offset=${offset}`;
    try {
      const response = await firstValueFrom(this.httpService.get<ApiResponse>(apiUrl));
      const standings = response.data.MRData.ConstructorTable.Constructors || [];
      const total = parseInt(response.data.MRData.total);
      return { standings, total };
    } catch (error) {
      this.logger.error(`Failed to fetch constructor standings for season ${season}, offset ${offset}`, error);
      return { standings: [], total: 0 };
    }
  }

  private async findConstructorId(constructorName: string): Promise<number | null> {
    const { data, error } = await this.supabaseService.client
      .from('constructors')
      .select('id')
      .ilike('name', constructorName)
      .maybeSingle();

    if (error) {
      this.logger.error(`Error finding constructor ID for ${constructorName}`, error.message);
      return null;
    }

    return data?.id ?? null;
  }

  private async processConstructorStanding(
    standing: ApiConstructorStanding,
    season: number,
  ): Promise<'created' | 'updated' | 'skipped'> {
    const constructorId = await this.findConstructorId(standing.Constructor.name);
    if (!constructorId) {
      this.logger.warn(`Skipping constructor ${standing.Constructor.name} — not found in database`);
      return 'skipped';
    }

    const standingData = {
      season,
      constructor_id: constructorId,
      position: standing.position,
      points: standing.points,
      wins: standing.wins,
    };

    const { data: existingStanding, error: selectError } = await this.supabaseService.client
      .from('constructor_standings')
      .select('*')
      .eq('season', season)
      .eq('constructor_id', constructorId)
      .maybeSingle();

    if (selectError && selectError.code !== 'PGRST116') {
      throw new Error(`Select error: ${selectError.message}`);
    }

    if (existingStanding) {
      const { error } = await this.supabaseService.client
        .from('constructor_standings')
        .update(standingData)
        .eq('id', existingStanding.id);

      if (error) throw new Error(`Update failed: ${error.message}`);
      return 'updated';
    } else {
      const { error } = await this.supabaseService.client
        .from('constructor_standings')
        .insert(standingData);

      if (error) throw new Error(`Insert failed: ${error.message}`);
      return 'created';
    }
  }

  public async ingestAllConstructorStandings(): Promise<{ created: number; updated: number; skipped: number }> {
    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (let season = 1950; season <= 2025; season++) {
      this.logger.log(`Fetching constructor standings for season ${season}`);

      let offset = 0;
      const limit = 30;
      let hasMore = true;

      while (hasMore) {
        const { standings, total } = await this.fetchConstructorStandings(season, offset, limit);
        if (standings.length === 0) break;

        for (const standing of standings) {
          try {
            const result = await this.processConstructorStanding(standing, season);
            if (result === 'created') created++;
            else if (result === 'updated') updated++;
            else if (result === 'skipped') skipped++;
          } catch (error) {
            this.logger.error(`Error processing standing for ${standing.Constructor.name}`, error);
          }
        }

        offset += limit;
        hasMore = offset < total;

        await new Promise(resolve => setTimeout(resolve, 300)); // Avoid API rate limits
      }
    }

    this.logger.log(`Ingestion completed: ${created} created, ${updated} updated, ${skipped} skipped`);
    return { created, updated, skipped };
  }
}

