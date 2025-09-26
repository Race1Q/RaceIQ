import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// Adjust the imported name to match your actual export in races.entity.ts.
// Common names are "Race" or "RaceEntity".
import { Race } from './races.entity'; // <-- if your entity is exported as RaceEntity, change this line accordingly.

<<<<<<< HEAD
import { Race } from './races.entity';
import { Session } from '../sessions/sessions.entity';
import { RaceResult } from '../race-results/race-results.entity';
import { QualifyingResult } from '../qualifying-results/qualifying-results.entity';
import { Lap } from '../laps/laps.entity';
import { PitStop } from '../pit-stops/pit-stops.entity';
import { TireStint } from '../tire-stints/tire-stints.entity';
import { RaceEvent } from '../race-events/race-events.entity';
import { Season } from '../seasons/seasons.entity';
=======
type SeasonQuery = {
  season?: number | string;
  season_id?: number | string;
  year?: number | string;
};
>>>>>>> main

@Injectable()
export class RacesService {
  constructor(
    @InjectRepository(Race)
<<<<<<< HEAD
    private readonly raceRepository: Repository<Race>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(RaceResult)
    private readonly raceResultRepository: Repository<RaceResult>,
    @InjectRepository(QualifyingResult)
    private readonly qualifyingResultRepository: Repository<QualifyingResult>,
    @InjectRepository(Lap)
    private readonly lapRepository: Repository<Lap>,
    @InjectRepository(PitStop)
    private readonly pitStopRepository: Repository<PitStop>,
    @InjectRepository(TireStint)
    private readonly tireStintRepository: Repository<TireStint>,
    @InjectRepository(RaceEvent)
    private readonly raceEventRepository: Repository<RaceEvent>,
    @InjectRepository(Season)
    private readonly seasonRepository: Repository<Season>,
=======
    private readonly racesRepo: Repository<Race>,
>>>>>>> main
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

  async getConstructorPolePositions(constructorId: number): Promise<number> {
    const poles = await this.qualifyingResultRepository.count({
      where: {
        constructor_id: constructorId,
        position: 1, // Pole position
      },
    });
  
    return poles;
  }

  // FIXED: now joins sessions → races → seasons
  async getConstructorPolePositionsBySeason(constructorId: number) {
    const poles = await this.qualifyingResultRepository
      .createQueryBuilder('qr')
      .innerJoin('qr.session', 's')
      .innerJoin('s.race', 'r')
      .innerJoin('r.season', 'se')
      .select('se.id', 'seasonId')           // Return season ID instead of year
      .addSelect('COUNT(*)', 'poleCount')
      .where('qr.constructor_id = :constructorId', { constructorId })
      .andWhere('qr.position = 1')
      .groupBy('se.id')
      .orderBy('se.id', 'ASC')
      .getRawMany();
  
    return poles; // [{ seasonId: 1, poleCount: 3 }, { seasonId: 2, poleCount: 1 }, ...]
  }

  async getConstructorPointsByCircuit(constructorId: number) {
    const results = await this.raceResultRepository
      .createQueryBuilder('rr')
      .innerJoin('rr.session', 's')
      .innerJoin('s.race', 'r')
      .innerJoin('r.circuit', 'c')
      .select('c.id', 'circuitId')
      .addSelect('c.name', 'circuitName')
      .addSelect('SUM(rr.points)', 'totalPoints')
      .where('rr.constructor_id = :constructorId', { constructorId })
      .groupBy('c.id')
      .addGroupBy('c.name')
      .orderBy('totalPoints', 'DESC')
      .getRawMany();
  
    // Map points to numbers
    return results.map(r => ({
      circuitId: Number(r.circuitId),
      circuitName: r.circuitName,
      totalPoints: Number(r.totalPoints),
    }));
  }
  
  
}
<<<<<<< HEAD



=======
>>>>>>> main
