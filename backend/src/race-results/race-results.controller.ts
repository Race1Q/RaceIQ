import { Controller, Get, Param, Post, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { RaceResultsService } from './race-results.service';
import { Scopes } from 'src/auth/scopes.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ScopesGuard } from '../auth/scopes.guard';

@Controller('race-results')
export class RaceResultsController {
  constructor(
    private readonly resultsService: RaceResultsService,
  ) {}

  @Get('session/:sessionId')
  async getBySession(@Param('sessionId') sessionId: string) {
    return this.resultsService.getBySessionId(parseInt(sessionId));
  }

  @UseGuards(JwtAuthGuard, ScopesGuard)
  @Get(':constructor_id')
  @Scopes('read:race-results')
async getByConstructor(@Param('constructorId') constructorId: string) {
  if (!constructorId) {
    return []; // or throw BadRequestException
  }
  return this.resultsService.getByConstructor(Number(constructorId));
}

@UseGuards(JwtAuthGuard, ScopesGuard)
@Get('constructor/:constructorId/stats')
@Scopes('read:race-results')
async getConstructorStats(@Param('constructorId') constructorId: string) {
  return this.resultsService.getConstructorStats(Number(constructorId));
}

@Get(':constructorId/points-per-season')
async getConstructorPointsPerSeason(@Param('constructorId') constructorId: string) {
  return this.resultsService.getPointsPerSeason(Number(constructorId));
}


@Get('constructor/:constructorId/season-points')
@Scopes('read:race-results')
async getPointsPerSeason(@Param('constructorId') constructorId: string) {
  return this.resultsService.getConstructorPointsPerSeason(Number(constructorId));
}

@Get('constructor/:constructorId/season/:seasonId/progression')
async getConstructorProgression(
  @Param('constructorId', ParseIntPipe) constructorId: number,
  @Param('seasonId', ParseIntPipe) seasonId: number,
) {
  return this.resultsService.getConstructorPointsProgression(constructorId, seasonId);
}
}