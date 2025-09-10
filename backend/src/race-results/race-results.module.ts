// src/race-results/race-results.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RaceResultsService } from './race-results.service';
import { RaceResultsController } from './race-results.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { RacesModule } from '../races/races.module';
import { DriversModule } from '../drivers/drivers.module';
import { ConstructorsModule } from '../constructors/constructors.module';

@Module({
  imports: [HttpModule, SupabaseModule, RacesModule, DriversModule, ConstructorsModule],
  controllers: [RaceResultsController],
  providers: [RaceResultsService],
  exports: [RaceResultsService],
})
export class RaceResultsModule {}


