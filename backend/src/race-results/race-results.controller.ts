// src/race-results/race-results.controller.ts
import { Controller, Get, Param, Post } from '@nestjs/common';
import { RaceResultsService } from './race-results.service';

@Controller('race-results')
export class RaceResultsController {
  constructor(
    private readonly resultsService: RaceResultsService,
  ) {}

  @Get('session/:sessionId')
  async getBySession(@Param('sessionId') sessionId: string) {
    return this.resultsService.getBySessionId(parseInt(sessionId));
  }

}


