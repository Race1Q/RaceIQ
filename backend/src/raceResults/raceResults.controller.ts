// src/raceResults/raceResults.controller.ts
import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { RaceResultsService } from './raceResults.service';
import { RaceResultsIngestionService } from './raceResults-ingestion.service';
import { Scopes } from 'src/auth/scopes.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ScopesGuard } from '../auth/scopes.guard';

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

  @UseGuards(JwtAuthGuard, ScopesGuard)
  @Get(':constructor_id')
  @Scopes('read:race-results')
async getByConstructor(@Param('constructorId') constructorId: string) {
  if (!constructorId) {
    return []; // or throw BadRequestException
  }
  return this.resultsService.getByConstructor(Number(constructorId));
}

@UseGuards(JwtAuthGuard, ScopesGuard)
@Get('constructor/:constructorId/stats')
@Scopes('read:race-results')
async getConstructorStats(@Param('constructorId') constructorId: string) {
  return this.resultsService.getConstructorStats(Number(constructorId));
}
}


