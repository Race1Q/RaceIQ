import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from './drivers.entity';
import { DriversController } from './drivers.controller';
import { DriversService } from './drivers.service';
import { CountriesModule } from '../countries/countries.module';
import { RaceResult } from '../race-results/race-results.entity';
import { QualifyingResult } from '../qualifying-results/qualifying-results.entity';
import { WinsPerSeasonMaterialized } from './wins-per-season-materialized.entity';
import { DriverCareerStatsMaterialized } from './driver-career-stats-materialized.entity';
import { DriverStandingMaterialized } from '../standings/driver-standings-materialized.entity';
import { RaceFastestLapMaterialized } from '../dashboard/race-fastest-laps-materialized.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Driver, 
      RaceResult,
      QualifyingResult,
      WinsPerSeasonMaterialized,
      DriverCareerStatsMaterialized,
      DriverStandingMaterialized,
      RaceFastestLapMaterialized
    ]),
    CountriesModule,
  ],
  controllers: [DriversController],
  providers: [DriversService],
  exports: [DriversService, TypeOrmModule],
})
export class DriversModule {}


