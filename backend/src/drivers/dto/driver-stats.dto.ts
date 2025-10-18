// backend/src/drivers/dto/driver-stats.dto.ts

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
  poles: number;
  standing: string;
}

class CareerStatsDto {
  wins: number;
  podiums: number;
  fastestLaps: number;
  poles: number;
  points: number;
  grandsPrixEntered: number;
  dnfs: number;
  highestRaceFinish: number;
  worldChampionships: number;
  firstRace: FirstRaceDto;
  winsPerSeason: WinsPerSeasonDto[];
}

// Define the transformed driver interface
interface TransformedDriver {
  id: number;
  full_name: string;
  given_name: string | null;
  family_name: string | null;
  code: string | null;
  current_team_name: string | null;
  image_url: string | null;
  team_color: string | null;
  country_code: string | null;
  driver_number: number | null;
  date_of_birth: Date | null;
  bio: string | null;
  fun_fact: string | null;
  teamName?: string; // For enriched driver data
}

import { ApiProperty } from '@nestjs/swagger';

export class DriverStatsResponseDto {
  driver: TransformedDriver;
  careerStats: CareerStatsDto;
  currentSeasonStats: CurrentSeasonStatsDto;

  @ApiProperty({
    description: "The driver's all-time fastest lap time in milliseconds, if available.",
    example: 76330,
    nullable: true,
  })
  bestLapMs: number | null;

  constructor(
    driver: TransformedDriver,
    careerStats: CareerStatsDto,
    currentSeasonStats: CurrentSeasonStatsDto,
    bestLapMs: number | null,
  ) {
    this.driver = driver;
    this.careerStats = careerStats;
    this.currentSeasonStats = currentSeasonStats;
    this.bestLapMs = bestLapMs;
  }
}

// NEW: Driver comparison stats response
export class DriverComparisonStatsResponseDto {
  driverId: number;
  year: number | null;
  career: {
    wins: number;
    podiums: number;
    fastestLaps: number;
    points: number;
    dnfs: number;
    sprintWins: number;
    sprintPodiums: number;
  };
  yearStats: null | {
    wins: number;
    podiums: number;
    fastestLaps: number;
    points: number;
    dnfs: number;
    sprintWins: number;
    sprintPodiums: number;
    poles: number; // from qualifying results
  };
}

// Shared small DTO used by multiple modules
export interface RecentFormItem {
  position: number;
  raceName: string;
  countryCode: string;
}