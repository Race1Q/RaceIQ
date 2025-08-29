// src/drivers/drivers.module.ts
import { Module } from '@nestjs/common';
import { DriversController } from './drivers.controller';
import { DriversService } from './drivers.service';
import { IngestService } from './ingest.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule], 
  controllers: [DriversController], // Only one controller is needed
  providers: [DriversService, IngestService],
  exports: [DriversService],
})
export class DriversModule {}