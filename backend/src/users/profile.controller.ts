import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthUser } from '../auth/auth-user.decorator';
import { User } from './entities/user.entity';

@Controller('profile') // Sets the route to /api/profile
@UseGuards(JwtAuthGuard) // Protect all routes in this controller
export class ProfileController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getProfile(@AuthUser() authUser: any): Promise<User> {
    // Passport's JWT strategy attaches a payload to request.user
    // We assume it has a 'sub' property for the Auth0 ID
    return this.usersService.getProfile(authUser.sub);
  }

  @Patch()
  async updateProfile(
    @AuthUser() authUser: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    return this.usersService.updateProfile(authUser.sub, updateProfileDto);
  }
}
