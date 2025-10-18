import { Controller, Get, Param, ParseIntPipe, Header } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { StandingsService } from './standings.service';
import { StandingsResponseDto } from './dto/standings-response.dto';
import { FeaturedDriverDto } from './dto/featured-driver.dto';

@Controller('standings')
export class StandingsController {
  constructor(private readonly standingsService: StandingsService) {}

  @Get('featured-driver')
  @Header('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
  async getFeaturedDriver(): Promise<FeaturedDriverDto> {
    return this.standingsService.getFeaturedDriver();
  }

  @Get('featured-driver-debug')
  async getFeaturedDriverDebug(): Promise<any> {
    return this.standingsService.getFeaturedDriverDebug();
  }

  @ApiExcludeEndpoint()
  @Get(':year/:round')
  async getStandings(
    @Param('year', ParseIntPipe) year: number,
    @Param('round', ParseIntPipe) round: number,
  ): Promise<StandingsResponseDto> {
    return this.standingsService.getStandingsByYearAndRound(year, round);
  }

  @ApiExcludeEndpoint()
  @Get('year/:year')
  async getStandingsByYear(
    @Param('year', ParseIntPipe) year: number,
  ): Promise<StandingsResponseDto> {
    return this.standingsService.getStandingsByYear(year);
  }
}


