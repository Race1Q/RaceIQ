// src/constructor-standings/constructor-standings.controller.ts

import { Controller, Get, Param, Post } from '@nestjs/common';
import { ConstructorStandingsIngestService } from './constructorStandings-ingest.service';
import { ConstructorStandingsService } from './constructorStandings.service';

@Controller('constructor-standings')
export class ConstructorStandingsController {
  constructor(private readonly ingestService: ConstructorStandingsIngestService,
    private readonly Service: ConstructorStandingsService
  ) {}

  // Endpoint to ingest standings for a given season
  @Post('ingest')
  async ingest() {
    return this.ingestService.ingestAllConstructorStandings();
  }

  // Endpoint to fetch standings for a given season
  @Get(':season')
  async getStandings(@Param('season') season: number) {
    return this.ingestService.ingestAllConstructorStandings();
  }
}
