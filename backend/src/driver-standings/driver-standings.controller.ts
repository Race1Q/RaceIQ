// src/driver-standings/driver-standings.controller.ts
import { Controller, Get, Post, Query, Param } from '@nestjs/common';
import { DriverStandingsService } from './driver-standings.service';
import { DriverStanding } from './driver-standings.entity';

@Controller('driver-standings')
export class DriverStandingsController {
  constructor(
    private readonly driverStandingsService: DriverStandingsService,
  ) {}


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

  @Get('season/:season')
  async getDriverStandingsBySeason(@Param('season') season: number): Promise<DriverStanding[]> {
    return this.driverStandingsService.getDriverStandingsBySeason(season);
  }

  @Get('search')
  async searchDriverStandings(@Query('q') query: string): Promise<DriverStanding[]> {
    return this.driverStandingsService.searchDriverStandings(query);
  }
}