import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, DataSource } from 'typeorm';
import { ConstructorEntity } from './constructors.entity';
import { DriverStandingMaterialized } from '../standings/driver-standings-materialized.entity';
import { ConstructorStandingsMaterialized } from './constructor-standings-materialized.entity';
import { RaceResult } from '../race-results/race-results.entity';
import { Race } from '../races/races.entity';
import { ConstructorComparisonStatsResponseDto, ConstructorStatsDto } from './dto/constructor-stats.dto';
import { ConstructorStatsBulkResponseDto } from './dto/constructor-stats-bulk.dto'; 

@Injectable()
export class ConstructorsService {
  constructor(
    @InjectRepository(ConstructorEntity)
    private readonly constructorRepository: Repository<ConstructorEntity>,

    @InjectRepository(RaceResult)
    private readonly raceResultRepository: Repository<RaceResult>,

    @InjectRepository(Race)
    private readonly raceRepository: Repository<Race>,
    @InjectRepository(DriverStandingMaterialized)
    private readonly standingsViewRepository: Repository<DriverStandingMaterialized>,
    @InjectRepository(ConstructorStandingsMaterialized)
    private readonly constructorStandingsRepository: Repository<ConstructorStandingsMaterialized>,
    private readonly dataSource: DataSource,
  ) {}
  private readonly logger = new Logger(ConstructorsService.name);

  async findAll(year?: number): Promise<ConstructorEntity[]> {
    if (year) {
      this.logger.log(`findAll(year=${year}) → querying standings view`);
      let standings = await this.standingsViewRepository.find({
        where: { seasonYear: year },
        select: ['constructorName'],
      });
      this.logger.log(`standings entries: ${standings.length}`);
      if (standings.length === 0) {
        const latest = await this.standingsViewRepository.createQueryBuilder('ds')
          .select('MAX(ds.seasonYear)', 'max')
          .getRawOne<{ max: number }>();
        const fallbackYear = latest?.max ? Number(latest.max) : undefined;
        this.logger.warn(`No constructor standings found for year=${year}. Fallback to latest standings year=${fallbackYear}`);
        if (!fallbackYear) return [];
        standings = await this.standingsViewRepository.find({ where: { seasonYear: fallbackYear }, select: ['constructorName'] });
      }
      const names = Array.from(new Set(standings.map(s => s.constructorName)));
      this.logger.log(`unique constructor names: ${names.length}`);
      const teams = await this.constructorRepository.find({ where: { name: In(names) }, order: { name: 'ASC' } });
      this.logger.log(`loaded constructors: ${teams.length}`);
      return teams;
    }
    // When no year provided, auto-pick latest standings year
    const latest = await this.standingsViewRepository.createQueryBuilder('ds')
      .select('MAX(ds.seasonYear)', 'max')
      .getRawOne<{ max: number }>();
    const fallbackYear = latest?.max ? Number(latest.max) : undefined;
    if (fallbackYear) {
      this.logger.log(`findAll(no year) → using latest standings year=${fallbackYear}`);
      const standings = await this.standingsViewRepository.find({ where: { seasonYear: fallbackYear }, select: ['constructorName'] });
      const names = Array.from(new Set(standings.map(s => s.constructorName)));
      const teams = await this.constructorRepository.find({ where: { name: In(names) }, order: { name: 'ASC' } });
      this.logger.log(`loaded constructors (latest year): ${teams.length}`);
      return teams;
    }
    const all = await this.constructorRepository.find({ order: { name: 'ASC' } });
    this.logger.log(`loaded constructors (no standings fallback available): ${all.length}`);
    return all;
  }

  async findOne(id: number): Promise<ConstructorEntity> {
    const constructor = await this.constructorRepository.findOne({
      where: { id },
    });

    if (!constructor) {
      throw new NotFoundException(`Constructor with ID ${id} not found`);
    }
    return constructor;
  }

  async getPointsPerSeason(constructorId: number): Promise<{ season: number; points: number }[]> {
    // Check if constructor exists
    const constructor = await this.constructorRepository.findOne({
      where: { id: constructorId },
    });
    if (!constructor) {
      throw new NotFoundException(`Constructor with ID ${constructorId} not found`);
    }

    // Query race results grouped by season
    const pointsPerSeason = await this.raceResultRepository
      .createQueryBuilder('result')
      .select('race.season_id', 'season')
      .addSelect('SUM(result.points)', 'points')
      .innerJoin(Race, 'race', 'race.id = result.race_id')
      .where('result.constructor_id = :constructorId', { constructorId })
      .groupBy('race.season_id')
      .orderBy('race.season_id', 'ASC')
      .getRawMany();

    // Convert points from string to number (TypeORM returns numeric columns as string)
    return pointsPerSeason.map((row) => ({
      season: Number(row.season),
      points: Number(row.points),
    }));
  }


  async findAllActive(): Promise<ConstructorEntity[]> {
    const constructors = await this.constructorRepository.find({
      where: { is_active: true },
    });

    return constructors;
  }

