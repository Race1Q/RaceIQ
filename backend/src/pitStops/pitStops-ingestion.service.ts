// src/pitStops/pitStops-ingestion.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SupabaseService } from '../supabase/supabase.service';
import { RacesService } from '../races/races.service';
import { DriversService } from '../drivers/drivers.service';
import { ApiPitStopsResponse, PitStopRow, durationToMillis } from './pitStops.entity';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

@Injectable()
export class PitStopsIngestionService {
  private readonly logger = new Logger(PitStopsIngestionService.name);

  constructor(
    private readonly http: HttpService,
    private readonly supabase: SupabaseService,
    private readonly racesService: RacesService,
    private readonly driversService: DriversService,
  ) {}

  async ingestOnly2024And2025(): Promise<{ created: number; updated: number }> {
    let created = 0;
    let updated = 0;

    const seasons: Array<{ year: '2024' | '2025'; races: any[] }> = [
      { year: '2024', races: await this.racesService.getRacesBySeason('2024') },
      { year: '2025', races: await this.racesService.getRacesBySeason('2025') },
    ];
    const drivers = await this.driversService.getAllDrivers();

    // Build robust driverId mapping to match Ergast pit stop driverId field
    // Ergast uses forms like "max_verstappen", "norris", "albon", etc.
    const normalize = (s: string) =>
      (s || '')
        .normalize('NFD')
        .replace(/\p{Diacritic}+/gu, '')
        .replace(/[^a-zA-Z0-9_]/g, '')
        .toLowerCase();

    const driverKeyToDriver = new Map<string, any>();
    for (const d of drivers as any[]) {
      const first = normalize(d.first_name);
      const last = normalize(d.last_name);
      const variants = new Set<string>([
        `${first}_${last}`,
        `${first}${last}`,
        `${last}`,
        `${first}`,
      ]);
      for (const v of variants) {
        if (!driverKeyToDriver.has(v)) driverKeyToDriver.set(v, d);
      }
    }

    for (const { year, races } of seasons) {
      for (const race of races) {
        try {
          const apiUrl = `https://api.jolpi.ca/ergast/f1/${year}/${race.round}/pitstops/`;
          const { data } = await firstValueFrom(this.http.get<ApiPitStopsResponse>(apiUrl));
          const payload = data.MRData.RaceTable.Races;
          if (!payload.length) continue;
          const stops = payload[0].PitStops || [];

          for (const item of stops) {
            const key = normalize(item.driverId || '');
            const mappedDriver = driverKeyToDriver.get(key)
              || driverKeyToDriver.get(key.replace(/_/g, ''))
              || driverKeyToDriver.get(key.split('_').pop() || '');
            if (!mappedDriver) {
              this.logger.warn(`Missing driver mapping for race ${race.id} → driverId ${item.driverId}`);
              continue;
            }

            const row: PitStopRow = {
              race_id: race.id!,
              driver_id: (mappedDriver as any).id,
              lap_number: parseInt(item.lap),
              stop_number: parseInt(item.stop),
              duration_ms: durationToMillis(item.duration),
            };

            const { data: existing, error: selErr } = await this.supabase.client
              .from('pit_stops')
              .select('id')
              .eq('race_id', row.race_id)
              .eq('driver_id', row.driver_id)
              .eq('lap_number', row.lap_number)
              .eq('stop_number', row.stop_number)
              .limit(1);

            if (selErr && (selErr as any).code !== 'PGRST116') {
              throw new Error(`Select failed: ${selErr.message}`);
            }

            if (existing && existing.length) {
              const { error } = await this.supabase.client
                .from('pit_stops')
                .update(row)
                .eq('id', existing[0].id);
              if (error) throw new Error(`Update failed: ${error.message}`);
              updated++;
            } else {
              const { error } = await this.supabase.client
                .from('pit_stops')
                .insert(row);
              if (error) throw new Error(`Insert failed: ${error.message}`);
              created++;
            }
          }
        } catch (e: any) {
          if (e?.response?.status === 404) {
            this.logger.warn(`No pit stops yet for season ${year}, round ${race.round}. Skipping.`);
          } else if (e?.response?.status === 429) {
            this.logger.warn(`Rate limited by Ergast. Backing off for 2s...`);
            await delay(2000);
          } else {
            this.logger.error(`Failed pit stop ingest for race ${race.id}: ${e.message}`);
          }
        }

        await delay(700);
      }
    }

    this.logger.log(`pit_stops ingestion (2024 & 2025) complete: ${created} created, ${updated} updated`);
    return { created, updated };
  }
}


