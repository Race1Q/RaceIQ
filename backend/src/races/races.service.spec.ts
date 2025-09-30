import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { RacesService } from './races.service';
import { Race } from './races.entity';
import { Session } from '../sessions/sessions.entity';
import { RaceResult } from '../race-results/race-results.entity';
import { QualifyingResult } from '../qualifying-results/qualifying-results.entity';
import { Lap } from '../laps/laps.entity';
import { PitStop } from '../pit-stops/pit-stops.entity';
import { TireStint } from '../tire-stints/tire-stints.entity';
import { RaceEvent } from '../race-events/race-events.entity';
import { RaceDetailsDto } from './dto/race-details.dto';

// Mock data
const mockRace: Race = {
  id: 1,
  name: 'Test Race',
  round: 1,
  date: new Date('2023-01-01'),
  time: '14:00:00',
  season: {
    id: 1,
    year: 2023,
    races: [],
  } as any,
  circuit: {
    id: 1,
    name: 'Test Circuit',
    location: 'Test Location',
    country_code: 'US',
    map_url: 'https://example.com',
    length_km: 5.0,
    race_distance_km: 300.0,
    track_layout: { type: 'FeatureCollection', features: [] },
    country: null,
  } as any,
} as Race;

const mockSession: Session = {
  id: 1,
  type: 'RACE',
  time: '14:00:00',
  weather: { temperature: 25, humidity: 60 },
  race: mockRace,
  race_id: 1,
  start_time: new Date('2023-01-01T14:00:00'),
  raceResults: [],
  qualifyingResults: [],
  laps: [],
  pitStops: [],
  tireStints: [],
  raceEvents: [],
} as Session;

