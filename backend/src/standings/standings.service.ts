import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThanOrEqual } from 'typeorm';
import { Season } from '../seasons/seasons.entity';
import { Race } from '../races/races.entity';
import { Session } from '../sessions/sessions.entity';
import { RaceResult } from '../race-results/race-results.entity';
import { Driver } from '../drivers/drivers.entity';
import { ConstructorEntity } from '../constructors/constructors.entity';
import {
  DriverStanding,
  ConstructorStanding,
  StandingsResponseDto,
} from './dto/standings-response.dto';

@Injectable()
export class StandingsService {
  constructor(
    // WE NEED TO INJECT MORE REPOSITORIES
    @InjectRepository(Season)
    private readonly seasonRepository: Repository<Season>,
    @InjectRepository(Race)
    private readonly raceRepository: Repository<Race>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(RaceResult)
    private readonly raceResultRepository: Repository<RaceResult>,
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
  ) {}

  async getStandingsByYearAndRound(
    year: number,
    round: number,
  ): Promise<StandingsResponseDto> {
    // 1. Find the Season ID
    const season = await this.seasonRepository.findOne({ where: { year } });
    if (!season) {
      throw new NotFoundException(`Season with year ${year} not found`);
    }

    // 2. NEW LOGIC: Find all Race IDs for this season up to the given round
    const races = await this.raceRepository.find({
      where: {
        season: { id: season.id },
        round: LessThanOrEqual(round),
      },
      select: ['id'],
    });

    if (!races.length) {
      return { driverStandings: [], constructorStandings: [] };
    }
    const raceIds = races.map((r) => r.id);

    // 3. NEW LOGIC: Find all *RACE* Session IDs for those races
    const sessions = await this.sessionRepository.find({
      where: {
        race: { id: In(raceIds) },
        type: 'RACE',
      },
      select: ['id'],
    });

    if (!sessions.length) {
      return { driverStandings: [], constructorStandings: [] };
    }
    const sessionIds = sessions.map((s) => s.id);

    // 4. Run the parallel calculations with the clean Session ID list
    const [driverStandings, constructorStandings] = await Promise.all([
      this.calculateDriverStandings(sessionIds),
      this.calculateConstructorStandings(sessionIds),
    ]);

    return {
      driverStandings: this.addPositions(driverStandings) as DriverStanding[],
      constructorStandings: this.addPositions(
        constructorStandings,
      ) as ConstructorStanding[],
    };
  }

  // Helper to dynamically add position numbers
  private addPositions(standings: any[]): any[] {
    return standings
      .sort((a, b) => b.points - a.points)
      .map((standing, index) => ({
        ...standing,
        position: index + 1,
      }));
  }

  // This function is now simpler: it just takes a list of session IDs
  private async calculateDriverStandings(
    sessionIds: number[],
  ): Promise<Partial<DriverStanding>[]> {
    const standings = await this.raceResultRepository
      .createQueryBuilder('rr')
      .select('rr.driver_id', 'driverId')
      .addSelect('SUM(rr.points)', 'points')
      .addSelect(
        'SUM(CASE WHEN rr.position = 1 THEN 1 ELSE 0 END)::int',
        'wins',
      )
      .where('rr.session_id IN (:...sessionIds)', { sessionIds })
      .groupBy('rr.driver_id')
      .orderBy('points', 'DESC')
      .getRawMany();

    // The query returns raw data; now we need to join the full Driver objects
    const drivers = await this.driverRepository.find({
      where: { id: In(standings.map((s) => s.driverId)) },
    });
    const driverMap = new Map(drivers.map((d) => [d.id, d]));

    return standings.map((s) => ({
      driver: driverMap.get(s.driverId),
      points: parseFloat(s.points) || 0,
      wins: s.wins || 0,
    }));
  }

  // This function is now simpler: it just takes a list of session IDs
  private async calculateConstructorStandings(
    sessionIds: number[],
  ): Promise<Partial<ConstructorStanding>[]> {
    const standings = await this.raceResultRepository
      .createQueryBuilder('rr')
      .select('rr.constructor_id', 'teamId')
      .addSelect('SUM(rr.points)', 'points')
      .addSelect(
        'SUM(CASE WHEN rr.position = 1 THEN 1 ELSE 0 END)::int',
        'wins',
      )
      .where('rr.session_id IN (:...sessionIds)', { sessionIds })
      .groupBy('rr.constructor_id')
      .orderBy('points', 'DESC')
      .getRawMany();

    const constructors = await this.raceResultRepository.manager.find(
      ConstructorEntity,
      {
        where: { id: In(standings.map((s) => s.teamId)) },
      },
    );
    const constructorMap = new Map(constructors.map((c) => [c.id, c]));

    return standings.map((s) => ({
      team: constructorMap.get(s.teamId),
      points: parseFloat(s.points) || 0,
      wins: s.wins || 0,
    }));
  }
}


