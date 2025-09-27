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

// --- Driver Details Page Types ---

export interface Stat {
  label: string;
  value: string | number;
}

// API Response Shapes
export interface DriverStatsResponse {
  driver: {
    id: number;
    // UPDATED to snake_case to match the API response
    first_name: string;
    last_name: string;
    country_code: string;
    date_of_birth: string;
    profile_image_url: string | null;
  };
  careerStats: {
    wins: number;
    podiums: number;
    poles: number;
    totalPoints: number;
    fastestLaps: number;
    racesCompleted: number;
    firstRace?: { year: string; event: string };
  };
}

export interface RecentFormItem {
  position: number;
  raceName: string;
  countryCode: string;
}

// Final, combined data object the component will use
export interface DriverDetailsData {
  id: number;
  fullName: string;
  firstName: string;
  lastName: string;
  countryCode: string;
  dateOfBirth: string;
  teamName: string;
  imageUrl: string | null;
  wins: number;
  podiums: number;
  fastestLaps: number;
  points: number;
  championshipStanding: string;
  firstRace: { year: string; event: string };
  // NEW: Add specific stat objects
  currentSeasonStats: Stat[];
  careerStats: Stat[];
  // Ensure winsPerSeason is defined
  winsPerSeason: Array<{ season: string; wins: number }>;
  funFact: string; // For the profile section
  recentForm: RecentFormItem[];
}
