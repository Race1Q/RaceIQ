import { Controller, Get, Param, ParseIntPipe, Header } from '@nestjs/common'; // 1. IMPORT Param & ParseIntPipe
import { ApiBadRequestResponse, ApiExcludeEndpoint, ApiNotFoundResponse } from '@nestjs/swagger';
import { SeasonsService } from './seasons.service';
import { Season } from './seasons.entity';
import { Race } from '../races/races.entity'; // 2. IMPORT RACE
import { ApiErrorDto } from '../common/dto/api-error.dto';

@Controller('seasons')
export class SeasonsController {
  constructor(private readonly seasonsService: SeasonsService) {}

  @Get()
  async findAll(): Promise<Season[]> {
    return this.seasonsService.findAll();
  }

  // 3. UNCOMMENT THIS ENDPOINT
  @ApiExcludeEndpoint()
  @ApiNotFoundResponse({
    description: 'The season with the specified year was not found.',
    type: ApiErrorDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input. (e.g., year is not a number).',
    type: ApiErrorDto,
  })
  @Get(':year/races')
  @Header('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400')
  async getRacesForYear(
    @Param('year', ParseIntPipe) year: number,
  ): Promise<Race[]> {
    return this.seasonsService.getRacesForYear(year);
  }
}


