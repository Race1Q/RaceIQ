// src/pitStops/pitStops.entity.ts

// Supabase table shape for `pit_stops`
export interface PitStopRow {
  id?: number;
  race_id: number;
  driver_id: number;
  lap_number: number;
  stop_number: number;
  duration_ms: number;
}

// Ergast API typings
export interface ApiPitStopItem {
  driverId: string;
  lap: string;      // number as string
  stop: string;     // number as string
  time: string;     // wall clock, not used for storage
  duration: string; // seconds with milliseconds, e.g. "13.341"
}

export interface ApiRacePitStops {
  season: string;
  round: string;
  PitStops: ApiPitStopItem[];
}

export interface ApiResponse {
  MRData: {
    RaceTable: {
      Races: ApiRacePitStops[];
    };
  };
}


