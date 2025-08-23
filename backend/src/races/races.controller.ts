// src/races/races.controller.ts
import { Controller, Get, Post, Query, Param } from '@nestjs/common';
// The import path is updated to match your file name 'races-ingest.services'
import { RaceIngestService } from './races-ingest.services';
import { RacesService } from './races.service';
import { Race } from './races.entity';

@Controller('races')
export class RacesController {
  constructor(
    private readonly racesService: RacesService,
    private readonly raceIngestService: RaceIngestService,
  ) {}

  @Post('ingest')
  async ingestAllRaces() {
    return this.raceIngestService.ingestAllRaces();
  }

  @Get()
  async getAllRaces(): Promise<Race[]> {
    return this.racesService.getAllRaces();
  }

  @Get('test-connection')
  async testConnection() {
    const result = await this.racesService.testConnection();
    return { success: result };
  }

  @Get('search')
  async searchRaces(@Query('q') query: string): Promise<Race[]> {
    return this.racesService.searchRaces(query);
  }

  @Get('season/:season')
  async getRacesBySeason(@Param('season') season: string): Promise<Race[]> {
    return this.racesService.getRacesBySeason(season);
  }
}
