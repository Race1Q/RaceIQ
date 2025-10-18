import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Race } from './races.entity';
import { RaceFastestLapMaterialized } from '../dashboard/race-fastest-laps-materialized.entity';
import { RacesController } from './races.controller';
import { RaceSummaryController } from './race-summary.controller';
import { RacesService } from './races.service';
import { SeasonsModule } from '../seasons/seasons.module';
import { CircuitsModule } from '../circuits/circuits.module';
import { DriversModule } from '../drivers/drivers.module';
import { SessionsModule } from '../sessions/sessions.module';
import { RaceResultsModule } from '../race-results/race-results.module';
import { QualifyingResultsModule } from '../qualifying-results/qualifying-results.module';
import { LapsModule } from '../laps/laps.module';
import { PitStopsModule } from '../pit-stops/pit-stops.module';
import { TireStintsModule } from '../tire-stints/tire-stints.module';
import { RaceEventsModule } from '../race-events/race-events.module';
import { RaceResultsController } from './races.controller'; 

@Module({
  imports: [
    // ✅ Only register OUR OWN entities
    TypeOrmModule.forFeature([
      Race,
      RaceFastestLapMaterialized, // This is related to races/dashboard
    ]),
    // ✅ Import modules that own entities we need
    forwardRef(() => SeasonsModule),     // Provides Season (circular dependency)
    CircuitsModule,
    forwardRef(() => DriversModule),     // Provides Driver (circular dependency)
    forwardRef(() => SessionsModule),    // Provides Session (circular dependency)
    forwardRef(() => RaceResultsModule), // Provides RaceResult (circular dependency)
    QualifyingResultsModule, // Provides QualifyingResult
    forwardRef(() => LapsModule),        // Provides Lap (circular dependency)
    forwardRef(() => PitStopsModule),    // Provides PitStop (circular dependency)
    forwardRef(() => TireStintsModule),  // Provides TireStint (circular dependency)
    forwardRef(() => RaceEventsModule),  // Provides RaceEvent (circular dependency)
  ],
  controllers: [RacesController, RaceSummaryController, RaceResultsController],
  providers: [RacesService],
  exports: [RacesService, TypeOrmModule], // ✅ Export TypeOrmModule
})
export class RacesModule {}


