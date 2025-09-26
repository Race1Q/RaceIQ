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

  // 🆕 Get drivers by standings (season)
  @Get('by-standings/:season')
  async getDriversByStandings(
    @Param('season', ParseIntPipe) season: number,
  ) {
    return this.driversService.getDriversByStandings3(season);
  }
}


