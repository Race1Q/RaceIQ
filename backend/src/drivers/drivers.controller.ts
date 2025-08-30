// backend/src/drivers/drivers.controller.ts

import { Controller, Get, Post, Query, Logger, UseGuards } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { IngestService } from './ingest.service';
import { Driver } from './entities/driver.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ScopesGuard } from '../auth/scopes.guard';
import { Scopes } from '../auth/scopes.decorator';

@Controller('drivers')
export class DriversController {
  private readonly logger = new Logger(DriversController.name);

  constructor(
    private readonly driversService: DriversService,
    // The IngestService is needed for the POST /ingest endpoint
    private readonly ingestService: IngestService, 
  ) {}

  /**
   * An admin-only endpoint to trigger the data ingestion process.
   */
  @Post('ingest')
  @UseGuards(JwtAuthGuard, ScopesGuard)
  @Scopes('write:drivers')
  async ingestDrivers() {
    this.logger.log('Starting drivers ingestion via API endpoint');
    this.ingestService.ingestDrivers();
    return {
      message: 'Drivers ingestion process started in the background.',
    };
  }

  /**
   * Fetches the list of active drivers (IDs 2-22).
   */
  @Get('active')
  @UseGuards(JwtAuthGuard, ScopesGuard)
  @Scopes('read:drivers')
  async findActiveDrivers(): Promise<Driver[]> {
    return this.driversService.findActiveDrivers();
  }

  /**
   * Searches for drivers by name or acronym.
   */
  @Get('search')
  @UseGuards(JwtAuthGuard, ScopesGuard)
  @Scopes('read:drivers')
  async searchDrivers(@Query('q') query: string): Promise<Driver[]> {
    if (!query || query.trim() === '') {
      return [];
    }
    return this.driversService.searchDrivers(query);
  }

  /**
   * Fetches the complete list of all drivers with pagination support.
   */
  @Get()
  @UseGuards(JwtAuthGuard, ScopesGuard)
  @Scopes('read:drivers')
  async getAllDrivers(
    @Query('limit') limit = '100',
    @Query('offset') offset = '0',
  ): Promise<Driver[]> {
    return this.driversService.getAllDrivers({
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    });
  }
}