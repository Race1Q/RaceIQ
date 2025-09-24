import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RaceEvent } from './race-events.entity';
import { RaceEventsController } from './race-events.controller';
import { SessionsModule } from '../sessions/sessions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RaceEvent]),
    SessionsModule,
  ],
  exports: [TypeOrmModule],
  controllers: [RaceEventsController],
})
export class RaceEventsModule {}


