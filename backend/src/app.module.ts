import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DriversModule } from './drivers/drivers.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { ConstructorsModule } from './constructors/constructors.module';
import { CircuitsModule } from './circuits/circuits.module';
import { CountriesModule } from './countries/countries.module';
import { RacesModule } from './races/races.module';
import { SeasonsModule } from './seasons/seasons.module';
import { ResultsModule } from './results/results.module';
import { DriverStandingsModule } from './driverStandings/driverStandings.module';
import { RaceResultsModule } from './raceResults/raceResults.module';
import { ConstructorStandingsModule } from './constructorStandings/constructorStandings.module';
import { QualifyingResultsModule } from './qualifyingResults/qualifyingResults.module';
import { PitStopsModule } from './pitStops/pitStops.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env.back' }),
    ScheduleModule.forRoot(),
    AuthModule,
    DriversModule,
    AdminModule,
    ConstructorsModule,
    CircuitsModule,
    CountriesModule,
    RacesModule,
    SeasonsModule,
    ResultsModule,
    RaceResultsModule,
    DriverStandingsModule,
    ConstructorStandingsModule,
    QualifyingResultsModule,
    PitStopsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
