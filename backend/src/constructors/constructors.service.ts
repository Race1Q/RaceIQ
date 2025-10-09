import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ConstructorEntity } from './constructors.entity';
import { DriverStandingMaterialized } from '../standings/driver-standings-materialized.entity';
import { RaceResult } from '../race-results/race-results.entity';
import { Race } from '../races/races.entity'; 

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
 
}


