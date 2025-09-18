// src/circuits/circuits.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CircuitsService } from './circuits.service';
import { CircuitsController } from './circuits.controller';
import { Circuit } from './circuits.entity';
import { CountriesModule } from '../countries/countries.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Circuit]),
    CountriesModule,
  ],
  controllers: [CircuitsController],
  providers: [CircuitsService],
  exports: [CircuitsService, TypeOrmModule],
})
export class CircuitsModule {}