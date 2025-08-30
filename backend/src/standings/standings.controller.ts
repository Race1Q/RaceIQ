import { Controller, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { StandingsService } from './standings.service';
// The AuthGuard import has been removed as it is no longer used for this endpoint

@Controller('standings')
export class StandingsController {
  constructor(private readonly standingsService: StandingsService) {}

  @Get('drivers')
  // The @UseGuards(AuthGuard) decorator has been removed to make this endpoint public
  async getDriverStandings(@Query('season') seasonParam?: string) {
    let targetSeason = seasonParam;
    
    if (!targetSeason) {
      targetSeason = await this.standingsService.getCurrentSeason();
      if (!targetSeason) {
        throw new HttpException('No seasons found in database', HttpStatus.NOT_FOUND);
      }
    }

    const standings = await this.standingsService.getDriverStandings(targetSeason);
    
    if (standings.length === 0) {
      throw new HttpException(`No standings found for season ${targetSeason}`, HttpStatus.NOT_FOUND);
    }
    
    return {
      season: targetSeason,
      data: standings,
    };
  }
}
