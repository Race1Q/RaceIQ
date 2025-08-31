// src/raceResults/raceResults-ingestion.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SupabaseService } from '../supabase/supabase.service';
import { RacesService } from '../races/races.service';
import { DriversService } from '../drivers/drivers.service';
import { ConstructorsService } from '../constructors/constructors.service';
import { ApiResponse, ApiRace, RaceResultRow } from './raceResults.entity';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

@Injectable()
export class RaceResultsIngestionService {
  private readonly logger = new Logger(RaceResultsIngestionService.name);

  constructor(
    private readonly http: HttpService,
    private readonly supabase: SupabaseService,
    private readonly racesService: RacesService,
    private readonly driversService: DriversService,
    private readonly constructorsService: ConstructorsService,
  ) {}

  async fetchAllResultsForSeason(season: string): Promise<ApiRace[]> {
    const url = `https://api.jolpi.ca/ergast/f1/${season}/results.json?limit=1000`;
    this.logger.log(`Fetching season results from ${url}`);
    const { data } = await firstValueFrom(this.http.get<ApiResponse>(url));
    return data.MRData.RaceTable.Races;
  }

  async ingestOnly2024And2025(): Promise<{ created: number; updated: number }> {
    let created = 0;
    let updated = 0;

    // Fetch races only for the requested seasons
    const seasons: Array<{ year: '2024' | '2025'; races: any[] }> = [
      { year: '2024', races: await this.racesService.getRacesBySeason('2024') },
      { year: '2025', races: await this.racesService.getRacesBySeason('2025') },
    ];
    const drivers = await this.driversService.getAllDrivers();
    const constructors = await this.constructorsService.getAllConstructors();

    for (const { year, races } of seasons) {
      for (const race of races) {
      try {
        // Use the season YEAR, not the foreign key season_id
        // Use Ergast endpoint without .json to match working endpoints
        const apiUrl = `https://api.jolpi.ca/ergast/f1/${year}/${race.round}/results/`;
        const { data } = await firstValueFrom(this.http.get<ApiResponse>(apiUrl));
        const racesPayload = data.MRData.RaceTable.Races;
        if (!racesPayload.length) continue;
        const resultItems = racesPayload[0].Results;

        for (const apiResult of resultItems) {
          // Match by code (e.g., ALB) or driver_number if available in your table
          const driver = drivers.find(d =>
            (d as any).name_acronym?.toUpperCase() === (apiResult.Driver.code || '').toUpperCase() ||
            (d as any).driver_number?.toString() === (apiResult.Driver.permanentNumber || '')
          );
          const constructor = constructors.find(c => (c as any).constructor_id === apiResult.Constructor.constructorId);
          if (!driver || !constructor) {
            this.logger.warn(`Missing driver/constructor mapping for session ${race.id} → driver ${apiResult.Driver.driverId}, constructor ${apiResult.Constructor.constructorId}`);
            continue;
          }

          const row: RaceResultRow = {
            session_id: race.id!,
            driver_id: (driver as any).id,
            constructor_id: (constructor as any).id,
            position: parseInt(apiResult.position),
            points: parseFloat(apiResult.points),
            grid: parseInt(apiResult.grid),
            laps: parseInt(apiResult.laps),
            time_ms: apiResult.Time?.millis ? parseInt(apiResult.Time.millis) : null,
            status: apiResult.status,
          };

          const { data: existing, error: selectErr } = await this.supabase.client
            .from('race_results')
            .select('id')
            .eq('session_id', row.session_id)
            .eq('driver_id', row.driver_id)
            .limit(1);

          if (selectErr && (selectErr as any).code !== 'PGRST116') {
            throw new Error(`Select failed: ${selectErr.message}`);
          }

          if (existing && existing.length) {
            const { error } = await this.supabase.client
              .from('race_results')
              .update(row)
              .eq('id', existing[0].id);
            if (error) throw new Error(`Update failed: ${error.message}`);
            updated++;
          } else {
            const { error } = await this.supabase.client
              .from('race_results')
              .insert(row);
            if (error) throw new Error(`Insert failed: ${error.message}`);
            created++;
          }
        }
      } catch (e: any) {
        if (e?.response?.status === 404) {
          this.logger.warn(`No results yet for season ${year}, round ${race.round}. Skipping.`);
        } else if (e?.response?.status === 429) {
          this.logger.warn(`Rate limited by Ergast. Backing off for 2s...`);
          await delay(2000);
        } else {
          this.logger.error(`Failed ingest for race ${race.id}: ${e.message}`);
        }
      }

      await delay(800);
      }
    }

    this.logger.log(`race_results ingestion (2024 & 2025) complete: ${created} created, ${updated} updated`);
    return { created, updated };
  }
}


