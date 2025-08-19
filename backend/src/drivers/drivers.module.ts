import { Module } from '@nestjs/common';
import { DriversController } from './drivers.controller';
import { DriversService } from './drivers.service'; // <-- Import DriversService
import { IngestService } from './ingest.service'; // <-- Import IngestService
import { SupabaseModule } from '../supabase/supabase.module'; // <-- Import SupabaseModule

@Module({
  imports: [SupabaseModule], 
  controllers: [DriversController],
  providers: [DriversService, IngestService],
  exports: [DriversService],
})
export class DriversModule {}
