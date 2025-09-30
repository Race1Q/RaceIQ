import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { jest, describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RaceEventsController } from './race-events.controller';
import { RaceEvent } from './race-events.entity';

describe('RaceEventsController', () => {
  let app: INestApplication;
  let module: TestingModule;
  let controller: RaceEventsController;
  let repository: Repository<RaceEvent>;

  const mockRepository = {
    find: jest.fn(),
    manager: {
      query: jest.fn()
    }
  };

  const mockRaceEvents: RaceEvent[] = [
    {
      id: 1,
      session_id: 1,
      lap_number: 15,
      type: 'DRS_ENABLED',
      message: 'DRS enabled for this lap',
      metadata: { drs_zone: 1 },
      session: null
    } as RaceEvent,
    {
      id: 2,
      session_id: 1,
      lap_number: 23,
      type: 'SAFETY_CAR',
      message: 'Safety car deployed',
      metadata: { incident_location: 'Turn 1' },
      session: null
    } as RaceEvent
  ];

  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [RaceEventsController],
      providers: [
        {
          provide: getRepositoryToken(RaceEvent),
          useValue: mockRepository,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    controller = module.get<RaceEventsController>(RaceEventsController);
    repository = module.get<Repository<RaceEvent>>(getRepositoryToken(RaceEvent));
    
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

    it('should be an instance of RaceEventsController', () => {
      expect(controller).toBeInstanceOf(RaceEventsController);
    });

    it('should have repository injected', () => {
      expect(controller['repo']).toBeDefined();
    });
  });

  describe('findByRaceId endpoint', () => {
    describe('Success Cases', () => {
      it('should return race events for valid race_id', async () => {
        const mockSessionIds = [{ id: 1 }, { id: 2 }];
        mockRepository.manager.query.mockResolvedValue(mockSessionIds);
        mockRepository.find.mockResolvedValue(mockRaceEvents);

        const response = await request(app.getHttpServer())
          .get('/race-events')
          .query({ race_id: 1 })
          .expect(200);

        expect(response.body).toEqual(mockRaceEvents);
        expect(mockRepository.manager.query).toHaveBeenCalledWith(
          'SELECT id FROM sessions WHERE race_id = $1',
          ['1']
        );
        expect(mockRepository.find).toHaveBeenCalledWith({
          where: { session_id: [1, 2] }
        });
      });

      it('should return empty array when no sessions found for race_id', async () => {
        mockRepository.manager.query.mockResolvedValue([]);

        const response = await request(app.getHttpServer())
          .get('/race-events')
          .query({ race_id: 999 })
          .expect(200);

        expect(response.body).toEqual([]);
        expect(mockRepository.manager.query).toHaveBeenCalledWith(
          'SELECT id FROM sessions WHERE race_id = $1',
          ['999']
        );
        expect(mockRepository.find).not.toHaveBeenCalled();
      });

      it('should handle single session for race_id', async () => {
        const mockSessionIds = [{ id: 5 }];
        const singleEvent = [mockRaceEvents[0]];
        mockRepository.manager.query.mockResolvedValue(mockSessionIds);
        mockRepository.find.mockResolvedValue(singleEvent);

        const response = await request(app.getHttpServer())
          .get('/race-events')
          .query({ race_id: 3 })
          .expect(200);

        expect(response.body).toEqual(singleEvent);
        expect(mockRepository.find).toHaveBeenCalledWith({
          where: { session_id: [5] }
        });
      });

      it('should handle multiple sessions for race_id', async () => {
        const mockSessionIds = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
        mockRepository.manager.query.mockResolvedValue(mockSessionIds);
        mockRepository.find.mockResolvedValue(mockRaceEvents);

        const response = await request(app.getHttpServer())
          .get('/race-events')
          .query({ race_id: 2 })
          .expect(200);

        expect(response.body).toEqual(mockRaceEvents);
        expect(mockRepository.find).toHaveBeenCalledWith({
          where: { session_id: [1, 2, 3, 4] }
        });
      });

      it('should handle different race_id types', async () => {
        const mockSessionIds = [{ id: 10 }];
        mockRepository.manager.query.mockResolvedValue(mockSessionIds);
        mockRepository.find.mockResolvedValue([]);

        const testCases = [1, 42, 999, 2024];
        
        for (const raceId of testCases) {
          await request(app.getHttpServer())
            .get('/race-events')
            .query({ race_id: raceId })
            .expect(200);

          expect(mockRepository.manager.query).toHaveBeenCalledWith(
            'SELECT id FROM sessions WHERE race_id = $1',
            [raceId.toString()]
          );
        }
      });
    });

    describe('Query Parameter Handling', () => {
      it('should handle race_id as string parameter', async () => {
        const mockSessionIds = [{ id: 1 }];
        mockRepository.manager.query.mockResolvedValue(mockSessionIds);
        mockRepository.find.mockResolvedValue([]);

        await request(app.getHttpServer())
          .get('/race-events')
          .query({ race_id: '123' })
          .expect(200);

        expect(mockRepository.manager.query).toHaveBeenCalledWith(
          'SELECT id FROM sessions WHERE race_id = $1',
          ['123']
        );
      });

      it('should handle missing race_id parameter', async () => {
        mockRepository.manager.query.mockResolvedValue([]);

        await request(app.getHttpServer())
          .get('/race-events')
          .expect(200);

        expect(mockRepository.manager.query).toHaveBeenCalledWith(
          'SELECT id FROM sessions WHERE race_id = $1',
          [undefined]
        );
      });

      it('should handle race_id as null', async () => {
        mockRepository.manager.query.mockResolvedValue([]);

        await request(app.getHttpServer())
          .get('/race-events')
          .query({ race_id: null })
          .expect(200);

        expect(mockRepository.manager.query).toHaveBeenCalledWith(
          'SELECT id FROM sessions WHERE race_id = $1',
          ['']
        );
      });

      it('should handle race_id as empty string', async () => {
        mockRepository.manager.query.mockResolvedValue([]);

        await request(app.getHttpServer())
          .get('/race-events')
          .query({ race_id: '' })
          .expect(200);

        expect(mockRepository.manager.query).toHaveBeenCalledWith(
          'SELECT id FROM sessions WHERE race_id = $1',
          ['']
        );
      });
    });

    describe('Database Query Logic', () => {
      it('should extract session IDs correctly from query result', async () => {
        const mockSessionIds = [
          { id: 1, name: 'Qualifying' },
          { id: 2, name: 'Race' },
          { id: 3, name: 'Sprint' }
        ];
        mockRepository.manager.query.mockResolvedValue(mockSessionIds);
        mockRepository.find.mockResolvedValue([]);

        await request(app.getHttpServer())
          .get('/race-events')
          .query({ race_id: 1 })
          .expect(200);

        expect(mockRepository.find).toHaveBeenCalledWith({
          where: { session_id: [1, 2, 3] }
        });
      });

      it('should handle session IDs with additional properties', async () => {
        const mockSessionIds = [
          { id: 10, race_id: 1, session_type: 'Qualifying' },
          { id: 11, race_id: 1, session_type: 'Race' }
        ];
        mockRepository.manager.query.mockResolvedValue(mockSessionIds);
        mockRepository.find.mockResolvedValue([]);

        await request(app.getHttpServer())
          .get('/race-events')
          .query({ race_id: 1 })
          .expect(200);

        expect(mockRepository.find).toHaveBeenCalledWith({
          where: { session_id: [10, 11] }
        });
      });

      it('should handle empty session IDs array', async () => {
        mockRepository.manager.query.mockResolvedValue([]);

        await request(app.getHttpServer())
          .get('/race-events')
          .query({ race_id: 1 })
          .expect(200);

        expect(mockRepository.find).not.toHaveBeenCalled();
      });
    });

    describe('Error Handling', () => {
      it('should handle database query errors', async () => {
        mockRepository.manager.query.mockRejectedValue(new Error('Database connection failed'));

        await request(app.getHttpServer())
          .get('/race-events')
          .query({ race_id: 1 })
          .expect(500);
      });

      it('should handle repository find errors', async () => {
        const mockSessionIds = [{ id: 1 }];
        mockRepository.manager.query.mockResolvedValue(mockSessionIds);
        mockRepository.find.mockRejectedValue(new Error('Find operation failed'));

        await request(app.getHttpServer())
          .get('/race-events')
          .query({ race_id: 1 })
          .expect(500);
      });

      it('should handle malformed query results', async () => {
        mockRepository.manager.query.mockResolvedValue([{ invalid: 'data' }]);
        mockRepository.find.mockResolvedValue([]);

        await request(app.getHttpServer())
          .get('/race-events')
          .query({ race_id: 1 })
          .expect(200);

        expect(mockRepository.find).toHaveBeenCalledWith({
          where: { session_id: [undefined] }
        });
      });
    });

    describe('Response Format', () => {
      it('should return race events with all properties', async () => {
        const mockSessionIds = [{ id: 1 }];
        const detailedRaceEvents = [
          {
            id: 1,
            session_id: 1,
            lap_number: 15,
            type: 'DRS_ENABLED',
            message: 'DRS enabled for this lap',
            metadata: {
              drs_zone: 1,
              gap_to_car_ahead: 0.8,
              speed_increase: '15km/h'
            },
            session: null
          } as RaceEvent
        ];
        
        mockRepository.manager.query.mockResolvedValue(mockSessionIds);
        mockRepository.find.mockResolvedValue(detailedRaceEvents);

        const response = await request(app.getHttpServer())
          .get('/race-events')
          .query({ race_id: 1 })
          .expect(200);

        expect(response.body).toEqual(detailedRaceEvents);
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('session_id');
        expect(response.body[0]).toHaveProperty('lap_number');
        expect(response.body[0]).toHaveProperty('type');
        expect(response.body[0]).toHaveProperty('message');
        expect(response.body[0]).toHaveProperty('metadata');
      });

      it('should return empty array when no events found', async () => {
        const mockSessionIds = [{ id: 1 }];
        mockRepository.manager.query.mockResolvedValue(mockSessionIds);
        mockRepository.find.mockResolvedValue([]);

        const response = await request(app.getHttpServer())
          .get('/race-events')
          .query({ race_id: 1 })
          .expect(200);

        expect(response.body).toEqual([]);
        expect(Array.isArray(response.body)).toBe(true);
      });
    });

    describe('HTTP Method Validation', () => {
      it('should only accept GET requests', async () => {
        await request(app.getHttpServer())
          .post('/race-events')
          .expect(404);

        await request(app.getHttpServer())
          .put('/race-events')
          .expect(404);

        await request(app.getHttpServer())
          .delete('/race-events')
          .expect(404);

        await request(app.getHttpServer())
          .patch('/race-events')
          .expect(404);
      });
    });

    describe('Edge Cases', () => {
      it('should handle very large race_id values', async () => {
        const mockSessionIds = [{ id: 1 }];
        mockRepository.manager.query.mockResolvedValue(mockSessionIds);
        mockRepository.find.mockResolvedValue([]);

        await request(app.getHttpServer())
          .get('/race-events')
          .query({ race_id: 2147483647 })
          .expect(200);

        expect(mockRepository.manager.query).toHaveBeenCalledWith(
          'SELECT id FROM sessions WHERE race_id = $1',
          ['2147483647']
        );
      });

      it('should handle negative race_id values', async () => {
        const mockSessionIds = [{ id: 1 }];
        mockRepository.manager.query.mockResolvedValue(mockSessionIds);
        mockRepository.find.mockResolvedValue([]);

        await request(app.getHttpServer())
          .get('/race-events')
          .query({ race_id: -1 })
          .expect(200);

        expect(mockRepository.manager.query).toHaveBeenCalledWith(
          'SELECT id FROM sessions WHERE race_id = $1',
          ['-1']
        );
      });

      it('should handle race_id as zero', async () => {
        const mockSessionIds = [{ id: 1 }];
        mockRepository.manager.query.mockResolvedValue(mockSessionIds);
        mockRepository.find.mockResolvedValue([]);

        await request(app.getHttpServer())
          .get('/race-events')
          .query({ race_id: 0 })
          .expect(200);

        expect(mockRepository.manager.query).toHaveBeenCalledWith(
          'SELECT id FROM sessions WHERE race_id = $1',
          ['0']
        );
      });

      it('should handle special characters in race_id', async () => {
        mockRepository.manager.query.mockResolvedValue([]);

        await request(app.getHttpServer())
          .get('/race-events')
          .query({ race_id: 'test@123' })
          .expect(200);

        expect(mockRepository.manager.query).toHaveBeenCalledWith(
          'SELECT id FROM sessions WHERE race_id = $1',
          ['test@123']
        );
      });
    });

    describe('Performance and Caching', () => {
      it('should make single database query for session IDs', async () => {
        const mockSessionIds = [{ id: 1 }, { id: 2 }];
        mockRepository.manager.query.mockResolvedValue(mockSessionIds);
        mockRepository.find.mockResolvedValue([]);

        await request(app.getHttpServer())
          .get('/race-events')
          .query({ race_id: 1 })
          .expect(200);

        expect(mockRepository.manager.query).toHaveBeenCalledTimes(1);
        expect(mockRepository.find).toHaveBeenCalledTimes(1);
      });

      it('should not call find when no sessions exist', async () => {
        mockRepository.manager.query.mockResolvedValue([]);

        await request(app.getHttpServer())
          .get('/race-events')
          .query({ race_id: 1 })
          .expect(200);

        expect(mockRepository.manager.query).toHaveBeenCalledTimes(1);
        expect(mockRepository.find).toHaveBeenCalledTimes(0);
      });
    });

    describe('Real-world F1 Scenarios', () => {
      it('should handle Monaco GP race events', async () => {
        const mockSessionIds = [{ id: 1 }, { id: 2 }];
        const monacoEvents = [
          {
            id: 1,
            session_id: 1,
            lap_number: 15,
            type: 'DRS_ENABLED',
            message: 'DRS enabled - gap under 1 second',
            metadata: { drs_zone: 1, gap: 0.8 },
            session: null
          } as RaceEvent,
          {
            id: 2,
            session_id: 1,
            lap_number: 23,
            type: 'SAFETY_CAR',
            message: 'Safety car deployed - incident at Turn 1',
            metadata: { incident_location: 'Turn 1', cars_involved: [44, 33] },
            session: null
          } as RaceEvent
        ];
        
        mockRepository.manager.query.mockResolvedValue(mockSessionIds);
        mockRepository.find.mockResolvedValue(monacoEvents);

        const response = await request(app.getHttpServer())
          .get('/race-events')
          .query({ race_id: 1 })
          .expect(200);

        expect(response.body).toEqual(monacoEvents);
        expect(response.body).toHaveLength(2);
        expect(response.body[0].type).toBe('DRS_ENABLED');
        expect(response.body[1].type).toBe('SAFETY_CAR');
      });

      it('should handle qualifying session events', async () => {
        const mockSessionIds = [{ id: 3 }];
        const qualifyingEvents = [
          {
            id: 3,
            session_id: 3,
            lap_number: 12,
            type: 'YELLOW_FLAG',
            message: 'Yellow flag - driver off track at Turn 3',
            metadata: { flag_location: 'Turn 3', driver_id: 77 },
            session: null
          } as RaceEvent
        ];
        
        mockRepository.manager.query.mockResolvedValue(mockSessionIds);
        mockRepository.find.mockResolvedValue(qualifyingEvents);

        const response = await request(app.getHttpServer())
          .get('/race-events')
          .query({ race_id: 2 })
          .expect(200);

        expect(response.body).toEqual(qualifyingEvents);
        expect(response.body[0].type).toBe('YELLOW_FLAG');
      });
    });
  });
});
