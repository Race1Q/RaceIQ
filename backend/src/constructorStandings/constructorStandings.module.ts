import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SupabaseModule } from '../supabase/supabase.module';
import { ConstructorStandingsIngestService } from './constructorStandings-ingest.service';
import { ConstructorStandingsService } from './constructorStandings.service';
import { ConstructorStandingsController } from './constructorStandings.controller';

@Module({
  imports: [HttpModule, SupabaseModule],
  controllers: [ConstructorStandingsController],
  providers: [ConstructorStandingsIngestService, ConstructorStandingsService],
})
export class ConstructorStandingsModule {}
