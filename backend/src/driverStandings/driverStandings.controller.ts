// src/driver-standings/driver-standings.controller.ts
import { Controller, Get, Post, Query, Param, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { DriverStandingsService } from './driverStandings.service';
import { DriverStandingIngestService } from './driverStandings-ingest.service';
import { DriverStanding } from './driverStandings.entity';

@Controller('driver-standings')
export class DriverStandingsController {
  private readonly logger = new Logger(DriverStandingsController.name);

  constructor(
    private readonly driverStandingsService: DriverStandingsService,
    private readonly driverStandingIngestService: DriverStandingIngestService,
  ) {}

  @Post('ingest')
  async ingestDriverStandings() {
    this.logger.log('Starting driver standings ingestion');
    return this.driverStandingIngestService.ingestAllDriverStandings();
  }

  @Get()
  async getAllDriverStandings(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<DriverStanding[]> {
    try {
      const safeLimit = Math.min(limit || 100, 1000);
      const safeOffset = offset || 0;
      
      this.logger.log(`Fetching driver standings with limit: ${safeLimit}, offset: ${safeOffset}`);
      return this.driverStandingsService.getAllDriverStandings(safeLimit, safeOffset);
    } catch (error) {
      this.logger.error('Error fetching driver standings:', error);
      throw new HttpException('Failed to fetch driver standings', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('test-connection')
  async testConnection() {
    try {
      const result = await this.driverStandingsService.testConnection();
      return { success: result, timestamp: new Date().toISOString() };
    } catch (error) {
      this.logger.error('Connection test failed:', error);
      throw new HttpException('Database connection failed', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  @Get('race/:raceId')
  async getDriverStandingsByRace(@Param('raceId') raceId: number): Promise<DriverStanding[]> {
    try {
      if (!raceId || isNaN(Number(raceId))) {
        throw new HttpException('Invalid race ID', HttpStatus.BAD_REQUEST);
      }
      
      this.logger.log(`Fetching driver standings for race ID: ${raceId}`);
      const standings = await this.driverStandingsService.getDriverStandingsByRace(raceId);
      
      if (!standings || standings.length === 0) {
        throw new HttpException('No driver standings found for this race', HttpStatus.NOT_FOUND);
      }
      
      return standings;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Error fetching driver standings for race ${raceId}:`, error);
      throw new HttpException('Failed to fetch driver standings for race', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('driver/:driverId')
  async getDriverStandingsByDriver(@Param('driverId') driverId: number): Promise<DriverStanding[]> {
    try {
      if (!driverId || isNaN(Number(driverId))) {
        throw new HttpException('Invalid driver ID', HttpStatus.BAD_REQUEST);
      }
      
      this.logger.log(`Fetching driver standings for driver ID: ${driverId}`);
      const standings = await this.driverStandingsService.getDriverStandingsByDriver(driverId);
      
      if (!standings || standings.length === 0) {
        throw new HttpException('No driver standings found for this driver', HttpStatus.NOT_FOUND);
      }
      
      return standings;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Error fetching driver standings for driver ${driverId}:`, error);
      throw new HttpException('Failed to fetch driver standings for driver', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('season/:season')
  async getDriverStandingsBySeason(@Param('season') season: number): Promise<DriverStanding[]> {
    try {
      if (!season || isNaN(Number(season))) {
        throw new HttpException('Invalid season', HttpStatus.BAD_REQUEST);
      }
      
      this.logger.log(`Fetching driver standings for season: ${season}`);
      const standings = await this.driverStandingsService.getDriverStandingsBySeason(season);
      
      if (!standings || standings.length === 0) {
        throw new HttpException('No driver standings found for this season', HttpStatus.NOT_FOUND);
      }
      
      return standings;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Error fetching driver standings for season ${season}:`, error);
      throw new HttpException('Failed to fetch driver standings for season', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('search')
  async searchDriverStandings(
    @Query('q') query: string,
    @Query('limit') limit?: number,
  ): Promise<DriverStanding[]> {
    try {
      if (!query || query.trim().length === 0) {
        return [];
      }
      
      const safeLimit = Math.min(limit || 50, 200);
      this.logger.log(`Searching driver standings with query: "${query}", limit: ${safeLimit}`);
      
      return this.driverStandingsService.searchDriverStandings(query, safeLimit);
    } catch (error) {
      this.logger.error(`Error searching driver standings with query "${query}":`, error);
      throw new HttpException('Failed to search driver standings', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('current')
  async getCurrentDriverStandings(): Promise<DriverStanding[]> {
    try {
      this.logger.log('Fetching current driver standings');
      const currentYear = new Date().getFullYear();
      return this.driverStandingsService.getDriverStandingsBySeason(currentYear);
    } catch (error) {
      this.logger.error('Error fetching current driver standings:', error);
      throw new HttpException('Failed to fetch current driver standings', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}