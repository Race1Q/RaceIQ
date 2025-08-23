import { Module } from '@nestjs/common';
import { DriversController } from './drivers.controller';
import { DriversService } from './drivers.service';
import { DriversIngestService } from './drivers-ingest.service';
import { HttpModule } from '@nestjs/axios';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [HttpModule, SupabaseModule],
  controllers: [DriversController],
  providers: [DriversService, DriversIngestService],
  exports: [DriversService],
})
export class DriversModule {}
