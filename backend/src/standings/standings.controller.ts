import { Controller, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { StandingsService } from './standings.service';
import { AuthGuard } from './auth.guard';
import { ConfigService } from '@nestjs/config';

@Controller('standings') // <-- The fix is here
export class StandingsController {
  constructor(private readonly standingsService: StandingsService, private readonly configService: ConfigService) {}

  @Get('drivers')
  async getDriverStandings(@Query('season') seasonParam?: string) {
    // This part of the code remains unchanged
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
