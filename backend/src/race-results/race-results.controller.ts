import { Controller, Get, Query, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { RaceResult } from './race-results.entity';

@Controller('race-results')
export class RaceResultsController {
  constructor(
    @InjectRepository(RaceResult)
    private readonly repo: Repository<RaceResult>,
  ) {}

  // Accept both race_id and raceId as query params
  @Get()
  async findByRaceIdQuery(@Query('race_id') race_id: string, @Query('raceId') raceId: string) {
    const id = race_id || raceId;
    if (!id || isNaN(Number(id))) {
      return [];
    }
    const sessionIds = await this.repo.manager.query(
      'SELECT id FROM sessions WHERE race_id = $1', [id]
    );
    const ids = sessionIds.map((s: any) => s.id);
    if (!ids.length) return [];
    const results = await this.repo.find({
      where: { session_id: In(ids) },
      relations: ['driver', 'team'],
    });
    return results.map(r => ({
      ...r,
      driver_name: r.driver ? `${r.driver.first_name ?? ''} ${r.driver.last_name ?? ''}`.trim() : undefined,
      constructor_name: r.team ? r.team.name : undefined,
    }));
  }

  // Accept /by-race/:id
  @Get('by-race/:id')
  async findByRaceIdParam(@Param('id') id: string) {
    if (!id || isNaN(Number(id))) {
      return [];
    }
    const sessionIds = await this.repo.manager.query(
      'SELECT id FROM sessions WHERE race_id = $1', [id]
    );
    const ids = sessionIds.map((s: any) => s.id);
    if (!ids.length) return [];
    const results = await this.repo.find({
      where: { session_id: In(ids) },
      relations: ['driver', 'team'],
    });
    return results.map(r => ({
      ...r,
      driver_name: r.driver ? `${r.driver.first_name ?? ''} ${r.driver.last_name ?? ''}`.trim() : undefined,
      constructor_name: r.team ? r.team.name : undefined,
    }));
  }

  // Accept /race/:id
  @Get('race/:id')
  async findByRaceIdParam2(@Param('id') id: string) {
    if (!id || isNaN(Number(id))) {
      return [];
    }
    const sessionIds = await this.repo.manager.query(
      'SELECT id FROM sessions WHERE race_id = $1', [id]
    );
    const ids = sessionIds.map((s: any) => s.id);
    if (!ids.length) return [];
    const results = await this.repo.find({
      where: { session_id: In(ids) },
      relations: ['driver', 'team'],
    });
    return results.map(r => ({
      ...r,
      driver_name: r.driver ? `${r.driver.first_name ?? ''} ${r.driver.last_name ?? ''}`.trim() : undefined,
      constructor_name: r.team ? r.team.name : undefined,
    }));
  }
}
