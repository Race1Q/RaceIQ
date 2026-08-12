import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // This is the core "find or create" logic as specified in the prompt
  async ensureExists(createUserDto: CreateUserDto): Promise<User> {
    const { auth0_sub, email } = createUserDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { auth0_sub },
    });

    if (existingUser) {
      return existingUser;
    }

    // If not, create a new user
    // This check makes our service resilient.
    const username = email ? email.split('@')[0] : auth0_sub;

    const newUser = this.userRepository.create({
      auth0_sub,
      email,
      username,
    });

    return this.userRepository.save(newUser);
  }

  // This method gets a user, or creates them if they don't exist
  async findOrCreateByAuth0Sub(
    auth0_sub: string,
    email?: string,
  ): Promise<User> {
    let user = await this.userRepository.findOne({ where: { auth0_sub } });

    if (!user) {
      const newUser = this.userRepository.create({
        auth0_sub,
        email,
        username: email?.split('@')[0], // Set a default username
      });
      user = await this.userRepository.save(newUser);
    }

    return user;
  }

  async getProfile(auth0_sub: string, email?: string): Promise<User> {
    const loadWithRelations = () =>
      this.userRepository.findOne({
        where: { auth0_sub },
        relations: ['favoriteDriver', 'favoriteConstructor'],
      });

    const user = await loadWithRelations();
    if (user) {
      return user;
    }

    // A valid Auth0 session can reach this endpoint before POST /users/ensure-exists
    // has finished (the frontend fires both on mount), or after it failed outright.
    // Create the row here instead of 404ing a session we just authenticated.
    // Concurrent callers race on the unique auth0_sub index; if our insert loses,
    // the winner's row is already committed, so re-read either way.
    try {
      await this.ensureExists({ auth0_sub, email });
    } catch {
      // Fall through to the re-read below.
    }

    const created = await loadWithRelations();
    if (!created) {
      throw new NotFoundException('User profile not found.');
    }
    return created;
  }

  async updateProfile(
    auth0_sub: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    // We use findOrCreate to ensure the user exists before updating
    const user = await this.findOrCreateByAuth0Sub(auth0_sub);

    // Merge the new data and save
    Object.assign(user, updateProfileDto);
    return this.userRepository.save(user);
  }
}
