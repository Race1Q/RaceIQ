// src/laps/laps-ingest.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SupabaseService } from '../supabase/supabase.service';
import { RacesService } from '../races/races.service';
import { DriversService } from '../drivers/drivers.service';
import { Lap } from './laps.entity';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

@Injectable()
export class LapsIngestService {
  private readonly logger = new Logger(LapsIngestService.name);

  constructor(
    private readonly http: HttpService,
    private readonly supabase: SupabaseService,
    private readonly racesService: RacesService,
    private readonly driversService: DriversService,
  ) {}

  async ingestOnly2024And2025(): Promise<{ created: number; skipped: number }> {
    let created = 0;
    let skipped = 0;

    const seasons: Array<'2024' | '2025'> = ['2024', '2025'];
    const drivers = await this.driversService.getAllDrivers();

    // same normalize + driver map as pit stops
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

    for (const season of seasons) {
      const races = await this.racesService.getRacesBySeason(season);
      this.logger.log(`===== Starting lap ingestion for season ${season} =====`);

      for (const race of races) {
        this.logger.log(`Processing race: season ${race.season_id}, round ${race.round}`);

        let offset = 0;
        const limit = 30;
        let morePages = true;

        while (morePages) {
          try {
            const apiUrl = `https://api.jolpi.ca/ergast/f1/${season}/${race.round}/laps/?limit=${limit}&offset=${offset}`;
            const { data } = await firstValueFrom(this.http.get(apiUrl));

            const lapsData = data?.MRData?.RaceTable?.Races?.[0]?.Laps;
            if (!lapsData || !lapsData.length) {
              if (offset === 0) this.logger.warn(`No lap data found for season ${season}, round ${race.round}, offset ${offset}`);
              break;
            }

            for (const lap of lapsData) {
              const lapNumber = parseInt(lap.number);

              for (const timing of lap.Timings) {
                const key = normalize(timing.driverId || '');
                const mappedDriver = driverKeyToDriver.get(key)
                  || driverKeyToDriver.get(key.replace(/_/g, ''))
                  || driverKeyToDriver.get(key.split('_').pop() || '');

                if (!mappedDriver) {
                  this.logger.warn(`Missing driver mapping for race ${race.id} → driverId ${timing.driverId}`);
                  skipped++;
                  continue;
                }

                const row: Lap = {
                  race_id: race.id!,
                  driver_id: (mappedDriver as any).id,
                  lap_number: lapNumber,
                  position: parseInt(timing.position),
                  time_ms: this.convertTimeToMs(timing.time),
                };

                const { data: existing, error: selErr } = await this.supabase.client
                  .from('laps')
                  .select('id')
                  .eq('race_id', row.race_id)
                  .eq('driver_id', row.driver_id)
                  .eq('lap_number', row.lap_number)
                  .limit(1);

                if (selErr) {
                  this.logger.error(`Select failed for lap: ${selErr.message}`);
                  skipped++;
                  continue;
                }

                if (existing && existing.length) {
                  skipped++;
                  continue;
                }

                const { error: insertErr } = await this.supabase.client
                  .from('laps')
                  .insert(row);

                if (insertErr) {
                  this.logger.error(`Insert failed: ${insertErr.message}`);
                  skipped++;
                  continue;
                }

                created++;
              }
            }

            offset += limit;
            if (lapsData.length < limit) morePages = false;
            await delay(500); // avoid API rate limits

          } catch (e: any) {
            this.logger.error(`Error fetching lap data for season ${season}, round ${race.round}, offset ${offset}: ${e.message}`);
            morePages = false;
          }
        }
      }

      this.logger.log(`===== Finished lap ingestion for season ${season} =====`);
    }

    this.logger.log(`Lap ingestion complete: Created: ${created}, Skipped: ${skipped}`);
    return { created, skipped };
  }

  private convertTimeToMs(time: string): number {
    const [min, sec] = time.split(':');
    return Math.floor(parseInt(min) * 60 * 1000 + parseFloat(sec) * 1000);
  }
}
















