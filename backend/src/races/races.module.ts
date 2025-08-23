// src/races/races.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RacesService } from './races.service';
import { RaceIngestService } from './races-ingest.services';
import { RacesController } from './races.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { CircuitsModule } from '../circuits/circuits.module';
import { SeasonsModule } from '../seasons/seasons.module'; // Import SeasonsModule

@Module({
  imports: [
    HttpModule,
    SupabaseModule, 
    CircuitsModule, 
    SeasonsModule, // Add SeasonsModule here
  ],
  controllers: [RacesController],
  providers: [RacesService, RaceIngestService],
  exports: [RacesService],
})
export class RacesModule {}
