/* backend/src/drivers/drivers.controller.ts */

import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBadRequestResponse, ApiBearerAuth, ApiExcludeEndpoint, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DriversService } from './drivers.service';
import { Driver } from './drivers.entity';
import { DriverStatsResponseDto, DriverComparisonStatsResponseDto } from './dto/driver-stats.dto';
import { DriverSeasonStatsDto } from './dto/driver-season-stats.dto';
import { DriverSeasonProgressionDto } from './dto/driver-season-progression.dto';
import { Public } from '../auth/public.decorator';
import { ErrorResponse } from '../common/dto/error-response.dto';
import { ApiErrorDto } from '../common/dto/api-error.dto';

@ApiTags('Drivers')
@ApiBearerAuth() // Apply bearer auth to all endpoints in the controller by default
@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Public() // This decorator overrides the controller-level auth for this specific endpoint
  @ApiOperation({ 
    summary: 'List all drivers',
    description: 'Returns a list of all drivers. Can be optionally filtered by a specific season year to get that season\'s roster.'
  })
  @ApiQuery({ 
    name: 'year', 
    required: false, 
    type: Number, 
    description: 'Filter drivers by a specific season year' 
  })
  @ApiOkResponse({ type: [Driver] })
  @ApiBadRequestResponse({ 
    description: 'Invalid input. (e.g., year parameter is not a valid number).',
    type: ApiErrorDto,
  })
  @Get()
  async findAll(@Query('year') year?: string): Promise<Driver[]> {
    const yearNumber = year ? parseInt(year, 10) : undefined;
    return this.driversService.findAll({ year: yearNumber });
  }

  @ApiExcludeEndpoint()
  @Public()
  @ApiOperation({ summary: 'Get all drivers who have won at least one race in any season' })
  @ApiOkResponse({ description: 'List of drivers with season wins from driver_standings_materialized' })
  @ApiNotFoundResponse({ type: ErrorResponse })
  @Get('winners')
  async getWinners(): Promise<any[]> {
    return this.driversService.findAllWinners();
  }

  @Public()
  @ApiOperation({ summary: 'Get all drivers with world championships' })
  @ApiOkResponse({ description: 'List of unique drivers who have won at least one world championship' })
  @ApiNotFoundResponse({ type: ErrorResponse })
  @Get('champions')
  async getChampions(): Promise<any[]> {
    return this.driversService.getChampions();
  }

  @Public()
  @ApiOperation({ summary: 'Get a single driver by ID (public)' })
  @ApiOkResponse({ type: Driver })
  @ApiNotFoundResponse({
    description: 'The driver with the specified ID was not found.',
    type: ApiErrorDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input. (e.g., ID is not a number).',
    type: ApiErrorDto,
  })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Driver> {
    return this.driversService.findOne(id);
  }

  // Made public: comparison stats are now accessible without authentication
  @ApiExcludeEndpoint()
  @Public()
  @ApiOperation({ summary: 'Get driver comparison stats by ID for a specific year (public)' })
  @ApiQuery({ name: 'year', required: false, type: Number, description: 'Optional year for season-specific stats' })
  @ApiOkResponse({ type: DriverComparisonStatsResponseDto })
  @ApiNotFoundResponse({
    description: 'The driver with the specified ID was not found.',
    type: ApiErrorDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input. (e.g., ID is not a number, year parameter is invalid).',
    type: ApiErrorDto,
  })
  @Get(':id/stats')
  async getDriverStats(
    @Param('id', ParseIntPipe) id: number,
    @Query('year') year?: string,
  ): Promise<DriverComparisonStatsResponseDto> {
    const yearNumber = year ? parseInt(year, 10) : undefined;
    return this.driversService.getDriverStats(id, yearNumber);
  }

  @ApiExcludeEndpoint()
  @Public()
  @ApiOperation({ summary: 'Get driver aggregated career stats (public)' })
  @ApiOkResponse({ type: DriverStatsResponseDto })
  @ApiNotFoundResponse({
    description: 'The driver with the specified ID was not found.',
    type: ApiErrorDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input. (e.g., ID is not a number).',
    type: ApiErrorDto,
  })
  @Get(':id/career-stats')
  async getDriverCareerStats(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DriverStatsResponseDto> {
    return this.driversService.getDriverCareerStats(id);
  }

  @ApiExcludeEndpoint()
  @Public()
  @ApiOperation({ summary: "Get a driver's recent race form (last 5 races) (public)" })
  @ApiOkResponse({ description: 'An array of recent race results.' })
  @ApiNotFoundResponse({
    description: 'The driver with the specified ID was not found.',
    type: ApiErrorDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input. (e.g., ID is not a number).',
    type: ApiErrorDto,
  })
  @Get(':id/recent-form')
  async getDriverRecentForm(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ position: number; raceName: string; countryCode: string }[]> {
    return this.driversService.getDriverRecentForm(id);
  }

  @ApiExcludeEndpoint()
  @Public()
  @ApiOperation({ summary: 'Get driver standings for a specific season' })
  @ApiOkResponse({ description: 'An array of driver standings for the season.' })
  @ApiNotFoundResponse({
    description: 'The season with the specified year was not found.',
    type: ApiErrorDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input. (e.g., season is not a number).',
    type: ApiErrorDto,
  })
  @Get('standings/:season')
  async getDriverStandings(
    @Param('season', ParseIntPipe) season: number,
  ) {
    return this.driversService.getDriverStandings(season);
  }

  @ApiExcludeEndpoint()
  @Public()
  @ApiOperation({ 
    summary: 'Get driver season statistics for trend graphs',
    description: 'Returns year-by-year performance data for driver trend analysis charts (Points by Season, Wins by Season, etc.)'
  })
  @ApiOkResponse({ type: [DriverSeasonStatsDto] })
  @ApiNotFoundResponse({
    description: 'The driver with the specified ID was not found.',
    type: ApiErrorDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input. (e.g., ID is not a number).',
    type: ApiErrorDto,
  })
  @Get(':id/season-stats')
  async getDriverSeasonStats(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DriverSeasonStatsDto[]> {
    return this.driversService.findDriverSeasonStats(id);
  }

  @ApiExcludeEndpoint()
  @Public()
  @ApiOperation({ 
    summary: 'Get driver current season progression',
    description: 'Returns race-by-race points progression for the current season cumulative chart'
  })
  @ApiOkResponse({ type: [DriverSeasonProgressionDto] })
  @ApiNotFoundResponse({
    description: 'The driver with the specified ID was not found.',
    type: ApiErrorDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input. (e.g., ID is not a number).',
    type: ApiErrorDto,
  })
  @Get(':id/current-season-progression')
  async getDriverCurrentSeasonProgression(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DriverSeasonProgressionDto[]> {
    return this.driversService.findCurrentSeasonProgression(id);
  }
}