import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ScopesGuard } from '../auth/scopes.guard';
import { Scopes } from '../auth/scopes.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, ScopesGuard)
export class AdminController {
  @Get('dashboard')
  @Scopes('admin:all')
  dashboard() {
    return {
      users: 1247,
      activeSessions: 89,
      apiCallsToday: 45200,
      status: 'Healthy',
      at: new Date().toISOString(),
    };
  }

  // Handy debug to see token claims (keep admin-only)
  @Get('me')
  @Scopes('admin:all')
  me(@Req() req: any) {
    const { sub, aud, iss, permissions, scope } = req.user || {};
    return { sub, aud, iss, permissions, scope };
  }
}
