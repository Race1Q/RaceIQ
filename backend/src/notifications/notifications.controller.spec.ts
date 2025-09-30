import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { jest, describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

describe('NotificationsController', () => {
  let app: INestApplication;
  let module: TestingModule;
  let controller: NotificationsController;
  let service: NotificationsService;
  
  const mockService = {
    sendRaceUpdateEmail: jest.fn(),
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [{ provide: NotificationsService, useValue: mockService }],
    }).compile();

    app = module.createNestApplication();
    controller = module.get<NotificationsController>(NotificationsController);
    service = module.get<NotificationsService>(NotificationsService);
    
    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app?.close();
    await module?.close();
  });

  describe('Controller Structure', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should be an instance of NotificationsController', () => {
      expect(controller).toBeInstanceOf(NotificationsController);
    });

    it('should have notificationsService injected', () => {
      expect(controller['notificationsService']).toBeDefined();
    });
  });

  describe('sendRaceUpdate endpoint', () => {
    describe('Validation', () => {
      it('should return 400 when body is empty', async () => {
        await request(app.getHttpServer())
          .post('/notifications/send-race-update')
          .send({})
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toContain('recipientEmail and raceDetails are required');
          });
      });

      it('should return 400 when recipientEmail is missing', async () => {
        await request(app.getHttpServer())
          .post('/notifications/send-race-update')
          .send({ raceDetails: 'Race details here' })
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toContain('recipientEmail and raceDetails are required');
          });
      });

      it('should return 400 when raceDetails is missing', async () => {
        await request(app.getHttpServer())
          .post('/notifications/send-race-update')
          .send({ recipientEmail: 'test@example.com' })
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toContain('recipientEmail and raceDetails are required');
          });
      });

      it('should return 400 when recipientEmail is empty string', async () => {
        await request(app.getHttpServer())
          .post('/notifications/send-race-update')
          .send({ recipientEmail: '', raceDetails: 'Race details' })
          .expect(HttpStatus.BAD_REQUEST);
      });

      it('should return 400 when raceDetails is empty string', async () => {
        await request(app.getHttpServer())
          .post('/notifications/send-race-update')
          .send({ recipientEmail: 'test@example.com', raceDetails: '' })
          .expect(HttpStatus.BAD_REQUEST);
      });

      it('should return 400 when recipientEmail is null', async () => {
        await request(app.getHttpServer())
          .post('/notifications/send-race-update')
          .send({ recipientEmail: null, raceDetails: 'Race details' })
          .expect(HttpStatus.BAD_REQUEST);
      });

      it('should return 400 when raceDetails is null', async () => {
        await request(app.getHttpServer())
          .post('/notifications/send-race-update')
          .send({ recipientEmail: 'test@example.com', raceDetails: null })
          .expect(HttpStatus.BAD_REQUEST);
      });

      it('should return 400 when recipientEmail is undefined', async () => {
        await request(app.getHttpServer())
          .post('/notifications/send-race-update')
          .send({ recipientEmail: undefined, raceDetails: 'Race details' })
          .expect(HttpStatus.BAD_REQUEST);
      });

      it('should return 400 when raceDetails is undefined', async () => {
        await request(app.getHttpServer())
          .post('/notifications/send-race-update')
          .send({ recipientEmail: 'test@example.com', raceDetails: undefined })
          .expect(HttpStatus.BAD_REQUEST);
      });
    });

    describe('Success Cases', () => {
      it('should return 201 when service returns success', async () => {
        mockService.sendRaceUpdateEmail.mockResolvedValue({ 
          success: true, 
          status: 202, 
          data: { ok: true } 
        });

        const res = await request(app.getHttpServer())
          .post('/notifications/send-race-update')
          .send({ 
            recipientEmail: 'test@example.com', 
            raceDetails: 'Race starts at 2PM' 
          })
          .expect(HttpStatus.CREATED);

        expect(res.body).toEqual({
          message: 'Race update email sent',
          status: 202,
          data: { ok: true }
        });
      });

      it('should return 201 with different status codes from service', async () => {
        mockService.sendRaceUpdateEmail.mockResolvedValue({ 
          success: true, 
          status: 200, 
          data: { message: 'Email sent successfully' } 
        });

        const res = await request(app.getHttpServer())
          .post('/notifications/send-race-update')
          .send({ 
            recipientEmail: 'user@test.com', 
            raceDetails: 'Monaco GP starting soon' 
          })
          .expect(HttpStatus.CREATED);

        expect(res.body).toEqual({
          message: 'Race update email sent',
          status: 200,
          data: { message: 'Email sent successfully' }
        });
      });

      it('should call service with correct parameters', async () => {
        mockService.sendRaceUpdateEmail.mockResolvedValue({ 
          success: true, 
          status: 201, 
          data: { sent: true } 
        });

        await request(app.getHttpServer())
          .post('/notifications/send-race-update')
          .send({ 
            recipientEmail: 'driver@f1.com', 
            raceDetails: 'Qualifying results are in' 
          })
          .expect(HttpStatus.CREATED);

        expect(mockService.sendRaceUpdateEmail).toHaveBeenCalledWith(
          'driver@f1.com',
          'Qualifying results are in'
        );
        expect(mockService.sendRaceUpdateEmail).toHaveBeenCalledTimes(1);
      });
    });

    describe('Error Cases', () => {
      it('should propagate error status when service fails', async () => {
        mockService.sendRaceUpdateEmail.mockResolvedValue({ 
          success: false, 
          status: 502, 
          data: { message: 'Service unavailable' } 
        });

        await request(app.getHttpServer())
          .post('/notifications/send-race-update')
          .send({ 
            recipientEmail: 'error@test.com', 
            raceDetails: 'Race cancelled' 
          })
          .expect(502)
          .expect((res) => {
            expect(res.body.message).toBe('Service unavailable');
          });
      });

      it('should handle service failure without data', async () => {
        mockService.sendRaceUpdateEmail.mockResolvedValue({ 
          success: false, 
          status: 500 
        });

        await request(app.getHttpServer())
          .post('/notifications/send-race-update')
          .send({ 
            recipientEmail: 'fail@test.com', 
            raceDetails: 'Race postponed' 
          })
          .expect(500);
      });

      it('should handle different error status codes', async () => {
        mockService.sendRaceUpdateEmail.mockResolvedValue({ 
          success: false, 
          status: 503, 
          data: { error: 'Temporary failure' } 
        });

        await request(app.getHttpServer())
          .post('/notifications/send-race-update')
          .send({ 
            recipientEmail: 'temp@test.com', 
            raceDetails: 'Race delayed' 
          })
          .expect(503);
      });

      it('should handle service failure with custom error message', async () => {
        mockService.sendRaceUpdateEmail.mockResolvedValue({ 
          success: false, 
          status: 429, 
          data: { message: 'Rate limit exceeded' } 
        });

        await request(app.getHttpServer())
          .post('/notifications/send-race-update')
          .send({ 
            recipientEmail: 'limit@test.com', 
            raceDetails: 'Too many requests' 
          })
          .expect(429)
          .expect((res) => {
            expect(res.body.message).toBe('Rate limit exceeded');
          });
      });
    });

    describe('Edge Cases', () => {
      it('should handle very long email addresses', async () => {
        const longEmail = 'a'.repeat(50) + '@' + 'b'.repeat(50) + '.com';
        mockService.sendRaceUpdateEmail.mockResolvedValue({ 
          success: true, 
          status: 202, 
          data: { sent: true } 
        });

        await request(app.getHttpServer())
          .post('/notifications/send-race-update')
          .send({ 
            recipientEmail: longEmail, 
            raceDetails: 'Long email test' 
          })
          .expect(HttpStatus.CREATED);

        expect(mockService.sendRaceUpdateEmail).toHaveBeenCalledWith(
          longEmail,
          'Long email test'
        );
      });

      it('should handle very long race details', async () => {
        const longDetails = 'A'.repeat(1000);
        mockService.sendRaceUpdateEmail.mockResolvedValue({ 
          success: true, 
          status: 202, 
          data: { sent: true } 
        });

        await request(app.getHttpServer())
          .post('/notifications/send-race-update')
          .send({ 
            recipientEmail: 'test@example.com', 
            raceDetails: longDetails 
          })
          .expect(HttpStatus.CREATED);

        expect(mockService.sendRaceUpdateEmail).toHaveBeenCalledWith(
          'test@example.com',
          longDetails
        );
      });

      it('should handle special characters in email and race details', async () => {
        mockService.sendRaceUpdateEmail.mockResolvedValue({ 
          success: true, 
          status: 202, 
          data: { sent: true } 
        });

        await request(app.getHttpServer())
          .post('/notifications/send-race-update')
          .send({ 
            recipientEmail: 'test+tag@example.com', 
            raceDetails: 'Monaco GP 2024 - Circuit de Monaco (Monte Carlo) 🏁' 
          })
          .expect(HttpStatus.CREATED);

        expect(mockService.sendRaceUpdateEmail).toHaveBeenCalledWith(
          'test+tag@example.com',
          'Monaco GP 2024 - Circuit de Monaco (Monte Carlo) 🏁'
        );
      });

      it('should handle null body gracefully', async () => {
        await request(app.getHttpServer())
          .post('/notifications/send-race-update')
          .send(null)
          .expect(HttpStatus.BAD_REQUEST);
      });

      it('should handle undefined body gracefully', async () => {
        await request(app.getHttpServer())
          .post('/notifications/send-race-update')
          .send(undefined)
          .expect(HttpStatus.BAD_REQUEST);
      });
    });

    describe('HTTP Method Validation', () => {
      it('should only accept POST requests', async () => {
        await request(app.getHttpServer())
          .get('/notifications/send-race-update')
          .expect(404);

        await request(app.getHttpServer())
          .put('/notifications/send-race-update')
          .expect(404);

        await request(app.getHttpServer())
          .delete('/notifications/send-race-update')
          .expect(404);
      });
    });

    describe('Content-Type Handling', () => {
      it('should accept JSON content type', async () => {
        mockService.sendRaceUpdateEmail.mockResolvedValue({ 
          success: true, 
          status: 202, 
          data: { sent: true } 
        });

        await request(app.getHttpServer())
          .post('/notifications/send-race-update')
          .set('Content-Type', 'application/json')
          .send({ 
            recipientEmail: 'json@test.com', 
            raceDetails: 'JSON test' 
          })
          .expect(HttpStatus.CREATED);
      });

      it('should accept application/json content type', async () => {
        mockService.sendRaceUpdateEmail.mockResolvedValue({ 
          success: true, 
          status: 202, 
          data: { sent: true } 
        });

        await request(app.getHttpServer())
          .post('/notifications/send-race-update')
          .set('Content-Type', 'application/json')
          .send({ 
            recipientEmail: 'appjson@test.com', 
            raceDetails: 'App JSON test' 
          })
          .expect(HttpStatus.CREATED);
      });
    });
  });
});