  async findAllConstructors(): Promise<ConstructorEntity[]> {
    // Return ALL constructors from the database without any filtering
    return this.constructorRepository.find({ 
      order: { name: 'ASC' } 
    });
  }

  async getConstructorStats(constructorId: number, year?: number): Promise<ConstructorComparisonStatsResponseDto> {
    // Check if constructor exists
    const constructor = await this.constructorRepository.findOne({
      where: { id: constructorId },
    });
    if (!constructor) {
      throw new NotFoundException(`Constructor with ID ${constructorId} not found`);
    }

    // Get career stats (all time)
    const careerStats = await this.getConstructorCareerStats(constructorId);
    
    // Get year-specific stats if year provided
    let yearStats: ConstructorStatsDto | null = null;
    if (year) {
      yearStats = await this.getConstructorYearStats(constructorId, year);
    }

    return {
      constructorId,
      year: year || null,
      career: careerStats,
      yearStats,
    };
  }

  async getConstructorStatsAllYears(constructorId: number): Promise<{ year: number; stats: any }[]> {
    // Check if constructor exists
    const constructor = await this.constructorRepository.findOne({
      where: { id: constructorId },
    });
    if (!constructor) {
      throw new NotFoundException(`Constructor with ID ${constructorId} not found`);
    }

    // For now, return mock data to test the endpoint
    // TODO: Implement actual database queries once we resolve the column issues
    return [
      {
        year: 2024,
        stats: {
          wins: 2,
          podiums: 8,
          poles: 1,
          fastestLaps: 3,
          points: 245,
          dnfs: 4,
          races: 24,
        },
      },
      {
        year: 2023,
        stats: {
          wins: 1,
          podiums: 5,
          poles: 0,
          fastestLaps: 2,
          points: 178,
          dnfs: 6,
          races: 22,
        },
      },
    ];
  }

  private async getConstructorCareerStats(constructorId: number) {
    try {
      // Query race results for all time stats
      const stats = await this.raceResultRepository
        .createQueryBuilder('result')
        .select([
          'SUM(result.points) as points',
          'COUNT(CASE WHEN result.position = 1 THEN 1 END) as wins',
          'COUNT(CASE WHEN result.position <= 3 THEN 1 END) as podiums',
          'COUNT(CASE WHEN result.position = 1 AND result.grid = 1 THEN 1 END) as poles',
          'COUNT(CASE WHEN result.fastest_lap_rank = 1 THEN 1 END) as fastestLaps',
          'COUNT(CASE WHEN result.status NOT IN (\'Finished\', \'+1 Lap\', \'+2 Laps\') THEN 1 END) as dnfs',
          'COUNT(*) as races'
        ])
        .where('result.constructor_id = :constructorId', { constructorId })
        .getRawOne();

      return {
        wins: Number(stats?.wins) || 0,
        podiums: Number(stats?.podiums) || 0,
        poles: Number(stats?.poles) || 0,
        fastestLaps: Number(stats?.fastestLaps) || 0,
        points: Number(stats?.points) || 0,
        dnfs: Number(stats?.dnfs) || 0,
        races: Number(stats?.races) || 0,
      };
    } catch (error) {
      console.error('SERVICE FAILED:', error);
      this.logger.error(`Error fetching constructor career stats for ID ${constructorId}:`, error);
      return {
        wins: 0,
        podiums: 0,
        poles: 0,
        fastestLaps: 0,
        points: 0,
        dnfs: 0,
        races: 0,
      };
    }
  }

  private async getConstructorYearStats(constructorId: number, year: number) {
    try {
      // Query race results for specific year using entity relationships
      const stats = await this.raceResultRepository
        .createQueryBuilder('result')
        .innerJoin('result.session', 'session')
        .innerJoin('session.race', 'race')
        .innerJoin('race.season', 'season')
        .select([
          'SUM(result.points) as points',
          'COUNT(CASE WHEN result.position = 1 THEN 1 END) as wins',
          'COUNT(CASE WHEN result.position <= 3 THEN 1 END) as podiums',
          'COUNT(CASE WHEN result.position = 1 AND result.grid = 1 THEN 1 END) as poles',
          'COUNT(CASE WHEN result.fastest_lap_rank = 1 THEN 1 END) as fastestLaps',
          'COUNT(CASE WHEN result.status NOT IN (\'Finished\', \'+1 Lap\', \'+2 Laps\') THEN 1 END) as dnfs',
          'COUNT(*) as races'
        ])
        .where('result.constructor_id = :constructorId', { constructorId })
        .andWhere('season.year = :year', { year })
        .getRawOne();

      return {
        wins: Number(stats?.wins) || 0,
        podiums: Number(stats?.podiums) || 0,
        poles: Number(stats?.poles) || 0,
        fastestLaps: Number(stats?.fastestLaps) || 0,
        points: Number(stats?.points) || 0,
        dnfs: Number(stats?.dnfs) || 0,
        races: Number(stats?.races) || 0,
      };
    } catch (error) {
      console.error('SERVICE FAILED:', error);
      this.logger.error(`Error fetching constructor year stats for ID ${constructorId}, year ${year}:`, error);
      return {
        wins: 0,
        podiums: 0,
        poles: 0,
        fastestLaps: 0,
        points: 0,
        dnfs: 0,
        races: 0,
      };
    }
  }

