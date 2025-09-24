import { Controller, Get, Param, Query } from '@nestjs/common';
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
}
