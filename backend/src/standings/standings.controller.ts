import { Controller, Get, Param, ParseIntPipe, Header } from '@nestjs/common';
import { ApiBadRequestResponse, ApiExcludeEndpoint, ApiNotFoundResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StandingsService } from './standings.service';
import { StandingsResponseDto } from './dto/standings-response.dto';
import { FeaturedDriverDto } from './dto/featured-driver.dto';
import { ApiErrorDto } from '../common/dto/api-error.dto';
import { Public } from '../auth/public.decorator';

@ApiTags('Standings')
@Controller('standings')
export class StandingsController {
  constructor(private readonly standingsService: StandingsService) {}

  @Public()
  @Get('2025/drivers')
  @Header('Cache-Control', 'public, max-age=300, stale-while-revalidate=600')
  @ApiOperation({
    summary: 'Get 2025 driver standings (Public)',
    description: 'Public endpoint that returns the current driver standings for the 2025 season. This endpoint can be accessed without authentication and is suitable for embedding on external sites.',
  })
  @ApiResponse({
    status: 200,
    description: 'Current 2025 driver standings.',
    type: StandingsResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'No standings data available for 2025.',
    type: ApiErrorDto,
  })
  async get2025DriverStandings(): Promise<StandingsResponseDto> {
    return this.standingsService.getStandingsByYear(2025);
  }

  @Get('featured-driver')
  @Header('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
  async getFeaturedDriver(): Promise<FeaturedDriverDto> {
    return this.standingsService.getFeaturedDriver();
  }

  @ApiExcludeEndpoint()
  @Get('featured-driver-debug')
  async getFeaturedDriverDebug(): Promise<any> {
    return this.standingsService.getFeaturedDriverDebug();
  }

  @ApiExcludeEndpoint()
  @ApiNotFoundResponse({
    description: 'The standings for the specified year and round were not found.',
    type: ApiErrorDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input. (e.g., year or round is not a number).',
    type: ApiErrorDto,
  })
  @Get(':year/:round')
  async getStandings(
    @Param('year', ParseIntPipe) year: number,
    @Param('round', ParseIntPipe) round: number,
  ): Promise<StandingsResponseDto> {
    return this.standingsService.getStandingsByYearAndRound(year, round);
  }

  @ApiExcludeEndpoint()
  @ApiNotFoundResponse({
    description: 'The standings for the specified year were not found.',
    type: ApiErrorDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input. (e.g., year is not a number).',
    type: ApiErrorDto,
  })
  @Get('year/:year')
  async getStandingsByYear(
    @Param('year', ParseIntPipe) year: number,
  ): Promise<StandingsResponseDto> {
    return this.standingsService.getStandingsByYear(year);
  }
}


