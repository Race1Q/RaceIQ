// backend/src/ingestion/ingestion.module.ts

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SupabaseModule } from '../supabase/supabase.module';
import { IngestionController } from './ingestion.controller';
import { ErgastService } from './ergast.service';
import { OpenF1Service } from './openf1.service';
import { IngestionService } from './ingestion.service';

@Module({
  imports: [HttpModule, SupabaseModule],
  controllers: [IngestionController],
  providers: [ErgastService, OpenF1Service, IngestionService],
  
})
export class IngestionModule {}