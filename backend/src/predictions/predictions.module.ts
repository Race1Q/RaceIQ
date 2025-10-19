import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PredictionsController } from './predictions.controller';
import { PredictionsService } from './predictions.service';
import { Race } from '../races/races.entity';
import { RaceResult } from '../race-results/race-results.entity';
import { DriverStandingMaterialized } from '../standings/driver-standings-materialized.entity';
import { ConstructorEntity } from '../constructors/constructors.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Race,
      RaceResult,
      DriverStandingMaterialized,
      ConstructorEntity,
    ]),
  ],
  controllers: [PredictionsController],
  providers: [PredictionsService],
  exports: [PredictionsService],
})
export class PredictionsModule {}
