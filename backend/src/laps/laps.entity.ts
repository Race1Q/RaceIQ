// src/laps/laps.entity.ts

export interface Lap {
    race_id: number;      // Supabase race id (UUID)
    driver_id: number;    // Supabase driver id (UUID)
    lap_number: number;
    position: number;
    time_ms: number;      // Lap time in milliseconds
  }
  
  // Optional: API response type
  export interface ApiLapTiming {
    driverId: string;
    position: string;
    time: string;
    code?: string;
    permanentNumber?: string;
  }
  
  export interface ApiLap {
    number: string;
    Timings: ApiLapTiming[];
  }
  
  export interface ApiRace {
    season: string;
    round: string;
    Laps: ApiLap[];
  }
  
  export interface ApiResponse {
    MRData: {
      RaceTable: {
        Races: ApiRace[];
      };
    };
  }
   
  