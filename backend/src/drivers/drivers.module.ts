import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from './drivers.entity';
import { DriversController } from './drivers.controller';
import { DriversService } from './drivers.service';
import { CountriesModule } from '../countries/countries.module';
import { WinsPerSeasonMaterialized } from './wins-per-season-materialized.entity';
import { DriverCareerStatsMaterialized } from './driver-career-stats-materialized.entity';
import { RaceResultsModule } from '../race-results/race-results.module';
import { QualifyingResultsModule } from '../qualifying-results/qualifying-results.module';
import { StandingsModule } from '../standings/standings.module';
import { DashboardModule } from '../dashboard/dashboard.module';

@Module({
  imports: [
    // ✅ Only register OUR OWN entities
    TypeOrmModule.forFeature([
      Driver, 
      WinsPerSeasonMaterialized,
      DriverCareerStatsMaterialized,
    ]),
    // ✅ Import modules that own entities we need
    CountriesModule,
    forwardRef(() => RaceResultsModule),       // Provides RaceResult (circular via RacesModule)
    QualifyingResultsModule, // Provides QualifyingResult
    forwardRef(() => StandingsModule),  // Provides DriverStandingMaterialized (circular with StandingsModule)
    DashboardModule,         // Provides RaceFastestLapMaterialized
  ],
  controllers: [DriversController],
  providers: [DriversService],
  exports: [DriversService, TypeOrmModule],
})
export class DriversModule {}


