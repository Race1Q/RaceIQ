import { Controller, Get, Patch, Body, UseGuards, Delete, SetMetadata } from '@nestjs/common';
import { ApiBadRequestResponse, ApiExcludeEndpoint, ApiForbiddenResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { AuthUser } from '../auth/auth-user.decorator';
import { User } from './entities/user.entity';
import { ApiErrorDto } from '../common/dto/api-error.dto';

// Helper to attach metadata
export const Permissions = (...permissions: string[]) => SetMetadata('permissions', permissions);

@Controller('profile') // Sets the route to /api/profile
@UseGuards(JwtAuthGuard) // Protect all routes in this controller
export class ProfileController {
  constructor(private readonly usersService: UsersService) {}

  @ApiExcludeEndpoint()
  @ApiUnauthorizedResponse({
    description: 'Authentication token is missing or invalid.',
    type: ApiErrorDto,
  })
  @Get()
  async getProfile(@AuthUser() authUser: any): Promise<User> {
    // Passport's JWT strategy attaches a payload to request.user
    // We assume it has a 'sub' property for the Auth0 ID
    return this.usersService.getProfile(authUser.sub);
  }

  @ApiExcludeEndpoint()
  @ApiUnauthorizedResponse({
    description: 'Authentication token is missing or invalid.',
    type: ApiErrorDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input. (e.g., DTO validation failed).',
    type: ApiErrorDto,
  })
  @Patch()
  async updateProfile(
    @AuthUser() authUser: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    return this.usersService.updateProfile(authUser.sub, updateProfileDto);
  }

  @ApiExcludeEndpoint()
  @ApiUnauthorizedResponse({
    description: 'Authentication token is missing or invalid.',
    type: ApiErrorDto,
  })
  @ApiForbiddenResponse({
    description: 'User does not have the required permissions for this resource.',
    type: ApiErrorDto,
  })
  @Delete()
  @UseGuards(PermissionsGuard)
  @Permissions('delete:users')
  async deleteProfile(@AuthUser() authUser: any): Promise<{ success: true }>{
    await this.usersService.deleteByAuth0Sub(authUser.sub);
    return { success: true };
  }
}
