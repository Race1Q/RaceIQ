import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Race } from './races.entity';
import { Session } from '../sessions/sessions.entity';
import { RaceResult } from '../race-results/race-results.entity';
import { QualifyingResult } from '../qualifying-results/qualifying-results.entity';
import { Lap } from '../laps/laps.entity';
import { PitStop } from '../pit-stops/pit-stops.entity';
import { TireStint } from '../tire-stints/tire-stints.entity';
import { RaceEvent } from '../race-events/race-events.entity';
import { RacesController } from './races.controller';
import { RaceSummaryController } from './race-summary.controller';
import { RacesService } from './races.service';
import { SeasonsModule } from '../seasons/seasons.module';
import { CircuitsModule } from '../circuits/circuits.module';
import { DriversModule } from '../drivers/drivers.module';
import { RaceResultsController } from './races.controller'; 
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Race,
      Session,
      RaceResult,
      QualifyingResult,
      Lap,
      PitStop,
      TireStint,
      RaceEvent,
    ]),
    SeasonsModule,
  CircuitsModule,
  DriversModule,
  ],
  controllers: [RacesController, RaceSummaryController,RaceResultsController],
  providers: [RacesService],
  exports: [TypeOrmModule],
})
export class RacesModule {}


