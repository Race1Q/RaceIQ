// src/qualifyingResults/qualifyingResults.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { QualifyingResultsService } from './qualifyingResults.service';
import { QualifyingResultsIngestionService } from './qualifyingResults-ingestion.service';
import { QualifyingResultsController } from './qualifyingResults.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { RacesModule } from '../races/races.module';
import { DriversModule } from '../drivers/drivers.module';
import { ConstructorsModule } from '../constructors/constructors.module';

@Module({
  imports: [HttpModule, SupabaseModule, RacesModule, DriversModule, ConstructorsModule],
  controllers: [QualifyingResultsController],
  providers: [QualifyingResultsService, QualifyingResultsIngestionService],
  exports: [QualifyingResultsService],
})
export class QualifyingResultsModule {}


