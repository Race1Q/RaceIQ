import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConstructorEntity } from './constructors.entity';
import { RaceResult } from 'src/race-results/race-results.entity';
import { Race } from 'src/races/races.entity'; 

@Injectable()
export class ConstructorsService {
  constructor(
    @InjectRepository(ConstructorEntity)
    private readonly constructorRepository: Repository<ConstructorEntity>,

    @InjectRepository(RaceResult)
    private readonly raceResultRepository: Repository<RaceResult>,

    @InjectRepository(Race)
    private readonly raceRepository: Repository<Race>,
  ) {}

  async findAll(): Promise<ConstructorEntity[]> {
    return this.constructorRepository.find();
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


