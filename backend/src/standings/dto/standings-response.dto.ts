import { ConstructorEntity } from '../../constructors/constructors.entity';

// This new DTO defines the rich, flattened structure the frontend needs.
export class DriverStandingDto {
  position: number;
  points: number;
  wins: number;
  constructorName: string;
  driverId: number;
  driverFullName: string;
  // Now provided by the materialized view
  driverNumber: number | null;
  driverCountryCode: string | null;
  driverProfileImageUrl: string | null;
}

export interface ConstructorStanding {
  team: ConstructorEntity;
  points: number;
  wins: number;
  position: number;
}

export class StandingsResponseDto {
  driverStandings: DriverStandingDto[];
  constructorStandings: ConstructorStanding[];
}


