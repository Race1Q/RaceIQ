import { Controller, Get, Param, Post, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { RaceResultsService } from './race-results.service';
import { Scopes } from '../auth/scopes.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ScopesGuard } from '../auth/scopes.guard';

@Controller('race-results')
export class RaceResultsController {
  constructor(
    private readonly resultsService: RaceResultsService,
  ) {}

  @ApiExcludeEndpoint()
  @Get('session/:sessionId')
  async getBySession(@Param('sessionId') sessionId: string) {
    return this.resultsService.getBySessionId(parseInt(sessionId));
  }

  @ApiExcludeEndpoint()
  @UseGuards(JwtAuthGuard, ScopesGuard)
  @Get(':constructor_id')
  @Scopes('read:race-results')
async getByConstructor(@Param('constructorId') constructorId: string) {
  if (!constructorId) {
    return []; // or throw BadRequestException
  }
  return this.resultsService.getByConstructor(Number(constructorId));
}

@ApiExcludeEndpoint()
@UseGuards(JwtAuthGuard, ScopesGuard)
@Get('constructor/:constructorId/stats')
@Scopes('read:race-results')
async getConstructorStats(@Param('constructorId') constructorId: string) {
  return this.resultsService.getConstructorStats(Number(constructorId));
}

@ApiExcludeEndpoint()
@Get(':constructorId/points-per-season')
async getConstructorPointsPerSeason(@Param('constructorId') constructorId: string) {
  return this.resultsService.getPointsPerSeason(Number(constructorId));
}


@ApiExcludeEndpoint()
@Get('constructor/:constructorId/season-points')
@Scopes('read:race-results')
async getPointsPerSeason(@Param('constructorId') constructorId: string) {
  return this.resultsService.getConstructorPointsPerSeason(Number(constructorId));
}

@ApiExcludeEndpoint()
@Get('constructor/:constructorId/season/:seasonId/progression')
async getConstructorProgression(
  @Param('constructorId', ParseIntPipe) constructorId: number,
  @Param('seasonId', ParseIntPipe) seasonId: number,
) {
  return this.resultsService.getConstructorPointsProgression(constructorId, seasonId);
}

@ApiExcludeEndpoint()
@Get('constructor/:constructorId/season/:seasonId/debug')
async debugConstructorSeason(
  @Param('constructorId', ParseIntPipe) constructorId: number,
  @Param('seasonId', ParseIntPipe) seasonId: number,
) {
  return this.resultsService.debugConstructorRaces(constructorId, seasonId);
}

@ApiExcludeEndpoint()
@Get('constructors/:seasonId/progression')
@Scopes('read:race-results')
  async getConstructorsProgression(@Param('seasonId') seasonId: string) {
    const seasonIdNum = Number(seasonId);
    return this.resultsService.getAllConstructorsProgression(seasonIdNum);
  }

  @ApiExcludeEndpoint()
  @Get('drivers/:seasonId/progression')
  @Scopes('read:race-results')
  async getDriversProgression(@Param('seasonId') seasonId: string) {
    const seasonIdNum = Number(seasonId);
    return this.resultsService.getDriversPointsProgression(seasonIdNum);
  }

  @ApiExcludeEndpoint()
  @Get('drivers/:seasonId/progression2')
  @Scopes('read:race-results')
  async getDriversProgression2(@Param('seasonId') seasonId: string) {
    const seasonIdNum = Number(seasonId);
    return this.resultsService.getDriversProgression(seasonIdNum);
  }

  @ApiExcludeEndpoint()
  @Get('drivers/progression')
  @Scopes('read:race-results')
  async getDriversProgression3() {
    return this.resultsService.getDriversPointsProgression3();
  }

  @ApiExcludeEndpoint()
  @Get('drivers/:seasonId/progression3')
  @Scopes('read:race-results')
  async getDriversProgression3WithSeason(@Param('seasonId') seasonId: string) {
    const seasonIdNum = Number(seasonId);
    return this.resultsService.getDriversPointsProgression3(seasonIdNum);
  }

}
