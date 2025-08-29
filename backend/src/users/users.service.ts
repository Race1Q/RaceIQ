import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async findByAuth0Sub(auth0Sub: string): Promise<User | null> {
    const { data, error } = await this.supabaseService.client
      .from('users')
      .select('*')
      .eq('auth0_sub', auth0Sub)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      this.logger.error(`Error finding user by auth0_sub: ${error.message}`, error);
      throw error;
    }

    return data;
  }

  async createUser(auth0Sub: string): Promise<User> {
    const newUser: Omit<User, 'id'> = {
      auth0_sub: auth0Sub,
      username: null,
      email: null,
      favorite_constructor_id: null,
      favorite_driver_id: null,
      role: 'user',
      created_at: new Date(),
    };

    const { data, error } = await this.supabaseService.client
      .from('users')
      .insert(newUser)
      .select()
      .single();

    if (error) {
      this.logger.error(`Error creating user: ${error.message}`, error);
      throw error;
    }

    this.logger.log(`Created new user with auth0_sub: ${auth0Sub}`);
    return data;
  }

  async findOrCreateUser(auth0Sub: string): Promise<User> {
    // First try to find existing user
    const existingUser = await this.findByAuth0Sub(auth0Sub);
    
    if (existingUser) {
      return existingUser;
    }

    // If user doesn't exist, create them
    return this.createUser(auth0Sub);
  }

  async updateUserProfile(auth0Sub: string, updateData: UpdateProfileDto): Promise<User> {
    const { data, error } = await this.supabaseService.client
      .from('users')
      .update({
        username: updateData.username,
        favorite_constructor_id: updateData.favorite_constructor_id,
        favorite_driver_id: updateData.favorite_driver_id,
      })
      .eq('auth0_sub', auth0Sub)
      .select()
      .single();

    if (error) {
      this.logger.error(`Error updating profile for ${auth0Sub}: ${error.message}`, error);
      throw error;
    }

    return data;
 }
}
