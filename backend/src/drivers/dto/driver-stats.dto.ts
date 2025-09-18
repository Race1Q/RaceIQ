import { Driver } from '../drivers.entity';

export class CareerStatsDto {
  wins: number;
  podiums: number;
  poles: number;
  totalPoints: number;
  fastestLaps: number;
  racesCompleted: number;
}

export class DriverStatsResponseDto {
  driver: Driver;
  careerStats: CareerStatsDto;
}
