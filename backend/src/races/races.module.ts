// src/races/races.module.ts
import { Module } from '@nestjs/common';
import { RacesService } from './races.service';
import { RacesController } from './races.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [RacesController],
  providers: [RacesService],
  exports: [RacesService],
})
export class RacesModule {}
