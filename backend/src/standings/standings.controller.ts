import { Controller, Get, Param, ParseIntPipe} from '@nestjs/common';
import { StandingsService } from './standings.service';
import { StandingsResponseDto, ConstructorStanding} from './dto/standings-response.dto';
import { Scopes } from 'src/auth/scopes.decorator';

@Controller('standings')
export class StandingsController {
  constructor(private readonly standingsService: StandingsService) {}

  @Get(':year/:round')
  async getStandings(
    @Param('year', ParseIntPipe) year: number,
    @Param('round', ParseIntPipe) round: number,
  ): Promise<StandingsResponseDto> {
    return this.standingsService.getStandingsByYearAndRound(year, round);
  }

  @Get('year/:year')
  async getStandingsByYear(
    @Param('year', ParseIntPipe) year: number,
  ): Promise<StandingsResponseDto> {
    return this.standingsService.getStandingsByYear(year);
  }


  @Get('constructors/season/:year')
  @Scopes('read:standings')
async getConstructorStandingsByYear(
  @Param('year', ParseIntPipe) year: number,
): Promise<ConstructorStanding[]> {
  return this.standingsService.getConstructorStandingsByYear(year);
}

}


