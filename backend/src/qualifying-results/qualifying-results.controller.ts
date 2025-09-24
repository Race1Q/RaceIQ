import { Controller, Get, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { QualifyingResult } from './qualifying-results.entity';

@Controller('qualifying-results')
export class QualifyingResultsController {
  constructor(
    @InjectRepository(QualifyingResult)
    private readonly repo: Repository<QualifyingResult>,
  ) {}

  @Get()
  async findByRaceId(@Query('race_id') raceId: number) {
    // Find all session_ids for this race
    const sessionIds = await this.repo.manager.query(
      'SELECT id FROM sessions WHERE race_id = $1', [raceId]
    );
    const ids = sessionIds.map((s: any) => s.id);
    if (!ids.length) return [];
    const results = await this.repo.find({
      where: { session_id: In(ids) },
      relations: ['driver', 'team'],
    });
    // Map driver_name, driver_code, constructor_name for frontend
    return results.map((r) => ({
      ...r,
      driver_name: r.driver?.first_name && r.driver?.last_name ? `${r.driver.first_name} ${r.driver.last_name}` : undefined,
      driver_code: r.driver?.name_acronym,
      constructor_name: r.team?.name,
    }));
  }
}
