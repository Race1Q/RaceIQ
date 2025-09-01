// src/drivers/drivers.controller.ts
import { Controller, Get, Post, Query, Logger, UseGuards, Param, ParseIntPipe } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { Driver } from './entities/driver.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ScopesGuard } from '../auth/scopes.guard';
import { Scopes } from '../auth/scopes.decorator';

@Controller('drivers')
export class DriversController {
  private readonly logger = new Logger(DriversController.name);

  constructor(
    private readonly driversService: DriversService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, ScopesGuard)
  @Scopes('read:drivers')
  async getAllDrivers(): Promise<Driver[]> {
    return this.driversService.getAllDrivers();
  }

  @Get('search')
  @UseGuards(JwtAuthGuard, ScopesGuard)
  @Scopes('read:drivers')
  async searchDrivers(@Query('q') query: string): Promise<Driver[]> {
    if (!query) return [];
    return this.driversService.searchDrivers(query);
  }

  @Get('by-standings/:season')
  @UseGuards(JwtAuthGuard, ScopesGuard)
  @Scopes('read:drivers')
  async findDriversByStandings(@Param('season', ParseIntPipe) season: number) {
    return this.driversService.findDriversByStandings(season);
  }
  @Get(':id/details')
  @UseGuards(JwtAuthGuard, ScopesGuard)
  @Scopes('read:drivers')
  async findOneDetails(@Param('id', ParseIntPipe) id: number) {
    return this.driversService.findOneDetails(id);
  }

  @Get(':id/performance/:season')
  @UseGuards(JwtAuthGuard, ScopesGuard)
  @Scopes('read:drivers')
  async findOnePerformance(
    @Param('id', ParseIntPipe) id: number,
    @Param('season') season: string, // <-- Changed to string, removed ParseIntPipe
  ) {
    return this.driversService.findOnePerformance(id, season);
  }
}