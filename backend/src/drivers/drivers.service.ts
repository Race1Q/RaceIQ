// backend/src/drivers/drivers.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver } from './drivers.entity';
import { RaceResult } from '../race-results/race-results.entity';
import { DriverStandingMaterialized } from '../standings/driver-standings-materialized.entity';
import { DriverCareerStatsMaterialized } from './driver-career-stats-materialized.entity';
import { WinsPerSeasonMaterialized } from './wins-per-season-materialized.entity';
import { DriverStatsResponseDto } from './dto/driver-stats.dto';

// Define the shape of the data we will return
interface RecentFormResult {
  position: number;
  raceName: string;
  countryCode: string;
}

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
    @InjectRepository(RaceResult)
    private readonly raceResultRepository: Repository<RaceResult>,
    @InjectRepository(DriverCareerStatsMaterialized)
    private readonly careerStatsViewRepo: Repository<DriverCareerStatsMaterialized>,
    @InjectRepository(DriverStandingMaterialized)
    private readonly standingsViewRepo: Repository<DriverStandingMaterialized>,
    @InjectRepository(WinsPerSeasonMaterialized)
    private readonly winsPerSeasonViewRepo: Repository<WinsPerSeasonMaterialized>,
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

  async getDriverCareerStats(driverId: number): Promise<DriverStatsResponseDto> {
    const currentYear = new Date().getFullYear();

    const [driver, careerStats, currentSeason, winsPerSeason, firstRace] = await Promise.all([
      this.findOne(driverId),
      this.careerStatsViewRepo.findOne({ where: { driverId } }),
      this.standingsViewRepo.findOne({ where: { driverId, seasonYear: currentYear } }),
      this.winsPerSeasonViewRepo.find({ 
        where: { driverId }, 
        order: { seasonYear: 'DESC' }, 
        take: 5 
      }),
      this.raceResultRepository.findOne({ 
        where: { driver: { id: driverId } }, 
        relations: ['session.race'], 
        order: { session: { race: { date: 'ASC' } } } 
      }),
    ]);

    if (!driver || !careerStats) {
      throw new NotFoundException(`Stats not found for driver ID ${driverId}`);
    }

    // Try to get the most recent team name for this driver
    const mostRecentTeamQuery = this.raceResultRepository
      .createQueryBuilder('rr')
      .select('c.name', 'teamName')
      .innerJoin('rr.session', 's')
      .innerJoin('s.race', 'r')
      .innerJoin('rr.team', 'c')
      .where('rr.driver_id = :driverId', { driverId })
      .orderBy('r.date', 'DESC')
      .limit(1);

    const teamResult = await mostRecentTeamQuery.getRawOne();
    
    // Enrich the driver object with team information
    const enrichedDriver = {
      ...driver,
      teamName: teamResult?.teamName || 'N/A',
    };

    return {
      driver: enrichedDriver,
      careerStats: {
        wins: careerStats.totalWins,
        podiums: careerStats.totalPodiums,
        fastestLaps: careerStats.totalFastestLaps,
        points: Number(careerStats.totalPoints),
        grandsPrixEntered: careerStats.grandsPrixEntered,
        dnfs: careerStats.dnfs,
        highestRaceFinish: careerStats.highestRaceFinish,
        firstRace: {
          year: firstRace ? new Date(firstRace.session.race.date).getFullYear() : 0,
          event: firstRace ? firstRace.session.race.name : 'N/A',
        },
        winsPerSeason: winsPerSeason.map(w => ({ 
          season: w.seasonYear, 
          wins: w.wins 
        })),
      },
      currentSeasonStats: {
        wins: currentSeason?.seasonWins || 0,
        podiums: currentSeason?.seasonPodiums || 0,
        fastestLaps: 0, // This is not in the standings view, placeholder for now
        standing: `P${currentSeason?.driverId ? currentSeason.driverId : 'N/A'}`,
      },
    };
  }

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

  async getDriverRecentForm(driverId: number): Promise<RecentFormResult[]> {
    // First, ensure the driver exists. This will throw a 404 if not found.
    await this.findOne(driverId);

    const rawResults = await this.raceResultRepository.createQueryBuilder('rr')
      .select([
        'rr.position AS position',
        'r.name AS "raceName"',
        'c.country_code AS "countryCode"',
      ])
      .innerJoin('rr.session', 's')
      .innerJoin('s.race', 'r')
      .innerJoin('r.circuit', 'c')
      .where('rr.driver_id = :driverId', { driverId })
      .andWhere('r.date < NOW()')
      .andWhere("s.type = 'RACE'")
      .orderBy('r.date', 'DESC')
      .limit(5)
      .getRawMany();

    return rawResults;
  }
}