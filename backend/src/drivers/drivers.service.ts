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

  // Career stats
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
    
    const careerStats: CareerStatsDto = {
      wins: 0,
      podiums: 0,
      poles: 0,
      totalPoints: 0,
      fastestLaps: 0,
      racesCompleted: 0,
    };

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

<<<<<<< HEAD
  // 🆕 Standings for a specific season + round
  async getDriversByStandings(season: number): Promise<any[]> {
    const rawResults = await this.raceResultRepository
      .createQueryBuilder('rr')
      .select([
        'driver.id AS id',
        `driver.first_name || ' ' || driver.last_name AS full_name`,
        'driver.country_code AS country',
        'SUM(rr.points) AS points',
      ])
      .leftJoin(Driver, 'driver', 'driver.id = rr.driver_id')
      .leftJoin('rr.session', 'session')
      .leftJoin('session.race', 'race')
      .where('race.season = :season', { season }) // filter by race.season
      .groupBy('driver.id, driver.first_name, driver.last_name, driver.country_code')
      .orderBy('SUM(rr.points)', 'DESC')
      .getRawMany();
  
    return rawResults.map((r) => ({
      id: parseInt(r.id, 10),
      full_name: r.full_name,
      country: r.country,
      points: parseFloat(r.points) || 0,
    }));
  }

  async getDriversByStandings2(season: number): Promise<any[]> {
    const rawResults = await this.driverRepository
      .createQueryBuilder('driver')
      .select([
        'ds.driver_id AS id',
        'ds.full_name AS full_name',
        'ds.country_code AS country',
        'ds.points AS points',
      ])
      .innerJoin('driver_standings_materialized', 'ds', 'ds.driver_id = driver.id')
      .where('ds.season = :season', { season })
      .orderBy('ds.points', 'DESC')
      .getRawMany();
  
    return rawResults.map((r) => ({
      id: parseInt(r.id, 10),
      full_name: r.full_name,
      country: r.country,
      points: parseFloat(r.points) || 0,
    }));
  }

  async getDriversByStandings3(season: number): Promise<any[]> {
    const rawResults = await this.driverRepository
      .createQueryBuilder()
      .select([
        'ds."driverId" AS id',
      ])
      .from('driver_standings_materialized', 'ds')
      .where('ds."season_id" = :season', { season })
      .orderBy('ds."seasonPoints"', 'DESC')
      .getRawMany();
  
    return rawResults.map(r => ({
      id: parseInt(r.id, 10),
      full_name: r.full_name,
      country: r.country,
      points: parseFloat(r.points) || 0,
    }));
  }
}  

=======
  async getDriverRecentForm(driverId: number): Promise<{ position: number; raceName: string; countryCode: string }[]> {
    // Find the driver first to ensure they exist
    await this.findOne(driverId);

    const rawResults = await this.raceResultRepository.createQueryBuilder('rr')
      .select([
        'rr.position AS position',
        'r.name AS "raceName"',
        'c.country_code AS "countryCode"', // NEW: Select the circuit's country code
      ])
      .innerJoin('rr.session', 's')
      .innerJoin('s.race', 'r')
      .innerJoin('r.circuit', 'c') // NEW: Join to the circuits table
      .where('rr.driver_id = :driverId', { driverId })
      .andWhere('r.date < NOW()')
      .andWhere("s.type = 'RACE'")
      .orderBy('r.date', 'DESC')
      .limit(5)
      .getRawMany();

    // The method now returns the full array of objects
    return rawResults;
  }
}
>>>>>>> main


