import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StandingsController } from './standings.controller';
import { StandingsService } from './standings.service';
import { DriverStandingMaterialized } from './driver-standings-materialized.entity';
import { DriverCareerStatsMaterialized } from '../drivers/driver-career-stats-materialized.entity';
import { DriversModule } from '../drivers/drivers.module';
import { ConstructorsModule } from '../constructors/constructors.module';
import { SeasonsModule } from '../seasons/seasons.module';
import { RacesModule } from '../races/races.module';
import { SessionsModule } from '../sessions/sessions.module';
import { RaceResultsModule } from '../race-results/race-results.module';
import { QualifyingResultsModule } from '../qualifying-results/qualifying-results.module';

@Module({
  imports: [
    // ✅ Only register OUR OWN entities
    TypeOrmModule.forFeature([
      DriverStandingMaterialized,
      DriverCareerStatsMaterialized,
    ]),
    // ✅ Import modules that own entities we need
    forwardRef(() => DriversModule),      // Provides Driver (circular via RaceResults chain)
    forwardRef(() => ConstructorsModule), // Provides ConstructorEntity (circular)
    forwardRef(() => SeasonsModule),      // Provides Season (circular via Races)
    forwardRef(() => RacesModule),        // Provides Race (circular)
    forwardRef(() => SessionsModule),     // Provides Session (circular via Races)
    forwardRef(() => RaceResultsModule),  // Provides RaceResult (circular)
    QualifyingResultsModule, // Provides QualifyingResult
  ],
  controllers: [StandingsController],
  providers: [StandingsService],
  exports: [StandingsService, TypeOrmModule], // ✅ Export TypeOrmModule
})
export class StandingsModule {}