  /**
   * Calculate the number of world championships won by a constructor
   * by counting seasons where they finished 1st in the final constructor standings
   */
  async getConstructorWorldChampionships(constructorId: number): Promise<{ championships: number }> {
    try {
      // Query to find all seasons where this constructor won the championship (position = 1)
      const result = await this.dataSource.query(`
        WITH latest_race_per_season AS (
          SELECT 
            s.year,
            MAX(r.round) as final_round
          FROM races r
          INNER JOIN seasons s ON r.season_id = s.id
          WHERE EXISTS (
            SELECT 1 FROM constructor_standings cs
            WHERE cs.race_id = r.id AND cs.constructor_id = $1
          )
          GROUP BY s.year
        ),
        final_standings AS (
          SELECT 
            s.year,
            cs.position,
            cs.constructor_id
          FROM constructor_standings cs
          INNER JOIN races r ON cs.race_id = r.id
          INNER JOIN seasons s ON r.season_id = s.id
          INNER JOIN latest_race_per_season lrs ON s.year = lrs.year AND r.round = lrs.final_round
          WHERE cs.constructor_id = $1
        )
        SELECT COUNT(*) as championships
        FROM final_standings
        WHERE position = 1
      `, [constructorId]);

      return { championships: parseInt(result[0]?.championships || '0', 10) };
    } catch (error) {
      console.error('SERVICE FAILED:', error);
      this.logger.error(`Error calculating world championships for constructor ${constructorId}:`, error);
      return { championships: 0 };
    }
  }

  /**
   * Find the best track for a constructor based on total points scored
   */
  async getConstructorBestTrack(constructorId: number): Promise<{ 
    circuitName: string; 
    totalPoints: number; 
    races: number;
    wins: number;
  }> {
    try {
      const result = await this.dataSource.query(`
        SELECT 
          c.name as circuit_name,
          SUM(rr.points) as total_points,
          COUNT(DISTINCT rr.id) as races,
          COUNT(CASE WHEN rr.position = 1 THEN 1 END) as wins
        FROM race_results rr
        INNER JOIN sessions s ON rr.session_id = s.id AND s.type = 'RACE'
        INNER JOIN races r ON s.race_id = r.id
        INNER JOIN circuits c ON r.circuit_id = c.id
        WHERE rr.constructor_id = $1
        GROUP BY c.id, c.name
        HAVING SUM(rr.points) > 0
        ORDER BY total_points DESC, wins DESC
        LIMIT 1
      `, [constructorId]);

      if (result.length === 0) {
        return { circuitName: 'N/A', totalPoints: 0, races: 0, wins: 0 };
      }

      return {
        circuitName: result[0].circuit_name,
        totalPoints: parseFloat(result[0].total_points || '0'),
        races: parseInt(result[0].races || '0', 10),
        wins: parseInt(result[0].wins || '0', 10),
      };
    } catch (error) {
      console.error('SERVICE FAILED:', error);
      this.logger.error(`Error calculating best track for constructor ${constructorId}:`, error);
      return { circuitName: 'N/A', totalPoints: 0, races: 0, wins: 0 };
    }
  }

  async getBulkConstructorStats(
    year?: number, 
    includeHistorical: boolean = false
  ): Promise<ConstructorStatsBulkResponseDto> {
    const targetYear = year || new Date().getFullYear();
    
    try {
      // Get all constructor standings from materialized view
      const standings = await this.constructorStandingsRepository.find({
        where: { seasonYear: targetYear },
        order: { position: 'ASC' }
      });

      // Get all constructors (active + historical if requested)
      const constructors = includeHistorical 
        ? await this.constructorRepository.find({ order: { name: 'ASC' } })
        : await this.constructorRepository.find({ 
            where: { is_active: true }, 
            order: { name: 'ASC' } 
          });

      // Create a map for quick lookup
      const standingsMap = new Map();
      standings.forEach(standing => {
        // Convert constructorId to number to match constructor.id type
        standingsMap.set(Number(standing.constructorId), standing);
      });

      // Combine constructor info with standings
      const result = constructors.map(constructor => {
        const standing = standingsMap.get(constructor.id);
        
        return {
          constructorId: constructor.id,
          constructorName: constructor.name,
          nationality: constructor.nationality,
          isActive: constructor.is_active,
          stats: standing ? {
            points: Number(standing.seasonPoints) || 0,
            wins: standing.seasonWins || 0,
            podiums: standing.seasonPodiums || 0,
            position: standing.position || 0
          } : {
            points: 0,
            wins: 0,
            podiums: 0,
            position: 0
          }
        };
      });

      return {
        seasonYear: targetYear,
        constructors: result
      };
    } catch (error) {
      console.error('BULK STATS FAILED:', error);
      this.logger.error(`Error fetching bulk constructor stats for year ${targetYear}:`, error);
      throw new NotFoundException(`Failed to fetch constructor stats for year ${targetYear}`);
    }
  }
}


