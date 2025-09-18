// src/drivers/drivers.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver } from './drivers.entity';
import { RaceResult } from '../race-results/race-results.entity'; // 1. IMPORT
import {
  CareerStatsDto,
  DriverStatsResponseDto,
} from './dto/driver-stats.dto'; // 2. IMPORT

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
    @InjectRepository(RaceResult) // 3. INJECT
    private readonly raceResultRepository: Repository<RaceResult>,
  ) {}

  async findAll(): Promise<Driver[]> {
    return this.driverRepository.find({ relations: ['country'] });
  }

  async findOne(id: number): Promise<Driver> {
    const driver = await this.driverRepository.findOne({
      where: { id },
      relations: ['country'],
    });
    if (!driver) {
      throw new NotFoundException(`Driver with ID ${id} not found`);
    }
    return driver;
  }

  // 4. IMPLEMENT THIS METHOD
  async getDriverCareerStats(driverId: number): Promise<DriverStatsResponseDto> {
    const driver = await this.findOne(driverId);

    const statsQuery = this.raceResultRepository
      .createQueryBuilder('rr')
      .select('SUM(CASE WHEN rr.position = 1 THEN 1 ELSE 0 END)::int', 'wins')
      .addSelect(
        'SUM(CASE WHEN rr.position <= 3 THEN 1 ELSE 0 END)::int',
        'podiums',
      )
      .addSelect('SUM(CASE WHEN rr.grid = 1 THEN 1 ELSE 0 END)::int', 'poles')
      .addSelect('SUM(rr.points)', 'totalPoints')
      .addSelect(
        'SUM(CASE WHEN rr.fastest_lap_rank = 1 THEN 1 ELSE 0 END)::int',
        'fastestLaps',
      )
      .addSelect('COUNT(rr.id)::int', 'racesCompleted')
      .where('rr.driver_id = :driverId', { driverId });

    const rawStats = await statsQuery.getRawOne();
    
    // Initialize with default values if no results found
    const careerStats: CareerStatsDto = {
      wins: 0,
      podiums: 0,
      poles: 0,
      totalPoints: 0,
      fastestLaps: 0,
      racesCompleted: 0,
    };

    // Convert raw query results (strings) to numbers if data exists
    if (rawStats) {
      for (const key in careerStats) {
        careerStats[key] = parseFloat(rawStats[key]) || 0;
      }
    }

    return {
      driver,
      careerStats,
    };
  }
}


