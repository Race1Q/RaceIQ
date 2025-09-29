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
  driverHeadshotUrl: string | null;
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

export interface ConstructorStandingsItem {
  position: number;
  constructorName: string;
  points: number;
}

// This is the shape of the full response from GET /api/dashboard
export interface DashboardData {
  standingsYear: number;
  nextRace: NextRace;
  championshipStandings: StandingsItem[];
  lastRacePodium: LastRacePodium;
  lastRaceFastestLap: FastestLap;
  headToHead: HeadToHead;
  constructorStandings: ConstructorStandingsItem[];
}

// --- Driver Details Page Types ---

export interface Stat {
  label: string;
  value: string | number;
}

// NEW: This interface matches the exact nested shape of the backend API response
export interface ApiDriverStatsResponse {
  driver: {
    id: number;
    first_name: string;
    last_name: string;
    driver_number: number;
    country_code: string;
    date_of_birth: string;
    profile_image_url: string | null;
    teamName: string; // Enriched on the backend
  };
  careerStats: {
    wins: number;
    podiums: number;
    fastestLaps: number;
    points: number;
    grandsPrixEntered: number;
    dnfs: number;
    highestRaceFinish: number;
    firstRace: { year: number; event: string };
    winsPerSeason: Array<{ season: number; wins: number }>;
  };
  currentSeasonStats: {
    wins: number;
    podiums: number;
    fastestLaps: number;
    standing: string;
  };
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

export interface FeaturedDriver {
  id: number;
  fullName: string;
  driverNumber: number | null;
  countryCode: string | null;
  teamName: string;
  seasonPoints: number;
  seasonWins: number;
  position: number;
  careerStats: {
    wins: number;
    podiums: number;
    poles: number;
  };
  recentForm: RecentFormItem[];
}

// This existing interface is our target "flattened" shape for the UI components
export interface DriverDetailsData {
  id: number;
  fullName: string;
  firstName: string;
  lastName: string;
  countryCode: string;
  dateOfBirth: string;
  teamName: string;
  imageUrl: string | null;
  number: number; // Add this from the API
  wins: number;
  podiums: number;
  points: number;
  championshipStanding: string;
  firstRace: { year: string; event: string };
  currentSeasonStats: Stat[];
  careerStats: Stat[];
  winsPerSeason: Array<{ season: string; wins: number }>;
  funFact: string; // For the profile section
  recentForm: RecentFormItem[];
}
