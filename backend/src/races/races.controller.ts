// backend/src/races/races.controller.ts
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RacesService } from './races.service';
import { RaceResponseDto } from './dto';

@ApiTags('races')
@Controller('races')
export class RacesController {
  constructor(private readonly racesService: RacesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all races, optionally filtered by season year (default 2025)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved races', 
    type: [RaceResponseDto],
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAll(@Query('season') season?: string): Promise<RaceResponseDto[]> {
    if (season) {
      return this.racesService.findAllRacesForSeason(parseInt(season, 10));
    }
    // default to 2025
    return this.racesService.findAllRacesForSeason(2025);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single race by id' })
  @ApiResponse({ status: 200, description: 'Race found', type: RaceResponseDto })
  @ApiResponse({ status: 404, description: 'Race not found' })
  async findOne(@Param('id') id: string): Promise<RaceResponseDto | null> {
    return this.racesService.findRaceById(parseInt(id, 10));
  }
}
