import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lap } from './laps.entity';
import { RacesModule } from '../races/races.module';
import { DriversModule } from '../drivers/drivers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lap]),
    RacesModule,
    DriversModule,
  ],
  exports: [TypeOrmModule],
})
export class LapsModule {}


