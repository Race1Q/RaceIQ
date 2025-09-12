// src/pit-stops/pit-stops.controller.ts
import { Controller, Get, Param, Post } from '@nestjs/common';
import { PitStopsService } from './pit-stops.service';

@Controller('pit-stops')
export class PitStopsController {
  constructor(
    private readonly service: PitStopsService,
  ) {}

  @Get('race/:raceId')
  async byRace(@Param('raceId') raceId: string) {
    return this.service.getByRace(parseInt(raceId));
  }

}


