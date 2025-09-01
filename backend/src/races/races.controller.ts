// backend/src/races/races.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RacesService } from './races.service';
import { RaceResponseDto } from './dto';

@ApiTags('races')
@Controller('races')
export class RacesController {
  constructor(private readonly racesService: RacesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all races for the 2025 season' })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved all races for the 2025 season', 
    type: [RaceResponseDto],
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAllRacesFor2025(): Promise<RaceResponseDto[]> {
    return this.racesService.findAllRacesFor2025();
  }
}
