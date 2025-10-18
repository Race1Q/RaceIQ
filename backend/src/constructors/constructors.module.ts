import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConstructorEntity } from './constructors.entity';
import { ConstructorsController } from './constructors.controller';
import { ConstructorsService } from './constructors.service';
import { ConstructorDriver } from './constructor-drivers.entity';
import { ConstructorStandingsMaterialized } from './constructor-standings-materialized.entity';
import { RaceResultsModule } from '../race-results/race-results.module';
import { RacesModule } from '../races/races.module';
import { StandingsModule } from '../standings/standings.module';

@Module({
  imports: [
    // ✅ Only register OUR OWN entities
    TypeOrmModule.forFeature([
      ConstructorEntity,
      ConstructorDriver,
      ConstructorStandingsMaterialized,
    ]),
    // ✅ Import the modules that own the entities we need
    forwardRef(() => RaceResultsModule),  // Provides RaceResult repository (circular)
    forwardRef(() => RacesModule),        // Provides Race repository (circular)
    forwardRef(() => StandingsModule),    // Provides DriverStandingMaterialized (circular dependency)
  ],
  controllers: [ConstructorsController],
  providers: [ConstructorsService],
  exports: [ConstructorsService, TypeOrmModule], // ✅ Export TypeOrmModule so other modules can access our entities
})
export class ConstructorsModule {}


