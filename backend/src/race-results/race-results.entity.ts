// src/race-results/race-results.entity.ts

// This interface matches the structure of the Supabase `race_results` table
export interface RaceResultRow {
  id?: number;
  session_id: number;
  driver_id: number;
  constructor_id: number;
  position: number;
  points: number;
  grid: number;
  laps: number;
  time_ms: number | null;
  status: string;
}

// Ergast API typings (subset we need)
export interface ApiDriverRef {
  driverId: string;
  code?: string;
  permanentNumber?: string;
}

export interface ApiConstructorRef {
  constructorId: string;
}

export interface ApiResultItem {
  position: string;
  points: string;
  grid: string;
  laps: string;
  status: string;
  Time?: {
    millis?: string;
  };
  Driver: ApiDriverRef;
  Constructor: ApiConstructorRef;
}

export interface ApiRace {
  season: string;
  round: string;
  raceName: string;
  date: string;
  time: string;
  Results: ApiResultItem[];
}

export interface ApiResponse {
  MRData: {
    RaceTable: {
      Races: ApiRace[];
    };
  };
}


