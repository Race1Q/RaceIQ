/* backend/src/drivers/drivers.controller.ts */

import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { Driver } from './drivers.entity';
import { DriverStatsResponseDto } from './dto/driver-stats.dto'; // 1. IMPORT

@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get()
  async findAll(): Promise<Driver[]> {
    return this.driversService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Driver> {
    return this.driversService.findOne(id);
  }

  // 2. UNCOMMENT THIS ENDPOINT
  @Get(':id/stats')
  async getDriverCareerStats(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DriverStatsResponseDto> {
    return this.driversService.getDriverCareerStats(id);
  }

  @Get(':id/recent-form')
  async getDriverRecentForm(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ position: number; raceName: string; countryCode: string }[]> {
    return this.driversService.getDriverRecentForm(id);
  }
}


