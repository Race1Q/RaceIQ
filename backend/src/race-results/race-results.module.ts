import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RaceResult } from './race-results.entity';
import { SessionsModule } from '../sessions/sessions.module';
import { DriversModule } from '../drivers/drivers.module';
import { ConstructorsModule } from '../constructors/constructors.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RaceResult]),
    SessionsModule,
    DriversModule,
    ConstructorsModule,
  ],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class RaceResultsModule {}


