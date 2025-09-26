// backend/src/dashboard/dashboard.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Race } from '../races/races.entity';
import { RaceResult } from '../race-results/race-results.entity';
import { DriverStandingMaterialized } from '../standings/driver-standings-materialized.entity';
import { RaceFastestLapMaterialized } from './race-fastest-laps-materialized.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Race,
      RaceResult,
      DriverStandingMaterialized,
      RaceFastestLapMaterialized,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
