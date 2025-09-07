// backend/src/constructors/constructors.controller.ts

// NOTE: All @UseGuards, @Scopes, and @ApiBearerAuth decorators have been removed
// to make these GET endpoints publicly accessible.

import { Controller, Get, Post, UseGuards, Param } from '@nestjs/common';
import { ConstructorsService } from './constructors.service';
import { Constructor } from './entities/constructors.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ScopesGuard } from '../auth/scopes.guard';
import { Scopes } from '../auth/scopes.decorator';

@Controller('constructors')
export class ConstructorsController {
  constructor(private readonly constructorsService: ConstructorsService) {}

  @Post('ingest')
  @UseGuards(JwtAuthGuard, ScopesGuard)
  @Scopes('write:constructors') // Assumes this scope exists
  async ingestConstructors() {
    this.constructorsService.ingestConstructors();
    return { message: 'Constructor ingestion started in the background.' };
  }

  @Get()
  async getAllConstructors(): Promise<Constructor[]> {
    return this.constructorsService.getAllConstructors();
  }

  @Get('by-api-id/:constructor_id')
  async getConstructorByApiId(
    @Param('constructor_id') constructor_id: string
  ): Promise<Constructor> {
    return this.constructorsService.findByApiId(constructor_id);
  }
}

