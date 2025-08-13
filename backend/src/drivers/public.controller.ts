import { Controller, Get, Query } from '@nestjs/common';
import { DriversService } from './drivers.service';

@Controller('drivers')
export class PublicController {
  constructor(private drivers: DriversService) {}

  @Get()
  async list(
    @Query('limit') limit = '100',
    @Query('offset') offset = '0'
  ) {
    return this.drivers.list(parseInt(limit, 10), parseInt(offset, 10));
  }
}
