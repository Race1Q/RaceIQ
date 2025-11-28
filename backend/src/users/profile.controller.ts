import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiExcludeEndpoint, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthUser } from '../auth/auth-user.decorator';
import { User } from './entities/user.entity';
import { ApiErrorDto } from '../common/dto/api-error.dto';

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

}
