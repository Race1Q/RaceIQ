// src/pitStops/pitStops.controller.ts
import { Controller, Get, Param, Post } from '@nestjs/common';
import { PitStopsService } from './pitStops.service';
import { PitStopsIngestionService } from './pitStops-ingestion.service';

@Controller('pit-stops')
export class PitStopsController {
  constructor(
    private readonly service: PitStopsService,
    private readonly ingest: PitStopsIngestionService,
  ) {}

  @Get('race/:raceId')
  async getByRace(@Param('raceId') raceId: string) {
    return this.service.getByRaceId(parseInt(raceId));
  }

  @Post('ingest')
  async ingestAll() {
    return this.ingest.ingestOnly2024And2025();
  }
}


