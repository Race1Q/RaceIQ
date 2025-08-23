// src/seasons/seasons.entity.ts

// This interface reflects the structure of a single season object from the Ergast API.
export interface ApiSeason {
  season: string;
  url: string;
}

// This interface defines the overall structure of the API response,
// including pagination details like 'total'.
export interface ApiResponse {
  MRData: {
    SeasonTable: {
      Seasons: ApiSeason[];
    };
    total: string;
    limit: string;
    offset: string;
  };
}

// This interface matches the schema of our Supabase 'seasons' table.
export interface Season {
  id?: number; // 'id' can be optional as it's auto-incrementing
  year: number;
}
