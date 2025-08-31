// src/drivers/drivers.controller.ts
import { Controller, Get, Post, Query, Logger, UseGuards, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { DriversService } from './drivers.service';
import { IngestService } from './ingest.service';
import { Driver } from './entities/driver.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ScopesGuard } from '../auth/scopes.guard';
import { Scopes } from '../auth/scopes.decorator';
import { 
  DriverDto, 
  DriverDetailDto, 
  DriverStatsDto, 
  DriversListResponseDto, 
  DriverDetailResponseDto, 
  DriverStatsResponseDto 
} from './dto/driver.dto';

@ApiTags('drivers')
@Controller('drivers')
export class DriversController {
  private readonly logger = new Logger(DriversController.name);

  constructor(
    private readonly driversService: DriversService,
    private readonly ingestService: IngestService,
  ) {}

  // Public endpoints (no authentication required)

  @Get()
  @ApiOperation({ 
    summary: 'Get all drivers', 
    description: 'Returns a list of all drivers with basic information. This endpoint is public and does not require authentication.' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all drivers retrieved successfully',
    type: DriversListResponseDto
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error' 
  })
  async getAllDrivers(): Promise<DriversListResponseDto> {
    this.logger.log('GET /drivers - Fetching all drivers');
    try {
      const drivers = await this.driversService.getAllDrivers();
      this.logger.log(`GET /drivers - Successfully retrieved ${drivers.length} drivers`);
      return {
        success: true,
        data: drivers,
        total: drivers.length
      };
    } catch (error) {
      this.logger.error('GET /drivers - Error fetching drivers', error);
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get driver by ID', 
    description: 'Returns detailed information for a specific driver by their ID. This endpoint is public and does not require authentication.' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Driver ID', 
    example: 1,
    type: 'number'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Driver details retrieved successfully',
    type: DriverDetailResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Driver not found' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error' 
  })
  async getDriverById(@Param('id', ParseIntPipe) id: number): Promise<DriverDetailResponseDto> {
    const driver = await this.driversService.getDriverById(id);
    return {
      success: true,
      data: driver
    };
  }

  @Get(':id/stats')
  @ApiOperation({ 
    summary: 'Get driver statistics', 
    description: 'Returns comprehensive statistics for a specific driver including career totals and current season performance. This endpoint is public and does not require authentication.' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Driver ID', 
    example: 1,
    type: 'number'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Driver statistics retrieved successfully',
    type: DriverStatsResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Driver not found' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error' 
  })
  async getDriverStats(@Param('id', ParseIntPipe) id: number): Promise<DriverStatsResponseDto> {
    const stats = await this.driversService.getDriverStats(id);
    return {
      success: true,
      data: stats
    };
  }

  @Get('search')
  @ApiOperation({ 
    summary: 'Search drivers', 
    description: 'Search drivers by name or acronym. This endpoint is public and does not require authentication.' 
  })
  @ApiQuery({ 
    name: 'q', 
    description: 'Search query (driver name or acronym)', 
    example: 'hamilton',
    required: true
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Search results retrieved successfully',
    type: DriversListResponseDto
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error' 
  })
  async searchDrivers(@Query('q') query: string): Promise<DriversListResponseDto> {
    if (!query) {
      return {
        success: true,
        data: [],
        total: 0
      };
    }
    const drivers = await this.driversService.searchDrivers(query);
    return {
      success: true,
      data: drivers,
      total: drivers.length
    };
  }

  // Authenticated endpoints (existing functionality)

  @Post('ingest')
  @UseGuards(JwtAuthGuard, ScopesGuard)
  @Scopes('write:drivers')
  @ApiOperation({ 
    summary: 'Ingest drivers data', 
    description: 'Starts the drivers data ingestion process. Requires authentication with write:drivers scope.' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Ingestion process started successfully' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - insufficient permissions' 
  })
  async ingestDrivers() {
    this.logger.log('Starting drivers ingestion via API endpoint');
    // We don't await this so the request can return immediately
    this.ingestService.ingestDrivers();
    return {
      message: 'Drivers ingestion process started in the background.',
    };
  }

  // Legacy authenticated endpoints (keeping for backward compatibility)
  @Get('auth/all')
  @UseGuards(JwtAuthGuard, ScopesGuard)
  @Scopes('read:drivers')
  @ApiOperation({ 
    summary: 'Get all drivers (authenticated)', 
    description: 'Returns a list of all drivers. Requires authentication with read:drivers scope.' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all drivers retrieved successfully',
    type: [DriverDto]
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - insufficient permissions' 
  })
  async getAllDriversAuth(): Promise<Driver[]> {
    return this.driversService.getAllDrivers();
  }

  @Get('auth/search')
  @UseGuards(JwtAuthGuard, ScopesGuard)
  @Scopes('read:drivers')
  @ApiOperation({ 
    summary: 'Search drivers (authenticated)', 
    description: 'Search drivers by name or acronym. Requires authentication with read:drivers scope.' 
  })
  @ApiQuery({ 
    name: 'q', 
    description: 'Search query (driver name or acronym)', 
    example: 'hamilton',
    required: true
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Search results retrieved successfully',
    type: [DriverDto]
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - insufficient permissions' 
  })
  async searchDriversAuth(@Query('q') query: string): Promise<Driver[]> {
    if (!query) return [];
    return this.driversService.searchDrivers(query);
  }
}