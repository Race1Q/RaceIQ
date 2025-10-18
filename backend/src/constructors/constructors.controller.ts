import { Controller, Get, Param, ParseIntPipe, Query, Header } from '@nestjs/common';
import { ApiBadRequestResponse, ApiExcludeEndpoint, ApiNotFoundResponse, ApiOperation, ApiQuery, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ConstructorsService } from './constructors.service';
import { ConstructorEntity } from './constructors.entity';
import { ConstructorComparisonStatsResponseDto } from './dto/constructor-stats.dto';
import { ConstructorStatsBulkResponseDto } from './dto/constructor-stats-bulk.dto';
import { ApiErrorDto } from '../common/dto/api-error.dto';

@ApiTags('Constructors')
@Controller('constructors')
export class ConstructorsController {
  constructor(private readonly constructorsService: ConstructorsService) {}

  @Get('active')
  @ApiOperation({ summary: 'Get all currently active constructors', description: 'Returns a list of all Formula 1 constructors that are currently competing in the championship.' })
  @ApiOkResponse({ type: [ConstructorEntity], description: 'List of active constructors' })
  async getActiveConstructors(): Promise<ConstructorEntity[]> {
    return this.constructorsService.findAllActive();
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all constructors of all time', description: 'Returns a complete list of all Formula 1 constructors throughout history, including both active and inactive teams.' })
  @ApiOkResponse({ type: [ConstructorEntity], description: 'List of all constructors' })
  async getAllConstructors(): Promise<ConstructorEntity[]> {
    return this.constructorsService.findAllConstructors();
  }

  @Get()
  @ApiOperation({ summary: 'Get constructors by year', description: 'Returns constructors that competed in a specific year. If no year is provided, returns all constructors.' })
  @ApiQuery({ name: 'year', required: false, type: Number, description: 'The year to filter constructors by (e.g., 2024)' })
  @ApiOkResponse({ type: [ConstructorEntity], description: 'List of constructors for the specified year' })
  @ApiBadRequestResponse({
    description: 'Invalid input. (e.g., year parameter is not a valid number).',
    type: ApiErrorDto,
  })
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
  
  @Get('stats/bulk')
  @Header('Cache-Control', 'public, max-age=300, stale-while-revalidate=600')
  @ApiOperation({ 
    summary: 'Get bulk constructor statistics', 
    description: 'Returns statistics for all constructors in a single request, optimized for performance using materialized views.' 
  })
  @ApiQuery({ name: 'year', required: false, description: 'Season year (defaults to current year)' })
  @ApiQuery({ name: 'includeHistorical', required: false, description: 'Include historical constructors (defaults to false)' })
  @ApiOkResponse({ type: ConstructorStatsBulkResponseDto, description: 'Bulk constructor statistics' })
  @ApiBadRequestResponse({ type: ApiErrorDto, description: 'Invalid input parameters' })
  @ApiNotFoundResponse({ type: ApiErrorDto, description: 'No data found for the specified year' })
  async getBulkConstructorStats(
    @Query('year') year?: string,
    @Query('includeHistorical') includeHistorical?: boolean
  ): Promise<ConstructorStatsBulkResponseDto> {
    return this.constructorsService.getBulkConstructorStats(
      year ? parseInt(year, 10) : undefined,
      includeHistorical
    );
  }
  
  @ApiExcludeEndpoint()
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ConstructorEntity> {
    return this.constructorsService.findOne(id);
  }
}


