import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { RacesService } from './races.service';
import { RaceDetailsDto } from './dto/race-details.dto';

@Controller('races')
export class RacesController {
  constructor(private readonly racesService: RacesService) {}

  @Get('details/:raceId')
  async getRaceDetails(
    @Param('raceId', ParseIntPipe) raceId: number,
  ): Promise<RaceDetailsDto> {
    return this.racesService.getRaceDetails(raceId);
  }
}


