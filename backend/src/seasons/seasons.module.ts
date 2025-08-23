// src/seasons/seasons.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SeasonsService } from './seasons.service';
import { SeasonIngestService } from './seasons-ingest.service';
import { SeasonsController } from './seasons.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [
    HttpModule,
    SupabaseModule, // Required to inject SupabaseService
  ],
  controllers: [SeasonsController],
  providers: [SeasonsService, SeasonIngestService],
  exports: [SeasonsService],
})
export class SeasonsModule {}
