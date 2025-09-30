import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { RacesController, RaceResultsController } from './races.controller';
import { RacesService } from './races.service';
import { Race } from './races.entity';
import { Session } from '../sessions/sessions.entity';
import { RaceResult } from '../race-results/race-results.entity';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('RacesController', () => {
  let controller: RacesController;
  let service: RacesService;

  const mockRacesService = {
    findAll: jest.fn() as jest.MockedFunction<RacesService['findAll']>,
    listYears: jest.fn() as jest.MockedFunction<RacesService['listYears']>,
    findOne: jest.fn() as jest.MockedFunction<RacesService['findOne']>,
    getConstructorPolePositions: jest.fn() as jest.MockedFunction<RacesService['getConstructorPolePositions']>,
    getConstructorPolePositionsBySeason: jest.fn() as jest.MockedFunction<RacesService['getConstructorPolePositionsBySeason']>,
    getConstructorPointsByCircuit: jest.fn() as jest.MockedFunction<RacesService['getConstructorPointsByCircuit']>,
  };

  const mockRace: Race = {
    id: 1,
    season_id: 1,
    circuit_id: 1,
    round: 1,
    name: 'Monaco Grand Prix',
    date: new Date('2023-05-28'),
    time: '14:00:00',
    season: {
      id: 1,
      year: 2023,
      races: [],
    } as any,
    circuit: {
      id: 1,
      name: 'Monaco',
      location: 'Monte Carlo',
      country_code: 'MCO',
      map_url: 'https://example.com/monaco-map',
      length_km: 3.337,
      race_distance_km: 260.286,
      track_layout: {
        type: 'FeatureCollection',
        features: [],
      },
      country: null,
    } as any,
    sessions: [],
    laps: [],
    pitStops: [],
  } as Race;

  const mockRaces: Race[] = [
    mockRace,
    {
      id: 2,
      season_id: 1,
      circuit_id: 2,
      round: 2,
      name: 'Spanish Grand Prix',
      date: new Date('2023-06-04'),
      time: '15:00:00',
      season: {
        id: 1,
        year: 2023,
        races: [],
      } as any,
      circuit: {
        id: 2,
        name: 'Barcelona',
        location: 'Barcelona',
        country_code: 'ESP',
        map_url: 'https://example.com/barcelona-map',
        length_km: 4.675,
        race_distance_km: 307.104,
        track_layout: {
          type: 'FeatureCollection',
          features: [],
        },
        country: null,
      } as any,
      sessions: [],
      laps: [],
      pitStops: [],
    } as Race,
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RacesController],
      providers: [
        {
          provide: RacesService,
          useValue: mockRacesService,
        },
      ],
    }).compile();

    controller = module.get<RacesController>(RacesController);
    service = module.get<RacesService>(RacesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of races', async () => {
      mockRacesService.findAll.mockResolvedValue(mockRaces);

      const result = await controller.findAll({});

      expect(result).toEqual(mockRaces);
      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(service.findAll).toHaveBeenCalledWith({});
    });

    it('should return empty array when no races exist', async () => {
      mockRacesService.findAll.mockResolvedValue([]);

      const result = await controller.findAll({});

      expect(result).toEqual([]);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });

    it('should pass query parameters to service', async () => {
      const query = { year: 2023, season: 1 };
      mockRacesService.findAll.mockResolvedValue(mockRaces);

      await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
    });

    it('should handle service errors', async () => {
      const error = new Error('Database error');
      mockRacesService.findAll.mockRejectedValue(error);

      await expect(controller.findAll({})).rejects.toThrow('Database error');
    });
  });

  describe('years', () => {
    it('should return an array of years', async () => {
      const years = [2023, 2022, 2021];
      mockRacesService.listYears.mockResolvedValue(years);

      const result = await controller.years();

      expect(result).toEqual(years);
      expect(service.listYears).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no years exist', async () => {
      mockRacesService.listYears.mockResolvedValue([]);

      const result = await controller.years();

      expect(result).toEqual([]);
      expect(service.listYears).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors', async () => {
      const error = new Error('Database error');
      mockRacesService.listYears.mockRejectedValue(error);

      await expect(controller.years()).rejects.toThrow('Database error');
    });
  });

  describe('findOne', () => {
    it('should return a race by id', async () => {
      mockRacesService.findOne.mockResolvedValue(mockRace);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockRace);
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });

    it('should handle string id parameter', async () => {
      mockRacesService.findOne.mockResolvedValue(mockRace);

      await controller.findOne('123');

      expect(service.findOne).toHaveBeenCalledWith('123');
    });

    it('should handle service errors', async () => {
      const error = new NotFoundException('Race not found');
      mockRacesService.findOne.mockRejectedValue(error);

      await expect(controller.findOne('999')).rejects.toThrow('Race not found');
    });
  });

  describe('getConstructorPoles', () => {
    it('should return constructor poles count', async () => {
      const constructorId = 1;
      const poles = 5;
      mockRacesService.getConstructorPolePositions.mockResolvedValue(poles);

      const result = await controller.getConstructorPoles(constructorId);

      expect(result).toEqual({ constructorId, poles });
      expect(service.getConstructorPolePositions).toHaveBeenCalledTimes(1);
      expect(service.getConstructorPolePositions).toHaveBeenCalledWith(constructorId);
    });

    it('should return zero poles when constructor has none', async () => {
      const constructorId = 2;
      const poles = 0;
      mockRacesService.getConstructorPolePositions.mockResolvedValue(poles);

      const result = await controller.getConstructorPoles(constructorId);

      expect(result).toEqual({ constructorId, poles });
      expect(service.getConstructorPolePositions).toHaveBeenCalledWith(constructorId);
    });

    it('should handle service errors', async () => {
      const constructorId = 1;
      const error = new Error('Database error');
      mockRacesService.getConstructorPolePositions.mockRejectedValue(error);

      await expect(controller.getConstructorPoles(constructorId)).rejects.toThrow('Database error');
    });
  });

  describe('getConstructorPolesBySeason', () => {
    it('should return poles grouped by season', async () => {
      const constructorId = 1;
      const polesBySeason = [
        { year: 2023, poles: 3 },
        { year: 2022, poles: 2 },
      ];
      mockRacesService.getConstructorPolePositionsBySeason.mockResolvedValue(polesBySeason);

      const result = await controller.getConstructorPolesBySeason(constructorId);

      expect(result).toEqual(polesBySeason);
      expect(service.getConstructorPolePositionsBySeason).toHaveBeenCalledTimes(1);
      expect(service.getConstructorPolePositionsBySeason).toHaveBeenCalledWith(constructorId);
    });

    it('should return empty array when no poles exist', async () => {
      const constructorId = 2;
      mockRacesService.getConstructorPolePositionsBySeason.mockResolvedValue([]);

      const result = await controller.getConstructorPolesBySeason(constructorId);

      expect(result).toEqual([]);
      expect(service.getConstructorPolePositionsBySeason).toHaveBeenCalledWith(constructorId);
    });

    it('should handle service errors', async () => {
      const constructorId = 1;
      const error = new Error('Database error');
      mockRacesService.getConstructorPolePositionsBySeason.mockRejectedValue(error);

      await expect(controller.getConstructorPolesBySeason(constructorId)).rejects.toThrow('Database error');
    });
  });

  describe('getConstructorPointsByCircuit', () => {
    it('should return points grouped by circuit', async () => {
      const constructorId = 1;
      const pointsByCircuit = [
        { circuit_name: 'Monaco', total_points: 25.0 },
        { circuit_name: 'Silverstone', total_points: 18.0 },
      ];
      mockRacesService.getConstructorPointsByCircuit.mockResolvedValue(pointsByCircuit);

      const result = await controller.getConstructorPointsByCircuit(constructorId);

      expect(result).toEqual(pointsByCircuit);
      expect(service.getConstructorPointsByCircuit).toHaveBeenCalledTimes(1);
      expect(service.getConstructorPointsByCircuit).toHaveBeenCalledWith(constructorId);
    });

    it('should return empty array when no points exist', async () => {
      const constructorId = 2;
      mockRacesService.getConstructorPointsByCircuit.mockResolvedValue([]);

      const result = await controller.getConstructorPointsByCircuit(constructorId);

      expect(result).toEqual([]);
      expect(service.getConstructorPointsByCircuit).toHaveBeenCalledWith(constructorId);
    });

    it('should handle service errors', async () => {
      const constructorId = 1;
      const error = new Error('Database error');
      mockRacesService.getConstructorPointsByCircuit.mockRejectedValue(error);

      await expect(controller.getConstructorPointsByCircuit(constructorId)).rejects.toThrow('Database error');
    });
  });

  describe('Controller Integration', () => {
    it('should have all required methods', () => {
      expect(typeof controller.findAll).toBe('function');
      expect(typeof controller.years).toBe('function');
      expect(typeof controller.findOne).toBe('function');
      expect(typeof controller.getConstructorPoles).toBe('function');
      expect(typeof controller.getConstructorPolesBySeason).toBe('function');
      expect(typeof controller.getConstructorPointsByCircuit).toBe('function');
    });

    it('should be injectable', () => {
      expect(controller).toBeInstanceOf(RacesController);
    });
  });

  describe('Error Handling', () => {
    it('should propagate service errors in findAll', async () => {
      const error = new Error('Service error');
      mockRacesService.findAll.mockRejectedValue(error);

      await expect(controller.findAll({})).rejects.toThrow('Service error');
    });

    it('should propagate service errors in years', async () => {
      const error = new Error('Service error');
      mockRacesService.listYears.mockRejectedValue(error);

      await expect(controller.years()).rejects.toThrow('Service error');
    });

    it('should propagate service errors in findOne', async () => {
      const error = new Error('Service error');
      mockRacesService.findOne.mockRejectedValue(error);

      await expect(controller.findOne('1')).rejects.toThrow('Service error');
    });
  });

  describe('Data Validation', () => {
    it('should handle empty query parameters', async () => {
      mockRacesService.findAll.mockResolvedValue(mockRaces);

      await controller.findAll({});

      expect(service.findAll).toHaveBeenCalledWith({});
    });

    it('should handle complex query parameters', async () => {
      const complexQuery = {
        year: 2023,
        season: 1,
        season_id: 1,
        circuit: 'Monaco',
        round: 1,
      };
      mockRacesService.findAll.mockResolvedValue(mockRaces);

      await controller.findAll(complexQuery);

      expect(service.findAll).toHaveBeenCalledWith(complexQuery);
    });
  });
});

