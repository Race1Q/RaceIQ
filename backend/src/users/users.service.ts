import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(public readonly supabaseService: SupabaseService) {}

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

    return data as User;
  }

  async createUser(auth0Sub: string, email?: string): Promise<User> {
    try {
      this.logger.log(`Attempting to create user with auth0_sub: ${auth0Sub}, email: ${email}`);
      
      const newUser: Omit<User, 'id'> = {
        auth0_sub: auth0Sub,
        username: null,
        email: email || null,
        favorite_constructor_id: null,
        favorite_driver_id: null,
        role: 'user',
        created_at: new Date(),
      };

      this.logger.log(`Inserting user data: ${JSON.stringify(newUser)}`);

      const { data, error } = await this.supabaseService.client
        .from('users')
        .insert(newUser)
        .select()
        .single();

      if (error) {
        this.logger.error(`Error creating user: ${error.message}`, error);
        throw error;
      }

      this.logger.log(`Successfully created new user with auth0_sub: ${auth0Sub}`);
      return data as User;
    } catch (error) {
      this.logger.error(`Failed to create user for auth0_sub: ${auth0Sub}`, error);
      throw error;
    }
  }

  async findOrCreateUser(auth0Sub: string, email?: string): Promise<User> {
    try {
      this.logger.log(`findOrCreateUser called for auth0_sub: ${auth0Sub}, email: ${email}`);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Database operation timed out after 10 seconds')), 10000);
      });
      
      // First try to find existing user
      this.logger.log(`Searching for existing user with auth0_sub: ${auth0Sub}`);
      const existingUser = await Promise.race([
        this.findByAuth0Sub(auth0Sub),
        timeoutPromise
      ]);
      
      if (existingUser) {
        this.logger.log(`Found existing user for auth0_sub: ${auth0Sub}`);
        return existingUser;
      }

      this.logger.log(`No existing user found for auth0_sub: ${auth0Sub}, creating new user`);
      
      // If user doesn't exist, create them
      const newUser = await Promise.race([
        this.createUser(auth0Sub, email),
        timeoutPromise
      ]);
      
      this.logger.log(`Successfully created new user for auth0_sub: ${auth0Sub}`);
      return newUser;
    } catch (error) {
      this.logger.error(`Error in findOrCreateUser for auth0_sub: ${auth0Sub}`, error);
      throw error;
    }
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

    return data as User;
 }
}
