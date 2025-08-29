// src/qualifyingResults/qualifyingResults.entity.ts

// Matches Supabase table `qualifying_results`
export interface QualifyingResultRow {
  id?: number;
  session_id: number;
  driver_id: number;
  constructor_id: number;
  position: number;
  q1_time_ms: number | null;
  q2_time_ms: number | null;
  q3_time_ms: number | null;
}

// Ergast API typings we need
export interface ApiDriverRef {
  driverId: string;
  code?: string;
  permanentNumber?: string;
}

export interface ApiConstructorRef {
  constructorId: string;
}

export interface ApiQualifyingItem {
  position: string;
  Driver: ApiDriverRef;
  Constructor: ApiConstructorRef;
  Q1?: string; // e.g. "1:15.096"
  Q2?: string;
  Q3?: string;
}

export interface ApiRaceQuali {
  season: string;
  round: string;
  QualifyingResults: ApiQualifyingItem[];
}

export interface ApiResponse {
  MRData: {
    RaceTable: {
      Races: ApiRaceQuali[];
    };
  };
}


