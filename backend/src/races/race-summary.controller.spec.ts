import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { RaceSummaryController } from './race-summary.controller';
import { RaceResult } from '../race-results/race-results.entity';
import { Lap } from '../laps/laps.entity';
import { RaceEvent } from '../race-events/race-events.entity';
import { Driver } from '../drivers/drivers.entity';
import { RaceFastestLapMaterialized } from '../dashboard/race-fastest-laps-materialized.entity';
import { Race } from './races.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('RaceSummaryController', () => {
  let controller: RaceSummaryController;
  let resultsRepo: Repository<RaceResult>;
  let lapsRepo: Repository<Lap>;
  let eventsRepo: Repository<RaceEvent>;
  let driversRepo: Repository<Driver>;
  let fastestLapViewRepo: Repository<RaceFastestLapMaterialized>;
  let raceRepo: Repository<Race>;

  const mockResultsRepo = {
    find: jest.fn() as jest.MockedFunction<Repository<RaceResult>['find']>,
    manager: {
      query: jest.fn() as jest.MockedFunction<any>,
    },
  };

  const mockLapsRepo = {
    manager: {
      query: jest.fn() as jest.MockedFunction<any>,
    },
  };

  const mockEventsRepo = {
    find: jest.fn() as jest.MockedFunction<Repository<RaceEvent>['find']>,
  };

  const mockDriversRepo = {
    findOne: jest.fn() as jest.MockedFunction<Repository<Driver>['findOne']>,
  };

  const mockFastestLapViewRepo = {
    findOne: jest.fn() as jest.MockedFunction<Repository<RaceFastestLapMaterialized>['findOne']>,
  };

  const mockRaceRepo = {
    findOne: jest.fn() as jest.MockedFunction<Repository<Race>['findOne']>,
  };

  const mockDriver: Driver = {
    id: 1,
    first_name: 'Lewis',
    last_name: 'Hamilton',
    code: 'HAM',
    nationality: 'British',
    date_of_birth: '1985-01-07',
    country_id: 1,
    profile_image_url: 'https://example.com/lewis.jpg',
  } as any;

  const mockRaceResult: RaceResult = {
    id: 1,
    position: 1,
    points: 25,
    driver_id: 1,
    constructor_id: 1,
    session_id: 1,
    driver: mockDriver,
  } as RaceResult;

  const mockRaceResults: RaceResult[] = [
    mockRaceResult,
    {
      id: 2,
      position: 2,
      points: 18,
      driver_id: 2,
      constructor_id: 2,
      session_id: 1,
      driver: {
        id: 2,
        first_name: 'Max',
        last_name: 'Verstappen',
        code: 'VER',
        nationality: 'Dutch',
        date_of_birth: '1997-09-30',
        country_id: 2,
        profile_image_url: 'https://example.com/max.jpg',
      } as any,
    } as RaceResult,
    {
      id: 3,
      position: 3,
      points: 15,
      driver_id: 3,
      constructor_id: 3,
      session_id: 1,
      driver: {
        id: 3,
        first_name: 'Charles',
        last_name: 'Leclerc',
        code: 'LEC',
        nationality: 'Monegasque',
        date_of_birth: '1997-10-16',
        country_id: 3,
        profile_image_url: 'https://example.com/charles.jpg',
      } as any,
    } as RaceResult,
  ];

  const mockRaceEvent: RaceEvent = {
    id: 1,
    session_id: 1,
    lap_number: 10,
    type: 'FLAG',
    metadata: {
      flag: 'yellow',
    },
  } as RaceEvent;

  const mockRaceEvents: RaceEvent[] = [
    mockRaceEvent,
    {
      id: 2,
      session_id: 1,
      lap_number: 15,
      type: 'FLAG',
      metadata: {
        flag: 'red',
      },
    } as RaceEvent,
    {
      id: 3,
      session_id: 1,
      lap_number: 20,
      type: 'FLAG',
      metadata: {
        flag: 'yellow',
      },
    } as RaceEvent,
  ];

  const mockFastestLapData = [
    {
      driver_id: 1,
      lap_number: 25,
      total_time_ms: 75000,
    },
  ];

  const mockSessionIds = [1, 2, 3];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RaceSummaryController],
      providers: [
        {
          provide: getRepositoryToken(RaceResult),
          useValue: mockResultsRepo,
        },
        {
          provide: getRepositoryToken(Lap),
          useValue: mockLapsRepo,
        },
        {
          provide: getRepositoryToken(RaceEvent),
          useValue: mockEventsRepo,
        },
        {
          provide: getRepositoryToken(Driver),
          useValue: mockDriversRepo,
        },
        {
          provide: getRepositoryToken(RaceFastestLapMaterialized),
          useValue: mockFastestLapViewRepo,
        },
        {
          provide: getRepositoryToken(Race),
          useValue: mockRaceRepo,
        },
      ],
    }).compile();

    controller = module.get<RaceSummaryController>(RaceSummaryController);
    resultsRepo = module.get<Repository<RaceResult>>(getRepositoryToken(RaceResult));
    lapsRepo = module.get<Repository<Lap>>(getRepositoryToken(Lap));
    eventsRepo = module.get<Repository<RaceEvent>>(getRepositoryToken(RaceEvent));
    driversRepo = module.get<Repository<Driver>>(getRepositoryToken(Driver));
    fastestLapViewRepo = module.get<Repository<RaceFastestLapMaterialized>>(getRepositoryToken(RaceFastestLapMaterialized));
    raceRepo = module.get<Repository<Race>>(getRepositoryToken(Race));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    // Default mock for race repository - returns a race with sessions
    mockRaceRepo.findOne.mockResolvedValue({
      id: 1,
      sessions: mockSessionIds.map(id => ({ id })),
    } as any);
    
    // Default mock for fastest lap view
    mockFastestLapViewRepo.findOne.mockResolvedValue(null);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSummary', () => {
    it('should return race summary with podium, fastest lap, and events', async () => {
      // Mock race with sessions
      mockRaceRepo.findOne.mockResolvedValue({
        id: 1,
        sessions: mockSessionIds.map(id => ({ id })),
      } as any);
      
      mockResultsRepo.find.mockResolvedValue(mockRaceResults);
      mockFastestLapViewRepo.findOne.mockResolvedValue({
        driverId: mockFastestLapData[0].driver_id,
        driverFullName: 'Lewis Hamilton',
        lapTimeMs: mockFastestLapData[0].total_time_ms,
        raceId: 1,
      } as any);
      mockEventsRepo.find.mockResolvedValue(mockRaceEvents);

      const result = await controller.getSummary(1);

      expect(result).toEqual({
        podium: [
          {
            position: 1,
            driver_id: 1,
            driver_name: 'Lewis Hamilton',
            driver_picture: 'https://example.com/lewis.jpg',
            team_name: 'N/A',
          },
          {
            position: 2,
            driver_id: 2,
            driver_name: 'Max Verstappen',
            driver_picture: 'https://example.com/max.jpg',
            team_name: 'N/A',
          },
          {
            position: 3,
            driver_id: 3,
            driver_name: 'Charles Leclerc',
            driver_picture: 'https://example.com/charles.jpg',
            team_name: 'N/A',
          },
        ],
        fastestLap: {
          driver_id: 1,
          driver_name: 'Lewis Hamilton',
          time_ms: 75000,
        },
        events: {
          yellowFlags: 2,
          redFlags: 1,
        },
      });
    });

    it('should handle missing race_id parameter', async () => {
      await expect(controller.getSummary(undefined as any)).rejects.toThrow('Missing or invalid race_id');
    });

    it('should handle invalid race_id parameter', async () => {
      await expect(controller.getSummary(NaN)).rejects.toThrow('Missing or invalid race_id');
    });

    it('should handle zero race_id parameter', async () => {
      await expect(controller.getSummary(0)).rejects.toThrow('Missing or invalid race_id');
    });

    it('should handle null race_id parameter', async () => {
      await expect(controller.getSummary(null as any)).rejects.toThrow('Missing or invalid race_id');
    });

    it('should handle empty string race_id parameter', async () => {
      await expect(controller.getSummary('' as any)).rejects.toThrow('Missing or invalid race_id');
    });

    it('should handle string race_id parameter', async () => {
      mockResultsRepo.manager.query.mockResolvedValueOnce(mockSessionIds.map(id => ({ id })));
      mockResultsRepo.find.mockResolvedValue(mockRaceResults);
      mockLapsRepo.manager.query.mockResolvedValue(mockFastestLapData);
      mockDriversRepo.findOne.mockResolvedValue(mockDriver);
      mockEventsRepo.find.mockResolvedValue(mockRaceEvents);

      const result = await controller.getSummary('1' as any);

      expect(result).toBeDefined();
      expect(result.podium).toHaveLength(3);
    });

    it('should handle no podium results', async () => {
      mockResultsRepo.manager.query.mockResolvedValueOnce(mockSessionIds.map(id => ({ id })));
      mockResultsRepo.find.mockResolvedValue([]);
      mockLapsRepo.manager.query.mockResolvedValue([]);
      mockEventsRepo.find.mockResolvedValue([]);

      const result = await controller.getSummary(1);

      expect(result.podium).toEqual([]);
      expect(result.fastestLap).toBeNull();
      expect(result.events).toEqual({ yellowFlags: 0, redFlags: 0 });
    });

    it('should handle no fastest lap data', async () => {
      mockResultsRepo.manager.query.mockResolvedValueOnce(mockSessionIds.map(id => ({ id })));
      mockResultsRepo.find.mockResolvedValue(mockRaceResults);
      mockLapsRepo.manager.query.mockResolvedValue([]);
      mockEventsRepo.find.mockResolvedValue([]);

      const result = await controller.getSummary(1);

      expect(result.fastestLap).toBeNull();
    });

    it('should handle missing driver for fastest lap', async () => {
      mockResultsRepo.find.mockResolvedValue(mockRaceResults);
      mockFastestLapViewRepo.findOne.mockResolvedValue({
        driverId: 1,
        driverFullName: undefined,
        lapTimeMs: 75000,
        raceId: 1,
      } as any);
      mockEventsRepo.find.mockResolvedValue([]);

      const result = await controller.getSummary(1);

      expect(result.fastestLap).toEqual({
        driver_id: 1,
        driver_name: undefined,
        time_ms: 75000,
      });
    });

    it('should handle missing driver for podium', async () => {
      const resultsWithoutDriver = mockRaceResults.map(r => ({ ...r, driver: null }));
      mockResultsRepo.find.mockResolvedValue(resultsWithoutDriver as any);
      mockEventsRepo.find.mockResolvedValue([]);

      const result = await controller.getSummary(1);

      expect(result.podium[0]).toEqual({
        position: 1,
        driver_id: 1,
        driver_name: 'N/A',
        driver_picture: undefined,
        team_name: 'N/A',
      });
    });

    it('should handle no race events', async () => {
      mockResultsRepo.manager.query.mockResolvedValueOnce(mockSessionIds.map(id => ({ id })));
      mockResultsRepo.find.mockResolvedValue(mockRaceResults);
      mockLapsRepo.manager.query.mockResolvedValue([]);
      mockEventsRepo.find.mockResolvedValue([]);

      const result = await controller.getSummary(1);

      expect(result.events).toEqual({ yellowFlags: 0, redFlags: 0 });
    });

    it('should handle events with different types', async () => {
      const mixedEvents = [
        { ...mockRaceEvent, type: 'FLAG', metadata: { flag: 'yellow' } },
        { ...mockRaceEvent, type: 'FLAG', metadata: { flag: 'red' } },
        { ...mockRaceEvent, type: 'safety_car', metadata: {} },
        { ...mockRaceEvent, type: 'FLAG', metadata: { flag: 'yellow' } },
      ];
      mockResultsRepo.find.mockResolvedValue(mockRaceResults);
      mockEventsRepo.find.mockResolvedValue(mixedEvents as any);

      const result = await controller.getSummary(1);

      expect(result.events).toEqual({ yellowFlags: 2, redFlags: 1 });
    });

    it('should handle events with invalid metadata', async () => {
      const invalidEvents = [
        { ...mockRaceEvent, type: 'FLAG', metadata: { flag: 'yellow' } },
        { ...mockRaceEvent, type: 'FLAG', metadata: { flag: 'red' } },
        { ...mockRaceEvent, type: 'FLAG', metadata: {} }, // no flag property
        { ...mockRaceEvent, type: 'safety_car', metadata: { flag: 'yellow' } }, // wrong type
      ];
      mockResultsRepo.find.mockResolvedValue(mockRaceResults);
      mockEventsRepo.find.mockResolvedValue(invalidEvents as any);

      const result = await controller.getSummary(1);

      expect(result.events).toEqual({ yellowFlags: 1, redFlags: 1 });
    });

    it('should handle database errors in session query', async () => {
      mockRaceRepo.findOne.mockRejectedValue(new Error('Database error'));

      await expect(controller.getSummary(1)).rejects.toThrow('Database error');
    });

    it('should handle database errors in results query', async () => {
      mockResultsRepo.find.mockRejectedValue(new Error('Database error'));

      await expect(controller.getSummary(1)).rejects.toThrow('Database error');
    });

    it('should handle database errors in fastest lap query', async () => {
      mockResultsRepo.find.mockResolvedValue(mockRaceResults);
      mockFastestLapViewRepo.findOne.mockRejectedValue(new Error('Database error'));

      await expect(controller.getSummary(1)).rejects.toThrow('Database error');
    });

    it('should handle database errors in events query', async () => {
      mockResultsRepo.find.mockResolvedValue(mockRaceResults);
      mockEventsRepo.find.mockRejectedValue(new Error('Database error'));

      await expect(controller.getSummary(1)).rejects.toThrow('Database error');
    });
  });

  describe('Controller Integration', () => {
    it('should have all required methods', () => {
      expect(typeof controller.getSummary).toBe('function');
    });

    it('should be injectable', () => {
      expect(controller).toBeInstanceOf(RaceSummaryController);
    });

    it('should have all required repositories injected', () => {
      expect(resultsRepo).toBeDefined();
      expect(lapsRepo).toBeDefined();
      expect(eventsRepo).toBeDefined();
      expect(driversRepo).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should propagate database errors from race query', async () => {
      const error = new Error('Race query failed');
      mockRaceRepo.findOne.mockRejectedValue(error);

      await expect(controller.getSummary(1)).rejects.toThrow('Race query failed');
    });

    it('should propagate database errors from results query', async () => {
      const error = new Error('Results query failed');
      mockResultsRepo.find.mockRejectedValue(error);

      await expect(controller.getSummary(1)).rejects.toThrow('Results query failed');
    });
  });

  describe('Data Validation', () => {
    it('should handle negative race_id', async () => {
      mockResultsRepo.manager.query.mockResolvedValueOnce(mockSessionIds.map(id => ({ id })));
      mockResultsRepo.find.mockResolvedValue(mockRaceResults);
      mockLapsRepo.manager.query.mockResolvedValue([]);
      mockEventsRepo.find.mockResolvedValue([]);

      const result = await controller.getSummary(-1);

      expect(result).toBeDefined();
      expect(result.podium).toHaveLength(3);
    });

    it('should handle decimal race_id', async () => {
      mockResultsRepo.manager.query.mockResolvedValueOnce(mockSessionIds.map(id => ({ id })));
      mockResultsRepo.find.mockResolvedValue(mockRaceResults);
      mockLapsRepo.manager.query.mockResolvedValue([]);
      mockEventsRepo.find.mockResolvedValue([]);

      const result = await controller.getSummary(1.5);

      expect(result).toBeDefined();
      expect(result.podium).toHaveLength(3);
    });

    it('should handle Infinity race_id', async () => {
      mockResultsRepo.manager.query.mockResolvedValueOnce(mockSessionIds.map(id => ({ id })));
      mockResultsRepo.find.mockResolvedValue(mockRaceResults);
      mockLapsRepo.manager.query.mockResolvedValue([]);
      mockEventsRepo.find.mockResolvedValue([]);

      const result = await controller.getSummary(Infinity);

      expect(result).toBeDefined();
      expect(result.podium).toHaveLength(3);
    });

    it('should handle -Infinity race_id', async () => {
      mockResultsRepo.manager.query.mockResolvedValueOnce(mockSessionIds.map(id => ({ id })));
      mockResultsRepo.find.mockResolvedValue(mockRaceResults);
      mockLapsRepo.manager.query.mockResolvedValue([]);
      mockEventsRepo.find.mockResolvedValue([]);

      const result = await controller.getSummary(-Infinity);

      expect(result).toBeDefined();
      expect(result.podium).toHaveLength(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty session IDs array', async () => {
      mockRaceRepo.findOne.mockResolvedValue({
        id: 1,
        sessions: [],
      } as any);
      mockResultsRepo.find.mockResolvedValue([]);
      mockEventsRepo.find.mockResolvedValue([]);

      const result = await controller.getSummary(1);

      expect(result.podium).toEqual([]);
      expect(result.fastestLap).toBeNull();
      expect(result.events).toEqual({ yellowFlags: 0, redFlags: 0 });
    });

    it('should handle partial driver information in fastest lap', async () => {
      mockResultsRepo.find.mockResolvedValue(mockRaceResults);
      mockFastestLapViewRepo.findOne.mockResolvedValue({
        driverId: 1,
        driverFullName: 'Lewis null',
        lapTimeMs: 75000,
        raceId: 1,
      } as any);
      mockEventsRepo.find.mockResolvedValue([]);

      const result = await controller.getSummary(1);

      expect(result.fastestLap.driver_name).toBe('Lewis null');
    });

    it('should handle events with null metadata', async () => {
      const eventsWithNullMetadata = [
        { ...mockRaceEvent, type: 'FLAG', metadata: null },
        { ...mockRaceEvent, type: 'FLAG', metadata: { flag: 'yellow' } },
      ];
      mockResultsRepo.find.mockResolvedValue(mockRaceResults);
      mockEventsRepo.find.mockResolvedValue(eventsWithNullMetadata as any);

      const result = await controller.getSummary(1);

      expect(result.events).toEqual({ yellowFlags: 1, redFlags: 0 });
    });
  });
});
