import { Controller, Get, Query } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RaceEvent } from './race-events.entity';

@Controller('race-events')
export class RaceEventsController {
  constructor(
    @InjectRepository(RaceEvent)
    private readonly repo: Repository<RaceEvent>,
  ) {}

  @ApiExcludeEndpoint()
  @Get()
  async findByRaceId(@Query('race_id') raceId: number) {
    // Find all session_ids for this race
    const sessionIds = await this.repo.manager.query(
      'SELECT id FROM sessions WHERE race_id = $1', [raceId]
    );
    const ids = sessionIds.map((s: any) => s.id);
    if (!ids.length) return [];
    return this.repo.find({ where: { session_id: ids } });
  }
}
