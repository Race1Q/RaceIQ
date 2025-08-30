// backend/src/constructor-standings/constructor-standings.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SupabaseService } from '../supabase/supabase.service';

interface ApiConstructorStanding { position: string; points: string; wins: string; Constructor: { constructorId: string; }; }
interface ApiResponse { MRData: { StandingsTable?: { StandingsLists: Array<{ ConstructorStandings: ApiConstructorStanding[] }> } } }

@Injectable()
export class ConstructorStandingsService {
  private readonly logger = new Logger(ConstructorStandingsService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly httpService: HttpService,
  ) {}

  async ingestStandingsForSeason(season: number): Promise<void> {
    const apiUrl = `https://api.jolpi.ca/ergast/f1/${season}/constructorStandings.json`;
    const response = await firstValueFrom(this.httpService.get<ApiResponse>(apiUrl));
    const standings = response.data.MRData.StandingsTable?.StandingsLists[0]?.ConstructorStandings || [];

    for (const standing of standings) {
      const { data: constructor } = await this.supabaseService.client
        .from('constructors').select('id').eq('constructor_id', standing.Constructor.constructorId).single();
      
      if (constructor) {
        const standingData = {
          season_id: season, // Assuming season year matches season_id for simplicity
          constructor_id: constructor.id,
          position: parseInt(standing.position),
          points: parseFloat(standing.points),
          wins: parseInt(standing.wins),
        };
        await this.supabaseService.client.from('constructor_standings').upsert(standingData, { onConflict: 'season_id, constructor_id' });
      }
    }
  }

  async getStandingsBySeason(season: number) {
    const { data, error } = await this.supabaseService.client
      .from('constructor_standings')
      .select('*, constructor:constructors(name, nationality)')
      .eq('season', season)
      .order('position', { ascending: true });
      
    if (error) throw new Error(`Failed to fetch standings for season ${season}`);
    return data;
  }
}

