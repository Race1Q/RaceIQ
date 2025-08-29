// src/laps/laps.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LapsService } from './laps.service';
import { LapsIngestService } from './laps-ingest.service';
import { LapsController } from './laps.controller';
import { SupabaseService } from '../supabase/supabase.service';
import { RacesModule } from '../races/races.module';
import { DriversModule } from '../drivers/drivers.module';

@Module({
  imports: [HttpModule,RacesModule,DriversModule],
  providers: [LapsService, LapsIngestService, SupabaseService],
  controllers: [LapsController],
})
export class LapsModule {}




