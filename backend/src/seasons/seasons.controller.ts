import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common'; // 1. IMPORT Param & ParseIntPipe
import { SeasonsService } from './seasons.service';
import { Season } from './seasons.entity';
import { Race } from '../races/races.entity'; // 2. IMPORT RACE

@Controller('seasons')
export class SeasonsController {
  constructor(private readonly seasonsService: SeasonsService) {}

  @Get()
  async findAll(): Promise<Season[]> {
    return this.seasonsService.findAll();
  }

  // 3. UNCOMMENT THIS ENDPOINT
  @Get(':year/races')
  async getRacesForYear(
    @Param('year', ParseIntPipe) year: number,
  ): Promise<Race[]> {
    return this.seasonsService.getRacesForYear(year);
  }
}


