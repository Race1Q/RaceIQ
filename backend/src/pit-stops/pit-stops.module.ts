import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PitStop } from './pit-stops.entity';
import { PitStopsController } from './pit-stops.controller';
import { RacesModule } from '../races/races.module';
import { DriversModule } from '../drivers/drivers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PitStop]),
    RacesModule,
    DriversModule,
  ],
  controllers: [PitStopsController],
  exports: [TypeOrmModule],
})
export class PitStopsModule {}


