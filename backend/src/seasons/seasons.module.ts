import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Season } from './seasons.entity';
import { SeasonsController } from './seasons.controller';
import { SeasonsService } from './seasons.service';
import { RacesModule } from '../races/races.module';
import { RaceResultsModule } from '../race-results/race-results.module';

@Module({
  imports: [
    // ✅ Only register OUR OWN entity
    TypeOrmModule.forFeature([Season]),
    // ✅ Import modules that own entities we need
    forwardRef(() => RacesModule),        // Provides Race (circular dependency)
    forwardRef(() => RaceResultsModule),  // Provides RaceResult (might be circular)
  ],
  controllers: [SeasonsController],
  providers: [SeasonsService],
  exports: [SeasonsService, TypeOrmModule],
})
export class SeasonsModule {}


