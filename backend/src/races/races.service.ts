import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// Adjust the imported name to match your actual export in races.entity.ts.
// Common names are "Race" or "RaceEntity".
import { Race } from './races.entity'; // <-- if your entity is exported as RaceEntity, change this line accordingly.

type SeasonQuery = {
  season?: number | string;
  season_id?: number | string;
  year?: number | string;
};

@Injectable()
export class RacesService {
  constructor(
    @InjectRepository(Race)
    private readonly racesRepo: Repository<Race>,
  ) {}

  /**
   * Return races, optionally filtered by season (season | season_id | year).
   * Ordered newest-first by date/time, then round desc.
   */
  async findAll(query: SeasonQuery = {}): Promise<Race[]> {
    const seasonRaw = query.season ?? query.season_id;
    const yearRaw = query.year;
    const season = seasonRaw !== undefined && seasonRaw !== null ? Number(seasonRaw) : undefined;
    const year = yearRaw !== undefined && yearRaw !== null ? Number(yearRaw) : undefined;

    // Debug logging removed

    const qb = this.racesRepo.createQueryBuilder('r')
      .leftJoinAndSelect('r.season', 'season')
      .leftJoinAndSelect('r.circuit', 'circuit')
      .leftJoinAndSelect('r.sessions', 'sessions');

    if (typeof year === 'number' && !Number.isNaN(year)) {
      qb.innerJoin('r.season', 's').where('s.year = :year', { year });
    } else if (typeof season === 'number' && !Number.isNaN(season)) {
      qb.where('r.season_id = :season', { season });
    }

    qb.orderBy('r.date', 'DESC')
      .addOrderBy('r.time', 'DESC')
      .addOrderBy('r.round', 'DESC');

    const races = await qb.getMany();
    return races;
  }

  /**
   * Return a single race by ID or throw 404.
   */
  async findOne(id: number | string): Promise<Race> {
    const raceId = Number(id);
    const race = await this.racesRepo.findOne({ where: { id: raceId } as any });
    if (!race) throw new NotFoundException('Race not found');
    return race;
  }

  /**
   * Return distinct season years (season_id), newest-first.
   */
  async listYears(): Promise<number[]> {
    const raw = await this.racesRepo
      .createQueryBuilder('r')
      .select('DISTINCT r.season_id', 'year')
      .orderBy('year', 'DESC')
      .getRawMany<{ year: string | number }>();

    return raw.map((r) => Number(r.year)).filter((n) => Number.isFinite(n));
  }
}
