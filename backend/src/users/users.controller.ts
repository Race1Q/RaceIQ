import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Test endpoint to check if user creation is working
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Req() req: any) {
    // This will show us what's in req.user after JWT validation
    return {
      message: 'Current user data',
      jwtPayload: req.user,
      databaseUser: req.user?.user, // This should contain our database user record
    };
  }

  // Manual test endpoint to create a user (for debugging)
  @Post('test-create')
  async testCreateUser(@Body() body: { auth0Sub: string }) {
    try {
      const user = await this.usersService.findOrCreateUser(body.auth0Sub);
      return {
        message: 'User created/found successfully',
        user,
      };
    } catch (error) {
      return {
        message: 'Error creating user',
        error: error.message,
      };
    }
  }
}
