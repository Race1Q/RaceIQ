import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Season } from './seasons.entity';
import { Race } from '../races/races.entity'; // 1. IMPORT RACE
import { RaceResult } from '../race-results/race-results.entity';

// Define the shape of a podium finisher
interface PodiumResult {
  position: number;
  driverName: string;
  countryCode?: string; // 3-letter code from Driver.country_code
}

// Define the new shape of our Race object, which now includes a podium array
export type RaceWithPodium = Race & { podium: PodiumResult[] | null };

@Injectable()
export class SeasonsService {
  constructor(
    @InjectRepository(Season)
    private readonly seasonRepository: Repository<Season>,
    @InjectRepository(Race) // 2. INJECT RACE REPOSITORY
    private readonly raceRepository: Repository<Race>,
    @InjectRepository(RaceResult)
    private readonly raceResultRepository: Repository<RaceResult>,
  ) {}

  async findAll(): Promise<Season[]> {
    return this.seasonRepository.find({
      order: {
        year: 'DESC',
      },
    });
  }

  // Replace the existing getRacesForYear method with this one
  async getRacesForYear(year: number): Promise<RaceWithPodium[]> {
    const season = await this.seasonRepository.findOne({ where: { year } });
    if (!season) {
      throw new NotFoundException(`Season with year ${year} not found`);
    }

    const races = await this.raceRepository.find({
      where: { season: { id: season.id } },
      relations: ['circuit'],
      order: { round: 'ASC' },
    });

    const racesWithPodiums = await Promise.all(
      races.map(async (race) => {
        // Check if the race date is in the past
        if (new Date(race.date) < new Date()) {
          // If it is, find the results for P1, P2, and P3
          const podiumResults = await this.raceResultRepository.find({
            where: {
              session: { race: { id: race.id }, type: 'RACE' },
              position: In([1, 2, 3]),
            },
            relations: ['driver'],
            order: { position: 'ASC' },
          });

          // Map the full result objects to our simpler PodiumResult shape
          const podium: PodiumResult[] = podiumResults.map((result) => ({
            position: result.position,
            driverName: `${result.driver.first_name} ${result.driver.last_name}`,
            countryCode: result.driver?.country_code ?? undefined,
          }));

          return { ...race, podium: podium.length ? podium : null } as RaceWithPodium;
        }
        
        // If the race is in the future, return it with a null podium
        return { ...race, podium: null } as RaceWithPodium;
      }),
    );

    return racesWithPodiums;
  }
}


