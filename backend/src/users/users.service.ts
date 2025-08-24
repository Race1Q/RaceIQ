import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export type UserRow = {
  id?: string;
  auth0_sub: string;
  username?: string | null;
  full_name?: string | null;
  favorite_constructor_id?: number | null;
};

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async findByAuth0Sub(auth0Sub: string): Promise<UserRow | null> {
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

  async createUser(auth0Sub: string): Promise<UserRow> {
    const newUser: Omit<UserRow, 'id'> = {
      auth0_sub: auth0Sub,
      username: null,
      full_name: null,
      favorite_constructor_id: null,
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

  async findOrCreateUser(auth0Sub: string): Promise<UserRow> {
    // First try to find existing user
    const existingUser = await this.findByAuth0Sub(auth0Sub);
    
    if (existingUser) {
      return existingUser;
    }

    // If user doesn't exist, create them
    return this.createUser(auth0Sub);
  }
}
