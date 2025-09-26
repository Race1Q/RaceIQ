import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IngestionModule } from './ingestion/ingestion.module';

// Our new "from scratch" modules
import { DriversModule } from './drivers/drivers.module';
import { CountriesModule } from './countries/countries.module';
import { ConstructorsModule } from './constructors/constructors.module';
import { SeasonsModule } from './seasons/seasons.module';
import { RacesModule } from './races/races.module';
import { SessionsModule } from './sessions/sessions.module';
import { RaceResultsModule } from './race-results/race-results.module';
import { LapsModule } from './laps/laps.module';
import { PitStopsModule } from './pit-stops/pit-stops.module';
import { CircuitsModule } from './circuits/circuits.module';
import { QualifyingResultsModule } from './qualifying-results/qualifying-results.module';
import { TireStintsModule } from './tire-stints/tire-stints.module';
import { RaceEventsModule } from './race-events/race-events.module';
import { StandingsModule } from './standings/standings.module';
import { UsersModule } from './users/users.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DriverStandingMaterialized } from './standings/driver-standings-materialized.entity';
import { RaceFastestLapMaterialized } from './dashboard/race-fastest-laps-materialized.entity';

// The entities we need to load at the root
import { Driver } from './drivers/drivers.entity';
import { Country } from './countries/countries.entity';
import { ConstructorEntity } from './constructors/constructors.entity';
import { Season } from './seasons/seasons.entity';
import { Race } from './races/races.entity';
import { Session } from './sessions/sessions.entity';
import { RaceResult } from './race-results/race-results.entity';
import { Lap } from './laps/laps.entity';
import { PitStop } from './pit-stops/pit-stops.entity';
import { Circuit } from './circuits/circuits.entity';
import { QualifyingResult } from './qualifying-results/qualifying-results.entity';
import { TireStint } from './tire-stints/tire-stints.entity';
import { RaceEvent } from './race-events/race-events.entity';
import { User } from './users/entities/user.entity';

@Module({
  imports: [
    // 1. Load the .env file
    ConfigModule.forRoot({ isGlobal: true }),

    // 2. Setup the TypeORM database connection (NOW USING DATABASE_URL)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        const isLocal = !!databaseUrl && (databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1'));
        return {
          type: 'postgres',
          url: databaseUrl,
          entities: [
          Driver,
          Country,
          ConstructorEntity,
          Season,
          Circuit,
          Race,
          Session,
          RaceResult,
          Lap,
          PitStop,
          QualifyingResult,
          TireStint,
          RaceEvent,
          User,
          DriverStandingMaterialized,
          RaceFastestLapMaterialized,
          ],
          synchronize: false, // trust the db schema
          ssl: isLocal ? false : { rejectUnauthorized: false },
        };
      },
    }),

    // 3. Load ONLY our new modules
    IngestionModule,
    DriversModule,
    CountriesModule,
    ConstructorsModule,
    SeasonsModule,
    RacesModule,
    SessionsModule,
    RaceResultsModule,
    LapsModule,
    PitStopsModule,
    CircuitsModule,
    QualifyingResultsModule,
    TireStintsModule,
    RaceEventsModule,
    StandingsModule,
    UsersModule,
    DashboardModule,
    // We have removed all the old, deleted modules 
    // (LapsModule, RacesModule, etc.)
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}