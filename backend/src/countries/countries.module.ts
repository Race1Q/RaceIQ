// src/countries/countries.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CountriesService } from './countries.service';
import { CountryIngestService } from './countries-ingest.service';
import { CountriesController } from './countries.controller';
import { SupabaseService } from '../supabase/supabase.service';

@Module({
  imports: [HttpModule],
  controllers: [CountriesController],
  providers: [CountriesService, CountryIngestService, SupabaseService],
  exports: [CountriesService],
})
export class CountriesModule {}