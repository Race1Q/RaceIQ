// backend/src/dashboard/dashboard.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardResponseDto } from './dto/dashboard.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiExcludeEndpoint()
  @Get()
  async getDashboardData(): Promise<DashboardResponseDto> {
    try {
      return await this.dashboardService.getDashboardData();
    } catch (error) {
      console.error('❌ [DashboardController] Error:', error.message);
      console.error('❌ [DashboardController] Stack:', error.stack);
      console.error('❌ [DashboardController] Full error:', error);
      throw error;
    }
  }
}
