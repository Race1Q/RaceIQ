import { Controller, Get, Post, Body, UseGuards, Req, Patch } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Simple test endpoint to check if backend is working
  @ApiExcludeEndpoint()
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
  @ApiExcludeEndpoint()
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
  @ApiExcludeEndpoint()
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
  // Updated to use the new ensureExists method as specified in the prompt
  @ApiExcludeEndpoint()
  @Post('ensure-exists')
  @UseGuards(AuthGuard('jwt')) // This protects the endpoint
  async ensureUserExists(@Req() req): Promise<User> {
    const auth0User = req.user; // Auth0 user profile from the token
    
    // UPDATED: Read the email from the correct namespaced claim
    const email = auth0User['https://api.raceiq.dev/email'];
    
    const createUserDto: CreateUserDto = {
      auth0_sub: auth0User.sub,
      email: email, // Pass the correctly retrieved email
    };

    return this.usersService.ensureExists(createUserDto);
  }

}
