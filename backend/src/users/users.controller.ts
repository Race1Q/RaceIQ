import { Controller, Get, Post, Body, UseGuards, Req, Patch } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Simple test endpoint to check if backend is working
  @Get('test')
  async testBackend() {
    try {
      return {
        status: 'success',
        message: 'Backend is working',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Backend test failed',
        error: error.message,
      };
    }
  }

  // Test endpoint to check if user creation is working
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Req() req: any) {
    // This will show us what's in req.user after JWT validation
    return {
      message: 'Current user data',
      jwtPayload: req.user,
    };
  }

  // Manual test endpoint to create a user (for debugging)
  @Post('test-create')
  async testCreateUser(@Body() body: { auth0Sub: string; email?: string }) {
    try {
      const user = await this.usersService.findOrCreateByAuth0Sub(body.auth0Sub, body.email);
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

  // Endpoint to ensure user exists in database (called after Auth0 signup)
  @Post('ensure-exists')
  @UseGuards(JwtAuthGuard)
  async ensureUserExists(@Req() req: any) {
    try {
      const auth0Sub = req.user.sub;
      const email = req.user.email; // Get email from JWT payload
      
      // Find or create user
      const user = await this.usersService.findOrCreateByAuth0Sub(auth0Sub, email);
      
      return {
        message: 'User ensured successfully',
        user,
      };
    } catch (error) {
      return {
        message: 'Error ensuring user exists',
        error: error.message,
      };
    }
  }

}
