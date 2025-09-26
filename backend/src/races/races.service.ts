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
import { Season } from '../seasons/seasons.entity';

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
    @InjectRepository(Season)
    private readonly seasonRepository: Repository<Season>,
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
        order: { lap_number: 'ASC', driver: { id: 'ASC' } as any },
      }),

      this.pitStopRepository.find({
        where: { race: { id: raceId } },
        relations: ['driver'],
        order: { lap_number: 'ASC', stop_number: 'ASC' } as any,
      }),

      allSessionIds.length
        ? this.tireStintRepository.find({
            where: { session: { id: In(allSessionIds) } },
            relations: ['driver'],
            order: { driver: { id: 'ASC' } as any, stint_number: 'ASC' },
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
        weather: (raceSession as any)?.weather || null,
      } as any,
      raceResults,
      qualifyingResults,
      laps,
      pitStops,
      tireStints,
      raceEvents,
    };

    return raceDetails;
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
  
}



