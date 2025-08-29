import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ScopesGuard } from '../auth/scopes.guard';
import { Scopes } from '../auth/scopes.decorator';
import { DriversService } from './drivers.service';
import { Driver } from './entities/driver.entity';

@Controller('drivers')
@UseGuards(JwtAuthGuard, ScopesGuard) // Secure all routes by default
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get()
  @Scopes('read:drivers')
  async findAll(
    @Query('isActive') isActive?: string,
    @Query('limit') limit = '100',
    @Query('offset') offset = '0',
  ): Promise<Driver[]> {
    const isActiveBoolean = isActive !== undefined ? isActive === 'true' : undefined;
    
    return this.driversService.findAll({
      isActive: isActiveBoolean,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    });
  }

  @Post()
  @Scopes('write:drivers')
  create(@Body() dto: any) {
    // This remains a placeholder for future admin functionality
    return { created: true, dto };
  }
}