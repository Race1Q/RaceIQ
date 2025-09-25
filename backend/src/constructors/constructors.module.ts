import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConstructorEntity } from './constructors.entity';
import { ConstructorsController } from './constructors.controller';
import { ConstructorsService } from './constructors.service';
import { RaceResult } from '../race-results/race-results.entity';
import { Race } from '../races/races.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ConstructorEntity, RaceResult,Race])],
  controllers: [ConstructorsController],
  providers: [ConstructorsService],
  exports: [ConstructorsService, TypeOrmModule],
})
export class ConstructorsModule {}