describe('RaceResultsController', () => {
  let controller: RaceResultsController;
  let sessionRepo: Repository<Session>;
  let resultsRepo: Repository<RaceResult>;

  const mockSessionRepo = {
    find: jest.fn() as jest.MockedFunction<Repository<Session>['find']>,
  };

  const mockResultsRepo = {
    find: jest.fn() as jest.MockedFunction<Repository<RaceResult>['find']>,
  };

  const mockSession: Session = {
    id: 1,
    type: 'RACE',
    time: '14:00:00',
    weather: { temperature: 25, humidity: 60 },
    race_id: 1,
    start_time: new Date('2023-01-01T14:00:00'),
    race: null as any,
    raceResults: [],
    qualifyingResults: [],
    laps: [],
    pitStops: [],
    tireStints: [],
    raceEvents: [],
  } as Session;

  const mockRaceResult: RaceResult = {
    id: 1,
    position: 1,
    points: 25,
    driver_id: 1,
    constructor_id: 1,
    session_id: 1,
    driver: {
      id: 1,
      first_name: 'Lewis',
      last_name: 'Hamilton',
      code: 'HAM',
      nationality: 'British',
      date_of_birth: '1985-01-07',
      country_id: 1,
    } as any,
    team: {
      id: 1,
      name: 'Mercedes',
      nationality: 'German',
      url: 'https://mercedes.com',
    } as any,
    session: mockSession,
  } as RaceResult;

  const mockRaceResults: RaceResult[] = [mockRaceResult];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RaceResultsController],
      providers: [
        {
          provide: getRepositoryToken(Session),
          useValue: mockSessionRepo,
        },
        {
          provide: getRepositoryToken(RaceResult),
          useValue: mockResultsRepo,
        },
      ],
    }).compile();

    controller = module.get<RaceResultsController>(RaceResultsController);
    sessionRepo = module.get<Repository<Session>>(getRepositoryToken(Session));
    resultsRepo = module.get<Repository<RaceResult>>(getRepositoryToken(RaceResult));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('byQuery', () => {
    it('should return race results by raceId query parameter', async () => {
      mockSessionRepo.find.mockResolvedValue([mockSession]);
      mockResultsRepo.find.mockResolvedValue(mockRaceResults);

      const result = await controller.byQuery('985', undefined);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        session_id: 1,
        driver_id: 1,
        driver_code: 'HAM',
        driver_name: 'Lewis Hamilton',
        constructor_id: 1,
        constructor_name: 'Mercedes',
        position: 1,
        points: 25,
      });
      expect(sessionRepo.find).toHaveBeenCalledWith({
        where: { race: { id: 985 }, type: expect.objectContaining({ _type: 'in', _value: ['RACE'] }) } as any,
        select: ['id'],
      });
    });

    it('should return race results by race_id query parameter', async () => {
      mockSessionRepo.find.mockResolvedValue([mockSession]);
      mockResultsRepo.find.mockResolvedValue(mockRaceResults);

      const result = await controller.byQuery(undefined, '985');

      expect(result).toHaveLength(1);
      expect(sessionRepo.find).toHaveBeenCalledWith({
        where: { race: { id: 985 }, type: expect.objectContaining({ _type: 'in', _value: ['RACE'] }) } as any,
        select: ['id'],
      });
    });

    it('should prioritize raceId over race_id', async () => {
      mockSessionRepo.find.mockResolvedValue([mockSession]);
      mockResultsRepo.find.mockResolvedValue(mockRaceResults);

      await controller.byQuery('123', '456');

      expect(sessionRepo.find).toHaveBeenCalledWith({
        where: { race: { id: 123 }, type: expect.objectContaining({ _type: 'in', _value: ['RACE'] }) } as any,
        select: ['id'],
      });
    });

    it('should return empty array when no valid raceId provided', async () => {
      const result = await controller.byQuery(undefined, undefined);

      expect(result).toEqual([]);
      expect(sessionRepo.find).not.toHaveBeenCalled();
    });

    it('should return empty array when raceId is not a number', async () => {
      const result = await controller.byQuery('invalid', undefined);

      expect(result).toEqual([]);
      expect(sessionRepo.find).not.toHaveBeenCalled();
    });

    it('should return empty array when no sessions found', async () => {
      mockSessionRepo.find.mockResolvedValue([]);

      const result = await controller.byQuery('985', undefined);

      expect(result).toEqual([]);
      expect(resultsRepo.find).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      mockSessionRepo.find.mockRejectedValue(error);

      await expect(controller.byQuery('985', undefined)).rejects.toThrow('Database error');
    });
  });

  describe('byParamA', () => {
    it('should return race results by raceId parameter', async () => {
      mockSessionRepo.find.mockResolvedValue([mockSession]);
      mockResultsRepo.find.mockResolvedValue(mockRaceResults);

      const result = await controller.byParamA(985);

      expect(result).toHaveLength(1);
      expect(sessionRepo.find).toHaveBeenCalledWith({
        where: { race: { id: 985 }, type: expect.objectContaining({ _type: 'in', _value: ['RACE'] }) } as any,
        select: ['id'],
      });
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      mockSessionRepo.find.mockRejectedValue(error);

      await expect(controller.byParamA(985)).rejects.toThrow('Database error');
    });
  });

  describe('byParamB', () => {
    it('should return race results by raceId parameter', async () => {
      mockSessionRepo.find.mockResolvedValue([mockSession]);
      mockResultsRepo.find.mockResolvedValue(mockRaceResults);

      const result = await controller.byParamB(985);

      expect(result).toHaveLength(1);
      expect(sessionRepo.find).toHaveBeenCalledWith({
        where: { race: { id: 985 }, type: expect.objectContaining({ _type: 'in', _value: ['RACE'] }) } as any,
        select: ['id'],
      });
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      mockSessionRepo.find.mockRejectedValue(error);

      await expect(controller.byParamB(985)).rejects.toThrow('Database error');
    });
  });

  describe('fetchForRace (private method)', () => {
    it('should map race results to UI-friendly format', async () => {
      mockSessionRepo.find.mockResolvedValue([mockSession]);
      mockResultsRepo.find.mockResolvedValue(mockRaceResults);

      const result = await controller.byQuery('985', undefined);

      expect(result[0]).toMatchObject({
        session_id: 1,
        driver_id: 1,
        driver_code: 'HAM',
        driver_name: 'Lewis Hamilton',
        constructor_id: 1,
        constructor_name: 'Mercedes',
        position: 1,
        points: 25,
        grid: null,
        time_ms: null,
        status: null,
        fastest_lap_rank: null,
        points_for_fastest_lap: null,
      });
    });

    it('should handle missing driver information', async () => {
      const raceResultWithoutDriver = {
        ...mockRaceResult,
        driver: null,
        driver_id: 1,
      };
      mockSessionRepo.find.mockResolvedValue([mockSession]);
      mockResultsRepo.find.mockResolvedValue([raceResultWithoutDriver as any]);

      const result = await controller.byQuery('985', undefined);

      expect(result[0]).toMatchObject({
        driver_id: 1,
        driver_code: undefined,
        driver_name: undefined,
      });
    });

    it('should handle missing team information', async () => {
      const raceResultWithoutTeam = {
        ...mockRaceResult,
        team: null,
        constructor_id: 1,
      };
      mockSessionRepo.find.mockResolvedValue([mockSession]);
      mockResultsRepo.find.mockResolvedValue([raceResultWithoutTeam as any]);

      const result = await controller.byQuery('985', undefined);

      expect(result[0]).toMatchObject({
        constructor_id: 1,
        constructor_name: undefined,
      });
    });

    it('should handle partial driver names', async () => {
      const raceResultWithPartialName = {
        ...mockRaceResult,
        driver: {
          first_name: 'Lewis',
          last_name: null,
        },
      };
      mockSessionRepo.find.mockResolvedValue([mockSession]);
      mockResultsRepo.find.mockResolvedValue([raceResultWithPartialName as any]);

      const result = await controller.byQuery('985', undefined);

      expect(result[0].driver_name).toBe('Lewis');
    });

    it('should handle empty driver names', async () => {
      const raceResultWithEmptyName = {
        ...mockRaceResult,
        driver: {
          first_name: null,
          last_name: null,
        },
      };
      mockSessionRepo.find.mockResolvedValue([mockSession]);
      mockResultsRepo.find.mockResolvedValue([raceResultWithEmptyName as any]);

      const result = await controller.byQuery('985', undefined);

      expect(result[0].driver_name).toBe('');
    });
  });

  describe('Controller Integration', () => {
    it('should have all required methods', () => {
      expect(typeof controller.byQuery).toBe('function');
      expect(typeof controller.byParamA).toBe('function');
      expect(typeof controller.byParamB).toBe('function');
    });

    it('should be injectable', () => {
      expect(controller).toBeInstanceOf(RaceResultsController);
    });
  });

  describe('Error Handling', () => {
    it('should handle session repository errors', async () => {
      const error = new Error('Session repository error');
      mockSessionRepo.find.mockRejectedValue(error);

      await expect(controller.byQuery('985', undefined)).rejects.toThrow('Session repository error');
    });

    it('should handle results repository errors', async () => {
      mockSessionRepo.find.mockResolvedValue([mockSession]);
      const error = new Error('Results repository error');
      mockResultsRepo.find.mockRejectedValue(error);

      await expect(controller.byQuery('985', undefined)).rejects.toThrow('Results repository error');
    });
  });

  describe('Data Validation', () => {
    it('should handle multiple sessions for same race', async () => {
      const multipleSessions = [
        { ...mockSession, id: 1 },
        { ...mockSession, id: 2 },
      ];
      mockSessionRepo.find.mockResolvedValue(multipleSessions as any);
      mockResultsRepo.find.mockResolvedValue(mockRaceResults);

      const result = await controller.byQuery('985', undefined);

      expect(result).toHaveLength(1);
      expect(resultsRepo.find).toHaveBeenCalledWith({
        where: { session: { id: expect.objectContaining({ _type: 'in', _value: [1, 2] }) } } as any,
        relations: ['driver', 'team', 'session'],
        order: { position: 'ASC' },
      });
    });

    it('should handle empty results', async () => {
      mockSessionRepo.find.mockResolvedValue([mockSession]);
      mockResultsRepo.find.mockResolvedValue([]);

      const result = await controller.byQuery('985', undefined);

      expect(result).toEqual([]);
    });
  });
});
