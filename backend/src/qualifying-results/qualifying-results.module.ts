// src/qualifying-results/qualifying-results.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { QualifyingResultsService } from './qualifying-results.service';
import { QualifyingResultsController } from './qualifying-results.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { RacesModule } from '../races/races.module';
import { DriversModule } from '../drivers/drivers.module';
import { ConstructorsModule } from '../constructors/constructors.module';

@Module({
  imports: [HttpModule, SupabaseModule, RacesModule, DriversModule, ConstructorsModule],
  controllers: [QualifyingResultsController],
  providers: [QualifyingResultsService],
  exports: [QualifyingResultsService],
})
export class QualifyingResultsModule {}


