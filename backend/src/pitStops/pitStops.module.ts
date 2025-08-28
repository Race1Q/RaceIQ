// src/pitStops/pitStops.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PitStopsService } from './pitStops.service';
import { PitStopsIngestionService } from './pitStops-ingestion.service';
import { PitStopsController } from './pitStops.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { RacesModule } from '../races/races.module';
import { DriversModule } from '../drivers/drivers.module';

@Module({
  imports: [HttpModule, SupabaseModule, RacesModule, DriversModule],
  controllers: [PitStopsController],
  providers: [PitStopsService, PitStopsIngestionService],
  exports: [PitStopsService],
})
export class PitStopsModule {}


