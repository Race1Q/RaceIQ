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
      // Test Supabase connection
      const { data, error } = await this.usersService.supabaseService.client
        .from('users')
        .select('count')
        .limit(1);
      
      if (error) {
        return {
          status: 'error',
          message: 'Supabase connection failed',
          error: error.message,
        };
      }
      
      return {
        status: 'success',
        message: 'Backend and Supabase are working',
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
    // Ensure we return the actual database user record based on the JWT subject
    const auth0Sub = req.user?.sub;
    const email = req.user?.email;
    const user = await this.usersService.findOrCreateUser(auth0Sub, email);
    return {
      message: 'Current user data',
      jwtPayload: req.user,
      databaseUser: user,
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

  // Endpoint to ensure user exists in database (called after Auth0 signup)
  @Post('ensure-exists')
  @UseGuards(JwtAuthGuard)
  async ensureUserExists(@Req() req: any) {
    try {
      const auth0Sub = req.user.sub;
      const email = req.user.email; // Get email from JWT payload
      
      // Check if user already exists first
      const existingUser = await this.usersService.findByAuth0Sub(auth0Sub);
      const wasCreated = !existingUser;
      
      // Find or create user
      const user = await this.usersService.findOrCreateUser(auth0Sub, email);
      
      return {
        message: 'User ensured successfully',
        user,
        wasCreated,
      };
    } catch (error) {
      return {
        message: 'Error ensuring user exists',
        error: error.message,
      };
    }
  }

@Patch('profile') // Handles PATCH /api/users/profile
@UseGuards(JwtAuthGuard)
async updateProfile(@Req() req: any, @Body() updateProfileDto: UpdateProfileDto) {
  const auth0Sub = req.user.sub; // Get the user's ID from the validated JWT
  return this.usersService.updateUserProfile(auth0Sub, updateProfileDto);
}

}
