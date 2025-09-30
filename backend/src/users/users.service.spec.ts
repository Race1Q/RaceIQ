import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

// Mock the uuid import to avoid ES module issues
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid-1234-5678-9012-345678901234')
}));

// Mock the User entity
const mockUser = {
  id: 'user-123',
  auth0_sub: 'auth0|123456',
  username: 'testuser',
  email: 'test@example.com',
  favorite_driver_id: 1,
  favorite_constructor_id: 2,
  theme_preference: 'dark',
  created_at: new Date('2023-01-01')
};

// Mock the repository
const mockRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Structure', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should be an instance of UsersService', () => {
      expect(service).toBeInstanceOf(UsersService);
    });

    it('should have userRepository injected', () => {
      expect(service['userRepository']).toBeDefined();
    });

    it('should have userRepository instance', () => {
      expect(service['userRepository']).toBe(repository);
    });
  });

  describe('ensureExists method', () => {
    it('should return existing user if found', async () => {
      const createUserDto: CreateUserDto = {
        auth0_sub: 'auth0|123456',
        email: 'test@example.com'
      };

      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.ensureExists(createUserDto);

      expect(result).toBe(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { auth0_sub: 'auth0|123456' }
      });
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should create new user if not found', async () => {
      const createUserDto: CreateUserDto = {
        auth0_sub: 'auth0|123456',
        email: 'test@example.com'
      };

      const newUser = {
        ...mockUser,
        username: 'test'
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(newUser);
      mockRepository.save.mockResolvedValue(newUser);

      const result = await service.ensureExists(createUserDto);

      expect(result).toBe(newUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { auth0_sub: 'auth0|123456' }
      });
      expect(mockRepository.create).toHaveBeenCalledWith({
        auth0_sub: 'auth0|123456',
        email: 'test@example.com',
        username: 'test'
      });
      expect(mockRepository.save).toHaveBeenCalledWith(newUser);
    });

    it('should handle missing email in createUserDto', async () => {
      const createUserDto: CreateUserDto = {
        auth0_sub: 'auth0|123456',
        email: undefined as any
      };

      const newUser = {
        ...mockUser,
        username: 'auth0|123456'
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(newUser);
      mockRepository.save.mockResolvedValue(newUser);

      const result = await service.ensureExists(createUserDto);

      expect(result).toBe(newUser);
      expect(mockRepository.create).toHaveBeenCalledWith({
        auth0_sub: 'auth0|123456',
        email: undefined,
        username: 'auth0|123456'
      });
    });

    it('should handle null email in createUserDto', async () => {
      const createUserDto: CreateUserDto = {
        auth0_sub: 'auth0|123456',
        email: null as any
      };

      const newUser = {
        ...mockUser,
        username: 'auth0|123456'
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(newUser);
      mockRepository.save.mockResolvedValue(newUser);

      const result = await service.ensureExists(createUserDto);

      expect(result).toBe(newUser);
      expect(mockRepository.create).toHaveBeenCalledWith({
        auth0_sub: 'auth0|123456',
        email: null,
        username: 'auth0|123456'
      });
    });

    it('should handle empty email in createUserDto', async () => {
      const createUserDto: CreateUserDto = {
        auth0_sub: 'auth0|123456',
        email: ''
      };

      const newUser = {
        ...mockUser,
        username: 'auth0|123456'
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(newUser);
      mockRepository.save.mockResolvedValue(newUser);

      const result = await service.ensureExists(createUserDto);

      expect(result).toBe(newUser);
      expect(mockRepository.create).toHaveBeenCalledWith({
        auth0_sub: 'auth0|123456',
        email: '',
        username: 'auth0|123456'
      });
    });

    it('should handle repository errors', async () => {
      const createUserDto: CreateUserDto = {
        auth0_sub: 'auth0|123456',
        email: 'test@example.com'
      };

      mockRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.ensureExists(createUserDto)).rejects.toThrow('Database error');
    });

    it('should handle save errors', async () => {
      const createUserDto: CreateUserDto = {
        auth0_sub: 'auth0|123456',
        email: 'test@example.com'
      };

      const newUser = {
        ...mockUser,
        username: 'test'
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(newUser);
      mockRepository.save.mockRejectedValue(new Error('Save error'));

      await expect(service.ensureExists(createUserDto)).rejects.toThrow('Save error');
    });
  });

  describe('findOrCreateByAuth0Sub method', () => {
    it('should return existing user if found', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOrCreateByAuth0Sub('auth0|123456', 'test@example.com');

      expect(result).toBe(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { auth0_sub: 'auth0|123456' }
      });
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should create new user if not found', async () => {
      const newUser = {
        ...mockUser,
        username: 'test'
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(newUser);
      mockRepository.save.mockResolvedValue(newUser);

      const result = await service.findOrCreateByAuth0Sub('auth0|123456', 'test@example.com');

      expect(result).toBe(newUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { auth0_sub: 'auth0|123456' }
      });
      expect(mockRepository.create).toHaveBeenCalledWith({
        auth0_sub: 'auth0|123456',
        email: 'test@example.com',
        username: 'test'
      });
      expect(mockRepository.save).toHaveBeenCalledWith(newUser);
    });

    it('should handle missing email parameter', async () => {
      const newUser = {
        ...mockUser,
        username: undefined
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(newUser);
      mockRepository.save.mockResolvedValue(newUser);

      const result = await service.findOrCreateByAuth0Sub('auth0|123456');

      expect(result).toBe(newUser);
      expect(mockRepository.create).toHaveBeenCalledWith({
        auth0_sub: 'auth0|123456',
        email: undefined,
        username: undefined
      });
    });

    it('should handle null email parameter', async () => {
      const newUser = {
        ...mockUser,
        username: undefined
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(newUser);
      mockRepository.save.mockResolvedValue(newUser);

      const result = await service.findOrCreateByAuth0Sub('auth0|123456', null as any);

      expect(result).toBe(newUser);
      expect(mockRepository.create).toHaveBeenCalledWith({
        auth0_sub: 'auth0|123456',
        email: null,
        username: undefined
      });
    });

    it('should handle empty email parameter', async () => {
      const newUser = {
        ...mockUser,
        username: undefined
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(newUser);
      mockRepository.save.mockResolvedValue(newUser);

      const result = await service.findOrCreateByAuth0Sub('auth0|123456', '');

      expect(result).toBe(newUser);
      expect(mockRepository.create).toHaveBeenCalledWith({
        auth0_sub: 'auth0|123456',
        email: '',
        username: ''
      });
    });

    it('should handle repository errors', async () => {
      mockRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.findOrCreateByAuth0Sub('auth0|123456', 'test@example.com')).rejects.toThrow('Database error');
    });

    it('should handle save errors', async () => {
      const newUser = {
        ...mockUser,
        username: 'test'
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(newUser);
      mockRepository.save.mockRejectedValue(new Error('Save error'));

      await expect(service.findOrCreateByAuth0Sub('auth0|123456', 'test@example.com')).rejects.toThrow('Save error');
    });
  });

  describe('getProfile method', () => {
    it('should return user profile with relations', async () => {
      const userWithRelations = {
        ...mockUser,
        favoriteDriver: { id: 1, forename: 'Lewis', surname: 'Hamilton' },
        favoriteConstructor: { id: 2, name: 'Mercedes' }
      };

      mockRepository.findOne.mockResolvedValue(userWithRelations);

      const result = await service.getProfile('auth0|123456');

      expect(result).toBe(userWithRelations);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { auth0_sub: 'auth0|123456' },
        relations: ['favoriteDriver', 'favoriteConstructor']
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.getProfile('auth0|123456')).rejects.toThrow(NotFoundException);
      await expect(service.getProfile('auth0|123456')).rejects.toThrow('User profile not found.');
    });

    it('should handle different auth0_sub formats', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      await service.getProfile('google-oauth2|123456');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { auth0_sub: 'google-oauth2|123456' },
        relations: ['favoriteDriver', 'favoriteConstructor']
      });
    });

    it('should handle empty auth0_sub', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      await service.getProfile('');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { auth0_sub: '' },
        relations: ['favoriteDriver', 'favoriteConstructor']
      });
    });

    it('should handle null auth0_sub', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      await service.getProfile(null as any);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { auth0_sub: null },
        relations: ['favoriteDriver', 'favoriteConstructor']
      });
    });

    it('should handle repository errors', async () => {
      mockRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.getProfile('auth0|123456')).rejects.toThrow('Database error');
    });
  });

  describe('updateProfile method', () => {
    it('should update user profile successfully', async () => {
      const updateProfileDto: UpdateProfileDto = {
        username: 'updateduser',
        favorite_driver_id: 1,
        favorite_constructor_id: 2,
        theme_preference: 'light'
      };

      const updatedUser = {
        ...mockUser,
        username: 'updateduser',
        favorite_driver_id: 1,
        favorite_constructor_id: 2,
        theme_preference: 'light'
      };

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.updateProfile('auth0|123456', updateProfileDto);

      expect(result).toBe(updatedUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { auth0_sub: 'auth0|123456' }
      });
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        username: 'updateduser',
        favorite_driver_id: 1,
        favorite_constructor_id: 2,
        theme_preference: 'light'
      });
    });

    it('should handle partial profile updates', async () => {
      const updateProfileDto: UpdateProfileDto = {
        username: 'newusername'
      };

      const updatedUser = {
        ...mockUser,
        username: 'newusername'
      };

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.updateProfile('auth0|123456', updateProfileDto);

      expect(result).toBe(updatedUser);
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        username: 'newusername'
      });
    });

    it('should handle theme preference updates', async () => {
      const updateProfileDto: UpdateProfileDto = {
        theme_preference: 'light'
      };

      const updatedUser = {
        ...mockUser,
        theme_preference: 'light'
      };

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.updateProfile('auth0|123456', updateProfileDto);

      expect(result).toBe(updatedUser);
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        theme_preference: 'light'
      });
    });

    it('should handle favorite updates', async () => {
      const updateProfileDto: UpdateProfileDto = {
        favorite_driver_id: 3,
        favorite_constructor_id: 4
      };

      const updatedUser = {
        ...mockUser,
        favorite_driver_id: 3,
        favorite_constructor_id: 4
      };

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.updateProfile('auth0|123456', updateProfileDto);

      expect(result).toBe(updatedUser);
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        favorite_driver_id: 3,
        favorite_constructor_id: 4
      });
    });

    it('should handle empty update DTO', async () => {
      const updateProfileDto: UpdateProfileDto = {};

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      const result = await service.updateProfile('auth0|123456', updateProfileDto);

      expect(result).toBe(mockUser);
      expect(mockRepository.save).toHaveBeenCalledWith(mockUser);
    });

    it('should handle null update DTO', async () => {
      const updateProfileDto: UpdateProfileDto = null as any;

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      const result = await service.updateProfile('auth0|123456', updateProfileDto);

      expect(result).toBe(mockUser);
      expect(mockRepository.save).toHaveBeenCalledWith(mockUser);
    });

    it('should handle user not found during update', async () => {
      const updateProfileDto: UpdateProfileDto = {
        username: 'newusername'
      };

      const newUser = {
        ...mockUser,
        username: 'newusername'
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(newUser);
      mockRepository.save.mockResolvedValue(newUser);

      const result = await service.updateProfile('auth0|123456', updateProfileDto);

      expect(result).toBe(newUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { auth0_sub: 'auth0|123456' }
      });
      expect(mockRepository.create).toHaveBeenCalledWith({
        auth0_sub: 'auth0|123456',
        email: undefined,
        username: undefined
      });
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...newUser,
        username: 'newusername'
      });
    });

    it('should handle repository errors during update', async () => {
      const updateProfileDto: UpdateProfileDto = {
        username: 'newusername'
      };

      mockRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.updateProfile('auth0|123456', updateProfileDto)).rejects.toThrow('Database error');
    });

    it('should handle save errors during update', async () => {
      const updateProfileDto: UpdateProfileDto = {
        username: 'newusername'
      };

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockRejectedValue(new Error('Save error'));

      await expect(service.updateProfile('auth0|123456', updateProfileDto)).rejects.toThrow('Save error');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long auth0_sub', async () => {
      const longAuth0Sub = 'auth0|' + 'a'.repeat(1000);
      mockRepository.findOne.mockResolvedValue(mockUser);

      await service.getProfile(longAuth0Sub);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { auth0_sub: longAuth0Sub },
        relations: ['favoriteDriver', 'favoriteConstructor']
      });
    });

    it('should handle very long username in update', async () => {
      const longUsername = 'a'.repeat(1000);
      const updateProfileDto: UpdateProfileDto = {
        username: longUsername
      };

      const updatedUser = {
        ...mockUser,
        username: longUsername
      };

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.updateProfile('auth0|123456', updateProfileDto);

      expect(result).toBe(updatedUser);
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        username: longUsername
      });
    });

    it('should handle large number IDs in update', async () => {
      const updateProfileDto: UpdateProfileDto = {
        favorite_driver_id: Number.MAX_SAFE_INTEGER,
        favorite_constructor_id: Number.MAX_SAFE_INTEGER
      };

      const updatedUser = {
        ...mockUser,
        favorite_driver_id: Number.MAX_SAFE_INTEGER,
        favorite_constructor_id: Number.MAX_SAFE_INTEGER
      };

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.updateProfile('auth0|123456', updateProfileDto);

      expect(result).toBe(updatedUser);
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        favorite_driver_id: Number.MAX_SAFE_INTEGER,
        favorite_constructor_id: Number.MAX_SAFE_INTEGER
      });
    });

    it('should handle negative IDs in update', async () => {
      const updateProfileDto: UpdateProfileDto = {
        favorite_driver_id: -1,
        favorite_constructor_id: -1
      };

      const updatedUser = {
        ...mockUser,
        favorite_driver_id: -1,
        favorite_constructor_id: -1
      };

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.updateProfile('auth0|123456', updateProfileDto);

      expect(result).toBe(updatedUser);
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        favorite_driver_id: -1,
        favorite_constructor_id: -1
      });
    });

    it('should handle zero IDs in update', async () => {
      const updateProfileDto: UpdateProfileDto = {
        favorite_driver_id: 0,
        favorite_constructor_id: 0
      };

      const updatedUser = {
        ...mockUser,
        favorite_driver_id: 0,
        favorite_constructor_id: 0
      };

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.updateProfile('auth0|123456', updateProfileDto);

      expect(result).toBe(updatedUser);
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        favorite_driver_id: 0,
        favorite_constructor_id: 0
      });
    });

    it('should handle special characters in username', async () => {
      const specialUsername = 'user@#$%^&*()';
      const updateProfileDto: UpdateProfileDto = {
        username: specialUsername
      };

      const updatedUser = {
        ...mockUser,
        username: specialUsername
      };

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.updateProfile('auth0|123456', updateProfileDto);

      expect(result).toBe(updatedUser);
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        username: specialUsername
      });
    });

    it('should handle unicode characters in username', async () => {
      const unicodeUsername = '用户123';
      const updateProfileDto: UpdateProfileDto = {
        username: unicodeUsername
      };

      const updatedUser = {
        ...mockUser,
        username: unicodeUsername
      };

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.updateProfile('auth0|123456', updateProfileDto);

      expect(result).toBe(updatedUser);
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        username: unicodeUsername
      });
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle typical F1 fan profile creation', async () => {
      const createUserDto: CreateUserDto = {
        auth0_sub: 'auth0|507f1f77bcf86cd799439011',
        email: 'f1fan@example.com'
      };

      const newUser = {
        ...mockUser,
        auth0_sub: 'auth0|507f1f77bcf86cd799439011',
        email: 'f1fan@example.com',
        username: 'f1fan'
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(newUser);
      mockRepository.save.mockResolvedValue(newUser);

      const result = await service.ensureExists(createUserDto);

      expect(result).toBe(newUser);
      expect(mockRepository.create).toHaveBeenCalledWith({
        auth0_sub: 'auth0|507f1f77bcf86cd799439011',
        email: 'f1fan@example.com',
        username: 'f1fan'
      });
    });

    it('should handle Google OAuth user creation', async () => {
      const createUserDto: CreateUserDto = {
        auth0_sub: 'google-oauth2|123456789',
        email: 'user@gmail.com'
      };

      const newUser = {
        ...mockUser,
        auth0_sub: 'google-oauth2|123456789',
        email: 'user@gmail.com',
        username: 'user'
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(newUser);
      mockRepository.save.mockResolvedValue(newUser);

      const result = await service.ensureExists(createUserDto);

      expect(result).toBe(newUser);
      expect(mockRepository.create).toHaveBeenCalledWith({
        auth0_sub: 'google-oauth2|123456789',
        email: 'user@gmail.com',
        username: 'user'
      });
    });

    it('should handle profile update with all fields', async () => {
      const updateProfileDto: UpdateProfileDto = {
        username: 'f1fan2023',
        favorite_driver_id: 1,
        favorite_constructor_id: 2,
        theme_preference: 'dark'
      };

      const updatedUser = {
        ...mockUser,
        username: 'f1fan2023',
        favorite_driver_id: 1,
        favorite_constructor_id: 2,
        theme_preference: 'dark'
      };

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.updateProfile('auth0|123456', updateProfileDto);

      expect(result).toBe(updatedUser);
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        username: 'f1fan2023',
        favorite_driver_id: 1,
        favorite_constructor_id: 2,
        theme_preference: 'dark'
      });
    });

    it('should handle profile retrieval with relations', async () => {
      const userWithRelations = {
        ...mockUser,
        favoriteDriver: {
          id: 1,
          forename: 'Lewis',
          surname: 'Hamilton',
          nationality: 'British'
        },
        favoriteConstructor: {
          id: 2,
          name: 'Mercedes',
          nationality: 'German'
        }
      };

      mockRepository.findOne.mockResolvedValue(userWithRelations);

      const result = await service.getProfile('auth0|123456');

      expect(result).toBe(userWithRelations);
      expect(result.favoriteDriver).toBeDefined();
      expect(result.favoriteConstructor).toBeDefined();
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle multiple rapid calls', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const promises = Array(10).fill(null).map(() => 
        service.getProfile('auth0|123456')
      );

      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result).toBe(mockUser);
      });
      expect(mockRepository.findOne).toHaveBeenCalledTimes(10);
    });

    it('should handle concurrent updates', async () => {
      const updateProfileDto: UpdateProfileDto = {
        username: 'concurrentuser'
      };

      const updatedUser = {
        ...mockUser,
        username: 'concurrentuser'
      };

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const promises = Array(5).fill(null).map(() => 
        service.updateProfile('auth0|123456', updateProfileDto)
      );

      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result).toBe(updatedUser);
      });
      expect(mockRepository.findOne).toHaveBeenCalledTimes(5);
      expect(mockRepository.save).toHaveBeenCalledTimes(5);
    });

    it('should handle mixed operations', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      const promises = [
        service.getProfile('auth0|123456'),
        service.updateProfile('auth0|123456', { username: 'test' }),
        service.getProfile('auth0|123456'),
        service.updateProfile('auth0|123456', { theme_preference: 'light' })
      ];

      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result).toBe(mockUser);
      });
      expect(mockRepository.findOne).toHaveBeenCalledTimes(4);
      expect(mockRepository.save).toHaveBeenCalledTimes(2);
    });
  });
});
