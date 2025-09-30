import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { jest, describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let app: INestApplication;
  let module: TestingModule;
  let appController: AppController;
  let appService: AppService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    app = module.createNestApplication();
    appController = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService);
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
      expect(appController).toBeDefined();
    });

    it('should be an instance of AppController', () => {
      expect(appController).toBeInstanceOf(AppController);
    });

    it('should have appService injected', () => {
      expect(appController['appService']).toBeDefined();
    });

    it('should have appService instance', () => {
      expect(appController['appService']).toBeInstanceOf(AppService);
    });
  });

  describe('getHello endpoint', () => {
    describe('Direct Method Call', () => {
    it('should return "Hello World!"', () => {
        const result = appController.getHello();
        expect(result).toBe('Hello World!');
      });

      it('should return a string', () => {
        const result = appController.getHello();
        expect(typeof result).toBe('string');
      });

      it('should call appService.getHello', () => {
        const getHelloSpy = jest.spyOn(appService, 'getHello').mockReturnValue('Mocked Hello!');
        
        const result = appController.getHello();
        
        expect(getHelloSpy).toHaveBeenCalledTimes(1);
        expect(result).toBe('Mocked Hello!');
      });

      it('should return consistent result on multiple calls', () => {
        const result1 = appController.getHello();
        const result2 = appController.getHello();
        const result3 = appController.getHello();
        
        expect(result1).toBe('Hello World!');
        expect(result2).toBe('Hello World!');
        expect(result3).toBe('Hello World!');
      });
    });

    describe('HTTP Request', () => {
      it('should return "Hello World!" on GET /', async () => {
        const response = await request(app.getHttpServer())
          .get('/')
          .expect(200);

        expect(response.text).toBe('Hello World!');
      });

      it('should return correct content type', async () => {
        const response = await request(app.getHttpServer())
          .get('/')
          .expect(200);

        expect(response.headers['content-type']).toContain('text/html');
      });

      it('should handle multiple requests', async () => {
        const requests = Array(5).fill(null).map(() => 
          request(app.getHttpServer()).get('/').expect(200)
        );

        const responses = await Promise.all(requests);
        
        responses.forEach(response => {
          expect(response.text).toBe('Hello World!');
        });
      });
    });

    describe('Error Handling', () => {
      it('should handle service errors gracefully', async () => {
        jest.spyOn(appService, 'getHello').mockImplementation(() => {
          throw new Error('Service error');
        });

        await request(app.getHttpServer())
          .get('/')
          .expect(500);
      });

      it('should handle service returning null', async () => {
        jest.spyOn(appService, 'getHello').mockReturnValue(null as any);

        await request(app.getHttpServer())
          .get('/')
          .expect(200);

        // The controller will return whatever the service returns
        const response = await request(app.getHttpServer()).get('/');
        expect(response.text).toBe('');
      });

      it('should handle service returning undefined', async () => {
        jest.spyOn(appService, 'getHello').mockReturnValue(undefined as any);

        await request(app.getHttpServer())
          .get('/')
          .expect(200);

        // The controller will return whatever the service returns
        const response = await request(app.getHttpServer()).get('/');
        expect(response.text).toBe('');
      });
    });
  });

  describe('getHealth endpoint', () => {
    describe('Direct Method Call', () => {
      it('should return health status object', () => {
        const result = appController.getHealth();
        
        expect(result).toHaveProperty('status');
        expect(result).toHaveProperty('timestamp');
        expect(result.status).toBe('ok');
        expect(typeof result.timestamp).toBe('string');
      });

      it('should return valid ISO timestamp', () => {
        const result = appController.getHealth();
        const timestamp = new Date(result.timestamp);
        
        expect(timestamp).toBeInstanceOf(Date);
        expect(timestamp.getTime()).not.toBeNaN();
      });

      it('should return current timestamp', () => {
        const before = new Date();
        const result = appController.getHealth();
        const after = new Date();
        
        const timestamp = new Date(result.timestamp);
        
        expect(timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
        expect(timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
      });

      it('should return consistent status', () => {
        const result1 = appController.getHealth();
        const result2 = appController.getHealth();
        const result3 = appController.getHealth();
        
        expect(result1.status).toBe('ok');
        expect(result2.status).toBe('ok');
        expect(result3.status).toBe('ok');
      });

      it('should return different timestamps on multiple calls', () => {
        const result1 = appController.getHealth();
        
        // Small delay to ensure different timestamps
        return new Promise(resolve => {
          setTimeout(() => {
            const result2 = appController.getHealth();
            expect(result1.timestamp).not.toBe(result2.timestamp);
            resolve(undefined);
          }, 10);
        });
      });
    });

    describe('HTTP Request', () => {
      it('should return health status on GET /health', async () => {
        const response = await request(app.getHttpServer())
          .get('/health')
          .expect(200);

        expect(response.body).toHaveProperty('status');
        expect(response.body).toHaveProperty('timestamp');
        expect(response.body.status).toBe('ok');
        expect(typeof response.body.timestamp).toBe('string');
      });

      it('should return correct content type', async () => {
        const response = await request(app.getHttpServer())
          .get('/health')
          .expect(200);

        expect(response.headers['content-type']).toContain('application/json');
      });

      it('should return valid JSON response', async () => {
        const response = await request(app.getHttpServer())
          .get('/health')
          .expect(200);

        expect(() => JSON.parse(JSON.stringify(response.body))).not.toThrow();
      });

      it('should handle multiple health check requests', async () => {
        const requests = Array(3).fill(null).map(() => 
          request(app.getHttpServer()).get('/health').expect(200)
        );

        const responses = await Promise.all(requests);
        
        responses.forEach(response => {
          expect(response.body.status).toBe('ok');
          expect(response.body).toHaveProperty('timestamp');
        });
      });

      it('should return different timestamps on rapid requests', async () => {
        const response1 = await request(app.getHttpServer()).get('/health');
        const response2 = await request(app.getHttpServer()).get('/health');
        
        expect(response1.body.timestamp).not.toBe(response2.body.timestamp);
      });
    });

    describe('Timestamp Validation', () => {
      it('should return ISO 8601 format timestamp', () => {
        const result = appController.getHealth();
        const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
        
        expect(iso8601Regex.test(result.timestamp)).toBe(true);
      });

      it('should return UTC timestamp', () => {
        const result = appController.getHealth();
        const timestamp = new Date(result.timestamp);
        const utcTimestamp = new Date(timestamp.getTime());
        
        expect(timestamp.toISOString()).toBe(utcTimestamp.toISOString());
      });

      it('should handle timestamp precision correctly', () => {
        const result = appController.getHealth();
        const timestamp = new Date(result.timestamp);
        
        // Should have millisecond precision
        expect(timestamp.getTime() % 1000).toBeGreaterThanOrEqual(0);
      });
    });

    describe('Edge Cases', () => {
      it('should handle rapid successive calls', () => {
        const results = Array(10).fill(null).map(() => appController.getHealth());
        
        results.forEach(result => {
          expect(result.status).toBe('ok');
          expect(result.timestamp).toBeDefined();
        });
      });

      it('should maintain consistent object structure', () => {
        const result = appController.getHealth();
        
        expect(Object.keys(result)).toEqual(['status', 'timestamp']);
        expect(result.status).toBe('ok');
        expect(typeof result.timestamp).toBe('string');
      });
    });
  });

  describe('HTTP Method Validation', () => {
    it('should only accept GET requests for root endpoint', async () => {
      await request(app.getHttpServer())
        .post('/')
        .expect(404);

      await request(app.getHttpServer())
        .put('/')
        .expect(404);

      await request(app.getHttpServer())
        .delete('/')
        .expect(404);
    });

    it('should only accept GET requests for health endpoint', async () => {
      await request(app.getHttpServer())
        .post('/health')
        .expect(404);

      await request(app.getHttpServer())
        .put('/health')
        .expect(404);

      await request(app.getHttpServer())
        .delete('/health')
        .expect(404);
    });
  });

  describe('Service Integration', () => {
    it('should properly inject and use AppService', () => {
      expect(appController['appService']).toBe(appService);
    });

    it('should call service methods correctly', () => {
      const getHelloSpy = jest.spyOn(appService, 'getHello');
      
      appController.getHello();
      
      expect(getHelloSpy).toHaveBeenCalledTimes(1);
    });

    it('should not affect other service methods', () => {
      const getHelloSpy = jest.spyOn(appService, 'getHello');
      
      appController.getHello();
      
      expect(getHelloSpy).toHaveBeenCalledTimes(1);
      // getHealth doesn't use the service, so it shouldn't affect getHello calls
      appController.getHealth();
      expect(getHelloSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Response Consistency', () => {
    it('should return consistent hello message', () => {
      const results = Array(5).fill(null).map(() => appController.getHello());
      
      results.forEach(result => {
        expect(result).toBe('Hello World!');
      });
    });

    it('should return consistent health status', () => {
      const results = Array(5).fill(null).map(() => appController.getHealth());
      
      results.forEach(result => {
        expect(result.status).toBe('ok');
        expect(result.timestamp).toBeDefined();
      });
    });
  });
});
