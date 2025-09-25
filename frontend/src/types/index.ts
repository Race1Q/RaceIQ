// frontend/src/types/index.ts

export interface ApiDriver {
  id: number;
  first_name: string;
  last_name: string;
  driver_number: number | null;
  country_code: string | null;
  profile_image_url: string;
}

export interface DriverStanding {
  position: number;
  points: number;
  wins: number;
  constructorName: string;
  constructorId: number;
  driver: ApiDriver;
}

export interface StandingsResponse {
  driverStandings: DriverStanding[];
  // We'll use constructorStandings later
}

// This is the final "hydrated" shape our component will use
export interface Driver {
  id: number;
  fullName: string;
  driverNumber: number | null;
  countryCode: string | null;
  teamName: string;
  headshotUrl: string;
  teamColor: string; // We'll add this from a local map
}


