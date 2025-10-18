import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiForbiddenResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ScopesGuard } from '../auth/scopes.guard';
import { Scopes } from '../auth/scopes.decorator';
import { ApiErrorDto } from '../common/dto/api-error.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, ScopesGuard)
export class AdminController {
  @ApiExcludeEndpoint()
  @ApiUnauthorizedResponse({
    description: 'Authentication token is missing or invalid.',
    type: ApiErrorDto,
  })
  @ApiForbiddenResponse({
    description: 'User does not have the required permissions (scopes) for this resource.',
    type: ApiErrorDto,
  })
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
  @ApiExcludeEndpoint()
  @ApiUnauthorizedResponse({
    description: 'Authentication token is missing or invalid.',
    type: ApiErrorDto,
  })
  @ApiForbiddenResponse({
    description: 'User does not have the required permissions (scopes) for this resource.',
    type: ApiErrorDto,
  })
  @Get('me')
  @Scopes('admin:all')
  me(@Req() req: any) {
    const { sub, aud, iss, permissions, scope } = req.user || {};
    return { sub, aud, iss, permissions, scope };
  }
}
