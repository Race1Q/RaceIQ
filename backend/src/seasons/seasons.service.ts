import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Season } from './seasons.entity';
import { Race } from '../races/races.entity'; // 1. IMPORT RACE

@Injectable()
export class SeasonsService {
  constructor(
    @InjectRepository(Season)
    private readonly seasonRepository: Repository<Season>,
    @InjectRepository(Race) // 2. INJECT RACE REPOSITORY
    private readonly raceRepository: Repository<Race>,
  ) {}

  async findAll(): Promise<Season[]> {
    return this.seasonRepository.find({
      order: {
        year: 'DESC',
      },
    });
  }

  // 3. IMPLEMENT THIS METHOD
  async getRacesForYear(year: number): Promise<Race[]> {
    // First, find the season to get its ID
    const season = await this.seasonRepository.findOne({ where: { year } });
    if (!season) {
      throw new NotFoundException(`Season with year ${year} not found`);
    }

    // Now, find all races for that season_id and join their circuit data
    return this.raceRepository.find({
      where: { season: { id: season.id } },
      relations: ['circuit'], // Join the circuit information
      order: {
        round: 'ASC', // Order by round number
      },
    });
  }
}


