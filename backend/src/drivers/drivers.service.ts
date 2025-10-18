// backend/src/drivers/drivers.service.ts

import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, DataSource, MoreThan } from 'typeorm';
import { Driver } from './drivers.entity';
import { RaceResult } from '../race-results/race-results.entity';
import { QualifyingResult } from '../qualifying-results/qualifying-results.entity';
import { DriverStandingMaterialized } from '../standings/driver-standings-materialized.entity';
import { DriverCareerStatsMaterialized } from './driver-career-stats-materialized.entity';
import { WinsPerSeasonMaterialized } from './wins-per-season-materialized.entity';
import { RaceFastestLapMaterialized } from '../dashboard/race-fastest-laps-materialized.entity';
import { DriverStatsResponseDto, DriverComparisonStatsResponseDto } from './dto/driver-stats.dto';
import { DriverSeasonStatsDto } from './dto/driver-season-stats.dto';
import { DriverSeasonProgressionDto } from './dto/driver-season-progression.dto';

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
    private readonly dataSource: DataSource,
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
      // bio and fun_fact not stored in database - available via AI endpoint
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
    console.log(`[getDriverCareerStats] Fetching career stats for driver ${driverId}`);

    // Add queries for poles data (career and current season)
    const [driver, careerStats, currentSeason, winsPerSeason, firstRace, seasonFastestLaps, allCurrentSeasonStandings, worldChampionships, careerPolesResult, seasonPolesResult, bestLapRow] = await Promise.all([
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
      // NEW QUERY: Get world championships from materialized view (fallback to calculation if not available)
      this.getWorldChampionships(driverId),
      // NEW QUERY: Career poles from qualifying results
      this.qualifyingResultRepository
        .createQueryBuilder('qr')
        .select('COUNT(CASE WHEN qr.position = 1 THEN 1 END) AS poles')
        .innerJoin('qr.session', 's')
        .innerJoin('s.race', 'r')
        .innerJoin('r.season', 'season')
        .where('qr.driver_id = :driverId', { driverId })
        .andWhere("s.type = 'QUALIFYING'")
        .getRawOne<{ poles: string }>(),
      // NEW QUERY: Current season poles from qualifying results
      this.qualifyingResultRepository
        .createQueryBuilder('qr')
        .select('COUNT(CASE WHEN qr.position = 1 THEN 1 END) AS poles')
        .innerJoin('qr.session', 's')
        .innerJoin('s.race', 'r')
        .innerJoin('r.season', 'season')
        .where('qr.driver_id = :driverId', { driverId })
        .andWhere("s.type = 'QUALIFYING'")
        .andWhere('season.year = :year', { year: currentYear })
        .getRawOne<{ poles: string }>(),
      // NEW QUERY: Driver's all-time best lap from race_fastest_laps_materialized
      this.dataSource
        .query(
          'SELECT MIN("lapTimeMs") AS "bestLapMs" FROM race_fastest_laps_materialized WHERE "driverId" = $1',
          [driverId]
        )
        .then((rows: Array<{ bestLapMs: number | null }>) => rows?.[0] ?? { bestLapMs: null }),
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
      // bio and fun_fact not stored in database - available via AI endpoint
      teamName: teamResult?.teamName || 'N/A', // Legacy field for compatibility
    };

    const bestLapMs = bestLapRow?.bestLapMs ?? null;

    return new DriverStatsResponseDto(
      transformedDriver,
      {
        wins: careerStats.totalWins,
        podiums: careerStats.totalPodiums,
        fastestLaps: careerStats.totalFastestLaps,
        poles: parseInt(careerPolesResult?.poles || '0', 10) || 0,
        points: Number(careerStats.totalPoints),
        grandsPrixEntered: careerStats.grandsPrixEntered,
        dnfs: careerStats.dnfs,
        highestRaceFinish: careerStats.highestRaceFinish,
        worldChampionships: worldChampionships,
        firstRace: {
          year: firstRace ? new Date(firstRace.session.race.date).getFullYear() : 0,
          event: firstRace ? firstRace.session.race.name : 'N/A',
        },
        winsPerSeason: winsPerSeason.map(w => ({ 
          season: w.seasonYear, 
          wins: w.wins 
        })),
      },
      {
        wins: currentSeason?.seasonWins || 0,
        podiums: currentSeason?.seasonPodiums || 0,
        fastestLaps: seasonFastestLaps, // USE THE LIVE DATA
        poles: parseInt(seasonPolesResult?.poles || '0', 10) || 0,
        // BUG FIX: Use the calculated position from standings
        standing: driverPosition > 0 ? `P${driverPosition}` : 'N/A', 
      },
      bestLapMs,
    );
  }

  /**
   * Get the number of world championships won by a driver
   * First tries to get from materialized view, falls back to calculation if not available
   */
  private async getWorldChampionships(driverId: number): Promise<number> {
    try {
      // First try to get from materialized view
      const careerStats = await this.careerStatsViewRepo.findOne({ where: { driverId } });
      if (careerStats && careerStats.championships !== undefined) {
        return careerStats.championships;
      }

      // Fallback to calculation if not in materialized view
      return await this.calculateWorldChampionships(driverId);
    } catch (error) {
      console.error(`Error getting world championships for driver ${driverId}:`, error);
      return 0;
    }
  }

  /**
   * Calculate the number of world championships won by a driver
   * by counting seasons where they finished 1st in the final standings
   */
  private async calculateWorldChampionships(driverId: number): Promise<number> {
    try {
      // Get all seasons where this driver participated
      const driverSeasons = await this.standingsViewRepo
        .createQueryBuilder('ds')
        .select('ds.seasonYear')
        .where('ds.driverId = :driverId', { driverId })
        .getMany();

      if (driverSeasons.length === 0) {
        return 0;
      }

      const seasons = driverSeasons.map(ds => ds.seasonYear);
      let championships = 0;

      // For each season, check if the driver finished 1st
      for (const season of seasons) {
        const seasonStandings = await this.standingsViewRepo
          .createQueryBuilder('ds')
          .select(['ds.driverId', 'ds.seasonPoints'])
          .where('ds.seasonYear = :season', { season })
          .orderBy('ds.seasonPoints', 'DESC')
          .limit(1)
          .getOne();

        // If this driver has the highest points in this season, they won the championship
        if (seasonStandings && seasonStandings.driverId === driverId) {
          championships++;
        }
      }

      return championships;
    } catch (error) {
      console.error(`Error calculating world championships for driver ${driverId}:`, error);
      return 0;
    }
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
        'ds.seasonYear AS seasonYear'
      ])
      .where('ds.seasonYear = :season', { season })
      .orderBy('ds.seasonPoints', 'DESC')
      .getRawMany();

    // Calculate position based on points ranking
    const resultsWithPosition = rawResults.map((r, index) => ({
      id: parseInt(r.id, 10),
      fullName: r.fullname || r.fullName || r.driverFullName || r.driverfullname || 'Unknown',
      number: r.number ? parseInt(r.number, 10) : null,
      country: r.country,
      profileImageUrl: r.profileImageUrl,
      constructor: r.constructor,
      points: parseFloat(r.points) || 0,
      wins: parseInt(r.wins, 10) || 0,
      podiums: parseInt(r.podiums, 10) || 0,
      position: index + 1, // Position based on ranking
      seasonYear: r.seasonYear
    }));
  
    return resultsWithPosition;
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

  /**
   * Get driver season statistics from materialized view
   * Used for 2x2 grid of career trend graphs
   */
  async findDriverSeasonStats(driverId: number): Promise<DriverSeasonStatsDto[]> {
    try {
      const query = `
        SELECT * FROM public.driver_season_stats_materialized 
        WHERE driver_id = $1 
        ORDER BY year ASC
      `;
      
      const results = await this.dataSource.query(query, [driverId]);
      
      this.logger.log(`Retrieved ${results.length} season stats records for driver ${driverId}`);
      
      return results.map((row: any) => ({
        year: row.year,
        driver_id: row.driver_id,
        total_points: parseFloat(row.total_points || '0'),
        wins: parseInt(row.wins || '0', 10),
        podiums: parseInt(row.podiums || '0', 10),
        poles: parseInt(row.poles || '0', 10),
      }));
    } catch (error) {
      this.logger.error(`Error fetching driver season stats for driver ${driverId}:`, error);
      throw new NotFoundException(`Season stats not found for driver ID ${driverId}`);
    }
  }

  /**
   * Get driver current season progression from materialized view
   * Used for full-width cumulative points progression chart
   */
  async findCurrentSeasonProgression(driverId: number): Promise<DriverSeasonProgressionDto[]> {
    try {
      const query = `
        SELECT * FROM public.driver_current_season_progression_materialized 
        WHERE driver_id = $1 
        ORDER BY round ASC
      `;
      
      const results = await this.dataSource.query(query, [driverId]);
      
      this.logger.log(`Retrieved ${results.length} progression records for driver ${driverId}`);
      
      return results.map((row: any) => ({
        year: row.year,
        round: parseInt(row.round || '0', 10),
        race_name: row.race_name,
        driver_id: row.driver_id,
        points: parseFloat(row.points || '0'),
        cumulative_points: parseFloat(row.cumulative_points || '0'),
      }));
    } catch (error) {
      this.logger.error(`Error fetching driver season progression for driver ${driverId}:`, error);
      throw new NotFoundException(`Season progression not found for driver ID ${driverId}`);
    }
  }

  /**
   * Get all drivers who have won at least one race in any season (seasonWins > 0)
   * Used for compare section to show drivers with season wins
   */
  async findAllWinners(): Promise<any[]> {
    try {
      const winners = await this.standingsViewRepo.find({
        where: {
          seasonWins: MoreThan(0)
        },
        order: {
          seasonWins: 'DESC',
          seasonYear: 'DESC'
        }
      });

      this.logger.log(`Retrieved ${winners.length} drivers with season wins`);
      
      return winners.map(winner => ({
        driverId: winner.driverId,
        driverFullName: winner.driverFullName,
        seasonYear: winner.seasonYear,
        constructorName: winner.constructorName,
        seasonWins: winner.seasonWins,
        seasonPoints: winner.seasonPoints,
        seasonPodiums: winner.seasonPodiums,
        driverNumber: winner.driverNumber,
        countryCode: winner.countryCode,
        profileImageUrl: winner.profileImageUrl
      }));
    } catch (error) {
      this.logger.error('Error fetching drivers with season wins:', error);
      throw new NotFoundException('Failed to fetch drivers with season wins');
    }
  }

  /**
   * Get all drivers who have won at least one world championship
   * Used for compare section to show only championship-winning drivers
   */
  async getChampions(): Promise<any[]> {
    try {
      // Query to get unique drivers with championships > 0
      const query = `
        SELECT DISTINCT ON (d.id)
          d.id AS "driverId",
          d.first_name || ' ' || d.last_name AS "driverFullName",
          d.profile_image_url AS "profileImageUrl",
          d.driver_number AS "driverNumber",
          d.country_code AS "countryCode",
          dcs.championships
        FROM
          drivers d
        INNER JOIN
          driver_career_stats_materialized dcs ON d.id = dcs."driverId"
        WHERE
          dcs.championships > 0
        ORDER BY
          d.id, dcs.championships DESC;
      `;
      
      const champions = await this.dataSource.query(query);
      
      this.logger.log(`Retrieved ${champions.length} drivers with world championships`);
      
      return champions.map(champion => ({
        driverId: champion.driverId,
        driverFullName: champion.driverFullName,
        profileImageUrl: champion.profileImageUrl,
        driverNumber: champion.driverNumber,
        countryCode: champion.countryCode,
        championships: champion.championships
      }));
    } catch (error) {
      this.logger.error('Error fetching champion drivers:', error);
      throw new NotFoundException('Failed to fetch champion drivers');
    }
  }
}