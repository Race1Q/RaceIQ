import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StandingsController } from './standings.controller';
import { StandingsService } from './standings.service';
import { Season } from '../seasons/seasons.entity';
import { Race } from '../races/races.entity';
import { Session } from '../sessions/sessions.entity';
import { RaceResult } from '../race-results/race-results.entity';
import { Driver } from '../drivers/drivers.entity';
import { ConstructorEntity } from '../constructors/constructors.entity';
import { DriverStandingMaterialized } from './driver-standings-materialized.entity';
import { DriverCareerStatsMaterialized } from '../drivers/driver-career-stats-materialized.entity';
import { DriversModule } from '../drivers/drivers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Season,
      Race,
      Session,
      RaceResult,
      Driver,
      ConstructorEntity,
      DriverStandingMaterialized,
      DriverCareerStatsMaterialized,
    ]),
    DriversModule,
  ],
  controllers: [StandingsController],
  providers: [StandingsService],
  exports: [StandingsService],
})
export class StandingsModule {}


