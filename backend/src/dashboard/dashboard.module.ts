// backend/src/dashboard/dashboard.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { RaceFastestLapMaterialized } from './race-fastest-laps-materialized.entity';
import { ConstructorStandingMaterialized } from './constructor-standings-materialized.entity';
import { RacesModule } from '../races/races.module';
import { RaceResultsModule } from '../race-results/race-results.module';
import { StandingsModule } from '../standings/standings.module';

@Module({
  imports: [
    // ✅ Only register OUR OWN entities
    TypeOrmModule.forFeature([
      RaceFastestLapMaterialized,
      ConstructorStandingMaterialized,
    ]),
    // ✅ Import modules that own entities we need
    RacesModule,        // Provides Race
    RaceResultsModule,  // Provides RaceResult
    forwardRef(() => StandingsModule), // Provides DriverStandingMaterialized (circular)
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [TypeOrmModule], // ✅ Export TypeOrmModule
})
export class DashboardModule {}
