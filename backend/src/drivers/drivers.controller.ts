import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ScopesGuard } from '../auth/scopes.guard';
import { Scopes } from '../auth/scopes.decorator';
import { DriversService } from './drivers.service';

@Controller('drivers')
//@UseGuards(JwtAuthGuard, ScopesGuard)
export class DriversController {
  constructor(private readonly driversService: DriversService) {}
  // GET /drivers  -> requires read:drivers
  @Get()
  //@Scopes('read:drivers')
  async findAll(@Query('isActive') isActive?: string) {
    return this.driversService.listWithFilter(isActive);
  }

  // POST /drivers -> requires write:drivers (kept for future admin edits)
  @Post()
  @Scopes('write:drivers')
  create(@Body() dto: any) {
    return { created: true, dto };
  }
}
