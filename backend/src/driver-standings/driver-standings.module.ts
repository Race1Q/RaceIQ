// src/driver-standings/driver-standings.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DriverStandingsService } from './driver-standings.service';
import { DriverStandingsController } from './driver-standings.controller';
import { SupabaseService } from '../supabase/supabase.service';

@Module({
  imports: [HttpModule],
  controllers: [DriverStandingsController],
  providers: [DriverStandingsService, SupabaseService],
  exports: [DriverStandingsService],
})
export class DriverStandingsModule {}