// backend/src/drivers/dto/driver-stats.dto.ts
import { Driver } from '../drivers.entity';

class FirstRaceDto {
  year: number;
  event: string;
}

class WinsPerSeasonDto {
  season: number;
  wins: number;
}

class CurrentSeasonStatsDto {
  wins: number;
  podiums: number;
  fastestLaps: number;
  standing: string;
}

class CareerStatsDto {
  wins: number;
  podiums: number;
  fastestLaps: number;
  points: number;
  grandsPrixEntered: number;
  dnfs: number;
  highestRaceFinish: number;
  firstRace: FirstRaceDto;
  winsPerSeason: WinsPerSeasonDto[];
}

export class DriverStatsResponseDto {
  driver: Driver;
  careerStats: CareerStatsDto;
  currentSeasonStats: CurrentSeasonStatsDto;
}