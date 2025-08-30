import { Module } from '@nestjs/common';
import { StandingsController } from './standings.controller';
import { StandingsService } from './standings.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule], // Make ConfigModule available to this module's components
  controllers: [StandingsController],
  providers: [StandingsService],
})
export class StandingsModule {}
