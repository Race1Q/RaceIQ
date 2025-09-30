import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { jest, describe, it, expect, beforeEach, beforeAll } from '@jest/globals';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { UsersService } from '../users/users.service';

// Mock uuid to prevent ES module issues
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mock-uuid')
}));

// Mock typeorm to prevent decorator issues
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: jest.fn().mockImplementation(() => (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) => {}),
  TypeOrmModule: {
    forFeature: jest.fn()
  }
}));

// Mock user entity to prevent import issues
jest.mock('../users/entities/user.entity', () => ({
  User: class MockUser {}
}));

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn() as jest.MockedFunction<any>
  })
}));

// Mock ConfigService
jest.mock('@nestjs/config', () => ({
  ConfigService: class MockConfigService {
    get() { return undefined; }
  }
}));

// Mock auth module
jest.mock('../auth/auth.module', () => ({
  AuthModule: 'mock-auth-module'
}));

// Mock auth guard
jest.mock('../auth/jwt-auth.guard', () => ({
  JwtAuthGuard: class MockJwtAuthGuard {
    canActivate() { return true; }
  }
}));

// Mock auth decorator
jest.mock('../auth/auth-user.decorator', () => ({
  AuthUser: () => (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) => {}
}));

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let module: TestingModule;
  let notificationsService: any;
  let usersService: any;
  
  const mockNotificationsService = {
    sendRaceUpdateEmail: jest.fn() as jest.MockedFunction<any>,
  };

  const mockUsersService = {
    getProfile: jest.fn() as jest.MockedFunction<any>,
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    notificationsService = module.get<NotificationsService>(NotificationsService);
    usersService = module.get<UsersService>(UsersService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default mock behavior
    mockUsersService.getProfile.mockResolvedValue({ 
      email: 'user@example.com' 
    });
    mockNotificationsService.sendRaceUpdateEmail.mockResolvedValue({ 
      success: true, 
      status: 200, 
      data: { mock: true } 
    });
  });

  describe('Service Structure', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should be an instance of NotificationsController', () => {
      expect(controller).toBeInstanceOf(NotificationsController);
    });

    it('should have notificationsService injected', () => {
      expect(controller['notificationsService']).toBeDefined();
    });

    it('should have usersService injected', () => {
      expect(controller['usersService']).toBeDefined();
    });
  });

  describe('sendRaceUpdate method', () => {
    const mockAuthUser = { sub: 'test-user-id' };

    describe('Validation', () => {
      it('should throw 400 when body is empty', async () => {
        await expect(controller.sendRaceUpdate(mockAuthUser, {} as any))
          .rejects
          .toThrow(new HttpException('raceDetails is required', HttpStatus.BAD_REQUEST));
      });

      it('should throw 400 when raceDetails is missing', async () => {
        await expect(controller.sendRaceUpdate(mockAuthUser, { otherField: 'some value' } as any))
          .rejects
          .toThrow(new HttpException('raceDetails is required', HttpStatus.BAD_REQUEST));
      });

      it('should throw 400 when raceDetails is empty string', async () => {
        await expect(controller.sendRaceUpdate(mockAuthUser, { raceDetails: '' }))
          .rejects
          .toThrow(new HttpException('raceDetails is required', HttpStatus.BAD_REQUEST));
      });

      it('should throw 400 when raceDetails is null', async () => {
        await expect(controller.sendRaceUpdate(mockAuthUser, { raceDetails: null as any }))
          .rejects
          .toThrow(new HttpException('raceDetails is required', HttpStatus.BAD_REQUEST));
      });

      it('should throw 400 when user has no email on file', async () => {
        mockUsersService.getProfile.mockResolvedValue({ email: null });

        await expect(controller.sendRaceUpdate(mockAuthUser, { raceDetails: 'Race details here' }))
          .rejects
          .toThrow(new HttpException('No email on file for user', HttpStatus.BAD_REQUEST));
      });

      it('should throw 400 when user profile has empty email', async () => {
        mockUsersService.getProfile.mockResolvedValue({ email: '' });

        await expect(controller.sendRaceUpdate(mockAuthUser, { raceDetails: 'Race details here' }))
          .rejects
          .toThrow(new HttpException('No email on file for user', HttpStatus.BAD_REQUEST));
      });
    });

    describe('Success Cases', () => {
      it('should return success response when service returns success', async () => {
        mockNotificationsService.sendRaceUpdateEmail.mockResolvedValue({ 
          success: true, 
          status: 202, 
          data: { ok: true } 
        });

        const result = await controller.sendRaceUpdate(mockAuthUser, { raceDetails: 'Race starts at 2PM' });

        expect(result).toEqual({
          message: 'Race update email sent',
          status: 202,
          data: { ok: true }
        });
      });

      it('should return success response with different status codes from service', async () => {
        mockNotificationsService.sendRaceUpdateEmail.mockResolvedValue({ 
          success: true, 
          status: 200, 
          data: { message: 'Email sent successfully' } 
        });

        const result = await controller.sendRaceUpdate(mockAuthUser, { raceDetails: 'Monaco GP starting soon' });

        expect(result).toEqual({
          message: 'Race update email sent',
          status: 200,
          data: { message: 'Email sent successfully' }
        });
      });

      it('should call services with correct parameters', async () => {
        mockUsersService.getProfile.mockResolvedValue({ 
          email: 'driver@f1.com' 
        });
        mockNotificationsService.sendRaceUpdateEmail.mockResolvedValue({ 
          success: true, 
          status: 201, 
          data: { sent: true } 
        });

        await controller.sendRaceUpdate(mockAuthUser, { raceDetails: 'Qualifying results are in' });

        expect(mockUsersService.getProfile).toHaveBeenCalledWith('test-user-id');
        expect(mockNotificationsService.sendRaceUpdateEmail).toHaveBeenCalledWith(
          'driver@f1.com',
          'Qualifying results are in'
        );
        expect(mockNotificationsService.sendRaceUpdateEmail).toHaveBeenCalledTimes(1);
      });
    });

    describe('Error Cases', () => {
      it('should throw error with correct status when service fails', async () => {
        mockNotificationsService.sendRaceUpdateEmail.mockResolvedValue({ 
          success: false, 
          status: 502, 
          data: { message: 'Service unavailable' } 
        });

        await expect(controller.sendRaceUpdate(mockAuthUser, { raceDetails: 'Race cancelled' }))
          .rejects
          .toThrow(new HttpException({ message: 'Service unavailable' }, 502));
      });

      it('should handle service failure without data', async () => {
        mockNotificationsService.sendRaceUpdateEmail.mockResolvedValue({ 
          success: false, 
          status: 500 
        });

        await expect(controller.sendRaceUpdate(mockAuthUser, { raceDetails: 'Race postponed' }))
          .rejects
          .toThrow(new HttpException('Failed to send email', 500));
      });

      it('should handle different error status codes', async () => {
        mockNotificationsService.sendRaceUpdateEmail.mockResolvedValue({ 
          success: false, 
          status: 503, 
          data: { error: 'Temporary failure' } 
        });

        await expect(controller.sendRaceUpdate(mockAuthUser, { raceDetails: 'Race delayed' }))
          .rejects
          .toThrow(new HttpException({ error: 'Temporary failure' }, 503));
      });

      it('should handle service failure with custom error message', async () => {
        mockNotificationsService.sendRaceUpdateEmail.mockResolvedValue({ 
          success: false, 
          status: 429, 
          data: { message: 'Rate limit exceeded' } 
        });

        await expect(controller.sendRaceUpdate(mockAuthUser, { raceDetails: 'Too many requests' }))
          .rejects
          .toThrow(new HttpException({ message: 'Rate limit exceeded' }, 429));
      });

      it('should handle users service errors', async () => {
        mockUsersService.getProfile.mockRejectedValue(new Error('User not found'));

        await expect(controller.sendRaceUpdate(mockAuthUser, { raceDetails: 'Race details' }))
          .rejects
          .toThrow('User not found');
      });
    });

    describe('Edge Cases', () => {
      it('should handle very long race details', async () => {
        const longDetails = 'A'.repeat(1000);
        mockNotificationsService.sendRaceUpdateEmail.mockResolvedValue({ 
          success: true, 
          status: 202, 
          data: { sent: true } 
        });

        const result = await controller.sendRaceUpdate(mockAuthUser, { raceDetails: longDetails });

        expect(result.message).toBe('Race update email sent');
        expect(mockNotificationsService.sendRaceUpdateEmail).toHaveBeenCalledWith(
          'user@example.com', // from default mock
          longDetails
        );
      });

      it('should handle special characters in race details', async () => {
        const specialDetails = 'Monaco GP 2024 - Circuit de Monaco (Monte Carlo) 🏁';
        mockNotificationsService.sendRaceUpdateEmail.mockResolvedValue({ 
          success: true, 
          status: 202, 
          data: { sent: true } 
        });

        const result = await controller.sendRaceUpdate(mockAuthUser, { raceDetails: specialDetails });

        expect(result.message).toBe('Race update email sent');
        expect(mockNotificationsService.sendRaceUpdateEmail).toHaveBeenCalledWith(
          'user@example.com',
          specialDetails
        );
      });

      it('should handle very long user email', async () => {
        const longEmail = 'a'.repeat(50) + '@' + 'b'.repeat(50) + '.com';
        mockUsersService.getProfile.mockResolvedValue({ email: longEmail });
        mockNotificationsService.sendRaceUpdateEmail.mockResolvedValue({ 
          success: true, 
          status: 202, 
          data: { sent: true } 
        });

        const result = await controller.sendRaceUpdate(mockAuthUser, { raceDetails: 'Long email test' });

        expect(result.message).toBe('Race update email sent');
        expect(mockNotificationsService.sendRaceUpdateEmail).toHaveBeenCalledWith(
          longEmail,
          'Long email test'
        );
      });
    });
  });
});
