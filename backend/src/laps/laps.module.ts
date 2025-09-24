import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lap } from './laps.entity';
import { LapsController } from './laps.controller';
import { RacesModule } from '../races/races.module';
import { DriversModule } from '../drivers/drivers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lap]),
    RacesModule,
    DriversModule,
  ],
  controllers: [LapsController],
  exports: [TypeOrmModule],
})
export class LapsModule {}


