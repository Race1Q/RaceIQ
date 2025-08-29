// src/drivers/drivers.module.ts
import { Module } from '@nestjs/common';
import { DriversController } from './drivers.controller';
import { DriversService } from './drivers.service';
import { IngestService } from './ingest.service';
import { HttpModule } from '@nestjs/axios';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [HttpModule, SupabaseModule],
  controllers: [DriversController],
  providers: [DriversService, IngestService],
  exports: [DriversService],
})
export class DriversModule {}