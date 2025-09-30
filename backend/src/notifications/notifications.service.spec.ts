import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let httpService: { post: jest.Mock };
  let configService: { get: jest.Mock };
  let module: TestingModule;

  beforeEach(async () => {
    httpService = { post: jest.fn() } as any;
    configService = { get: jest.fn().mockReturnValue(undefined) };

    module = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: HttpService, useValue: httpService },
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

    it('should have httpService injected', () => {
      expect(service['httpService']).toBeDefined();
    });

    it('should have configService injected', () => {
      expect(service['configService']).toBeDefined();
    });

    it('should have correct baseUrl', () => {
      expect(service['baseUrl']).toBe('https://lockedin-backsupa.onrender.com/api');
    });

    it('should have logger', () => {
      expect(service['logger']).toBeDefined();
    });
  });

  describe('sendRaceUpdateEmail', () => {
    describe('Success Cases', () => {
      it('should return success=true when first JSON attempt succeeds', async () => {
        httpService.post.mockReturnValueOnce(of({ 
          status: 200, 
          data: { message: 'Email sent successfully' } 
        }));

        const result = await service.sendRaceUpdateEmail('test@example.com', 'Race starts at 2PM');

        expect(result.success).toBe(true);
        expect(result.status).toBe(200);
        expect(result.data).toEqual({ message: 'Email sent successfully' });
        expect(httpService.post).toHaveBeenCalledTimes(1);
      });

      it('should return success=true when later JSON attempt succeeds', async () => {
    httpService.post
          .mockReturnValueOnce(of({ status: 400, data: { error: 'bad request' } }))
      .mockReturnValueOnce(of({ status: 201, data: { ok: true } }));

        const result = await service.sendRaceUpdateEmail('test@example.com', 'Race X starts at 1PM');

        expect(result.success).toBe(true);
        expect(result.status).toBe(201);
        expect(result.data).toEqual({ ok: true });
    expect(httpService.post).toHaveBeenCalledTimes(2);
      });

      it('should return success=true when FORM attempt succeeds', async () => {
        // Mock all JSON attempts to fail
        for (let i = 0; i < 7; i++) {
          httpService.post.mockReturnValueOnce(of({ status: 400, data: { error: 'bad request' } }));
        }
        // Mock first FORM attempt to succeed
        httpService.post.mockReturnValueOnce(of({ status: 202, data: { sent: true } }));

        const result = await service.sendRaceUpdateEmail('form@example.com', 'Race via form');

        expect(result.success).toBe(true);
        expect(result.status).toBe(202);
        expect(result.data).toEqual({ sent: true });
        expect(httpService.post).toHaveBeenCalledTimes(8);
      });

      it('should try different JSON payload formats', async () => {
        httpService.post.mockReturnValue(of({ status: 400, data: { error: 'bad request' } }));

        await service.sendRaceUpdateEmail('test@example.com', 'Race details');

        // Check that different payload formats were tried
        const calls = httpService.post.mock.calls;
        expect(calls.length).toBeGreaterThanOrEqual(7); // JSON attempts

        // Check first few JSON attempts
        expect(calls[0][1]).toEqual({ recipientEmail: 'test@example.com', message: 'Race details' });
        expect(calls[1][1]).toEqual({ email: 'test@example.com', message: 'Race details' });
        expect(calls[2][1]).toEqual({ to: 'test@example.com', message: 'Race details' });
        expect(calls[3][1]).toEqual({ inviteeEmail: 'test@example.com', message: 'Race details' });
        expect(calls[4][1]).toEqual({ recipient: 'test@example.com', message: 'Race details' });
        expect(calls[5][1]).toEqual({ recipientEmail: 'test@example.com', content: 'Race details' });
        expect(calls[6][1]).toEqual({ email: 'test@example.com', content: 'Race details' });
      });

      it('should try different FORM payload formats', async () => {
        // Mock all JSON attempts to fail
        for (let i = 0; i < 7; i++) {
          httpService.post.mockReturnValueOnce(of({ status: 400, data: { error: 'bad request' } }));
        }
        // Mock all FORM attempts to fail
        for (let i = 0; i < 7; i++) {
          httpService.post.mockReturnValueOnce(of({ status: 400, data: { error: 'bad request' } }));
        }

        await service.sendRaceUpdateEmail('test@example.com', 'Race details');

        const calls = httpService.post.mock.calls;
        expect(calls.length).toBe(14); // 7 JSON + 7 FORM attempts

        // Check that FORM attempts use URLSearchParams
        for (let i = 7; i < 14; i++) {
          expect(typeof calls[i][1]).toBe('string'); // URLSearchParams.toString() returns string
          expect(calls[i][2].headers['Content-Type']).toBe('application/x-www-form-urlencoded');
        }
      });
    });

    describe('Authentication Headers', () => {
      it('should include bearer token when configured', async () => {
        configService.get.mockImplementation((key: string) => {
          if (key === 'LOCKEDIN_BEARER_TOKEN') return 'test-bearer-token';
          return undefined;
        });

        httpService.post.mockReturnValue(of({ status: 200, data: { success: true } }));

        await service.sendRaceUpdateEmail('auth@test.com', 'Auth test');

        expect(configService.get).toHaveBeenCalledWith('LOCKEDIN_BEARER_TOKEN');
        expect(httpService.post).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(Object),
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': 'Bearer test-bearer-token'
            })
          })
        );
      });

      it('should include API key when configured', async () => {
        configService.get.mockImplementation((key: string) => {
          if (key === 'LOCKEDIN_API_KEY') return 'test-api-key';
          return undefined;
        });

        httpService.post.mockReturnValue(of({ status: 200, data: { success: true } }));

        await service.sendRaceUpdateEmail('apikey@test.com', 'API key test');

        expect(httpService.post).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(Object),
          expect.objectContaining({
            headers: expect.objectContaining({
              'x-api-key': 'test-api-key'
            })
          })
        );
      });

      it('should include cookie when configured', async () => {
        configService.get.mockImplementation((key: string) => {
          if (key === 'LOCKEDIN_COOKIE') return 'session=abc123';
          return undefined;
        });

        httpService.post.mockReturnValue(of({ status: 200, data: { success: true } }));

        await service.sendRaceUpdateEmail('cookie@test.com', 'Cookie test');

        expect(httpService.post).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(Object),
          expect.objectContaining({
            headers: expect.objectContaining({
              'Cookie': 'session=abc123'
            })
          })
        );
      });

      it('should include all auth headers when all are configured', async () => {
        configService.get.mockImplementation((key: string) => {
          const configs = {
            'LOCKEDIN_BEARER_TOKEN': 'bearer-token',
            'LOCKEDIN_API_KEY': 'api-key',
            'LOCKEDIN_COOKIE': 'cookie=value'
          };
          return configs[key];
        });

        httpService.post.mockReturnValue(of({ status: 200, data: { success: true } }));

        await service.sendRaceUpdateEmail('allauth@test.com', 'All auth test');

        expect(httpService.post).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(Object),
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': 'Bearer bearer-token',
              'x-api-key': 'api-key',
              'Cookie': 'cookie=value'
            })
          })
        );
      });
    });

    describe('Error Handling', () => {
      it('should return success=false after exhausting all attempts', async () => {
    httpService.post.mockReturnValue(of({ status: 400, data: { error: 'bad request' } }));

        const result = await service.sendRaceUpdateEmail('nobody@example.com', 'Race details');

        expect(result.success).toBe(false);
        expect(result.status).toBe(502);
        expect(result.data).toEqual({ message: 'Failed to send via external service' });
        expect(httpService.post).toHaveBeenCalledTimes(14); // 7 JSON + 7 FORM attempts
      });

      it('should handle HTTP errors in JSON attempts', async () => {
        httpService.post.mockReturnValue(throwError(() => ({
          response: { status: 500, data: 'Internal server error' },
          message: 'Network error'
        })));

        const result = await service.sendRaceUpdateEmail('error@test.com', 'Error test');

        expect(result.success).toBe(false);
        expect(result.status).toBe(502);
      });

      it('should handle HTTP errors in FORM attempts', async () => {
        // Mock all JSON attempts to fail
        for (let i = 0; i < 7; i++) {
          httpService.post.mockReturnValueOnce(of({ status: 400, data: { error: 'bad request' } }));
        }
        // Mock FORM attempts to throw errors
        httpService.post.mockReturnValue(throwError(() => ({
          response: { status: 503, data: 'Service unavailable' },
          message: 'Timeout'
        })));

        const result = await service.sendRaceUpdateEmail('timeout@test.com', 'Timeout test');

        expect(result.success).toBe(false);
        expect(result.status).toBe(502);
      });

      it('should handle errors without response object', async () => {
        httpService.post.mockReturnValue(throwError(() => ({
          message: 'Connection failed'
        })));

        const result = await service.sendRaceUpdateEmail('connfail@test.com', 'Connection test');

        expect(result.success).toBe(false);
        expect(result.status).toBe(502);
      });

      it('should handle errors without response data', async () => {
        httpService.post.mockReturnValue(throwError(() => ({
          response: { status: 400 }
        })));

        const result = await service.sendRaceUpdateEmail('nodata@test.com', 'No data test');

        expect(result.success).toBe(false);
        expect(result.status).toBe(502);
      });
    });

    describe('Request Configuration', () => {
      it('should use correct URL', async () => {
        httpService.post.mockReturnValue(of({ status: 200, data: { success: true } }));

        await service.sendRaceUpdateEmail('url@test.com', 'URL test');

        expect(httpService.post).toHaveBeenCalledWith(
          'https://lockedin-backsupa.onrender.com/api/invite',
          expect.any(Object),
          expect.any(Object)
        );
      });

      it('should use correct headers for JSON requests', async () => {
        httpService.post.mockReturnValue(of({ status: 200, data: { success: true } }));

        await service.sendRaceUpdateEmail('headers@test.com', 'Headers test');

        expect(httpService.post).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(Object),
          expect.objectContaining({
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }),
            validateStatus: expect.any(Function),
            timeout: 15000
          })
        );
      });

      it('should use correct headers for FORM requests', async () => {
        // Mock all JSON attempts to fail
        for (let i = 0; i < 7; i++) {
          httpService.post.mockReturnValueOnce(of({ status: 400, data: { error: 'bad request' } }));
        }
        httpService.post.mockReturnValue(of({ status: 200, data: { success: true } }));

        await service.sendRaceUpdateEmail('formheaders@test.com', 'Form headers test');

        const formCalls = httpService.post.mock.calls.slice(7);
        expect(formCalls.length).toBeGreaterThan(0);
        
        formCalls.forEach(call => {
          expect(call[2].headers['Content-Type']).toBe('application/x-www-form-urlencoded');
          expect(call[2].headers['Accept']).toBe('application/json');
          expect(call[2].timeout).toBe(15000);
        });
      });

      it('should use validateStatus function that accepts all status codes', async () => {
        httpService.post.mockReturnValue(of({ status: 200, data: { success: true } }));

        await service.sendRaceUpdateEmail('validate@test.com', 'Validate test');

        const validateStatus = httpService.post.mock.calls[0][2].validateStatus;
        expect(validateStatus(200)).toBe(true);
        expect(validateStatus(400)).toBe(true);
        expect(validateStatus(500)).toBe(true);
        expect(validateStatus(999)).toBe(true);
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty email', async () => {
        httpService.post.mockReturnValue(of({ status: 400, data: { error: 'Invalid email' } }));

        const result = await service.sendRaceUpdateEmail('', 'Empty email test');

        expect(result.success).toBe(false);
        expect(httpService.post).toHaveBeenCalledTimes(14);
      });

      it('should handle empty race details', async () => {
        httpService.post.mockReturnValue(of({ status: 400, data: { error: 'Invalid details' } }));

        const result = await service.sendRaceUpdateEmail('empty@test.com', '');

        expect(result.success).toBe(false);
        expect(httpService.post).toHaveBeenCalledTimes(14);
      });

      it('should handle very long email', async () => {
        const longEmail = 'a'.repeat(100) + '@' + 'b'.repeat(100) + '.com';
        httpService.post.mockReturnValue(of({ status: 200, data: { success: true } }));

        const result = await service.sendRaceUpdateEmail(longEmail, 'Long email test');

        expect(result.success).toBe(true);
        expect(httpService.post).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({ recipientEmail: longEmail }),
          expect.any(Object)
        );
      });

      it('should handle very long race details', async () => {
        const longDetails = 'A'.repeat(5000);
        httpService.post.mockReturnValue(of({ status: 200, data: { success: true } }));

        const result = await service.sendRaceUpdateEmail('long@test.com', longDetails);

        expect(result.success).toBe(true);
        expect(httpService.post).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({ message: longDetails }),
          expect.any(Object)
        );
      });

      it('should handle special characters in email and details', async () => {
        const specialEmail = 'test+tag@example.com';
        const specialDetails = 'Monaco GP 2024 - Circuit de Monaco (Monte Carlo) 🏁';
        httpService.post.mockReturnValue(of({ status: 200, data: { success: true } }));

        const result = await service.sendRaceUpdateEmail(specialEmail, specialDetails);

        expect(result.success).toBe(true);
        expect(httpService.post).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({ 
            recipientEmail: specialEmail, 
            message: specialDetails 
          }),
          expect.any(Object)
        );
  });
});

    describe('Logging', () => {
      it('should log successful attempts', async () => {
        const logSpy = jest.spyOn(service['logger'], 'log');
        httpService.post.mockReturnValue(of({ status: 200, data: { success: true } }));

        await service.sendRaceUpdateEmail('log@test.com', 'Log test');

        expect(logSpy).toHaveBeenCalledWith(
          expect.stringContaining('Sending race update email try #1 to log@test.com')
        );
        expect(logSpy).toHaveBeenCalledWith(
          expect.stringContaining('Race update email sent successfully to log@test.com')
        );
      });

      it('should log failed attempts', async () => {
        const warnSpy = jest.spyOn(service['logger'], 'warn');
        httpService.post.mockReturnValue(of({ status: 400, data: { error: 'bad request' } }));

        await service.sendRaceUpdateEmail('warn@test.com', 'Warn test');

        expect(warnSpy).toHaveBeenCalledWith(
          expect.stringContaining('JSON attempt #1 failed for warn@test.com')
        );
      });

      it('should log errors', async () => {
        const errorSpy = jest.spyOn(service['logger'], 'error');
        httpService.post.mockReturnValue(throwError(() => ({
          response: { status: 500, data: 'Server error' },
          message: 'Network error'
        })));

        await service.sendRaceUpdateEmail('error@test.com', 'Error test');

        expect(errorSpy).toHaveBeenCalledWith(
          expect.stringContaining('All attempts to send race update email to error@test.com failed')
        );
      });
    });
  });
});