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

  // Optimized to avoid N+1 queries for podiums by batching all podium lookups into one query.
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

    // Preload podiums for all races (single query)
    const now = new Date();
    const pastRaceIds = races.filter(r => new Date(r.date) < now).map(r => r.id);

    let podiumByRaceId = new Map<number, PodiumResult[]>();
    if (pastRaceIds.length > 0) {
      const allPodiums = await this.raceResultRepository.find({
        where: {
          session: { race: { id: In(pastRaceIds) }, type: 'RACE' },
          position: In([1, 2, 3]),
        },
        relations: ['driver', 'session', 'session.race'],
        order: { position: 'ASC' },
      });

      podiumByRaceId = allPodiums.reduce((map, rr) => {
        const rid = rr.session.race.id;
        const list = map.get(rid) || [];
        list.push({
          position: rr.position,
          driverName: `${rr.driver.first_name} ${rr.driver.last_name}`,
          countryCode: rr.driver?.country_code ?? undefined,
        });
        map.set(rid, list);
        return map;
      }, new Map<number, PodiumResult[]>());
    }

    // Stitch results
    return races.map(race => {
      const podium = podiumByRaceId.get(race.id) || null;
      // Only include podiums for past races
      const value = new Date(race.date) < now ? (podium && podium.length ? podium : null) : null;
      return { ...race, podium: value } as RaceWithPodium;
    });
  }
}


