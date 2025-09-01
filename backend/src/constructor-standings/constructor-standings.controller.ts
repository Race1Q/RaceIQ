// backend/src/constructor-standings/constructor-standings.controller.ts
import { Controller, Get, Param, Post, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ConstructorStandingsService } from './constructor-standings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ScopesGuard } from '../auth/scopes.guard';
import { Scopes } from '../auth/scopes.decorator';

@Controller('constructor-standings')
@UseGuards(JwtAuthGuard, ScopesGuard)
export class ConstructorStandingsController {
  constructor(private readonly standingsService: ConstructorStandingsService) {}

  @Get(':season')
  @Scopes('read:standings') // Assumes this scope exists
  async getStandings(@Param('season', ParseIntPipe) season: number) {
    return this.standingsService.getStandingsBySeason(season);
  }
}
