import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ConstructorEntity } from './constructors.entity';
import { DriverStandingMaterialized } from '../standings/driver-standings-materialized.entity';
import { RaceResult } from 'src/race-results/race-results.entity';
import { Race } from 'src/races/races.entity';
import { ConstructorComparisonStatsResponseDto, ConstructorStatsDto } from './dto/constructor-stats.dto';

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
 
}


