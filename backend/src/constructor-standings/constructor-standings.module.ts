// backend/src/constructor-standings/constructor-standings.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SupabaseModule } from '../supabase/supabase.module';
import { ConstructorStandingsService } from './constructor-standings.service';
import { ConstructorStandingsController } from './constructor-standings.controller';

@Module({
  imports: [HttpModule, SupabaseModule],
  controllers: [ConstructorStandingsController],
  providers: [ConstructorStandingsService],
})
export class ConstructorStandingsModule {}
