import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThanOrEqual } from 'typeorm';
import { Season } from '../seasons/seasons.entity';
import { Race } from '../races/races.entity';
import { Session } from '../sessions/sessions.entity';
import { RaceResult } from '../race-results/race-results.entity';
import { Driver } from '../drivers/drivers.entity';
import { ConstructorEntity } from '../constructors/constructors.entity';
import { DriverStandingDto, ConstructorStanding, StandingsResponseDto } from './dto/standings-response.dto';
import { DriverStandingMaterialized } from './driver-standings-materialized.entity';

@Injectable()
export class StandingsService {
  constructor(
    @InjectRepository(DriverStandingMaterialized)
    private readonly standingsViewRepository: Repository<DriverStandingMaterialized>,
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
    @InjectRepository(ConstructorEntity)
    private readonly constructorRepository: Repository<ConstructorEntity>,
  ) {}

  async getStandingsByYearAndRound(
    year: number,
    round: number,
  ): Promise<StandingsResponseDto> {
    // Query materialized view for this season
    const fromView = await this.standingsViewRepository.find({
      where: { seasonYear: year },
      order: { seasonPoints: 'DESC' as const },
    });

    const driverStandings: DriverStandingDto[] = fromView.map((row, index) => ({
      position: index + 1,
      points: Number(row.seasonPoints),
      wins: row.seasonWins,
      constructorName: row.constructorName,
      driverId: row.driverId,
      driverFullName: row.driverFullName,
      driverNumber: row.driverNumber ?? null,
      driverCountryCode: row.countryCode ?? null,
      driverProfileImageUrl: row.profileImageUrl ?? null,
    }));

    return {
      driverStandings,
      constructorStandings: [],
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

  // Removed complex joins in favor of materialized view lookup

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


