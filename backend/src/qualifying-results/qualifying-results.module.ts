import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QualifyingResult } from './qualifying-results.entity';
import { SessionsModule } from '../sessions/sessions.module';
import { DriversModule } from '../drivers/drivers.module';
import { ConstructorsModule } from '../constructors/constructors.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([QualifyingResult]),
    SessionsModule,
    DriversModule,
    ConstructorsModule,
  ],
  exports: [TypeOrmModule],
})
export class QualifyingResultsModule {}


