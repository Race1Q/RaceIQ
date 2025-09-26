<<<<<<< HEAD
import { Controller, Get, Param, Post, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { RaceResultsService } from './race-results.service';
import { Scopes } from 'src/auth/scopes.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ScopesGuard } from '../auth/scopes.guard';
=======
import { Controller, Get, Query, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { RaceResult } from './race-results.entity';
>>>>>>> main

@Controller('race-results')
export class RaceResultsController {
  constructor(
<<<<<<< HEAD
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

@Get('constructor/:constructorId/season/:seasonId/debug')
async debugConstructorSeason(
  @Param('constructorId', ParseIntPipe) constructorId: number,
  @Param('seasonId', ParseIntPipe) seasonId: number,
) {
  return this.resultsService.debugConstructorRaces(constructorId, seasonId);
}

}
=======
    @InjectRepository(RaceResult)
    private readonly repo: Repository<RaceResult>,
  ) {}

  // Accept both race_id and raceId as query params
  @Get()
  async findByRaceIdQuery(@Query('race_id') race_id: string, @Query('raceId') raceId: string) {
    const id = race_id || raceId;
    if (!id || isNaN(Number(id))) {
      return [];
    }
    const sessionIds = await this.repo.manager.query(
      'SELECT id FROM sessions WHERE race_id = $1', [id]
    );
    const ids = sessionIds.map((s: any) => s.id);
    if (!ids.length) return [];
    const results = await this.repo.find({
      where: { session_id: In(ids) },
      relations: ['driver', 'team'],
    });
    return results.map(r => ({
      ...r,
      driver_name: r.driver ? `${r.driver.first_name ?? ''} ${r.driver.last_name ?? ''}`.trim() : undefined,
      constructor_name: r.team ? r.team.name : undefined,
    }));
  }

  // Accept /by-race/:id
  @Get('by-race/:id')
  async findByRaceIdParam(@Param('id') id: string) {
    if (!id || isNaN(Number(id))) {
      return [];
    }
    const sessionIds = await this.repo.manager.query(
      'SELECT id FROM sessions WHERE race_id = $1', [id]
    );
    const ids = sessionIds.map((s: any) => s.id);
    if (!ids.length) return [];
    const results = await this.repo.find({
      where: { session_id: In(ids) },
      relations: ['driver', 'team'],
    });
    return results.map(r => ({
      ...r,
      driver_name: r.driver ? `${r.driver.first_name ?? ''} ${r.driver.last_name ?? ''}`.trim() : undefined,
      constructor_name: r.team ? r.team.name : undefined,
    }));
  }

  // Accept /race/:id
  @Get('race/:id')
  async findByRaceIdParam2(@Param('id') id: string) {
    if (!id || isNaN(Number(id))) {
      return [];
    }
    const sessionIds = await this.repo.manager.query(
      'SELECT id FROM sessions WHERE race_id = $1', [id]
    );
    const ids = sessionIds.map((s: any) => s.id);
    if (!ids.length) return [];
    const results = await this.repo.find({
      where: { session_id: In(ids) },
      relations: ['driver', 'team'],
    });
    return results.map(r => ({
      ...r,
      driver_name: r.driver ? `${r.driver.first_name ?? ''} ${r.driver.last_name ?? ''}`.trim() : undefined,
      constructor_name: r.team ? r.team.name : undefined,
    }));
  }
}
>>>>>>> main
