// backend/src/drivers/ingest.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { DriversService } from './drivers.service';
import { Driver } from './entities/driver.entity'; // <-- FIX 1: Import the correct Driver entity

// ---------- Types ----------
// ... (IngestOptions, IngestResult, OpenF1Driver types remain the same) ...
export interface IngestOptions { // Kept for clarity
    year?: string; 
    meeting_key?: string; 
}
export interface IngestResult { // Kept for clarity
    fetched: number; 
    unique: number; 
    upserted: number; 
    skipped: number; 
}
export type OpenF1Driver = { // Kept for clarity
    broadcast_name?: string | null;
    country_code?: string | null;
    driver_number?: number | null;
    first_name?: string | null;
    full_name?: string | null;
    headshot_url?: string | null;
    last_name?: string | null;
    name_acronym?: string | null;
    team_colour?: string | null; 
    team_name?: string | null;
};


type IncomingDriver = Omit<Driver, 'driver_id'>; // <-- FIX 2: Base the type on the new Driver entity

// ... (Small helpers and getWithRetry functions remain the same) ...
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
async function getWithRetry<T>( url: string, params: Record<string, any>, tries = 3, timeout = 20000): Promise<T> {
    let lastErr: any;
    for (let i = 0; i < tries; i++) {
        try {
            const { data } = await axios.get<T>(url, { params, timeout });
            return data;
        } catch (e) {
            lastErr = e;
            if (i < tries - 1) await sleep(500 * Math.pow(2, i));
        }
    }
    throw lastErr;
}


@Injectable()
export class IngestService {
  private readonly logger = new Logger(IngestService.name);
  private readonly base: string;

  constructor(
    private readonly drivers: DriversService,
    private readonly configService: ConfigService,
  ) {
    this.base = this.configService.get<string>('OPENF1_BASE') || 'https://api.openf1.org/v1';
  }

  // ... (run method remains the same) ...
  async run(options?: IngestOptions): Promise<IngestResult> {
    if (options?.meeting_key) {
        const season = options?.year ? Number(options.year) : new Date().getFullYear();
        const data = await getWithRetry<OpenF1Driver[]>(`${this.base}/drivers`, { meeting_key: options.meeting_key }, 3, 20000);
        return this.processDrivers(data ?? [], { season });
    }
    if (options?.year) {
        const season = Number(options.year);
        const meetings = await getWithRetry<{ meeting_key: number }[]>(`${this.base}/meetings`, { year: options.year }, 3, 20000);
        const meetingKeys = (meetings ?? []).map((m) => m.meeting_key);
        if (!meetingKeys.length) {
            this.logger.warn(`No meetings found for year ${options.year}`);
            return { fetched: 0, unique: 0, upserted: 0, skipped: 0 };
        }
        const batches = await Promise.all(meetingKeys.map((mk) => getWithRetry<OpenF1Driver[]>(`${this.base}/drivers`, { meeting_key: mk }, 3, 20000).catch(() => [])));
        const merged = ([] as OpenF1Driver[]).concat(...batches);
        return this.processDrivers(merged, { season });
    }
    const data = await getWithRetry<OpenF1Driver[]>(`${this.base}/drivers`, {}, 3, 40000);
    return this.processDrivers(data ?? [], { season: new Date().getFullYear() });
  }

  private async processDrivers(
    data: OpenF1Driver[],
    options?: { season?: number },
  ): Promise<IngestResult> {
    const season = options?.season ?? new Date().getFullYear();

    const mapped: Driver[] = (data || [])
      .map<Driver>((d) => ({
        full_name: d.full_name ?? [d.first_name, d.last_name].filter(Boolean).join(' ') ?? 'Unknown',
        first_name: d.first_name ?? '',
        last_name: d.last_name ?? '',
        country_code: (d.country_code || '').toUpperCase() || null,
        name_acronym: d.name_acronym ?? null,
        driver_number: d.driver_number ?? null,
        broadcast_name: d.broadcast_name ?? null,
        headshot_url: d.headshot_url ?? null,
        team_name: d.team_name ?? null,
        team_colour: this.normalizeHex(d.team_colour ?? null),
        season_year: season,
        is_active: false, // Default value, can be updated later
      }))
      .filter((r) => !!r.full_name && !!r.country_code && r.country_code!.length === 3);

    const fetched = mapped.length;
    if (!fetched) {
      this.logger.warn('No drivers found after mapping/validation.');
      return { fetched: 0, unique: 0, upserted: 0, skipped: 0 };
    }

    const dedup = new Map<string, Driver>(); // Use Driver type
    for (const r of mapped) {
      const key = `${r.full_name!.toLowerCase()}|${r.country_code}|${r.season_year}`;
      const prev = dedup.get(key);
      dedup.set(key, prev ? this.pickBetter(prev, r) : r);
    }
    const incoming = Array.from(dedup.values());
    const unique = incoming.length;

    const existing = await this.drivers.getAllForDiff();
    const byKey = new Map(
      (existing || [])
        .filter((e) => e.full_name && e.country_code && typeof e.season_year === 'number')
        .map((e) => [`${(e.full_name as string).toLowerCase()}|${e.country_code}|${e.season_year}`, e]),
    );

    const toUpsert: Driver[] = []; // Use Driver type
    let skipped = 0;
    for (const row of incoming) {
      const key = `${row.full_name!.toLowerCase()}|${row.country_code}|${row.season_year}`;
      const ex = byKey.get(key);
      if (!ex || this.rowDiffers(ex, row)) toUpsert.push(row);
      else skipped++;
    }

    if (toUpsert.length) await this.drivers.upsertMany(toUpsert);

    this.logger.log(`Fetched: ${fetched}, Unique: ${unique}, Upserted: ${toUpsert.length}, Skipped: ${skipped}`);
    return { fetched, unique, upserted: toUpsert.length, skipped };
  }
  
  // ... (pickBetter and normalizeHex methods remain the same) ...
  private pickBetter(a: Driver, b: Driver): Driver {
    const score = (r: Driver) => (r.team_name ? 1 : 0) + (r.headshot_url ? 1 : 0) + (r.driver_number ? 1 : 0);
    return score(b) > score(a) ? b : a;
  }
  private normalizeHex(hex?: string | null): string | null {
    if (!hex) return null;
    return hex.replace(/^#/, '').toLowerCase();
  }


  private rowDiffers(a: Driver, b: Driver): boolean { // Use Driver type
    const keys: (keyof Omit<Driver, 'driver_id'>)[] = [
      'full_name',
      'first_name',
      'last_name',
      'country_code',
      'name_acronym',
      'driver_number',
      'broadcast_name',
      'headshot_url',
      'team_name',
      'team_colour',
      'season_year',
      'is_active',
    ];
    return keys.some((k) => (a?.[k] ?? null) !== (b?.[k] ?? null));
  }
}