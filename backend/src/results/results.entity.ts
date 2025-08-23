// src/results/results.entity.ts

// This interface matches the structure of the data you want to save to your Supabase table.
export interface RaceResult {
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

// These interfaces match the structure of the data coming from the Ergast API.
export interface ApiDriver {
  driverId: string;
}

export interface ApiConstructor {
  constructorId: string;
}

export interface ApiResult {
  position: string;
  points: string;
  grid: string;
  laps: string;
  status: string;
  Time: {
    millis: string;
  }
  Driver: ApiDriver;
  Constructor: ApiConstructor;
}

export interface ApiRace {
  season: string;
  round: string;
  url: string;
  raceName: string;
  Circuit: {
    circuitName: string;
  };
  date: string;
  time: string;
  Results: ApiResult[];
}

export interface ApiResponse {
  MRData: {
    RaceTable: {
      Races: ApiRace[];
    };
  };
}
