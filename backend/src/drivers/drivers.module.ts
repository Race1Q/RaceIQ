/* backend/src/drivers/drivers.module.ts */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from './drivers.entity';
import { DriversController } from './drivers.controller';
import { DriversService } from './drivers.service';
import { CountriesModule } from '../countries/countries.module';
import { RaceResult } from '../race-results/race-results.entity'; // 1. IMPORT

@Module({
  imports: [
    TypeOrmModule.forFeature([Driver, RaceResult]), // 2. ADD RaceResult
    CountriesModule,
  ],
  controllers: [DriversController],
  providers: [DriversService],
  exports: [DriversService, TypeOrmModule],
})
export class DriversModule {}


