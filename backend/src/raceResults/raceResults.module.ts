// src/raceResults/raceResults.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RaceResultsService } from './raceResults.service';
import { RaceResultsIngestionService } from './raceResults-ingestion.service';
import { RaceResultsController } from './raceResults.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { RacesModule } from '../races/races.module';
import { DriversModule } from '../drivers/drivers.module';
import { ConstructorsModule } from '../constructors/constructors.module';

@Module({
  imports: [HttpModule, SupabaseModule, RacesModule, DriversModule, ConstructorsModule],
  controllers: [RaceResultsController],
  providers: [RaceResultsService, RaceResultsIngestionService],
  exports: [RaceResultsService],
})
export class RaceResultsModule {}


