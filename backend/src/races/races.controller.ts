import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { RacesService } from './races.service';

@Controller('races')
export class RacesController {
  constructor(private readonly racesService: RacesService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.racesService.findAll(query); // accepts season | season_id | year
  }

  @Get('years')
  years() {
    return this.racesService.listYears(); // e.g., [2025, 2024, ...]
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.racesService.findOne(id);
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

@Get('constructor/:constructorId/points-by-circuit')
  async getConstructorPointsByCircuit(
    @Param('constructorId', ParseIntPipe) constructorId: number,
  ) {
    return this.racesService.getConstructorPointsByCircuit(constructorId);
  }
 
}
