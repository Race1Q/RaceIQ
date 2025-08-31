// src/qualifyingResults/qualifyingResults-ingestion.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SupabaseService } from '../supabase/supabase.service';
import { RacesService } from '../races/races.service';
import { DriversService } from '../drivers/drivers.service';
import { ConstructorsService } from '../constructors/constructors.service';
import { ApiResponse, QualifyingResultRow } from './qualifyingResults.entity';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function timeToMillis(value?: string): number | null {
  if (!value) return null;
  // Formats like 1:15.096 or 1:31.200
  const parts = value.split(':');
  if (parts.length !== 2) return null;
  const minutes = parseInt(parts[0]);
  const seconds = parseFloat(parts[1]);
  if (Number.isNaN(minutes) || Number.isNaN(seconds)) return null;
  return Math.round((minutes * 60 + seconds) * 1000);
}

@Injectable()
export class QualifyingResultsIngestionService {
  private readonly logger = new Logger(QualifyingResultsIngestionService.name);

  constructor(
    private readonly http: HttpService,
    private readonly supabase: SupabaseService,
    private readonly racesService: RacesService,
    private readonly driversService: DriversService,
    private readonly constructorsService: ConstructorsService,
  ) {}

  async ingestOnly2024And2025(): Promise<{ created: number; updated: number }> {
    let created = 0;
    let updated = 0;

    const seasons: Array<{ year: '2024' | '2025'; races: any[] }> = [
      { year: '2024', races: await this.racesService.getRacesBySeason('2024') },
      { year: '2025', races: await this.racesService.getRacesBySeason('2025') },
    ];
    const drivers = await this.driversService.getAllDrivers();
    const constructors = await this.constructorsService.getAllConstructors();

    for (const { year, races } of seasons) {
      for (const race of races) {
        try {
          const apiUrl = `https://api.jolpi.ca/ergast/f1/${year}/${race.round}/qualifying/`;
          const { data } = await firstValueFrom(this.http.get<ApiResponse>(apiUrl));
          const payload = data.MRData.RaceTable.Races;
          if (!payload.length) continue;
          const qualiItems = payload[0].QualifyingResults;

          for (const item of qualiItems) {
            const driver = drivers.find(d =>
              (d as any).name_acronym?.toUpperCase() === (item.Driver.code || '').toUpperCase() ||
              (d as any).driver_number?.toString() === (item.Driver.permanentNumber || '')
            );
            const constructor = constructors.find(c => (c as any).constructor_id === item.Constructor.constructorId);
            if (!driver || !constructor) {
              this.logger.warn(`Missing mapping for session ${race.id} → driver ${item.Driver.driverId}, constructor ${item.Constructor.constructorId}`);
              continue;
            }

            const row: QualifyingResultRow = {
              session_id: race.id!,
              driver_id: (driver as any).id,
              constructor_id: (constructor as any).id,
              position: parseInt(item.position),
              q1_time_ms: timeToMillis(item.Q1),
              q2_time_ms: timeToMillis(item.Q2),
              q3_time_ms: timeToMillis(item.Q3),
            };

            const { data: existing, error: selErr } = await this.supabase.client
              .from('qualifying_results')
              .select('id')
              .eq('session_id', row.session_id)
              .eq('driver_id', row.driver_id)
              .limit(1);

            if (selErr && (selErr as any).code !== 'PGRST116') {
              throw new Error(`Select failed: ${selErr.message}`);
            }

            if (existing && existing.length) {
              const { error } = await this.supabase.client
                .from('qualifying_results')
                .update(row)
                .eq('id', existing[0].id);
              if (error) throw new Error(`Update failed: ${error.message}`);
              updated++;
            } else {
              const { error } = await this.supabase.client
                .from('qualifying_results')
                .insert(row);
              if (error) throw new Error(`Insert failed: ${error.message}`);
              created++;
            }
          }
        } catch (e: any) {
          if (e?.response?.status === 404) {
            this.logger.warn(`No quali results yet for season ${year}, round ${race.round}. Skipping.`);
          } else if (e?.response?.status === 429) {
            this.logger.warn(`Rate limited by Ergast. Backing off for 2s...`);
            await delay(2000);
          } else {
            this.logger.error(`Failed quali ingest for race ${race.id}: ${e.message}`);
          }
        }

        await delay(800);
      }
    }

    this.logger.log(`qualifying_results ingestion (2024 & 2025) complete: ${created} created, ${updated} updated`);
    return { created, updated };
  }
}


