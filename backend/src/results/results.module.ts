// src/results/results.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ResultsService } from './results.service';
import { ResultsIngestService } from './results-ingest.service';
import { ResultsController } from './results.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { RacesModule } from '../races/races.module';
import { DriversModule } from '../drivers/drivers.module';
import { ConstructorsModule } from '../constructors/constructors.module';

@Module({
  imports: [HttpModule, SupabaseModule, RacesModule, DriversModule, ConstructorsModule],
  controllers: [ResultsController],
  providers: [ResultsService, ResultsIngestService],
  exports: [ResultsService],
})
export class ResultsModule {}
