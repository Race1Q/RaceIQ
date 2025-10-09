import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { NotificationsService } from './notifications.service';
import * as nodemailer from 'nodemailer';

// Mock nodemailer
jest.mock('nodemailer');

describe('NotificationsService', () => {
  let service: NotificationsService;
  let configService: { get: jest.Mock };
  let module: TestingModule;
  let mockTransporter: {
    sendMail: jest.MockedFunction<any>;
  };

  beforeEach(async () => {
    mockTransporter = {
      sendMail: jest.fn(),
    };

    configService = { 
      get: jest.fn().mockImplementation((key: any) => {
        // Default mock values for common config keys
        const mockValues: Record<string, string> = {
          'SMTP_HOST': '',
          'NOTIFICATIONS_OVERRIDE_TO': '',
          'NOTIFICATIONS_FROM_EMAIL': 'no-reply@raceiq.local',
        };
        return mockValues[key];
      })
    };

    // Mock nodemailer.createTransport
    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);

    module = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get(NotificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Structure', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should be an instance of NotificationsService', () => {
      expect(service).toBeInstanceOf(NotificationsService);
    });

    it('should have configService injected', () => {
      expect(service['config']).toBeDefined();
    });

    it('should have logger', () => {
      expect(service['logger']).toBeDefined();
    });

    it('should initialize without SMTP when no host is provided', () => {
      expect(service['transporter']).toBeNull();
    });
  });

  describe('sendRaceUpdateEmail', () => {
    describe('Mock Mode (No SMTP Host)', () => {
      beforeEach(() => {
        // Ensure no SMTP_HOST is set for mock mode
        configService.get.mockImplementation((key: any) => {
          const mockValues: Record<string, string> = {
            'SMTP_HOST': '',
            'NOTIFICATIONS_OVERRIDE_TO': '',
            'NOTIFICATIONS_FROM_EMAIL': 'no-reply@raceiq.local',
          };
          return mockValues[key];
        });
      });

      it('should return success=true in mock mode', async () => {
        const result = await service.sendRaceUpdateEmail('test@example.com', 'Race starts at 2PM');

        expect(result.success).toBe(true);
        expect(result.status).toBe(200);
        expect(result.data).toEqual({ mock: true });
      });

      it('should use default from email in mock mode', async () => {
        const logSpy = jest.spyOn(service['logger'], 'log');
        
        await service.sendRaceUpdateEmail('test@example.com', 'Race details');

        expect(logSpy).toHaveBeenCalledWith(
          expect.stringContaining('[EMAIL MOCK]')
        );
        expect(logSpy).toHaveBeenCalledWith(
          expect.stringContaining('FROM: no-reply@raceiq.local')
        );
      });

      it('should use override recipient when configured', async () => {
        configService.get.mockImplementation((key: any) => {
          const mockValues: Record<string, string> = {
            'SMTP_HOST': '',
            'NOTIFICATIONS_OVERRIDE_TO': 'override@test.com',
            'NOTIFICATIONS_FROM_EMAIL': 'no-reply@raceiq.local',
          };
          return mockValues[key];
        });

        const logSpy = jest.spyOn(service['logger'], 'log');
        
        await service.sendRaceUpdateEmail('original@example.com', 'Test details');

        expect(logSpy).toHaveBeenCalledWith(
          expect.stringContaining('TO: override@test.com')
        );
      });

      it('should include race details in mock email body', async () => {
        const logSpy = jest.spyOn(service['logger'], 'log');
        const raceJson = JSON.stringify({
          username: 'Racer',
          races: [
            { countryCode: 'MC', round: 1, grandPrix: 'Monaco GP - Circuit de Monaco', date: '2025-05-25' }
          ]
        });
        
        await service.sendRaceUpdateEmail('test@example.com', raceJson);

        expect(logSpy).toHaveBeenCalledWith(
          expect.stringContaining('Monaco GP - Circuit de Monaco')
        );
      });
    });

    describe('SMTP Mode', () => {
      beforeEach(() => {
        // Mock SMTP configuration
        configService.get.mockImplementation((key: any) => {
          const mockValues: Record<string, any> = {
            'SMTP_HOST': 'smtp.test.com',
            'SMTP_PORT': '587',
            'SMTP_SECURE': 'false',
            'SMTP_USER': 'smtp@test.com',
            'SMTP_PASS': 'password123',
            'NOTIFICATIONS_OVERRIDE_TO': '',
            'NOTIFICATIONS_FROM_EMAIL': 'sender@raceiq.com',
          };
          return mockValues[key];
        });

        // Mock nodemailer.createTransport to return our mock transporter
        (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);

        // Re-create service with SMTP configuration
        service = new NotificationsService(configService as any);
      });

      it('should send email successfully via SMTP', async () => {
        const mockMessageId = 'test-message-id-123';
        mockTransporter.sendMail.mockResolvedValue({ messageId: mockMessageId });

        const result = await service.sendRaceUpdateEmail('test@example.com', 'Race update');

        expect(result.success).toBe(true);
        expect(result.status).toBe(200);
        expect(result.data).toEqual({ messageId: mockMessageId });
        expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1);
      });

      it('should use correct email configuration', async () => {
        mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-id' });

        await service.sendRaceUpdateEmail('recipient@test.com', 'Test message');

        expect(mockTransporter.sendMail).toHaveBeenCalledWith(
          expect.objectContaining({
            from: 'sender@raceiq.com',
            to: 'recipient@test.com',
            subject: 'RaceIQ Upcoming Races',
            text: expect.stringContaining('Here are the next 3 Formula 1 races'),
            html: expect.stringContaining('<title>RaceIQ Upcoming Races</title>')
          })
        );
      });

      it('should handle SMTP send failure', async () => {
        const errorMessage = 'SMTP connection failed';
        mockTransporter.sendMail.mockRejectedValue(new Error(errorMessage));

        const result = await service.sendRaceUpdateEmail('fail@test.com', 'This will fail');

        expect(result.success).toBe(false);
        expect(result.status).toBe(502);
        expect(result.data).toEqual({ 
          error: 'SMTP send failed', 
          detail: errorMessage 
        });
      });

      it('should log successful email send', async () => {
        const mockMessageId = 'success-message-id';
        mockTransporter.sendMail.mockResolvedValue({ messageId: mockMessageId });
        const logSpy = jest.spyOn(service['logger'], 'log');

        await service.sendRaceUpdateEmail('success@test.com', 'Success test');

        expect(logSpy).toHaveBeenCalledWith(
          expect.stringContaining(`Email sent to success@test.com messageId=${mockMessageId}`)
        );
      });

      it('should log SMTP errors', async () => {
        const errorMessage = 'Authentication failed';
        mockTransporter.sendMail.mockRejectedValue(new Error(errorMessage));
        const errorSpy = jest.spyOn(service['logger'], 'error');

        await service.sendRaceUpdateEmail('error@test.com', 'Error test');

        expect(errorSpy).toHaveBeenCalledWith(
          expect.stringContaining(`SMTP send failed: ${errorMessage}`)
        );
      });

      it('should use override recipient when configured in SMTP mode', async () => {
        configService.get.mockImplementation((key: any) => {
          const mockValues: Record<string, any> = {
            'SMTP_HOST': 'smtp.test.com',
            'SMTP_PORT': '587',
            'SMTP_SECURE': 'false',
            'SMTP_USER': 'smtp@test.com',
            'SMTP_PASS': 'password123',
            'NOTIFICATIONS_OVERRIDE_TO': 'override@test.com',
            'NOTIFICATIONS_FROM_EMAIL': 'sender@raceiq.com',
          };
          return mockValues[key];
        });

        mockTransporter.sendMail.mockResolvedValue({ messageId: 'override-id' });

        await service.sendRaceUpdateEmail('original@test.com', 'Override test');

        expect(mockTransporter.sendMail).toHaveBeenCalledWith(
          expect.objectContaining({
            to: 'override@test.com'
          })
        );
      });
    });

    describe('Email Content', () => {
      it('should handle empty email address', async () => {
        const result = await service.sendRaceUpdateEmail('', 'Test message');

        expect(result.success).toBe(true);
        expect(result.status).toBe(200);
        expect(result.data).toEqual({ mock: true });
      });

      it('should handle empty race details', async () => {
        const result = await service.sendRaceUpdateEmail('test@example.com', '');

        expect(result.success).toBe(true);
        expect(result.status).toBe(200);
        expect(result.data).toEqual({ mock: true });
      });

      it('should handle very long email addresses', async () => {
        const longEmail = 'a'.repeat(100) + '@' + 'b'.repeat(100) + '.com';
        
        const result = await service.sendRaceUpdateEmail(longEmail, 'Long email test');

        expect(result.success).toBe(true);
        expect(result.status).toBe(200);
      });

      it('should handle very long race details', async () => {
        const longDetails = 'A'.repeat(5000);
        
        const result = await service.sendRaceUpdateEmail('test@example.com', longDetails);

        expect(result.success).toBe(true);
        expect(result.status).toBe(200);
      });

      it('should handle special characters in email and details', async () => {
        const specialEmail = 'test+tag@example.com';
        const specialDetails = 'Monaco GP 2024 - Circuit de Monaco (Monte Carlo) 🏁';
        
        const result = await service.sendRaceUpdateEmail(specialEmail, specialDetails);

        expect(result.success).toBe(true);
        expect(result.status).toBe(200);
      });
    });

    describe('Configuration Edge Cases', () => {
      it('should use SMTP_USER as fallback for from email', async () => {
        configService.get.mockImplementation((key: any) => {
          const mockValues: Record<string, string> = {
            'SMTP_HOST': '',
            'NOTIFICATIONS_OVERRIDE_TO': '',
            'NOTIFICATIONS_FROM_EMAIL': '',
            'SMTP_USER': 'smtp-user@test.com',
          };
          return mockValues[key];
        });

        const logSpy = jest.spyOn(service['logger'], 'log');
        
        await service.sendRaceUpdateEmail('test@example.com', 'Fallback test');

        expect(logSpy).toHaveBeenCalledWith(
          expect.stringContaining('FROM: smtp-user@test.com')
        );
      });

      it('should use default from email when no config is provided', async () => {
        configService.get.mockImplementation(() => '');

        const logSpy = jest.spyOn(service['logger'], 'log');
        
        await service.sendRaceUpdateEmail('test@example.com', 'Default test');

        expect(logSpy).toHaveBeenCalledWith(
          expect.stringContaining('FROM: no-reply@raceiq.local')
        );
      });
    });
  });
});