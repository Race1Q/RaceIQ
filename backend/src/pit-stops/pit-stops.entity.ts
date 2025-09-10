// src/pit-stops/pit-stops.entity.ts

export interface ApiPitStopsResponse {
  MRData: {
    RaceTable: {
      season: string;
      round: string;
      Races: Array<{
        season: string;
        round: string;
        PitStops: Array<{
          driverId: string;
          lap: string; // number as string
          stop: string; // stop number as string
          time: string; // timestamp HH:MM:SS
          duration: string; // seconds with milliseconds e.g. "13.341"
        }>;
      }>;
    };
  };
}

export interface PitStopRow {
  race_id: number; // FK to races.id
  driver_id: number; // FK to drivers.id
  lap_number: number;
  stop_number: number;
  duration_ms: number | null;
}

export function durationToMillis(value?: string): number | null {
  if (!value) return null;
  // Examples: "13.341" seconds, or "16.0"
  const seconds = parseFloat(value);
  if (Number.isNaN(seconds)) return null;
  return Math.round(seconds * 1000);
}


