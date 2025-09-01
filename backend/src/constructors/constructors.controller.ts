// backend/src/constructors/constructors.controller.ts
import { Controller, Get, Post, UseGuards, Param, ParseIntPipe } from '@nestjs/common';
import { ConstructorsService } from './constructors.service';
import { Constructor } from './entities/constructors.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ScopesGuard } from '../auth/scopes.guard';
import { Scopes } from '../auth/scopes.decorator';

@Controller('constructors')
@UseGuards(JwtAuthGuard, ScopesGuard)
export class ConstructorsController {
  constructor(private readonly constructorsService: ConstructorsService) {}

  @Post('ingest')
  @Scopes('write:constructors') // Assumes this scope exists
  async ingestConstructors() {
    this.constructorsService.ingestConstructors();
    return { message: 'Constructor ingestion started in the background.' };
  }

  @Get()
  @Scopes('read:constructors') // Assumes this scope exists
  async getAllConstructors(): Promise<Constructor[]> {
    return this.constructorsService.getAllConstructors();
  }

  @UseGuards(JwtAuthGuard, ScopesGuard)
  @Scopes('read:constructors')
  @Get(':id')
  async getConstructorById(@Param('id', ParseIntPipe) id: number): Promise<Constructor> {
    return this.constructorsService.getConstructorById(id);
  }
}

