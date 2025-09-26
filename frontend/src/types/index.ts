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

// --- Dashboard Types ---

export interface NextRace {
  raceName: string;
  circuitName: string;
  raceDate: string; // ISO 8601 Date string
}

export interface StandingsItem {
  position: number;
  driverFullName: string;
  constructorName: string;
  points: number;
}

export interface PodiumItem {
  position: number;
  driverFullName: string;
  constructorName: string;
}

export interface LastRacePodium {
  raceName: string;
  podium: PodiumItem[];
}

export interface FastestLap {
  driverFullName: string;
  lapTime: string;
}

export interface HeadToHeadDriver {
  fullName: string;
  headshotUrl: string;
  teamName: string;
  wins: number;
  podiums: number;
  points: number;
}

export interface HeadToHead {
  driver1: HeadToHeadDriver;
  driver2: HeadToHeadDriver;
}

// This is the shape of the full response from GET /api/dashboard
export interface DashboardData {
  nextRace: NextRace;
  championshipStandings: StandingsItem[];
  lastRacePodium: LastRacePodium;
  lastRaceFastestLap: FastestLap;
  headToHead: HeadToHead;
}
