/* backend/src/drivers/drivers.controller.ts */

import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { Driver } from './drivers.entity';
import { DriverStatsResponseDto, DriverComparisonStatsResponseDto } from './dto/driver-stats.dto';
import { Public } from '../auth/public.decorator';
import { ApiBadRequestResponse, ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DriverListDto } from './dto/driver-list.dto';
import { ErrorResponse } from '../common/dto/error-response.dto';

@ApiTags('Drivers')
@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Public()
  @ApiOperation({ 
    summary: 'List drivers',
    description: 'Returns a list of all drivers. Can be optionally filtered by a specific season year.'
  })
  @ApiQuery({ 
    name: 'year', 
    required: false, 
    type: Number, 
    description: 'Filter drivers by a specific season year' 
  })
  @ApiOkResponse({ type: Driver, isArray: true }) // Assuming Driver is the response type
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async findAll(@Query('year') year?: string): Promise<Driver[]> {
    const yearNumber = year ? parseInt(year, 10) : undefined;

    // The service method needs to handle an options object that may or may not have a year
    return this.driversService.findAll({ year: yearNumber });
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get driver by id' })
  @ApiOkResponse({ type: DriverListDto })
  @ApiNotFoundResponse({ type: ErrorResponse })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Driver> {
    return this.driversService.findOne(id);
  }

  // NEW: Driver comparison stats endpoint
  @Get(':id/stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get driver stats (optionally filtered by year)' })
  async getDriverStats(
    @Param('id', ParseIntPipe) id: number,
    @Query('year') year?: string,
  ): Promise<DriverComparisonStatsResponseDto> {
    const yearNumber = year ? parseInt(year, 10) : undefined;
    return this.driversService.getDriverStats(id, yearNumber);
  }

  // EXISTING: Driver career stats endpoint (keep for backward compatibility)
  @Get(':id/career-stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get driver aggregated career stats' })
  async getDriverCareerStats(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DriverStatsResponseDto> {
    return this.driversService.getDriverCareerStats(id);
  }


  @Get(':id/recent-form')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Recent finishing positions for the driver' })
  async getDriverRecentForm(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ position: number; raceName: string; countryCode: string }[]> {
    return this.driversService.getDriverRecentForm(id);
  }

  @Get('standings/:season')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Driver championship standings for a season' })
  async getDriverStandings(
    @Param('season', ParseIntPipe) season: number,
  ) {
    return this.driversService.getDriverStandings(season);
  }
}


