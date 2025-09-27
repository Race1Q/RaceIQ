/* backend/src/drivers/drivers.module.ts */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from './drivers.entity';
import { DriversController } from './drivers.controller';
import { DriversService } from './drivers.service';
import { CountriesModule } from '../countries/countries.module';
import { RaceResult } from '../race-results/race-results.entity';
import { WinsPerSeasonMaterialized } from './wins-per-season-materialized.entity';
import { DriverCareerStatsMaterialized } from './driver-career-stats-materialized.entity';
import { DriverStandingMaterialized } from '../standings/driver-standings-materialized.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Driver, 
      RaceResult, 
      WinsPerSeasonMaterialized,
      DriverCareerStatsMaterialized,
      DriverStandingMaterialized
    ]),
    CountriesModule,
  ],
  controllers: [DriversController],
  providers: [DriversService],
  exports: [DriversService, TypeOrmModule],
})
export class DriversModule {}


