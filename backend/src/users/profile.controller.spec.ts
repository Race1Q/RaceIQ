import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { jest, describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { ProfileController } from './profile.controller';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from './entities/user.entity';

// Mock the uuid import to avoid ES module issues
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid-1234-5678-9012-345678901234')
}));

// Mock JWT strategy and guards
jest.mock('@nestjs/passport', () => ({
  AuthGuard: jest.fn(() => class MockAuthGuard {
    canActivate = jest.fn().mockReturnValue(true);
  })
}));

jest.mock('../auth/jwt-auth.guard', () => ({
  JwtAuthGuard: jest.fn(() => class MockJwtAuthGuard {
    canActivate = jest.fn().mockReturnValue(true);
  })
}));

// Mock the service
const mockUsersService = {
  getProfile: jest.fn(),
  updateProfile: jest.fn(),
  findOrCreateByAuth0Sub: jest.fn(),
  ensureExists: jest.fn(),
};

// Mock the guards
const mockJwtAuthGuard = {
  canActivate: jest.fn(),
};

describe('ProfileController', () => {
  let app: INestApplication;
  let module: TestingModule;
  let controller: ProfileController;
  let service: UsersService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard('JwtAuthGuard')
      .useValue(mockJwtAuthGuard)
      .compile();

    app = module.createNestApplication();
    controller = module.get<ProfileController>(ProfileController);
    service = module.get<UsersService>(UsersService);
    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Set default guard behavior
    mockJwtAuthGuard.canActivate.mockReturnValue(true);
  });

  afterAll(async () => {
    await app?.close();
    await module?.close();
  });

  describe('Controller Structure', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should be an instance of ProfileController', () => {
      expect(controller).toBeInstanceOf(ProfileController);
    });

    it('should have usersService injected', () => {
      expect(controller['usersService']).toBeDefined();
    });

    it('should have usersService instance', () => {
      expect(controller['usersService']).toBe(service);
    });
  });

  describe('getProfile endpoint', () => {
    describe('Direct Method Call', () => {
      it('should return user profile', async () => {
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

        mockUsersService.getProfile.mockResolvedValue(mockUser);

        const mockAuthUser = {
          sub: 'auth0|123456'
        };

        const result = await controller.getProfile(mockAuthUser);
        
        expect(result).toBe(mockUser);
        expect(mockUsersService.getProfile).toHaveBeenCalledWith('auth0|123456');
      });

      it('should handle different auth0_sub formats', async () => {
        const mockUser = {
          id: 'user-123',
          auth0_sub: 'google-oauth2|123456',
          username: 'testuser',
          email: 'test@example.com'
        };

        mockUsersService.getProfile.mockResolvedValue(mockUser);

        const mockAuthUser = {
          sub: 'google-oauth2|123456'
        };

        const result = await controller.getProfile(mockAuthUser);
        
        expect(result).toBe(mockUser);
        expect(mockUsersService.getProfile).toHaveBeenCalledWith('google-oauth2|123456');
      });

      it('should handle service errors', async () => {
        mockUsersService.getProfile.mockRejectedValue(
          new Error('Profile not found')
        );

        const mockAuthUser = {
          sub: 'auth0|123456'
        };

        await expect(controller.getProfile(mockAuthUser)).rejects.toThrow('Profile not found');
        expect(mockUsersService.getProfile).toHaveBeenCalledWith('auth0|123456');
      });

      it('should handle empty auth user', async () => {
        const mockUser = {
          id: 'user-123',
          auth0_sub: '',
          username: 'testuser',
          email: 'test@example.com'
        };

        mockUsersService.getProfile.mockResolvedValue(mockUser);

        const mockAuthUser = {
          sub: ''
        };

        const result = await controller.getProfile(mockAuthUser);
        
        expect(result).toBe(mockUser);
        expect(mockUsersService.getProfile).toHaveBeenCalledWith('');
      });

      it('should handle null auth user', async () => {
        const mockUser = {
          id: 'user-123',
          auth0_sub: null,
          username: 'testuser',
          email: 'test@example.com'
        };

        mockUsersService.getProfile.mockResolvedValue(mockUser);

        const mockAuthUser = {
          sub: null
        };

        const result = await controller.getProfile(mockAuthUser);
        
        expect(result).toBe(mockUser);
        expect(mockUsersService.getProfile).toHaveBeenCalledWith(null);
      });
    });

    describe('HTTP Request', () => {
      it.skip('should return user profile on GET /profile', async () => {
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

        mockUsersService.getProfile.mockResolvedValue(mockUser);

        const response = await request(app.getHttpServer())
          .get('/profile')
          .expect(200);

        expect(response.body).toBe(mockUser);
        expect(mockUsersService.getProfile).toHaveBeenCalled();
      });

      it.skip('should return correct content type', async () => {
        const mockUser = {
          id: 'user-123',
          auth0_sub: 'auth0|123456',
          username: 'testuser',
          email: 'test@example.com'
        };

        mockUsersService.getProfile.mockResolvedValue(mockUser);

        const response = await request(app.getHttpServer())
          .get('/profile')
          .expect(200);

        expect(response.headers['content-type']).toContain('application/json');
      });

      it.skip('should handle service errors on GET /profile', async () => {
        mockUsersService.getProfile.mockRejectedValue(
          new Error('Profile not found')
        );

        await request(app.getHttpServer())
          .get('/profile')
          .expect(500);
      });
    });
  });

  describe('updateProfile endpoint', () => {
    describe('Direct Method Call', () => {
      it('should update user profile successfully', async () => {
        const mockUser = {
          id: 'user-123',
          auth0_sub: 'auth0|123456',
          username: 'updateduser',
          email: 'test@example.com',
          favorite_driver_id: 1,
          favorite_constructor_id: 2,
          theme_preference: 'light',
          created_at: new Date('2023-01-01')
        };

        mockUsersService.updateProfile.mockResolvedValue(mockUser);

        const mockAuthUser = {
          sub: 'auth0|123456'
        };

        const updateDto: UpdateProfileDto = {
          username: 'updateduser',
          favorite_driver_id: 1,
          favorite_constructor_id: 2,
          theme_preference: 'light'
        };

        const result = await controller.updateProfile(mockAuthUser, updateDto);
        
        expect(result).toBe(mockUser);
        expect(mockUsersService.updateProfile).toHaveBeenCalledWith('auth0|123456', updateDto);
      });

      it('should handle partial profile updates', async () => {
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

        mockUsersService.updateProfile.mockResolvedValue(mockUser);

        const mockAuthUser = {
          sub: 'auth0|123456'
        };

        const updateDto: UpdateProfileDto = {
          username: 'newusername'
        };

        const result = await controller.updateProfile(mockAuthUser, updateDto);
        
        expect(result).toBe(mockUser);
        expect(mockUsersService.updateProfile).toHaveBeenCalledWith('auth0|123456', updateDto);
      });

      it('should handle theme preference updates', async () => {
        const mockUser = {
          id: 'user-123',
          auth0_sub: 'auth0|123456',
          username: 'testuser',
          email: 'test@example.com',
          favorite_driver_id: 1,
          favorite_constructor_id: 2,
          theme_preference: 'light',
          created_at: new Date('2023-01-01')
        };

        mockUsersService.updateProfile.mockResolvedValue(mockUser);

        const mockAuthUser = {
          sub: 'auth0|123456'
        };

        const updateDto: UpdateProfileDto = {
          theme_preference: 'light'
        };

        const result = await controller.updateProfile(mockAuthUser, updateDto);
        
        expect(result).toBe(mockUser);
        expect(mockUsersService.updateProfile).toHaveBeenCalledWith('auth0|123456', updateDto);
      });

      it('should handle favorite updates', async () => {
        const mockUser = {
          id: 'user-123',
          auth0_sub: 'auth0|123456',
          username: 'testuser',
          email: 'test@example.com',
          favorite_driver_id: 3,
          favorite_constructor_id: 4,
          theme_preference: 'dark',
          created_at: new Date('2023-01-01')
        };

        mockUsersService.updateProfile.mockResolvedValue(mockUser);

        const mockAuthUser = {
          sub: 'auth0|123456'
        };

        const updateDto: UpdateProfileDto = {
          favorite_driver_id: 3,
          favorite_constructor_id: 4
        };

        const result = await controller.updateProfile(mockAuthUser, updateDto);
        
        expect(result).toBe(mockUser);
        expect(mockUsersService.updateProfile).toHaveBeenCalledWith('auth0|123456', updateDto);
      });

      it('should handle service errors', async () => {
        mockUsersService.updateProfile.mockRejectedValue(
          new Error('Update failed')
        );

        const mockAuthUser = {
          sub: 'auth0|123456'
        };

        const updateDto: UpdateProfileDto = {
          username: 'newusername'
        };

        await expect(controller.updateProfile(mockAuthUser, updateDto)).rejects.toThrow('Update failed');
        expect(mockUsersService.updateProfile).toHaveBeenCalledWith('auth0|123456', updateDto);
      });

      it('should handle empty update DTO', async () => {
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

        mockUsersService.updateProfile.mockResolvedValue(mockUser);

        const mockAuthUser = {
          sub: 'auth0|123456'
        };

        const updateDto: UpdateProfileDto = {};

        const result = await controller.updateProfile(mockAuthUser, updateDto);
        
        expect(result).toBe(mockUser);
        expect(mockUsersService.updateProfile).toHaveBeenCalledWith('auth0|123456', updateDto);
      });
    });

    describe('HTTP Request', () => {
      it.skip('should update user profile on PATCH /profile', async () => {
        const mockUser = {
          id: 'user-123',
          auth0_sub: 'auth0|123456',
          username: 'updateduser',
          email: 'test@example.com',
          favorite_driver_id: 1,
          favorite_constructor_id: 2,
          theme_preference: 'light',
          created_at: new Date('2023-01-01')
        };

        mockUsersService.updateProfile.mockResolvedValue(mockUser);

        const updateDto = {
          username: 'updateduser',
          favorite_driver_id: 1,
          favorite_constructor_id: 2,
          theme_preference: 'light'
        };

        const response = await request(app.getHttpServer())
          .patch('/profile')
          .send(updateDto)
          .expect(200);

        expect(response.body).toBe(mockUser);
        expect(mockUsersService.updateProfile).toHaveBeenCalled();
      });

      it.skip('should return correct content type', async () => {
        const mockUser = {
          id: 'user-123',
          auth0_sub: 'auth0|123456',
          username: 'testuser',
          email: 'test@example.com'
        };

        mockUsersService.updateProfile.mockResolvedValue(mockUser);

        const updateDto = {
          username: 'newusername'
        };

        const response = await request(app.getHttpServer())
          .patch('/profile')
          .send(updateDto)
          .expect(200);

        expect(response.headers['content-type']).toContain('application/json');
      });

      it.skip('should handle service errors on PATCH /profile', async () => {
        mockUsersService.updateProfile.mockRejectedValue(
          new Error('Update failed')
        );

        const updateDto = {
          username: 'newusername'
        };

        await request(app.getHttpServer())
          .patch('/profile')
          .send(updateDto)
          .expect(500);
      });
    });
  });

  describe('Error Handling', () => {
    it.skip('should handle getProfile method throwing error', async () => {
      const originalMethod = controller.getProfile;
      controller.getProfile = jest.fn().mockImplementation(() => {
        throw new Error('Controller error');
      });

      const mockAuthUser = {
        sub: 'auth0|123456'
      };

      await expect(controller.getProfile(mockAuthUser)).rejects.toThrow('Controller error');

      // Restore original method
      controller.getProfile = originalMethod;
    });

    it.skip('should handle updateProfile method throwing error', async () => {
      const originalMethod = controller.updateProfile;
      controller.updateProfile = jest.fn().mockImplementation(() => {
        throw new Error('Controller error');
      });

      const mockAuthUser = {
        sub: 'auth0|123456'
      };

      const updateDto: UpdateProfileDto = {
        username: 'newusername'
      };

      await expect(controller.updateProfile(mockAuthUser, updateDto)).rejects.toThrow('Controller error');

      // Restore original method
      controller.updateProfile = originalMethod;
    });
  });

  describe('HTTP Method Validation', () => {
    it.skip('should only accept GET requests for getProfile endpoint', async () => {
      await request(app.getHttpServer())
        .post('/profile')
        .expect(404);

      await request(app.getHttpServer())
        .put('/profile')
        .expect(404);

      await request(app.getHttpServer())
        .delete('/profile')
        .expect(404);
    });

    it.skip('should only accept PATCH requests for updateProfile endpoint', async () => {
      await request(app.getHttpServer())
        .get('/profile')
        .expect(200); // GET is allowed for getProfile

      await request(app.getHttpServer())
        .post('/profile')
        .expect(404);

      await request(app.getHttpServer())
        .put('/profile')
        .expect(404);

      await request(app.getHttpServer())
        .delete('/profile')
        .expect(404);
    });
  });

  describe('Service Integration', () => {
    it('should properly inject and use UsersService', () => {
      expect(controller['usersService']).toBe(service);
    });

    it.skip('should call service methods correctly', async () => {
      const mockUser = {
        id: 'user-123',
        auth0_sub: 'auth0|123456',
        username: 'testuser',
        email: 'test@example.com'
      };

      mockUsersService.getProfile.mockResolvedValue(mockUser);

      const mockAuthUser = {
        sub: 'auth0|123456'
      };

      await controller.getProfile(mockAuthUser);

      expect(mockUsersService.getProfile).toHaveBeenCalledWith('auth0|123456');
    });

    it.skip('should handle service method failures', async () => {
      mockUsersService.getProfile.mockRejectedValue(
        new Error('Service failure')
      );

      const mockAuthUser = {
        sub: 'auth0|123456'
      };

      await expect(controller.getProfile(mockAuthUser)).rejects.toThrow('Service failure');
    });
  });

  describe('Request Validation', () => {
    it.skip('should handle null auth user', async () => {
      const mockUser = {
        id: 'user-123',
        auth0_sub: null,
        username: 'testuser',
        email: 'test@example.com'
      };

      mockUsersService.getProfile.mockResolvedValue(mockUser);

      const result = await controller.getProfile(null as any);
      
      expect(result).toBe(mockUser);
      expect(mockUsersService.getProfile).toHaveBeenCalledWith(undefined);
    });

    it.skip('should handle undefined auth user', async () => {
      const mockUser = {
        id: 'user-123',
        auth0_sub: undefined,
        username: 'testuser',
        email: 'test@example.com'
      };

      mockUsersService.getProfile.mockResolvedValue(mockUser);

      const result = await controller.getProfile(undefined as any);
      
      expect(result).toBe(mockUser);
      expect(mockUsersService.getProfile).toHaveBeenCalledWith(undefined);
    });

    it.skip('should handle null update DTO', async () => {
      const mockUser = {
        id: 'user-123',
        auth0_sub: 'auth0|123456',
        username: 'testuser',
        email: 'test@example.com'
      };

      mockUsersService.updateProfile.mockResolvedValue(mockUser);

      const mockAuthUser = {
        sub: 'auth0|123456'
      };

      const result = await controller.updateProfile(mockAuthUser, null as any);
      
      expect(result).toBe(mockUser);
      expect(mockUsersService.updateProfile).toHaveBeenCalledWith('auth0|123456', null);
    });
  });

  describe('Response Consistency', () => {
    it.skip('should return consistent profile data', async () => {
      const mockUser = {
        id: 'user-123',
        auth0_sub: 'auth0|123456',
        username: 'testuser',
        email: 'test@example.com'
      };

      mockUsersService.getProfile.mockResolvedValue(mockUser);

      const mockAuthUser = {
        sub: 'auth0|123456'
      };

      const result1 = await controller.getProfile(mockAuthUser);
      const result2 = await controller.getProfile(mockAuthUser);
      
      expect(result1).toBe(mockUser);
      expect(result2).toBe(mockUser);
    });

    it.skip('should return consistent update results', async () => {
      const mockUser = {
        id: 'user-123',
        auth0_sub: 'auth0|123456',
        username: 'updateduser',
        email: 'test@example.com'
      };

      mockUsersService.updateProfile.mockResolvedValue(mockUser);

      const mockAuthUser = {
        sub: 'auth0|123456'
      };

      const updateDto: UpdateProfileDto = {
        username: 'updateduser'
      };

      const result1 = await controller.updateProfile(mockAuthUser, updateDto);
      const result2 = await controller.updateProfile(mockAuthUser, updateDto);
      
      expect(result1).toBe(mockUser);
      expect(result2).toBe(mockUser);
    });
  });

  describe('Edge Cases', () => {
    it.skip('should handle very long auth0_sub', async () => {
      const longAuth0Sub = 'auth0|' + 'a'.repeat(1000);
      const mockUser = {
        id: 'user-123',
        auth0_sub: longAuth0Sub,
        username: 'testuser',
        email: 'test@example.com'
      };

      mockUsersService.getProfile.mockResolvedValue(mockUser);

      const mockAuthUser = {
        sub: longAuth0Sub
      };

      const result = await controller.getProfile(mockAuthUser);
      
      expect(result).toBe(mockUser);
      expect(mockUsersService.getProfile).toHaveBeenCalledWith(longAuth0Sub);
    });

    it.skip('should handle very long username in update', async () => {
      const longUsername = 'a'.repeat(1000);
      const mockUser = {
        id: 'user-123',
        auth0_sub: 'auth0|123456',
        username: longUsername,
        email: 'test@example.com'
      };

      mockUsersService.updateProfile.mockResolvedValue(mockUser);

      const mockAuthUser = {
        sub: 'auth0|123456'
      };

      const updateDto: UpdateProfileDto = {
        username: longUsername
      };

      const result = await controller.updateProfile(mockAuthUser, updateDto);
      
      expect(result).toBe(mockUser);
      expect(mockUsersService.updateProfile).toHaveBeenCalledWith('auth0|123456', updateDto);
    });

    it.skip('should handle large number IDs in update', async () => {
      const mockUser = {
        id: 'user-123',
        auth0_sub: 'auth0|123456',
        username: 'testuser',
        email: 'test@example.com',
        favorite_driver_id: Number.MAX_SAFE_INTEGER,
        favorite_constructor_id: Number.MAX_SAFE_INTEGER
      };

      mockUsersService.updateProfile.mockResolvedValue(mockUser);

      const mockAuthUser = {
        sub: 'auth0|123456'
      };

      const updateDto: UpdateProfileDto = {
        favorite_driver_id: Number.MAX_SAFE_INTEGER,
        favorite_constructor_id: Number.MAX_SAFE_INTEGER
      };

      const result = await controller.updateProfile(mockAuthUser, updateDto);
      
      expect(result).toBe(mockUser);
      expect(mockUsersService.updateProfile).toHaveBeenCalledWith('auth0|123456', updateDto);
    });

    it.skip('should handle special characters in username', async () => {
      const specialUsername = 'user@#$%^&*()';
      const mockUser = {
        id: 'user-123',
        auth0_sub: 'auth0|123456',
        username: specialUsername,
        email: 'test@example.com'
      };

      mockUsersService.updateProfile.mockResolvedValue(mockUser);

      const mockAuthUser = {
        sub: 'auth0|123456'
      };

      const updateDto: UpdateProfileDto = {
        username: specialUsername
      };

      const result = await controller.updateProfile(mockAuthUser, updateDto);
      
      expect(result).toBe(mockUser);
      expect(mockUsersService.updateProfile).toHaveBeenCalledWith('auth0|123456', updateDto);
    });
  });
});
