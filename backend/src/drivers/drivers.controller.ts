/* backend/src/drivers/drivers.controller.ts */

import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { Driver } from './drivers.entity';
import { DriverStatsResponseDto, DriverComparisonStatsResponseDto } from './dto/driver-stats.dto';

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

  // NEW: Driver comparison stats endpoint
  @Get(':id/stats')
  async getDriverStats(
    @Param('id', ParseIntPipe) id: number,
    @Query('year') year?: string,
  ): Promise<DriverComparisonStatsResponseDto> {
    const yearNumber = year ? parseInt(year, 10) : undefined;
    return this.driversService.getDriverStats(id, yearNumber);
  }

  // EXISTING: Driver career stats endpoint (keep for backward compatibility)
  @Get(':id/career-stats')
  async getDriverCareerStats(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DriverStatsResponseDto> {
    return this.driversService.getDriverCareerStats(id);
  }

  // 🆕 Get drivers by standings (season)
  @Get('by-standings/:season')
  async getDriversByStandings(
    @Param('season', ParseIntPipe) season: number,
  ) {
    return this.driversService.getDriversByStandings3(season);
  }

  @Get(':id/recent-form')
  async getDriverRecentForm(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ position: number; raceName: string; countryCode: string }[]> {
    return this.driversService.getDriverRecentForm(id);
  }
}