const mockQualifyingSession: Session = {
  id: 2,
  type: 'QUALIFYING',
  time: '12:00:00',
  weather: { temperature: 24, humidity: 58 },
  race: mockRace,
  race_id: 1,
  start_time: new Date('2023-01-01T12:00:00'),
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

const mockQualifyingResult: QualifyingResult = {
  id: 1,
  position: 1,
  driver_id: 1,
  constructor_id: 1,
  session_id: 2,
  driver: {
    id: 1,
    first_name: 'Lewis',
    last_name: 'Hamilton',
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
  session: mockQualifyingSession,
} as QualifyingResult;

const mockLap: Lap = {
  id: 1,
  race_id: 1,
  driver_id: 1,
  lap_number: 1,
  position: 1,
  time_ms: 90000,
  sector_1_ms: 30000,
  sector_2_ms: 30000,
  sector_3_ms: 30000,
  is_pit_out_lap: false,
  race: mockRace,
  driver: {
    id: 1,
    first_name: 'Lewis',
    last_name: 'Hamilton',
    nationality: 'British',
    date_of_birth: '1985-01-07',
    country_id: 1,
  } as any,
} as Lap;

const mockPitStop: PitStop = {
  id: 1,
  race_id: 1,
  driver_id: 1,
  lap_number: 10,
  stop_number: 1,
  duration_ms: 2500,
  total_duration_in_pitlane_ms: 3000,
  stationary_duration_ms: 2500,
  race: mockRace,
  driver: {
    id: 1,
    first_name: 'Lewis',
    last_name: 'Hamilton',
    nationality: 'British',
    date_of_birth: '1985-01-07',
    country_id: 1,
  } as any,
} as PitStop;

const mockTireStint: TireStint = {
  id: 1,
  session_id: 1,
  driver_id: 1,
  stint_number: 1,
  compound: 'SOFT',
  session: mockSession,
  driver: {
    id: 1,
    first_name: 'Lewis',
    last_name: 'Hamilton',
    nationality: 'British',
    date_of_birth: '1985-01-07',
    country_id: 1,
  } as any,
} as TireStint;

const mockRaceEvent: RaceEvent = {
  id: 1,
  session_id: 1,
  lap_number: 5,
  type: 'SAFETY_CAR',
  session: mockSession,
} as RaceEvent;

const mockRaceDetails: RaceDetailsDto = {
  raceInfo: {
    ...mockRace,
    weather: mockSession.weather,
  },
  raceResults: [mockRaceResult],
  qualifyingResults: [mockQualifyingResult],
  laps: [mockLap],
  pitStops: [mockPitStop],
  tireStints: [mockTireStint],
  raceEvents: [mockRaceEvent],
};

// Mock repositories
const mockRaceRepository = {
  findOne: jest.fn() as jest.MockedFunction<Repository<Race>['findOne']>,
  find: jest.fn() as jest.MockedFunction<Repository<Race>['find']>,
  createQueryBuilder: jest.fn() as jest.MockedFunction<Repository<Race>['createQueryBuilder']>,
};

const mockSessionRepository = {
  find: jest.fn() as jest.MockedFunction<Repository<Session>['find']>,
};

const mockRaceResultRepository = {
  find: jest.fn() as jest.MockedFunction<Repository<RaceResult>['find']>,
  createQueryBuilder: jest.fn() as jest.MockedFunction<Repository<RaceResult>['createQueryBuilder']>,
  count: jest.fn() as jest.MockedFunction<Repository<RaceResult>['count']>,
};

const mockQualifyingResultRepository = {
  find: jest.fn() as jest.MockedFunction<Repository<QualifyingResult>['find']>,
  createQueryBuilder: jest.fn() as jest.MockedFunction<Repository<QualifyingResult>['createQueryBuilder']>,
  count: jest.fn() as jest.MockedFunction<Repository<QualifyingResult>['count']>,
};

const mockLapRepository = {
  find: jest.fn() as jest.MockedFunction<Repository<Lap>['find']>,
};

const mockPitStopRepository = {
  find: jest.fn() as jest.MockedFunction<Repository<PitStop>['find']>,
};

const mockTireStintRepository = {
  find: jest.fn() as jest.MockedFunction<Repository<TireStint>['find']>,
};

const mockRaceEventRepository = {
  find: jest.fn() as jest.MockedFunction<Repository<RaceEvent>['find']>,
};

describe('RacesService', () => {
  let service: RacesService;
  let raceRepository: Repository<Race>;
  let sessionRepository: Repository<Session>;
  let raceResultRepository: Repository<RaceResult>;
  let qualifyingResultRepository: Repository<QualifyingResult>;
  let lapRepository: Repository<Lap>;
  let pitStopRepository: Repository<PitStop>;
  let tireStintRepository: Repository<TireStint>;
  let raceEventRepository: Repository<RaceEvent>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RacesService,
        {
          provide: getRepositoryToken(Race),
          useValue: mockRaceRepository,
        },
        {
          provide: getRepositoryToken(Session),
          useValue: mockSessionRepository,
        },
        {
          provide: getRepositoryToken(RaceResult),
          useValue: mockRaceResultRepository,
        },
        {
          provide: getRepositoryToken(QualifyingResult),
          useValue: mockQualifyingResultRepository,
        },
        {
          provide: getRepositoryToken(Lap),
          useValue: mockLapRepository,
        },
        {
          provide: getRepositoryToken(PitStop),
          useValue: mockPitStopRepository,
        },
        {
          provide: getRepositoryToken(TireStint),
          useValue: mockTireStintRepository,
        },
        {
          provide: getRepositoryToken(RaceEvent),
          useValue: mockRaceEventRepository,
        },
      ],
    }).compile();

    service = module.get<RacesService>(RacesService);
    raceRepository = module.get<Repository<Race>>(getRepositoryToken(Race));
    sessionRepository = module.get<Repository<Session>>(getRepositoryToken(Session));
    raceResultRepository = module.get<Repository<RaceResult>>(getRepositoryToken(RaceResult));
    qualifyingResultRepository = module.get<Repository<QualifyingResult>>(getRepositoryToken(QualifyingResult));
    lapRepository = module.get<Repository<Lap>>(getRepositoryToken(Lap));
    pitStopRepository = module.get<Repository<PitStop>>(getRepositoryToken(PitStop));
    tireStintRepository = module.get<Repository<TireStint>>(getRepositoryToken(TireStint));
    raceEventRepository = module.get<Repository<RaceEvent>>(getRepositoryToken(RaceEvent));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Definition', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should be an instance of RacesService', () => {
      expect(service).toBeInstanceOf(RacesService);
    });
  });

  describe('getRaceDetails', () => {
    it('should return race details for valid race ID', async () => {
      mockRaceRepository.findOne.mockResolvedValue(mockRace as any);
      mockSessionRepository.find.mockResolvedValue([mockSession, mockQualifyingSession]);
      mockRaceResultRepository.find.mockResolvedValue([mockRaceResult]);
      mockQualifyingResultRepository.find.mockResolvedValue([mockQualifyingResult]);
      mockLapRepository.find.mockResolvedValue([mockLap]);
      mockPitStopRepository.find.mockResolvedValue([mockPitStop]);
      mockTireStintRepository.find.mockResolvedValue([mockTireStint]);
      mockRaceEventRepository.find.mockResolvedValue([mockRaceEvent]);

      const result = await service.getRaceDetails(1);

      expect(result).toEqual(mockRaceDetails);
      expect(raceRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['circuit', 'season'],
      });
    });

    it('should throw NotFoundException for invalid race ID', async () => {
      mockRaceRepository.findOne.mockResolvedValue(null as any);

      await expect(service.getRaceDetails(999)).rejects.toThrow(
        new NotFoundException('Race with ID 999 not found')
      );
    });

    it('should handle race with no sessions', async () => {
      mockRaceRepository.findOne.mockResolvedValue(mockRace as any);
      mockSessionRepository.find.mockResolvedValue([]);
      mockLapRepository.find.mockResolvedValue([mockLap]);
      mockPitStopRepository.find.mockResolvedValue([mockPitStop]);
      mockTireStintRepository.find.mockResolvedValue([]);
      mockRaceEventRepository.find.mockResolvedValue([]);

      const result = await service.getRaceDetails(1);

      expect(result.raceResults).toEqual([]);
      expect(result.qualifyingResults).toEqual([]);
      expect(result.tireStints).toEqual([]);
      expect(result.raceEvents).toEqual([]);
    });

    it('should handle race with only race session', async () => {
      mockRaceRepository.findOne.mockResolvedValue(mockRace as any);
      mockSessionRepository.find.mockResolvedValue([mockSession]);
      mockRaceResultRepository.find.mockResolvedValue([mockRaceResult]);
      mockLapRepository.find.mockResolvedValue([mockLap]);
      mockPitStopRepository.find.mockResolvedValue([mockPitStop]);
      mockTireStintRepository.find.mockResolvedValue([mockTireStint]);
      mockRaceEventRepository.find.mockResolvedValue([mockRaceEvent]);

      const result = await service.getRaceDetails(1);

      expect(result.raceResults).toEqual([mockRaceResult]);
      expect(result.qualifyingResults).toEqual([]);
    });

    it('should handle race with only qualifying session', async () => {
      mockRaceRepository.findOne.mockResolvedValue(mockRace as any);
      mockSessionRepository.find.mockResolvedValue([mockQualifyingSession]);
      mockQualifyingResultRepository.find.mockResolvedValue([mockQualifyingResult]);
      mockLapRepository.find.mockResolvedValue([mockLap]);
      mockPitStopRepository.find.mockResolvedValue([mockPitStop]);
      mockTireStintRepository.find.mockResolvedValue([mockTireStint]);
      mockRaceEventRepository.find.mockResolvedValue([mockRaceEvent]);

      const result = await service.getRaceDetails(1);

      expect(result.raceResults).toEqual([]);
      expect(result.qualifyingResults).toEqual([mockQualifyingResult]);
    });

    it('should include weather information from race session', async () => {
      mockRaceRepository.findOne.mockResolvedValue(mockRace as any);
      mockSessionRepository.find.mockResolvedValue([mockSession, mockQualifyingSession]);
      mockRaceResultRepository.find.mockResolvedValue([mockRaceResult]);
      mockQualifyingResultRepository.find.mockResolvedValue([mockQualifyingResult]);
      mockLapRepository.find.mockResolvedValue([mockLap]);
      mockPitStopRepository.find.mockResolvedValue([mockPitStop]);
      mockTireStintRepository.find.mockResolvedValue([mockTireStint]);
      mockRaceEventRepository.find.mockResolvedValue([mockRaceEvent]);

      const result = await service.getRaceDetails(1);

      expect(result.raceInfo.weather).toEqual(mockSession.weather);
    });

    it('should handle null weather from race session', async () => {
      const sessionWithoutWeather = { ...mockSession, weather: null };
      mockRaceRepository.findOne.mockResolvedValue(mockRace as any);
      mockSessionRepository.find.mockResolvedValue([sessionWithoutWeather, mockQualifyingSession]);
      mockRaceResultRepository.find.mockResolvedValue([mockRaceResult]);
      mockQualifyingResultRepository.find.mockResolvedValue([mockQualifyingResult]);
      mockLapRepository.find.mockResolvedValue([mockLap]);
      mockPitStopRepository.find.mockResolvedValue([mockPitStop]);
      mockTireStintRepository.find.mockResolvedValue([mockTireStint]);
      mockRaceEventRepository.find.mockResolvedValue([mockRaceEvent]);

      const result = await service.getRaceDetails(1);

      expect(result.raceInfo.weather).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all races when no query parameters', async () => {
      mockRaceRepository.find.mockResolvedValue([mockRace] as any);

      const result = await service.findAll({});

      expect(result).toEqual([mockRace]);
      expect(raceRepository.find).toHaveBeenCalledWith({
        where: {},
        relations: ['circuit', 'season'],
        order: { round: 'ASC' },
      });
    });

    it('should filter by year when year parameter is provided', async () => {
      mockRaceRepository.find.mockResolvedValue([mockRace] as any);

      const result = await service.findAll({ year: '2023' });

      expect(result).toEqual([mockRace]);
      expect(raceRepository.find).toHaveBeenCalledWith({
        where: { season: { year: 2023 } } as any,
        relations: ['circuit', 'season'],
        order: { round: 'ASC' },
      });
    });

    it('should filter by season when season parameter is provided', async () => {
      mockRaceRepository.find.mockResolvedValue([mockRace] as any);

      const result = await service.findAll({ season: '2023' });

      expect(result).toEqual([mockRace]);
      expect(raceRepository.find).toHaveBeenCalledWith({
        where: { season: { year: 2023 } } as any,
        relations: ['circuit', 'season'],
        order: { round: 'ASC' },
      });
    });

    it('should filter by season_id when season_id parameter is provided', async () => {
      mockRaceRepository.find.mockResolvedValue([mockRace] as any);

      const result = await service.findAll({ season_id: '1' });

      expect(result).toEqual([mockRace]);
      expect(raceRepository.find).toHaveBeenCalledWith({
        where: { season: { id: 1 } } as any,
        relations: ['circuit', 'season'],
        order: { round: 'ASC' },
      });
    });

    it('should prioritize year over season parameter', async () => {
      mockRaceRepository.find.mockResolvedValue([mockRace] as any);

      const result = await service.findAll({ year: '2023', season: '2022' });

      expect(result).toEqual([mockRace]);
      expect(raceRepository.find).toHaveBeenCalledWith({
        where: { season: { year: 2023 } } as any,
        relations: ['circuit', 'season'],
        order: { round: 'ASC' },
      });
    });

    it('should handle invalid year parameter', async () => {
      mockRaceRepository.find.mockResolvedValue([mockRace] as any);

      const result = await service.findAll({ year: 'invalid' });

      expect(result).toEqual([mockRace]);
      expect(raceRepository.find).toHaveBeenCalledWith({
        where: {},
        relations: ['circuit', 'season'],
        order: { round: 'ASC' },
      });
    });

    it('should handle invalid season parameter', async () => {
      mockRaceRepository.find.mockResolvedValue([mockRace] as any);

      const result = await service.findAll({ season: 'invalid' });

      expect(result).toEqual([mockRace]);
      expect(raceRepository.find).toHaveBeenCalledWith({
        where: {},
        relations: ['circuit', 'season'],
        order: { round: 'ASC' },
      });
    });

    it('should handle invalid season_id parameter', async () => {
      mockRaceRepository.find.mockResolvedValue([mockRace] as any);

      const result = await service.findAll({ season_id: 'invalid' });

      expect(result).toEqual([mockRace]);
      expect(raceRepository.find).toHaveBeenCalledWith({
        where: {},
        relations: ['circuit', 'season'],
        order: { round: 'ASC' },
      });
    });
  });

  describe('listYears', () => {
    it('should return list of years', async () => {
      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockImplementation(() => Promise.resolve([
          { year: 2023 },
          { year: 2022 },
          { year: 2021 },
        ])),
      };
      (mockRaceRepository.createQueryBuilder as any).mockReturnValue(mockQueryBuilder);

      const result = await service.listYears();

      expect(result).toEqual([2023, 2022, 2021]);
      expect(raceRepository.createQueryBuilder).toHaveBeenCalledWith('race');
      expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith('race.season', 'season');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('DISTINCT season.year', 'year');
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('season.year', 'DESC');
    });

    it('should return empty array when no races exist', async () => {
      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockImplementation(() => Promise.resolve([])),
      };
      (mockRaceRepository.createQueryBuilder as any).mockReturnValue(mockQueryBuilder);

      const result = await service.listYears();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return race for valid ID', async () => {
      mockRaceRepository.findOne.mockResolvedValue(mockRace as any);

      const result = await service.findOne('1');

      expect(result).toEqual(mockRace);
      expect(raceRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['circuit', 'season'],
      });
    });

    it('should throw NotFoundException for invalid ID', async () => {
      mockRaceRepository.findOne.mockResolvedValue(null as any);

      await expect(service.findOne('999')).rejects.toThrow(
        new NotFoundException('Race with ID 999 not found')
      );
    });

    it('should handle string ID conversion', async () => {
      mockRaceRepository.findOne.mockResolvedValue(mockRace as any);

      const result = await service.findOne('123');

      expect(result).toEqual(mockRace);
      expect(raceRepository.findOne).toHaveBeenCalledWith({
        where: { id: 123 },
        relations: ['circuit', 'season'],
      });
    });
  });

  describe('getConstructorPolePositions', () => {
    it('should return pole position count for constructor', async () => {
      mockQualifyingResultRepository.count.mockResolvedValue(5 as any);

      const result = await service.getConstructorPolePositions(1);

      expect(result).toBe(5);
      expect(qualifyingResultRepository.count).toHaveBeenCalledWith({
        where: {
          constructor_id: 1,
          position: 1,
        },
      });
    });

    it('should return zero when no pole positions', async () => {
      mockQualifyingResultRepository.count.mockResolvedValue(0 as any);

      const result = await service.getConstructorPolePositions(1);

      expect(result).toBe(0);
    });
  });

  describe('getConstructorPolePositionsBySeason', () => {
    it('should return pole positions grouped by season', async () => {
      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockImplementation(() => Promise.resolve([
          { year: '2023', poles: '3' },
          { year: '2022', poles: '2' },
        ])),
      };
      (mockQualifyingResultRepository.createQueryBuilder as any).mockReturnValue(mockQueryBuilder);

      const result = await service.getConstructorPolePositionsBySeason(1);

      expect(result).toEqual([
        { year: 2023, poles: 3 },
        { year: 2022, poles: 2 },
      ]);
      expect(qualifyingResultRepository.createQueryBuilder).toHaveBeenCalledWith('qr');
      expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith('qr.session', 'session');
      expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith('session.race', 'race');
      expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith('race.season', 'season');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('qr.constructor_id = :constructorId', { constructorId: 1 });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('qr.position = 1');
    });

    it('should return empty array when no pole positions', async () => {
      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockImplementation(() => Promise.resolve([])),
      };
      (mockQualifyingResultRepository.createQueryBuilder as any).mockReturnValue(mockQueryBuilder);

      const result = await service.getConstructorPolePositionsBySeason(1);

      expect(result).toEqual([]);
    });
  });

  describe('getConstructorPointsByCircuit', () => {
    it('should return points grouped by circuit', async () => {
      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockImplementation(() => Promise.resolve([
          { circuit_name: 'Monaco', total_points: '25.0' },
          { circuit_name: 'Silverstone', total_points: '18.0' },
        ])),
      };
      (mockRaceResultRepository.createQueryBuilder as any).mockReturnValue(mockQueryBuilder);

      const result = await service.getConstructorPointsByCircuit(1);

      expect(result).toEqual([
        { circuit_name: 'Monaco', total_points: 25.0 },
        { circuit_name: 'Silverstone', total_points: 18.0 },
      ]);
      expect(raceResultRepository.createQueryBuilder).toHaveBeenCalledWith('rr');
      expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith('rr.session', 'session');
      expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith('session.race', 'race');
      expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith('race.circuit', 'circuit');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('rr.constructor_id = :constructorId', { constructorId: 1 });
    });

    it('should handle null total_points', async () => {
      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockImplementation(() => Promise.resolve([
          { circuit_name: 'Monaco', total_points: null },
        ])),
      };
      (mockRaceResultRepository.createQueryBuilder as any).mockReturnValue(mockQueryBuilder);

      const result = await service.getConstructorPointsByCircuit(1);

      expect(result).toEqual([
        { circuit_name: 'Monaco', total_points: 0 },
      ]);
    });

    it('should return empty array when no points', async () => {
      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockImplementation(() => Promise.resolve([])),
      };
      (mockRaceResultRepository.createQueryBuilder as any).mockReturnValue(mockQueryBuilder);

      const result = await service.getConstructorPointsByCircuit(1);

      expect(result).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors in getRaceDetails', async () => {
      const error = new Error('Database connection failed');
      mockRaceRepository.findOne.mockRejectedValue(error as any);

      await expect(service.getRaceDetails(1)).rejects.toThrow('Database connection failed');
    });

    it('should handle database errors in findAll', async () => {
      const error = new Error('Database connection failed');
      mockRaceRepository.find.mockRejectedValue(error as any);

      await expect(service.findAll({})).rejects.toThrow('Database connection failed');
    });

    it('should handle database errors in listYears', async () => {
      const error = new Error('Database connection failed');
      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockImplementation(() => Promise.reject(error)),
      };
      (mockRaceRepository.createQueryBuilder as any).mockReturnValue(mockQueryBuilder);

      await expect(service.listYears()).rejects.toThrow('Database connection failed');
    });

    it('should handle database errors in findOne', async () => {
      const error = new Error('Database connection failed');
      mockRaceRepository.findOne.mockRejectedValue(error as any);

      await expect(service.findOne('1')).rejects.toThrow('Database connection failed');
    });

    it('should handle database errors in getConstructorPolePositions', async () => {
      const error = new Error('Database connection failed');
      mockQualifyingResultRepository.count.mockRejectedValue(error as any);

      await expect(service.getConstructorPolePositions(1)).rejects.toThrow('Database connection failed');
    });

    it('should handle database errors in getConstructorPolePositionsBySeason', async () => {
      const error = new Error('Database connection failed');
      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockImplementation(() => Promise.reject(error)),
      };
      (mockQualifyingResultRepository.createQueryBuilder as any).mockReturnValue(mockQueryBuilder);

      await expect(service.getConstructorPolePositionsBySeason(1)).rejects.toThrow('Database connection failed');
    });

    it('should handle database errors in getConstructorPointsByCircuit', async () => {
      const error = new Error('Database connection failed');
      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockImplementation(() => Promise.reject(error)),
      };
      (mockRaceResultRepository.createQueryBuilder as any).mockReturnValue(mockQueryBuilder);

      await expect(service.getConstructorPointsByCircuit(1)).rejects.toThrow('Database connection failed');
    });
  });

  describe('Service Integration', () => {
    it('should have all required repositories injected', () => {
      expect(raceRepository).toBeDefined();
      expect(sessionRepository).toBeDefined();
      expect(raceResultRepository).toBeDefined();
      expect(qualifyingResultRepository).toBeDefined();
      expect(lapRepository).toBeDefined();
      expect(pitStopRepository).toBeDefined();
      expect(tireStintRepository).toBeDefined();
      expect(raceEventRepository).toBeDefined();
    });

    it('should be injectable', () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(RacesService);
    });
  });

  describe('Data Validation', () => {
    it('should handle empty race results', async () => {
      mockRaceRepository.findOne.mockResolvedValue(mockRace as any);
      mockSessionRepository.find.mockResolvedValue([mockSession, mockQualifyingSession]);
      mockRaceResultRepository.find.mockResolvedValue([]);
      mockQualifyingResultRepository.find.mockResolvedValue([mockQualifyingResult]);
      mockLapRepository.find.mockResolvedValue([mockLap]);
      mockPitStopRepository.find.mockResolvedValue([mockPitStop]);
      mockTireStintRepository.find.mockResolvedValue([mockTireStint]);
      mockRaceEventRepository.find.mockResolvedValue([mockRaceEvent]);

      const result = await service.getRaceDetails(1);

      expect(result.raceResults).toEqual([]);
    });

    it('should handle empty qualifying results', async () => {
      mockRaceRepository.findOne.mockResolvedValue(mockRace as any);
      mockSessionRepository.find.mockResolvedValue([mockSession, mockQualifyingSession]);
      mockRaceResultRepository.find.mockResolvedValue([mockRaceResult]);
      mockQualifyingResultRepository.find.mockResolvedValue([]);
      mockLapRepository.find.mockResolvedValue([mockLap]);
      mockPitStopRepository.find.mockResolvedValue([mockPitStop]);
      mockTireStintRepository.find.mockResolvedValue([mockTireStint]);
      mockRaceEventRepository.find.mockResolvedValue([mockRaceEvent]);

      const result = await service.getRaceDetails(1);

      expect(result.qualifyingResults).toEqual([]);
    });

    it('should handle empty laps', async () => {
      mockRaceRepository.findOne.mockResolvedValue(mockRace as any);
      mockSessionRepository.find.mockResolvedValue([mockSession, mockQualifyingSession]);
      mockRaceResultRepository.find.mockResolvedValue([mockRaceResult]);
      mockQualifyingResultRepository.find.mockResolvedValue([mockQualifyingResult]);
      mockLapRepository.find.mockResolvedValue([]);
      mockPitStopRepository.find.mockResolvedValue([mockPitStop]);
      mockTireStintRepository.find.mockResolvedValue([mockTireStint]);
      mockRaceEventRepository.find.mockResolvedValue([mockRaceEvent]);

      const result = await service.getRaceDetails(1);

      expect(result.laps).toEqual([]);
    });

    it('should handle empty pit stops', async () => {
      mockRaceRepository.findOne.mockResolvedValue(mockRace as any);
      mockSessionRepository.find.mockResolvedValue([mockSession, mockQualifyingSession]);
      mockRaceResultRepository.find.mockResolvedValue([mockRaceResult]);
      mockQualifyingResultRepository.find.mockResolvedValue([mockQualifyingResult]);
      mockLapRepository.find.mockResolvedValue([mockLap]);
      mockPitStopRepository.find.mockResolvedValue([]);
      mockTireStintRepository.find.mockResolvedValue([mockTireStint]);
      mockRaceEventRepository.find.mockResolvedValue([mockRaceEvent]);

      const result = await service.getRaceDetails(1);

      expect(result.pitStops).toEqual([]);
    });

    it('should handle empty tire stints', async () => {
      mockRaceRepository.findOne.mockResolvedValue(mockRace as any);
      mockSessionRepository.find.mockResolvedValue([mockSession, mockQualifyingSession]);
      mockRaceResultRepository.find.mockResolvedValue([mockRaceResult]);
      mockQualifyingResultRepository.find.mockResolvedValue([mockQualifyingResult]);
      mockLapRepository.find.mockResolvedValue([mockLap]);
      mockPitStopRepository.find.mockResolvedValue([mockPitStop]);
      mockTireStintRepository.find.mockResolvedValue([]);
      mockRaceEventRepository.find.mockResolvedValue([mockRaceEvent]);

      const result = await service.getRaceDetails(1);

      expect(result.tireStints).toEqual([]);
    });

    it('should handle empty race events', async () => {
      mockRaceRepository.findOne.mockResolvedValue(mockRace as any);
      mockSessionRepository.find.mockResolvedValue([mockSession, mockQualifyingSession]);
      mockRaceResultRepository.find.mockResolvedValue([mockRaceResult]);
      mockQualifyingResultRepository.find.mockResolvedValue([mockQualifyingResult]);
      mockLapRepository.find.mockResolvedValue([mockLap]);
      mockPitStopRepository.find.mockResolvedValue([mockPitStop]);
      mockTireStintRepository.find.mockResolvedValue([mockTireStint]);
      mockRaceEventRepository.find.mockResolvedValue([]);

      const result = await service.getRaceDetails(1);

      expect(result.raceEvents).toEqual([]);
    });
  });
});
