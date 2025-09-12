// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'; // Import Throttler
import { APP_GUARD } from '@nestjs/core';
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
import { DriverStandingsModule } from './driver-standings/driver-standings.module';
import { RaceResultsModule } from './race-results/race-results.module';
import { ConstructorStandingsModule } from './constructor-standings/constructor-standings.module';
import { QualifyingResultsModule } from './qualifying-results/qualifying-results.module';
import { PitStopsModule } from './pit-stops/pit-stops.module';
import { LapsModule } from './laps/laps.module';
import { UsersModule } from './users/users.module';
import { NotificationsModule } from './notifications/notifications.module';
import { IngestionModule } from './ingestion/ingestion.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env.back' }),
    ScheduleModule.forRoot(),
    // Configure Throttler: 10 requests per second per IP
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    IngestionModule,
    AuthModule,
    DriversModule,
    AdminModule,
    ConstructorsModule,
    CircuitsModule,
    CountriesModule,
    RacesModule,
    SeasonsModule,
    RaceResultsModule,
    DriverStandingsModule,
    ConstructorStandingsModule,
    QualifyingResultsModule,
    PitStopsModule,
    LapsModule,
    UsersModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Set the ThrottlerGuard as a global guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
