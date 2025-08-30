// backend/src/drivers/ingest.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Driver } from './entities/driver.entity';
import { SupabaseService } from '../supabase/supabase.service'; // 1. Import SupabaseService

// ... (Types and helpers like IngestOptions, OpenF1Driver, getWithRetry remain the same) ...
export interface IngestOptions { year?: string; meeting_key?: string; }
export interface IngestResult { fetched: number; unique: number; upserted: number; skipped: number; }
export type OpenF1Driver = { broadcast_name?: string | null; country_code?: string | null; driver_number?: number | null; first_name?: string | null; full_name?: string | null; headshot_url?: string | null; last_name?: string | null; name_acronym?: string | null; team_colour?: string | null; team_name?: string | null; };
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
async function getWithRetry<T>( url: string, params: Record<string, any>, tries = 3, timeout = 20000): Promise<T> {
    let lastErr: any;
    for (let i = 0; i < tries; i++) { try { const { data } = await axios.get<T>(url, { params, timeout }); return data; } catch (e) { lastErr = e; if (i < tries - 1) await sleep(500 * Math.pow(2, i)); } }
    throw lastErr;
}

@Injectable()
export class IngestService {
  private readonly logger = new Logger(IngestService.name);
  private readonly base: string;

  constructor(
    // 2. Inject SupabaseService directly
    private readonly supabase: SupabaseService,
    private readonly configService: ConfigService,
  ) {
    this.base = this.configService.get<string>('OPENF1_BASE') || 'https://api.openf1.org/v1';
  }

  async ingestDrivers(options?: IngestOptions): Promise<IngestResult> {
    try {
      this.logger.log('Starting drivers ingestion process');
      
      // Fetch drivers from OpenF1 API
      const response = await getWithRetry<OpenF1Driver[]>(`${this.base}/drivers`, {});
      
      if (!response || response.length === 0) {
        this.logger.warn('No drivers data received from OpenF1 API');
        return { fetched: 0, unique: 0, upserted: 0, skipped: 0 };
      }

      // Process and upsert the drivers
      return await this.processDrivers(response, { season: options?.year ? parseInt(options.year) : undefined });
    } catch (error) {
      this.logger.error('Failed to ingest drivers', error);
      throw new Error(`Drivers ingestion failed: ${error.message}`);
    }
  }

  private async processDrivers(
    data: OpenF1Driver[],
    options?: { season?: number },
  ): Promise<IngestResult> {
    const season = options?.season ?? new Date().getFullYear();

    const mapped: Omit<Driver, 'id'>[] = (data || [])
      .map((d) => ({
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
        is_active: false,
      }))
      .filter((r) => !!r.full_name && !!r.country_code && r.country_code!.length === 3);

    const fetched = mapped.length;
    if (!fetched) { return { fetched: 0, unique: 0, upserted: 0, skipped: 0 }; }

    const dedup = new Map<string, Omit<Driver, 'id'>>();
    for (const r of mapped) {
      const key = `${r.full_name!.toLowerCase()}|${r.country_code}|${r.season_year}`;
      const prev = dedup.get(key);
      dedup.set(key, prev ? this.pickBetter(prev, r) : r);
    }
    const incoming = Array.from(dedup.values());
    const unique = incoming.length;

    // 3. Use the injected Supabase client directly
    const { data: existing } = await this.supabase.client.from('drivers').select<string, Driver>('*');
    
    const byKey = new Map(
      (existing || [])
        .filter((e) => e.full_name && e.country_code && typeof e.season_year === 'number')
        .map((e) => [`${e.full_name.toLowerCase()}|${e.country_code}|${e.season_year}`, e]),
    );

    const toUpsert: Driver[] = [];
    let skipped = 0;
    for (const row of incoming) {
      const key = `${row.full_name!.toLowerCase()}|${row.country_code}|${row.season_year}`;
      const ex = byKey.get(key);
      if (!ex || this.rowDiffers(ex, row)) {
        toUpsert.push(row as Driver);
      } else {
        skipped++;
      }
    }

    if (toUpsert.length) {
      // 4. Use the injected Supabase client directly
      const { error } = await this.supabase.client.from('drivers').upsert(toUpsert, {
        onConflict: 'full_name,country_code,season_year',
      });
      if (error) {
        this.logger.error(`Upsert failed: ${error.message}`, error.stack);
        throw new Error('Could not upsert drivers.');
      }
    }

    this.logger.log(`Fetched: ${fetched}, Unique: ${unique}, Upserted: ${toUpsert.length}, Skipped: ${skipped}`);
    return { fetched, unique, upserted: toUpsert.length, skipped };
  }
  
  private pickBetter(a: Omit<Driver, 'id'>, b: Omit<Driver, 'id'>): Omit<Driver, 'id'> {
    // Prefer the record with more complete data
    const aScore = this.getCompletenessScore(a);
    const bScore = this.getCompletenessScore(b);
    return aScore >= bScore ? a : b;
  }

  private rowDiffers(a: Driver, b: Omit<Driver, 'id'>): boolean {
    return a.full_name !== b.full_name ||
           a.first_name !== b.first_name ||
           a.last_name !== b.last_name ||
           a.country_code !== b.country_code ||
           a.name_acronym !== b.name_acronym ||
           a.driver_number !== b.driver_number ||
           a.broadcast_name !== b.broadcast_name ||
           a.headshot_url !== b.headshot_url ||
           a.team_name !== b.team_name ||
           a.team_colour !== b.team_colour ||
           a.season_year !== b.season_year ||
           a.is_active !== b.is_active;
  }

  private normalizeHex(hex?: string | null): string | null {
    if (!hex) return null;
    // Remove # if present and ensure it's a valid hex color
    const cleanHex = hex.replace('#', '').toLowerCase();
    if (/^[0-9a-f]{6}$/.test(cleanHex)) {
      return `#${cleanHex}`;
    }
    return null;
  }

  private getCompletenessScore(driver: Omit<Driver, 'id'>): number {
    let score = 0;
    if (driver.full_name) score += 2;
    if (driver.first_name) score += 1;
    if (driver.last_name) score += 1;
    if (driver.country_code) score += 1;
    if (driver.name_acronym) score += 1;
    if (driver.driver_number) score += 1;
    if (driver.broadcast_name) score += 1;
    if (driver.headshot_url) score += 1;
    if (driver.team_name) score += 1;
    if (driver.team_colour) score += 1;
    return score;
  }
}