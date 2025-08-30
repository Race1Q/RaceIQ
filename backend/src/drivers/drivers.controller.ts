// src/drivers/drivers.controller.ts
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
    private readonly ingestService: IngestService,
  ) {}

  @Post('ingest')
  @UseGuards(JwtAuthGuard, ScopesGuard)
  @Scopes('write:drivers') // Secure this admin-level action
  async ingestDrivers() {
    this.logger.log('Starting drivers ingestion via API endpoint');
    // We don't await this so the request can return immediately
    this.ingestService.ingestDrivers();
    return {
      message: 'Drivers ingestion process started in the background.',
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard, ScopesGuard)
  @Scopes('read:drivers')
  async getAllDrivers(): Promise<Driver[]> {
    return this.driversService.getAllDrivers();
  }

  @Get('search')
  @UseGuards(JwtAuthGuard, ScopesGuard)
  @Scopes('read:drivers')
  async searchDrivers(@Query('q') query: string): Promise<Driver[]> {
    if (!query) return [];
    return this.driversService.searchDrivers(query);
  }
}