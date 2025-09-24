import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Season } from './seasons.entity';
import { SeasonsController } from './seasons.controller';
import { SeasonsService } from './seasons.service';
import { Race } from '../races/races.entity'; // 1. IMPORT RACE
import { RaceResult } from '../race-results/race-results.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Season, Race, RaceResult])],
  controllers: [SeasonsController],
  providers: [SeasonsService],
  exports: [SeasonsService, TypeOrmModule],
})
export class SeasonsModule {}


