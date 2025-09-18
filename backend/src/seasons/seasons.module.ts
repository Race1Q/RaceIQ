import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Season } from './seasons.entity';
import { SeasonsController } from './seasons.controller';
import { SeasonsService } from './seasons.service';
import { Race } from '../races/races.entity'; // 1. IMPORT RACE

@Module({
  imports: [TypeOrmModule.forFeature([Season, Race])], // 2. ADD RACE HERE
  controllers: [SeasonsController],
  providers: [SeasonsService],
  exports: [SeasonsService, TypeOrmModule],
})
export class SeasonsModule {}


