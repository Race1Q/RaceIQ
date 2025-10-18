import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lap } from './laps.entity';
import { LapsController } from './laps.controller';
import { RacesModule } from '../races/races.module';
import { DriversModule } from '../drivers/drivers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lap]),
    forwardRef(() => RacesModule),   // Circular dependency
    forwardRef(() => DriversModule), // Circular dependency
  ],
  controllers: [LapsController],
  exports: [TypeOrmModule],
})
export class LapsModule {}


