// backend/src/drivers/drivers.controller.ts

// NOTE: All @UseGuards, @Scopes, and @ApiBearerAuth decorators have been removed
// to make these GET endpoints publicly accessible.

import { Controller, Get, Post, Query, Logger, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { DriversService } from './drivers.service';
import { 
  DriverResponseDto, 
  DriverStandingsResponseDto, 
  DriverDetailsResponseDto, 
  DriverPerformanceResponseDto 
} from './dto';

@ApiTags('drivers')
// The @ApiBearerAuth() decorator is removed from here
@Controller('drivers')
export class DriversController {
  private readonly logger = new Logger(DriversController.name);

  constructor(
    private readonly driversService: DriversService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all drivers', description: 'Retrieve a list of all drivers in the system' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved all drivers', type: [DriverResponseDto] })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getAllDrivers(): Promise<DriverResponseDto[]> {
    return this.driversService.getAllDrivers();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search drivers', description: 'Search drivers by name or acronym' })
  @ApiQuery({ name: 'q', description: 'Search query for driver name or acronym', example: 'ham' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved matching drivers', type: [DriverResponseDto] })
  @ApiResponse({ status: 400, description: 'Bad request - Missing search query' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async searchDrivers(@Query('q') query: string): Promise<DriverResponseDto[]> {
    if (!query) return [];
    return this.driversService.searchDrivers(query);
  }

  @Get('by-standings/:season')
  @ApiOperation({ summary: 'Get drivers by championship standings', description: 'Retrieve drivers sorted by their championship position for a specific season' })
  @ApiParam({ name: 'season', description: 'Season year', example: 2024 })
  @ApiResponse({ status: 200, description: 'Successfully retrieved drivers by standings', type: [DriverStandingsResponseDto] })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid season parameter' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findDriversByStandings(@Param('season', ParseIntPipe) season: number): Promise<DriverStandingsResponseDto[]> {
    return this.driversService.findDriversByStandings(season);
  }

  @Get(':id/details')
  @ApiOperation({ summary: 'Get driver details', description: 'Retrieve comprehensive details for a specific driver including career statistics' })
  @ApiParam({ name: 'id', description: 'Driver ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Successfully retrieved driver details', type: DriverDetailsResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid driver ID' })
  @ApiResponse({ status: 404, description: 'Driver not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findOneDetails(@Param('id', ParseIntPipe) id: number): Promise<DriverDetailsResponseDto> {
    return this.driversService.findOneDetails(id);
  }

  @Get(':id/performance/:season')
  @ApiOperation({ summary: 'Get driver performance', description: 'Retrieve performance statistics for a specific driver in a specific season' })
  @ApiParam({ name: 'id', description: 'Driver ID', example: 1 })
  @ApiParam({ name: 'season', description: 'Season year', example: '2024' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved driver performance', type: DriverPerformanceResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid driver ID or season' })
  @ApiResponse({ status: 404, description: 'Driver or season not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findOnePerformance(
    @Param('id', ParseIntPipe) id: number,
    @Param('season') season: string,
  ): Promise<DriverPerformanceResponseDto> {
    return this.driversService.findOnePerformance(id, season);
  }
}