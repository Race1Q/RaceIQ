// backend/src/dashboard/dashboard.controller.ts
import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardResponseDto } from './dto/dashboard.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboardData(): Promise<DashboardResponseDto> {
    return this.dashboardService.getDashboardData();
  }
}
