import { Controller, Get, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PitStop } from './pit-stops.entity';

@Controller('pit-stops')
export class PitStopsController {
  constructor(
    @InjectRepository(PitStop)
    private readonly repo: Repository<PitStop>,
  ) {}

  @Get()
  async findByRaceId(@Query('race_id') raceId: number) {
    return this.repo.find({ where: { race_id: raceId } });
  }
}
