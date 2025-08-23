// src/drivers/drivers.controller.ts
import { Controller, Get, Post, Query, Logger } from '@nestjs/common';
import { DriversService, DriverRow } from './drivers.service';
import { DriversIngestService } from './drivers-ingest.service';

@Controller('drivers')
export class DriversController {
  private readonly logger = new Logger(DriversController.name);

  constructor(
    private readonly driversService: DriversService,
    private readonly driversIngestService: DriversIngestService,
  ) {}

  @Post('ingest')
  async ingestDrivers() {
    this.logger.log('Starting drivers ingestion');
    const result = await this.driversIngestService.ingestDrivers();
    return {
      message: 'Drivers ingestion completed',
      result,
    };
  }

  @Get()
  async getAllDrivers(): Promise<DriverRow[]> {
    return this.driversService.getAllDrivers();
  }

  @Get('search')
  async searchDrivers(@Query('q') query: string): Promise<DriverRow[]> {
    return this.driversService.searchDrivers(query);
  }
}
