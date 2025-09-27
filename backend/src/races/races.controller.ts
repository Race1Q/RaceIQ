import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { RacesService } from './races.service';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Session } from '../sessions/sessions.entity';
import { RaceResult } from '../race-results/race-results.entity';

@Controller('races')
export class RacesController {
  constructor(private readonly racesService: RacesService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.racesService.findAll(query); // accepts season | season_id | year
  }

  @Get('years')
  years() {
    return this.racesService.listYears(); // e.g., [2025, 2024, ...]
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.racesService.findOne(id);
  }

  @Get('constructor/:constructorId/poles')
async getConstructorPoles(
  @Param('constructorId', ParseIntPipe) constructorId: number,
): Promise<{ constructorId: number; poles: number }> {
  const poles = await this.racesService.getConstructorPolePositions(constructorId);
  return { constructorId, poles };
}

@Get('constructor/:constructorId/poles-by-season')
async getConstructorPolesBySeason(
  @Param('constructorId', ParseIntPipe) constructorId: number,
): Promise<any[]> {
  return this.racesService.getConstructorPolePositionsBySeason(constructorId);
}

@Get('constructor/:constructorId/points-by-circuit')
  async getConstructorPointsByCircuit(
    @Param('constructorId', ParseIntPipe) constructorId: number,
  ) {
    return this.racesService.getConstructorPointsByCircuit(constructorId);
  }
 
}
@Controller('race-results')
export class RaceResultsController {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
    @InjectRepository(RaceResult)
    private readonly resultsRepo: Repository<RaceResult>,
  ) {}

  // supports: /race-results?raceId=985  OR  /race-results?race_id=985
  @Get()
  async byQuery(
    @Query('raceId') raceIdA?: string,
    @Query('race_id') raceIdB?: string,
  ) {
    const raceId = Number(raceIdA ?? raceIdB);
    if (!Number.isFinite(raceId)) return [];
    return this.fetchForRace(raceId);
  }

  // supports: /race-results/by-race/985
  @Get('by-race/:raceId')
  async byParamA(@Param('raceId', ParseIntPipe) raceId: number) {
    return this.fetchForRace(raceId);
  }

  // supports: /race-results/race/985
  @Get('race/:raceId')
  async byParamB(@Param('raceId', ParseIntPipe) raceId: number) {
    return this.fetchForRace(raceId);
  }

  private async fetchForRace(raceId: number) {
    // Find the RACE sessions for this race
    const sessions = await this.sessionRepo.find({
      where: { race: { id: raceId }, type: In(['RACE']) },
      select: ['id'],
    });
    if (!sessions.length) return [];

    // Pull results for those sessions
    const rows = await this.resultsRepo.find({
      where: { session: { id: In(sessions.map(s => s.id)) } },
      relations: ['driver', 'team', 'session'],
      order: { position: 'ASC' },
    });

    // Map to UI-friendly shape
    return rows.map((r: any) => ({
      session_id: r.session?.id,
      driver_id: r.driver_id ?? r.driver?.id,
      driver_code: r.driver?.code,
      driver_name: r.driver
        ? [r.driver.first_name, r.driver.last_name].filter(Boolean).join(' ')
        : undefined,
      constructor_id: r.constructor_id ?? r.team?.id,
      constructor_name: r.team?.name,
      position: r.position ?? null,
      points: r.points ?? null,
      grid: r.grid ?? null,
      time_ms: r.time_ms ?? null,
      status: r.status ?? null,
      fastest_lap_rank: r.fastest_lap_rank ?? null,
      points_for_fastest_lap: r.points_for_fastest_lap ?? null,
    }));
  }
}