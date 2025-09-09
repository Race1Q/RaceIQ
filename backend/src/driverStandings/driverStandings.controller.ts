// src/driver-standings/driver-standings.controller.ts
import { Controller, Get, Post, Query, Param, UseGuards } from '@nestjs/common';
import { DriverStandingsService } from './driverStandings.service';
import { DriverStandingIngestService } from './driverStandings-ingest.service';
import { DriverStanding } from './driverStandings.entity';
import { Scopes } from '../auth/scopes.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ScopesGuard } from '../auth/scopes.guard';

@Controller('driver-standings')
export class DriverStandingsController {
  constructor(
    private readonly driverStandingsService: DriverStandingsService,
    private readonly driverStandingIngestService: DriverStandingIngestService,
  ) {}

  @Post('ingest')
  async ingestDriverStandings() {
    return this.driverStandingIngestService.ingestAllDriverStandings();
  }

  @Get()
  async getAllDriverStandings(): Promise<DriverStanding[]> {
    return this.driverStandingsService.getAllDriverStandings();
  }

  @Get('test-connection')
  async testConnection() {
    const result = await this.driverStandingsService.testConnection();
    return { success: result };
  }

  @Get('race/:raceId')
  async getDriverStandingsByRace(@Param('raceId') raceId: number): Promise<DriverStanding[]> {
    return this.driverStandingsService.getDriverStandingsByRace(raceId);
  }

  @Get('driver/:driverId')
  async getDriverStandingsByDriver(@Param('driverId') driverId: number): Promise<DriverStanding[]> {
    return this.driverStandingsService.getDriverStandingsByDriver(driverId);
  }

@UseGuards(JwtAuthGuard, ScopesGuard)
@Scopes('read:driverStandings') 
  @Get(':season')
  async getDriverStandingsBySeason(@Param('season') season: number): Promise<DriverStanding[]> {
    return this.driverStandingsService.getDriverStandingsBySeason(season);
  }

  @Get('search')
  async searchDriverStandings(@Query('q') query: string): Promise<DriverStanding[]> {
    return this.driverStandingsService.searchDriverStandings(query);
  }
}