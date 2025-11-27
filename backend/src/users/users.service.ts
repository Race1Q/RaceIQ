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

  async getProfile(auth0_sub: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { auth0_sub },
      relations: ['favoriteDriver', 'favoriteConstructor'],
    });

    if (!user) {
      // This case is unlikely if findOrCreate is called on every login
      throw new NotFoundException('User profile not found.');
    }
    return user;
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
