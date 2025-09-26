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

  @Get('constructor/:constructorId/poles')
async getConstructorPoles(
  @Param('constructorId', ParseIntPipe) constructorId: number,
): Promise<{ constructorId: number; poles: number }> {
  const poles = await this.racesService.getConstructorPolePositions(constructorId);
  return { constructorId, poles };
}

@Get('constructor/:constructorId/poles-by-season')
async getConstructorPolesBySeason(
  @Param('constructorId', ParseIntPipe) constructorId: number,
): Promise<any[]> {
  return this.racesService.getConstructorPolePositionsBySeason(constructorId);
}

 
}


