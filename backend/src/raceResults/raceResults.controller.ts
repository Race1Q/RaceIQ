// src/raceResults/raceResults.controller.ts
import { Controller, Get, Param, Post } from '@nestjs/common';
import { RaceResultsService } from './raceResults.service';
import { RaceResultsIngestionService } from './raceResults-ingestion.service';

@Controller('race-results')
export class RaceResultsController {
  constructor(
    private readonly resultsService: RaceResultsService,
    private readonly ingestService: RaceResultsIngestionService,
  ) {}

  @Get('session/:sessionId')
  async getBySession(@Param('sessionId') sessionId: string) {
    return this.resultsService.getBySessionId(parseInt(sessionId));
  }

  @Post('ingest')
  async ingestAll() {
    return this.ingestService.ingestOnly2024And2025();
  }
}


