export interface RaceStanding {
  position: number;
  driver: string;
  points: number;
  team: string;
  driverAbbreviation: string;
  driverImageUrl: string;
  interval?: string;
  status?: string;
}

export interface KeyInfo {
  weather: string;
  fastestLap: { driver: string; time: string };
  totalOvertakes: number;
}

export interface FlagSegment {
  type: 'green' | 'yellow' | 'red' | 'safety_car' | 'virtual_safety_car';
  startLap: number;
  endLap: number;
}

export interface TireStrategy {
  strategy: string;
  count: number;
}

export interface HistoricalStats {
  lapRecord: { driver: string; time: string };
  previousWinner: string;
}

export interface WeatherInfo {
  airTemp: number;
  trackTemp: number;
  windSpeed: number;
  condition: 'Sunny' | 'Cloudy' | 'Rain';
}

export interface LapPosition {
  lap: number;
  positions: { [driverAbbreviation: string]: number }; // e.g., { 'VER': 1, 'HAM': 3 }
}

export interface RaceControlMessage {
  lap: number;
  message: string;
}

export interface Race {
  id: string;
  trackName: string;
  country: string;
  countryCode: string;
  date: string;
  trackMapCoords: string;
  standings: RaceStanding[];
  keyInfo: KeyInfo;
  flagsTimeline: FlagSegment[];
  paceDistribution: number[];
  tireStrategies: TireStrategy[];
  historicalStats: HistoricalStats;
  driverOfTheDay: string;
  circuitLength: number;
  raceDistance: number;
  totalLaps: number;
  weather: WeatherInfo;
  lapPositions: LapPosition[];
  raceControlMessages: RaceControlMessage[];
}
  