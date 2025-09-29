import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ConstructorsService } from './constructors.service';
import { ConstructorEntity } from './constructors.entity';

@Controller('constructors')
export class ConstructorsController {
  constructor(private readonly constructorsService: ConstructorsService) {}

  @Get()
  async findAll(
    @Query('year') year?: string,
  ): Promise<ConstructorEntity[]> {
    const yearNumber = year ? parseInt(year, 10) : undefined;
    return this.constructorsService.findAll(yearNumber);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ConstructorEntity> {
    return this.constructorsService.findOne(id);
  }

  @Get(':id/points-per-season')
  async getPointsPerSeason(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ season: number; points: number }[]> {
    return this.constructorsService.getPointsPerSeason(id);
  }

  @Get('active')
  async getActiveConstructors(): Promise<ConstructorEntity[]> {
    return this.constructorsService.findAllActive();
  }
}


