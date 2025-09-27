// backend/src/drivers/drivers.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver } from './drivers.entity';
import { RaceResult } from '../race-results/race-results.entity';
import { DriverStandingMaterialized } from '../standings/driver-standings-materialized.entity';
import { DriverCareerStatsMaterialized } from './driver-career-stats-materialized.entity';
import { WinsPerSeasonMaterialized } from './wins-per-season-materialized.entity';
import { RaceFastestLapMaterialized } from '../dashboard/race-fastest-laps-materialized.entity';
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
    @InjectRepository(RaceFastestLapMaterialized)
    private readonly fastestLapViewRepo: Repository<RaceFastestLapMaterialized>,
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

    // Add a query for this season's fastest laps to the parallel execution
    const [driver, careerStats, currentSeason, winsPerSeason, firstRace, seasonFastestLaps, allCurrentSeasonStandings] = await Promise.all([
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
      // NEW QUERY: Count fastest laps for the current season from our reliable view
      this.fastestLapViewRepo.count({ where: { driverId } }),
      // NEW QUERY: Get all standings for current season to calculate position
      this.standingsViewRepo.find({ 
        where: { seasonYear: currentYear }, 
        order: { seasonPoints: 'DESC' } 
      }),
    ]);

    if (!driver || !careerStats) {
      throw new NotFoundException(`Stats not found for driver ID ${driverId}`);
    }

    // Calculate the driver's position in the current season standings
    const driverPosition = allCurrentSeasonStandings.findIndex(
      standing => standing.driverId === driverId
    ) + 1; // +1 because array index is 0-based, but positions start at 1

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
        fastestLaps: seasonFastestLaps, // USE THE LIVE DATA
        // BUG FIX: Use the calculated position from standings
        standing: driverPosition > 0 ? `P${driverPosition}` : 'N/A', 
      },
    };
  }

  async getDriverStandings(season: number): Promise<any[]> {
    const rawResults = await this.standingsViewRepo
      .createQueryBuilder('ds')
      .select([
        'ds.driverId AS id',
        'ds.driverFullName AS fullName',
        'ds.driver_number AS number',
        'ds.country_code AS country',
        'ds.profile_image_url AS profileImageUrl',
        'ds.constructorName AS constructor',
        'ds.seasonPoints AS points',
        'ds.seasonWins AS wins',
        'ds.seasonPodiums AS podiums',
        'ds.position AS position',
        'ds.seasonYear AS seasonYear'
      ])
      .where('ds.seasonYear = :season', { season })
      .orderBy('ds.position', 'ASC')
      .getRawMany();

      console.log(rawResults[0]);
  
    return rawResults.map(r => ({
      id: parseInt(r.id, 10),
      fullName: r.fullname || r.fullName || r.driverFullName || r.driverfullname || 'Unknown',
      number: r.number ? parseInt(r.number, 10) : null,
      country: r.country,
      profileImageUrl: r.profileImageUrl,
      constructor: r.constructor,
      points: parseFloat(r.points) || 0,
      wins: parseInt(r.wins, 10) || 0,
      podiums: parseInt(r.podiums, 10) || 0,
      position: parseInt(r.position, 10) || 0,
      seasonYear: r.seasonYear
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