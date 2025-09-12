// src/pit-stops/pit-stops.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PitStopsService } from './pit-stops.service';
import { PitStopsController } from './pit-stops.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { RacesModule } from '../races/races.module';
import { DriversModule } from '../drivers/drivers.module';

@Module({
  imports: [HttpModule, SupabaseModule, RacesModule, DriversModule],
  controllers: [PitStopsController],
  providers: [PitStopsService],
  exports: [PitStopsService],
})
export class PitStopsModule {}


