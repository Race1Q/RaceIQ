import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ConstructorsService } from './constructors.service';
import { ConstructorEntity } from './constructors.entity';
import { ConstructorComparisonStatsResponseDto } from './dto/constructor-stats.dto';

@Controller('constructors')
export class ConstructorsController {
  constructor(private readonly constructorsService: ConstructorsService) {}

  @Get('active')
  async getActiveConstructors(): Promise<ConstructorEntity[]> {
    return this.constructorsService.findAllActive();
  }

  @Get('all')
  async getAllConstructors(): Promise<ConstructorEntity[]> {
    return this.constructorsService.findAll();
  }

  @Get()
  async findAll(
    @Query('year') year?: string,
  ): Promise<ConstructorEntity[]> {
    const yearNumber = year ? parseInt(year, 10) : undefined;
    return this.constructorsService.findAll(yearNumber);
  }

  @Get(':id/stats/all')
  async getConstructorStatsAllYears(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ year: number; stats: any }[]> {
    return this.constructorsService.getConstructorStatsAllYears(id);
  }

  @Get(':id/stats')
  async getConstructorStats(
    @Param('id', ParseIntPipe) id: number,
    @Query('year') year?: string,
  ): Promise<ConstructorComparisonStatsResponseDto> {
    const yearNumber = year ? parseInt(year, 10) : undefined;
    return this.constructorsService.getConstructorStats(id, yearNumber);
  }

  @Get(':id/stats/:year')
  async getConstructorStatsByYear(
    @Param('id', ParseIntPipe) id: number,
    @Param('year', ParseIntPipe) year: number,
  ): Promise<ConstructorComparisonStatsResponseDto> {
    return this.constructorsService.getConstructorStats(id, year);
  }

  @Get(':id/points-per-season')
  async getPointsPerSeason(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ season: number; points: number }[]> {
    return this.constructorsService.getPointsPerSeason(id);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ConstructorEntity> {
    return this.constructorsService.findOne(id);
  }
}


