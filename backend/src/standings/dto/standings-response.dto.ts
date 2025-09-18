import { Driver } from '../../drivers/drivers.entity';
import { ConstructorEntity } from '../../constructors/constructors.entity';

export interface DriverStanding {
  driver: Driver;
  points: number;
  wins: number;
  position: number;
}

export interface ConstructorStanding {
  team: ConstructorEntity;
  points: number;
  wins: number;
  position: number;
}

export class StandingsResponseDto {
  driverStandings: DriverStanding[];
  constructorStandings: ConstructorStanding[];
}


