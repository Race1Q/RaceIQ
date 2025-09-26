import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { RaceDetailsDto } from './dto/race-details.dto';
import { Race } from './races.entity';
import { Session } from '../sessions/sessions.entity';
import { RaceResult } from '../race-results/race-results.entity';
import { QualifyingResult } from '../qualifying-results/qualifying-results.entity';
import { Lap } from '../laps/laps.entity';
import { PitStop } from '../pit-stops/pit-stops.entity';
import { TireStint } from '../tire-stints/tire-stints.entity';
import { RaceEvent } from '../race-events/race-events.entity';

@Injectable()
export class RacesService {
  constructor(
    @InjectRepository(Race)
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
  ) {}

  async getRaceDetails(raceId: number): Promise<RaceDetailsDto> {
    const raceInfo = await this.raceRepository.findOne({
      where: { id: raceId },
      relations: ['circuit', 'season'],
    });

    if (!raceInfo) {
      throw new NotFoundException(`Race with ID ${raceId} not found`);
    }

    const sessions = await this.sessionRepository.find({
      where: { race: { id: raceId } },
    });

    const raceSession = sessions.find((s) => s.type === 'RACE');
    const qualifyingSession = sessions.find((s) => s.type === 'QUALIFYING');
    const allSessionIds = sessions.map((s) => s.id);

    const [
      raceResults,
      qualifyingResults,
      laps,
      pitStops,
      tireStints,
      raceEvents,
    ] = await Promise.all([
      raceSession
        ? this.raceResultRepository.find({
            where: { session: { id: raceSession.id } },
            relations: ['driver', 'team'],
            order: { position: 'ASC' },
          })
        : Promise.resolve([]),
      qualifyingSession
        ? this.qualifyingResultRepository.find({
            where: { session: { id: qualifyingSession.id } },
            relations: ['driver', 'team'],
            order: { position: 'ASC' },
          })
        : Promise.resolve([]),
      this.lapRepository.find({
        where: { race: { id: raceId } },
        relations: ['driver'],
        order: { lap_number: 'ASC', driver: { id: 'ASC' } },
      }),
      this.pitStopRepository.find({
        where: { race: { id: raceId } },
        relations: ['driver'],
        order: { lap_number: 'ASC', stop_number: 'ASC' },
      }),
      allSessionIds.length
        ? this.tireStintRepository.find({
            where: { session: { id: In(allSessionIds) } },
            relations: ['driver'],
            order: { driver: { id: 'ASC' }, stint_number: 'ASC' },
          })
        : Promise.resolve([]),
      allSessionIds.length
        ? this.raceEventRepository.find({
            where: { session: { id: In(allSessionIds) } },
            order: { lap_number: 'ASC' },
          })
        : Promise.resolve([]),
    ]);

    const raceDetails: RaceDetailsDto = {
      raceInfo: {
        ...raceInfo,
        weather: raceSession?.weather || null,
      },
      raceResults,
      qualifyingResults,
      laps,
      pitStops,
      tireStints,
      raceEvents,
    };

    return raceDetails;
  }

  async findAll(query: any): Promise<Race[]> {
    // Implementation for finding races with optional filters
    const whereCondition: any = {};
    
    if (query.season || query.season_id || query.year) {
      whereCondition.season = { id: query.season_id || query.season || query.year };
    }

    return this.raceRepository.find({
      where: whereCondition,
      relations: ['circuit', 'season'],
      order: { round: 'ASC' },
    });
  }

  async listYears(): Promise<number[]> {
    // Get distinct years from races
    const result = await this.raceRepository
      .createQueryBuilder('race')
      .leftJoin('race.season', 'season')
      .select('DISTINCT season.year', 'year')
      .orderBy('season.year', 'DESC')
      .getRawMany();

    return result.map(r => r.year);
  }

  async findOne(id: string): Promise<Race> {
    const race = await this.raceRepository.findOne({
      where: { id: parseInt(id, 10) },
      relations: ['circuit', 'season'],
    });

    if (!race) {
      throw new NotFoundException(`Race with ID ${id} not found`);
    }

    return race;
  }

  async getConstructorPolePositions(constructorId: number): Promise<number> {
    // Count pole positions for a constructor
    const result = await this.qualifyingResultRepository.count({
      where: {
        constructor_id: constructorId,
        position: 1,
      },
    });

    return result;
  }

  async getConstructorPolePositionsBySeason(constructorId: number): Promise<any[]> {
    // Get pole positions grouped by season
    const result = await this.qualifyingResultRepository
      .createQueryBuilder('qr')
      .leftJoin('qr.session', 'session')
      .leftJoin('session.race', 'race')
      .leftJoin('race.season', 'season')
      .select('season.year', 'year')
      .addSelect('COUNT(*)', 'poles')
      .where('qr.constructor_id = :constructorId', { constructorId })
      .andWhere('qr.position = 1')
      .groupBy('season.year')
      .orderBy('season.year', 'ASC')
      .getRawMany();

    return result.map(r => ({
      year: parseInt(r.year, 10),
      poles: parseInt(r.poles, 10),
    }));
  }

  async getConstructorPointsByCircuit(constructorId: number): Promise<any[]> {
    // Get points grouped by circuit
    const result = await this.raceResultRepository
      .createQueryBuilder('rr')
      .leftJoin('rr.session', 'session')
      .leftJoin('session.race', 'race')
      .leftJoin('race.circuit', 'circuit')
      .select('circuit.name', 'circuit_name')
      .addSelect('SUM(rr.points)', 'total_points')
      .where('rr.constructor_id = :constructorId', { constructorId })
      .groupBy('circuit.name')
      .orderBy('SUM(rr.points)', 'DESC')
      .getRawMany();

    return result.map(r => ({
      circuit_name: r.circuit_name,
      total_points: parseFloat(r.total_points) || 0,
    }));
  }
}