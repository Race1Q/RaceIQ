import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RaceResult } from './race-results.entity';
import { RaceResultsController } from './race-results.controller';
import { RaceResultsService } from './race-results.service';
import { SessionsModule } from '../sessions/sessions.module';
import { DriversModule } from '../drivers/drivers.module';
import { ConstructorsModule } from '../constructors/constructors.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { SeasonsModule } from '../seasons/seasons.module';
import { RacesModule } from '../races/races.module';
import { StandingsModule } from '../standings/standings.module';

@Module({
  imports: [
    // ✅ Only register OUR OWN entity
    TypeOrmModule.forFeature([RaceResult]),
    // ✅ Import modules
    forwardRef(() => SessionsModule),    // Circular via RacesModule
    forwardRef(() => DriversModule),     // Circular via RacesModule chain
    forwardRef(() => ConstructorsModule), // Circular
    SupabaseModule,
    forwardRef(() => SeasonsModule),     // Circular via RacesModule
    forwardRef(() => RacesModule),       // Circular dependency
    StandingsModule,         // ⚠️ NO forwardRef - service injects DriverStandingMaterialized repository
  ],
  controllers: [RaceResultsController],
  providers: [RaceResultsService],
  exports: [RaceResultsService, TypeOrmModule], // ✅ Export TypeOrmModule so other modules can access RaceResult
})
export class RaceResultsModule {}



