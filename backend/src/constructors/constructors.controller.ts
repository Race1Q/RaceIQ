import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiExcludeEndpoint, ApiNotFoundResponse } from '@nestjs/swagger';
import { ConstructorsService } from './constructors.service';
import { ConstructorEntity } from './constructors.entity';
import { ConstructorComparisonStatsResponseDto } from './dto/constructor-stats.dto';
import { ApiErrorDto } from '../common/dto/api-error.dto';

@Controller('constructors')
export class ConstructorsController {
  constructor(private readonly constructorsService: ConstructorsService) {}

  @Get('active')
  async getActiveConstructors(): Promise<ConstructorEntity[]> {
    return this.constructorsService.findAllActive();
  }

  @Get('all')
  async getAllConstructors(): Promise<ConstructorEntity[]> {
    return this.constructorsService.findAllConstructors();
  }

  @ApiBadRequestResponse({
    description: 'Invalid input. (e.g., year parameter is not a valid number).',
    type: ApiErrorDto,
  })
  @Get()
  async findAll(
    @Query('year') year?: string,
  ): Promise<ConstructorEntity[]> {
    const yearNumber = year ? parseInt(year, 10) : undefined;
    return this.constructorsService.findAll(yearNumber);
  }

  @ApiExcludeEndpoint()
  @ApiNotFoundResponse({
    description: 'The constructor with the specified ID was not found.',
    type: ApiErrorDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input. (e.g., ID is not a number).',
    type: ApiErrorDto,
  })
  @Get(':id/stats/all')
  async getConstructorStatsAllYears(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ year: number; stats: any }[]> {
    return this.constructorsService.getConstructorStatsAllYears(id);
  }

  @ApiExcludeEndpoint()
  @ApiNotFoundResponse({
    description: 'The constructor with the specified ID was not found.',
    type: ApiErrorDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input. (e.g., ID is not a number, year parameter is invalid).',
    type: ApiErrorDto,
  })
  @Get(':id/stats')
  async getConstructorStats(
    @Param('id', ParseIntPipe) id: number,
    @Query('year') year?: string,
  ): Promise<ConstructorComparisonStatsResponseDto> {
    const yearNumber = year ? parseInt(year, 10) : undefined;
    return this.constructorsService.getConstructorStats(id, yearNumber);
  }

  @ApiExcludeEndpoint()
  @ApiNotFoundResponse({
    description: 'The constructor with the specified ID or year was not found.',
    type: ApiErrorDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input. (e.g., ID or year is not a number).',
    type: ApiErrorDto,
  })
  @Get(':id/stats/:year')
  async getConstructorStatsByYear(
    @Param('id', ParseIntPipe) id: number,
    @Param('year', ParseIntPipe) year: number,
  ): Promise<ConstructorComparisonStatsResponseDto> {
    return this.constructorsService.getConstructorStats(id, year);
  }

  @ApiExcludeEndpoint()
  @ApiNotFoundResponse({
    description: 'The constructor with the specified ID was not found.',
    type: ApiErrorDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input. (e.g., ID is not a number).',
    type: ApiErrorDto,
  })
  @Get(':id/points-per-season')
  async getPointsPerSeason(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ season: number; points: number }[]> {
    return this.constructorsService.getPointsPerSeason(id);
  }

  @ApiExcludeEndpoint()
  @ApiNotFoundResponse({
    description: 'The constructor with the specified ID was not found.',
    type: ApiErrorDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input. (e.g., ID is not a number).',
    type: ApiErrorDto,
  })
  @Get(':id/championships')
  async getConstructorChampionships(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ championships: number }> {
    return this.constructorsService.getConstructorWorldChampionships(id);
  }

  @ApiExcludeEndpoint()
  @ApiNotFoundResponse({
    description: 'The constructor with the specified ID was not found.',
    type: ApiErrorDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input. (e.g., ID is not a number).',
    type: ApiErrorDto,
  })
  @Get(':id/best-track')
  async getConstructorBestTrack(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ circuitName: string; totalPoints: number; races: number; wins: number }> {
    return this.constructorsService.getConstructorBestTrack(id);
  }
  
  @ApiExcludeEndpoint()
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ConstructorEntity> {
    return this.constructorsService.findOne(id);
  }
}


