import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Country } from './countries.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Country])],
  // We don't need a controller or service, we just need to export the entity
  exports: [TypeOrmModule],
})
export class CountriesModule {}