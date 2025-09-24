// src/services/raceDetails.ts
// Frontend adapters for detail data.

function resolveBase(): string {
  const fromWindow =
    typeof window !== 'undefined' && (window as any).__API_BASE__ && String((window as any).__API_BASE__);
  const fromEnv =
    (typeof process !== 'undefined' && (process as any)?.env && (
      (process as any).env.VITE_API_BASE_URL ||
      (process as any).env.NX_API_BASE_URL ||
      (process as any).env.API_BASE_URL
    )) || '';
  return (fromWindow || fromEnv || '/api').toString().replace(/\/+$/, '');
}
const BASE = resolveBase();

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { credentials: 'include', headers: { 'Content-Type': 'application/json' } });
  if (!res.ok) throw new Error(`${path} -> ${res.status} ${res.statusText}`);
  return res.json();
}

// ---------- Types shaped to your tables ----------

export type RaceResult = {
  session_id?: number;
  driver_id: number | string;
  driver_code?: string;
  driver_name?: string;
  constructor_id?: number | string;
  constructor_name?: string;
  position?: number | null;
  points?: number | null;
  grid?: number | null;
  time_ms?: number | null;
  status?: string | null;
  fastest_lap_rank?: number | null;
  points_for_fastest_lap?: number | null;
};

export type QualiResult = {
  session_id?: number;
  driver_id: number | string;
  driver_code?: string;
  driver_name?: string;
  constructor_id?: number | string;
  constructor_name?: string;
  position?: number | null;
  q1_time_ms?: number | null;
  q2_time_ms?: number | null;
  q3_time_ms?: number | null;
};

export type PitStop = {
  race_id: number | string;
  driver_id: number | string;
  driver_code?: string;
  stop_number: number;
  lap_number: number;
  total_duration_in_pit_ms?: number | null;
  stationary_duration_ms?: number | null;
};

export type Lap = {
  id?: number;
  race_id: number | string;
  driver_id: number | string;
  driver_code?: string;
  lap_number: number;
  position?: number | null;
  time_ms?: number | null;
  sector_1_ms?: number | null;
  sector_2_ms?: number | null;
  sector_3_ms?: number | null;
  is_pit_out_lap?: boolean | null;
};

export type RaceEvent = {
  id?: number;
  session_id?: number;
  lap_number?: number;
  type?: string;           // e.g., 'yellow_flag', 'overtake', etc.
  message?: string | null;
  metadata?: any;          // should include x/y for map overlays if available
};

// ---------- Flexible endpoints (no backend change required) ----------

function candidatePaths(base: string, raceId: string | number, names: string[]) {
  const id = encodeURIComponent(String(raceId));
  // Supports routes like:
  //   /{base}?raceId=  | /{base}?race_id= | /{base}/by-race/:id | /{base}/race/:id
  return [
    `/${base}?raceId=${id}`,
    `/${base}?race_id=${id}`,
    `/${base}/by-race/${id}`,
    `/${base}/race/${id}`,
  ].concat(names); // allow caller to pass extra candidates if needed
}

async function tryGet<T>(paths: string[]): Promise<T> {
  let last: any;
  for (const p of paths) {
    try { return await getJSON<T>(p); }
    catch (e) { last = e; }
  }
  throw last instanceof Error ? last : new Error('All endpoints failed');
}

// ---------- Public fetchers ----------

export async function fetchRaceResultsByRaceId(raceId: string | number): Promise<RaceResult[]> {
  return tryGet<RaceResult[]>(candidatePaths('race-results', raceId, []));
}

export async function fetchQualifyingResultsByRaceId(raceId: string | number): Promise<QualiResult[]> {
  return tryGet<QualiResult[]>(candidatePaths('qualifying-results', raceId, []));
}

export async function fetchPitStopsByRaceId(raceId: string | number): Promise<PitStop[]> {
  return tryGet<PitStop[]>(candidatePaths('pit-stops', raceId, []));
}

export async function fetchLapsByRaceId(raceId: string | number): Promise<Lap[]> {
  return tryGet<Lap[]>(candidatePaths('laps', raceId, []));
}

export async function fetchRaceEventsByRaceId(raceId: string | number): Promise<RaceEvent[]> {
  // If your events are tied to session, your backend may expose …/events?raceId= and do the join.
  return tryGet<RaceEvent[]>(candidatePaths('race-events', raceId, []));
}
