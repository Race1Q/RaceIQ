import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { DriversService, DriverRow } from './drivers.service';

// ---------- Types ----------
export interface IngestOptions {
  year?: string;         // e.g. "2025"
  meeting_key?: string;  // e.g. "latest" or "1219"
}

export interface IngestResult {
  fetched: number;       // raw mapped rows (after validation)
  unique: number;        // after de-dup
  upserted: number;      // rows actually written
  skipped: number;       // unique - upserted
}

export type OpenF1Driver = {
  broadcast_name?: string | null;
  country_code?: string | null;
  driver_number?: number | null;
  first_name?: string | null;
  full_name?: string | null;
  headshot_url?: string | null;
  last_name?: string | null;
  name_acronym?: string | null;
  team_colour?: string | null; // may include '#'
  team_name?: string | null;
};

type IncomingDriver = Omit<DriverRow, 'driver_id'>;

// ---------- Small helpers ----------
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function getWithRetry<T>(
  url: string,
  params: Record<string, any>,
  tries = 3,
  timeout = 20000
): Promise<T> {
  let lastErr: any;
  for (let i = 0; i < tries; i++) {
    try {
      const { data } = await axios.get<T>(url, { params, timeout });
      return data;
    } catch (e) {
      lastErr = e;
      if (i < tries - 1) await sleep(500 * Math.pow(2, i)); // 0.5s, 1s
    }
  }
  throw lastErr;
}

@Injectable()
export class IngestService {
  private readonly logger = new Logger(IngestService.name);
  private readonly base = process.env.OPENF1_BASE || 'https://api.openf1.org/v1';

  constructor(private readonly drivers: DriversService) {}

  // ---------- Public entrypoint ----------
  async run(options?: IngestOptions): Promise<IngestResult> {
    // A) explicit meeting (supports "latest")
    if (options?.meeting_key) {
      const season = options?.year ? Number(options.year) : new Date().getFullYear();
      const data = await getWithRetry<OpenF1Driver[]>(
        `${this.base}/drivers`,
        { meeting_key: options.meeting_key },
        3,
        20000
      );
      return this.processDrivers(data ?? [], { season });
    }

    // B) year provided → resolve meetings for that season, then fetch drivers per meeting
    if (options?.year) {
      const season = Number(options.year);
      const meetings = await getWithRetry<{ meeting_key: number }[]>(
        `${this.base}/meetings`,
        { year: options.year },
        3,
        20000
      );
      const meetingKeys = (meetings ?? []).map((m) => m.meeting_key);
      if (!meetingKeys.length) {
        this.logger.warn(`No meetings found for year ${options.year}`);
        return { fetched: 0, unique: 0, upserted: 0, skipped: 0 };
      }

      const batches = await Promise.all(
        meetingKeys.map((mk) =>
          getWithRetry<OpenF1Driver[]>(
            `${this.base}/drivers`,
            { meeting_key: mk },
            3,
            20000
          ).catch(() => [])
        )
      );
      const merged = ([] as OpenF1Driver[]).concat(...batches);
      return this.processDrivers(merged, { season });
    }

    // C) no filter (can be large; avoid if possible)
    const data = await getWithRetry<OpenF1Driver[]>(
      `${this.base}/drivers`,
      {},
      3,
      40000
    );
    return this.processDrivers(data ?? [], { season: new Date().getFullYear() });
  }

  // ---------- Mapping → De-dup → Diff → Upsert ----------
  private async processDrivers(
    data: OpenF1Driver[],
    options?: { season?: number }
  ): Promise<IngestResult> {
    const season = options?.season ?? new Date().getFullYear();

    // Map API → DB shape + basic validation
    const mapped: IncomingDriver[] = (data || [])
      .map<IncomingDriver>((d) => ({
        full_name: d.full_name ?? null,
        first_name: d.first_name ?? null,
        last_name: d.last_name ?? null,
        country_code: (d.country_code || '').toUpperCase() || null,
        name_acronym: d.name_acronym ?? null,
        driver_number: d.driver_number ?? null,
        broadcast_name: d.broadcast_name ?? null,
        headshot_url: d.headshot_url ?? null,
        team_name: d.team_name ?? null,
        team_colour: this.normalizeHex(d.team_colour ?? null),
        season_year: season, // ← requires season_year column in DB + DriverRow
      }))
      .filter(
        (r) => !!r.full_name && !!r.country_code && r.country_code!.length === 3
      );

    const fetched = mapped.length;
    if (!fetched) {
      this.logger.warn('No drivers found after mapping/validation.');
      return { fetched: 0, unique: 0, upserted: 0, skipped: 0 };
    }

    // De-duplicate by (full_name|country_code|season_year)
    const dedup = new Map<string, IncomingDriver>();
    for (const r of mapped) {
      const key = `${r.full_name!.toLowerCase()}|${r.country_code}|${r.season_year}`;
      const prev = dedup.get(key);
      dedup.set(key, prev ? this.pickBetter(prev, r) : r);
    }
    const incoming = Array.from(dedup.values());
    const unique = incoming.length;

    // Diff vs existing DB rows
    const existing = await this.drivers.getAllForDiff();
    const byKey = new Map(
      (existing || [])
        .filter(
          (e) => e.full_name && e.country_code && typeof e.season_year === 'number'
        )
        .map((e) => [
          `${(e.full_name as string).toLowerCase()}|${e.country_code}|${e.season_year}`,
          e,
        ])
    );

    const toUpsert: IncomingDriver[] = [];
    let skipped = 0;
    for (const row of incoming) {
      const key = `${row.full_name!.toLowerCase()}|${row.country_code}|${row.season_year}`;
      const ex = byKey.get(key);
      if (!ex || this.rowDiffers(ex, row)) toUpsert.push(row);
      else skipped++;
    }

    if (toUpsert.length) await this.drivers.upsertMany(toUpsert);

    this.logger.log(
      `Fetched: ${fetched}, Unique: ${unique}, Upserted: ${toUpsert.length}, Skipped: ${skipped}`
    );
    return { fetched, unique, upserted: toUpsert.length, skipped };
  }

  // Prefer a row with more useful fields populated
  private pickBetter(a: IncomingDriver, b: IncomingDriver): IncomingDriver {
    const score = (r: IncomingDriver) =>
      (r.team_name ? 1 : 0) + (r.headshot_url ? 1 : 0) + (r.driver_number ? 1 : 0);
    return score(b) > score(a) ? b : a;
  }

  private rowDiffers(a: DriverRow | IncomingDriver, b: IncomingDriver): boolean {
    const keys: (keyof IncomingDriver)[] = [
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
    ];
    return keys.some((k) => (a?.[k] ?? null) !== (b?.[k] ?? null));
  }

  private normalizeHex(hex?: string | null): string | null {
    if (!hex) return null;
    return hex.replace(/^#/, '').toLowerCase();
  }
}
