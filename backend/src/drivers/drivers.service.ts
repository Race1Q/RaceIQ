// backend/src/drivers/drivers.service.ts

import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Driver } from './drivers.entity';
import { RaceResult } from '../race-results/race-results.entity';
import { QualifyingResult } from '../qualifying-results/qualifying-results.entity';
import { DriverStandingMaterialized } from '../standings/driver-standings-materialized.entity';
import { DriverCareerStatsMaterialized } from './driver-career-stats-materialized.entity';
import { WinsPerSeasonMaterialized } from './wins-per-season-materialized.entity';
import { RaceFastestLapMaterialized } from '../dashboard/race-fastest-laps-materialized.entity';
import { DriverStatsResponseDto, DriverComparisonStatsResponseDto } from './dto/driver-stats.dto';

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
    @InjectRepository(QualifyingResult)
    private readonly qualifyingResultRepository: Repository<QualifyingResult>,
    @InjectRepository(DriverCareerStatsMaterialized)
    private readonly careerStatsViewRepo: Repository<DriverCareerStatsMaterialized>,
    @InjectRepository(DriverStandingMaterialized)
    private readonly standingsViewRepo: Repository<DriverStandingMaterialized>,
    @InjectRepository(WinsPerSeasonMaterialized)
    private readonly winsPerSeasonViewRepo: Repository<WinsPerSeasonMaterialized>,
    @InjectRepository(RaceFastestLapMaterialized)
    private readonly fastestLapViewRepo: Repository<RaceFastestLapMaterialized>,
  ) {}
  private readonly logger = new Logger(DriversService.name);

  async findAll(options: { status?: 'active' | 'inactive'; year?: number } = {}): Promise<any[]> {
    const { status, year } = options;
    let drivers: Driver[];
    if (year) {
      this.logger.log(`findAll(year=${year}) → querying standings view`);
      let standings = await this.standingsViewRepo.find({
        where: { seasonYear: year },
        select: ['driverId'],
      });
      this.logger.log(`standings entries: ${standings.length}`);
      if (standings.length === 0) {
        // fallback to latest available year in standings
        const latest = await this.standingsViewRepo.createQueryBuilder('ds')
          .select('MAX(ds.seasonYear)', 'max')
          .getRawOne<{ max: number }>();
        const fallbackYear = latest?.max ? Number(latest.max) : undefined;
        this.logger.warn(`No driver standings found for year=${year}. Fallback to latest standings year=${fallbackYear}`);
        if (!fallbackYear) return [];
        standings = await this.standingsViewRepo.find({ where: { seasonYear: fallbackYear }, select: ['driverId'] });
      }
      const ids = Array.from(new Set(standings.map(s => s.driverId)));
      this.logger.log(`unique driverIds: ${ids.length}`);
      this.logger.debug(`driverIds (sample up to 20): ${ids.slice(0, 20).join(', ')}`);
      drivers = await this.driverRepository.find({
        where: { id: In(ids) },
        relations: ['country'],
        order: { last_name: 'ASC' },
      });
      this.logger.log(`loaded drivers: ${drivers.length}`);
      this.logger.debug(
        `drivers fetched (sample up to 20): ${drivers
          .slice(0, 20)
          .map(d => `${d.id}:${(d.first_name||'').trim()} ${(d.last_name||'').trim()}`.trim())
          .join(', ')}`
      );
    } else {
      const where: any = {};
      if (status === 'active') where.is_active = true;
      if (status === 'inactive') where.is_active = false;
      // if no status filter provided, auto-pick latest standings year
      if (!status) {
        const latest = await this.standingsViewRepo.createQueryBuilder('ds')
          .select('MAX(ds.seasonYear)', 'max')
          .getRawOne<{ max: number }>();
        const fallbackYear = latest?.max ? Number(latest.max) : undefined;
        this.logger.log(`findAll(no year) → using latest standings year=${fallbackYear}`);
        if (fallbackYear) {
          const standings = await this.standingsViewRepo.find({ where: { seasonYear: fallbackYear }, select: ['driverId'] });
          const ids = Array.from(new Set(standings.map(s => s.driverId)));
          drivers = await this.driverRepository.find({ where: { id: In(ids) }, relations: ['country'], order: { last_name: 'ASC' } });
          this.logger.log(`loaded drivers (latest year): ${drivers.length}`);
        } else {
          drivers = await this.driverRepository.find({ relations: ['country'], where, order: { last_name: 'ASC' } });
          this.logger.log(`loaded drivers (no standings fallback available): ${drivers.length}`);
        }
      } else {
        this.logger.log(`findAll(no year) where=${JSON.stringify(where)}`);
        drivers = await this.driverRepository.find({ relations: ['country'], where, order: { last_name: 'ASC' } });
        this.logger.log(`loaded drivers: ${drivers.length}`);
      }
    }
    
    // Transform the data to match frontend expectations
    return drivers.map(driver => ({
      id: driver.id,
      full_name: driver.first_name && driver.last_name 
        ? `${driver.first_name} ${driver.last_name}`
        : driver.first_name || driver.last_name || driver.name_acronym || `Driver ${driver.id}`,
      given_name: driver.first_name,
      family_name: driver.last_name,
      code: driver.name_acronym,
      current_team_name: null, // Will be populated later if needed
      image_url: driver.profile_image_url,
      team_color: null, // Will be populated later if needed
      country_code: driver.country_code,
      driver_number: driver.driver_number,
      date_of_birth: driver.date_of_birth,
      bio: driver.bio,
      fun_fact: driver.fun_fact,
    }));
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
    
    // Transform and enrich the driver object with team information
    const transformedDriver = {
      id: driver.id,
      full_name: driver.first_name && driver.last_name 
        ? `${driver.first_name} ${driver.last_name}`
        : driver.first_name || driver.last_name || driver.name_acronym || `Driver ${driver.id}`,
      given_name: driver.first_name,
      family_name: driver.last_name,
      code: driver.name_acronym,
      current_team_name: teamResult?.teamName || null,
      image_url: driver.profile_image_url,
      team_color: null, // Will be populated later if needed
      country_code: driver.country_code,
      driver_number: driver.driver_number,
      date_of_birth: driver.date_of_birth,
      bio: driver.bio,
      fun_fact: driver.fun_fact,
      teamName: teamResult?.teamName || 'N/A', // Legacy field for compatibility
    };

    return {
      driver: transformedDriver,
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

  // NEW: Driver comparison stats method
  async getDriverStats(driverId: number, year?: number): Promise<DriverComparisonStatsResponseDto> {
    // Verify driver exists
    const driver = await this.findOne(driverId);
    
    // Build the DNF condition predicate
    const dnfCondition = `(
      rr.status IS NULL 
      OR (rr.status NOT ILIKE 'Finished%' 
          AND rr.status NOT ILIKE '+% Lap%' 
          AND rr.status NOT ILIKE 'Classified%')
    )`;

    // Career stats query (race results only)
    const careerRaceQuery = this.raceResultRepository
      .createQueryBuilder('rr')
      .select([
        'COUNT(CASE WHEN rr.position = 1 THEN 1 END) AS wins',
        'COUNT(CASE WHEN rr.position <= 3 THEN 1 END) AS podiums',
        'COUNT(CASE WHEN rr.fastest_lap_rank = 1 THEN 1 END) AS fastest_laps',
        'SUM(COALESCE(rr.points, 0) + COALESCE(rr.points_for_fastest_lap, 0)) AS points',
        `COUNT(CASE WHEN ${dnfCondition} THEN 1 END) AS dnfs`,
      ])
      .innerJoin('rr.session', 's')
      .where('rr.driver_id = :driverId', { driverId })
      .andWhere("s.type = 'RACE'");

    // Career stats query (sprint results only)  
    const careerSprintQuery = this.raceResultRepository
      .createQueryBuilder('rr')
      .select([
        'COUNT(CASE WHEN rr.position = 1 THEN 1 END) AS sprint_wins',
        'COUNT(CASE WHEN rr.position <= 3 THEN 1 END) AS sprint_podiums',
      ])
      .innerJoin('rr.session', 's')
      .where('rr.driver_id = :driverId', { driverId })
      .andWhere("s.type = 'SPRINT'");

    // Execute base queries
    const [careerRaceStats, careerSprintStats] = await Promise.all([
      careerRaceQuery.getRawOne(),
      careerSprintQuery.getRawOne(),
    ]);

    // Year-specific stats (only if year is provided)
    let yearRaceStats: any = null;
    let yearSprintStats: any = null; 
    let yearPolesStats: any = null;

    if (year) {
      // Year race stats
      const yearRaceQuery = this.raceResultRepository
        .createQueryBuilder('rr')
        .select([
          'COUNT(CASE WHEN rr.position = 1 THEN 1 END) AS wins',
          'COUNT(CASE WHEN rr.position <= 3 THEN 1 END) AS podiums',
          'COUNT(CASE WHEN rr.fastest_lap_rank = 1 THEN 1 END) AS fastest_laps',
          'SUM(COALESCE(rr.points, 0) + COALESCE(rr.points_for_fastest_lap, 0)) AS points',
          `COUNT(CASE WHEN ${dnfCondition} THEN 1 END) AS dnfs`,
        ])
        .innerJoin('rr.session', 's')
        .innerJoin('s.race', 'r')
        .innerJoin('r.season', 'season')
        .where('rr.driver_id = :driverId', { driverId })
        .andWhere("s.type = 'RACE'")
        .andWhere('season.year = :year', { year });

      // Year sprint stats
      const yearSprintQuery = this.raceResultRepository
        .createQueryBuilder('rr')
        .select([
          'COUNT(CASE WHEN rr.position = 1 THEN 1 END) AS sprint_wins',
          'COUNT(CASE WHEN rr.position <= 3 THEN 1 END) AS sprint_podiums',
        ])
        .innerJoin('rr.session', 's')
        .innerJoin('s.race', 'r')
        .innerJoin('r.season', 'season')
        .where('rr.driver_id = :driverId', { driverId })
        .andWhere("s.type = 'SPRINT'")
        .andWhere('season.year = :year', { year });

      // Year poles (from qualifying results)
      const yearPolesQuery = this.qualifyingResultRepository
        .createQueryBuilder('qr')
        .select('COUNT(CASE WHEN qr.position = 1 THEN 1 END) AS poles')
        .innerJoin('qr.session', 's')
        .innerJoin('s.race', 'r')
        .innerJoin('r.season', 'season')
        .where('qr.driver_id = :driverId', { driverId })
        .andWhere("s.type = 'QUALIFYING'")
        .andWhere('season.year = :year', { year });

      // Execute year-specific queries
      [yearRaceStats, yearSprintStats, yearPolesStats] = await Promise.all([
        yearRaceQuery.getRawOne(),
        yearSprintQuery.getRawOne(), 
        yearPolesQuery.getRawOne(),
      ]);
    }

    // Build response
    const response: DriverComparisonStatsResponseDto = {
      driverId,
      year: year || null,
      career: {
        wins: parseInt(careerRaceStats?.wins || '0', 10),
        podiums: parseInt(careerRaceStats?.podiums || '0', 10),
        fastestLaps: parseInt(careerRaceStats?.fastest_laps || '0', 10),
        points: parseFloat(careerRaceStats?.points || '0'),
        dnfs: parseInt(careerRaceStats?.dnfs || '0', 10),
        sprintWins: parseInt(careerSprintStats?.sprint_wins || '0', 10),
        sprintPodiums: parseInt(careerSprintStats?.sprint_podiums || '0', 10),
      },
      yearStats: year ? {
        wins: parseInt(yearRaceStats?.wins || '0', 10),
        podiums: parseInt(yearRaceStats?.podiums || '0', 10),
        fastestLaps: parseInt(yearRaceStats?.fastest_laps || '0', 10),
        points: parseFloat(yearRaceStats?.points || '0'),
        dnfs: parseInt(yearRaceStats?.dnfs || '0', 10),
        sprintWins: parseInt(yearSprintStats?.sprint_wins || '0', 10),
        sprintPodiums: parseInt(yearSprintStats?.sprint_podiums || '0', 10),
        poles: parseInt(yearPolesStats?.poles || '0', 10),
      } : null,
    };

    return response;
  }
}