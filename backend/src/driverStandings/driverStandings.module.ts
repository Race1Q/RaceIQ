// src/driver-standings/driver-standings.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DriverStandingsService } from './driverStandings.service';
import { DriverStandingIngestService } from './driverStandings-ingest.service';
import { DriverStandingsController } from './driverStandings.controller';
import { SupabaseService } from '../supabase/supabase.service';

@Module({
  imports: [HttpModule],
  controllers: [DriverStandingsController],
  providers: [DriverStandingsService, DriverStandingIngestService, SupabaseService],
  exports: [DriverStandingsService],
})
export class DriverStandingsModule {}