// src/races/races.entity.ts

/**
 * Interface for the 'races' table in Supabase.
 * This reflects the structure of your database table.
 */
export interface Race {
  id?: number;
  season_id: number;
  circuit_id: number; // Foreign key to the circuits table
  round: number;
  name: string;
  date: string; // ISO 8601 date string
  time: string; // ISO 8601 time string
}

/**
 * Interface for the data returned from the Ergast API.
 * This is the raw data model we will ingest.
 */
export interface ApiRace {
  season: string;
  round: string;
  url: string;
  raceName: string;
  Circuit: {
    circuitId: string;
    url: string;
    circuitName: string;
    Location: {
      lat: string;
      long: string;
      locality: string;
      country: string;
    };
  };
  date: string;
  time: string;
}

/**
 * The structure of the full API response from the Ergast API.
 */
export interface ApiResponse {
  MRData: {
    RaceTable: {
      Races: ApiRace[];
    };
  };
}
