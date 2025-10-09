import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { RaceResultsService } from './race-results.service';
import { RaceResult } from './race-results.entity';
import { DriverStandingMaterialized } from '../standings/driver-standings-materialized.entity';
import { Season } from '../seasons/seasons.entity';
import { Race } from '../races/races.entity';
import { SupabaseService } from '../supabase/supabase.service';

describe('RaceResultsService', () => {
  let service: RaceResultsService;
  let supabaseService: jest.Mocked<SupabaseService>;
  let driverStandingsRepo: jest.Mocked<Repository<DriverStandingMaterialized>>;
  let raceResultRepository: jest.Mocked<Repository<RaceResult>>;
  let seasonRepository: jest.Mocked<Repository<Season>>;
  let raceRepository: jest.Mocked<Repository<Race>>;
  let dataSource: jest.Mocked<DataSource>;

  const mockRaceResult: RaceResult = {
    id: 1,
    session_id: 1,
    driver_id: 1,
    constructor_id: 1,
    position: 1,
    points: 25,
    fastest_lap: false,
    fastest_lap_time: '1:23.456',
    fastest_lap_rank: null,
    points_for_fastest_lap: 0,
    status: 'Finished',
    time: '1:30:45.123',
    time_ms: 5445123,
    grid: 1,
    laps: 58,
    driver: { id: 1, name: 'Lewis Hamilton' } as any,
    team: { id: 1, name: 'Mercedes' } as any,
    session: { id: 1 } as any,
  } as RaceResult;

  beforeEach(async () => {
    const mockSupabaseService = {
      client: {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: [], error: null }),
            }),
            eq: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      },
    };

    const mockDriverStandingsRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const mockRaceResultRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const mockSeasonRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const mockRaceRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const mockDataSource = {
      query: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RaceResultsService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
        {
          provide: getRepositoryToken(DriverStandingMaterialized),
          useValue: mockDriverStandingsRepo,
        },
        {
          provide: getRepositoryToken(RaceResult),
          useValue: mockRaceResultRepo,
        },
        {
          provide: getRepositoryToken(Season),
          useValue: mockSeasonRepo,
        },
        {
          provide: getRepositoryToken(Race),
          useValue: mockRaceRepo,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<RaceResultsService>(RaceResultsService);
    supabaseService = module.get(SupabaseService);
    driverStandingsRepo = module.get(getRepositoryToken(DriverStandingMaterialized));
    raceResultRepository = module.get(getRepositoryToken(RaceResult));
    seasonRepository = module.get(getRepositoryToken(Season));
    raceRepository = module.get(getRepositoryToken(Race));
    dataSource = module.get(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getBySessionId', () => {
    it('should return race results for a session', async () => {
      const sessionId = 1;
      const mockData = [mockRaceResult];

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      });

      (supabaseService.client.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const result = await service.getBySessionId(sessionId);

      expect(result).toEqual(mockData);
      expect(supabaseService.client.from).toHaveBeenCalledWith('race_results');
      expect(mockSelect).toHaveBeenCalledWith('*');
    });

    it('should throw error when Supabase fails', async () => {
      const sessionId = 1;
      const error = { message: 'Database connection failed' };

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: null, error }),
      });

      (supabaseService.client.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      await expect(service.getBySessionId(sessionId)).rejects.toThrow(
        'Failed to fetch race_results: Database connection failed'
      );
    });

    it('should handle empty results', async () => {
      const sessionId = 1;

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

      (supabaseService.client.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const result = await service.getBySessionId(sessionId);

      expect(result).toEqual([]);
    });
  });

  describe('getByConstructor', () => {
    it('should return race results for a constructor', async () => {
      const constructorId = 1;
      const mockData = [mockRaceResult];

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      });

      (supabaseService.client.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const result = await service.getByConstructor(constructorId);

      expect(result).toEqual(mockData);
      expect(supabaseService.client.from).toHaveBeenCalledWith('race_results');
    });

    it('should throw error when Supabase fails', async () => {
      const constructorId = 1;
      const error = { message: 'Database connection failed' };

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: null, error }),
      });

      (supabaseService.client.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      await expect(service.getByConstructor(constructorId)).rejects.toThrow(
        'Failed to fetch race_results: Database connection failed'
      );
    });

    it('should handle empty results', async () => {
      const constructorId = 1;

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

      (supabaseService.client.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const result = await service.getByConstructor(constructorId);

      expect(result).toEqual([]);
    });
  });

  describe('getConstructorStats', () => {
    it('should return constructor statistics', async () => {
      const constructorId = 1;
      const mockResults = [
        { position: 1, points: 25 },
        { position: 2, points: 18 },
        { position: 3, points: 15 },
        { position: 5, points: 10 },
        { position: 8, points: 4 },
      ];

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: mockResults, error: null }),
      });

      (supabaseService.client.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const result = await service.getConstructorStats(constructorId);

      expect(result).toEqual({
        totalRaces: 5,
        wins: 1,
        podiums: 3,
        totalPoints: 72,
      });
    });

    it('should throw error when Supabase fails', async () => {
      const constructorId = 1;
      const error = { message: 'Database connection failed' };

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: null, error }),
      });

      (supabaseService.client.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      await expect(service.getConstructorStats(constructorId)).rejects.toThrow(
        'Failed to fetch race_results: Database connection failed'
      );
    });

    it('should handle no wins or podiums', async () => {
      const constructorId = 1;
      const mockResults = [
        { position: 10, points: 1 },
        { position: 15, points: 0 },
      ];

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: mockResults, error: null }),
      });

      (supabaseService.client.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const result = await service.getConstructorStats(constructorId);

      expect(result).toEqual({
        totalRaces: 2,
        wins: 0,
        podiums: 0,
        totalPoints: 1,
      });
    });
  });

  describe('getPointsPerSeason', () => {
    it('should return points per season for constructor', async () => {
      const constructorId = 1;
      const mockRaceResults = [
        { race_id: 1, points: 25 },
        { race_id: 2, points: 18 },
        { race_id: 3, points: 15 },
      ];
      const mockRaces = [
        { id: 1, season_id: 2023 },
        { id: 2, season_id: 2023 },
        { id: 3, season_id: 2024 },
      ];

      let callCount = 0;
      (supabaseService.client.from as jest.Mock).mockImplementation((table) => {
        if (table === 'race_results') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: mockRaceResults, error: null }),
            }),
          };
        } else if (table === 'races') {
          return {
            select: jest.fn().mockReturnValue({
              in: jest.fn().mockResolvedValue({ data: mockRaces, error: null }),
            }),
          };
        }
      });

      const result = await service.getPointsPerSeason(constructorId);

      expect(result).toEqual([
        { season: 2023, points: 43 },
        { season: 2024, points: 15 },
      ]);
    });

    it('should throw error when race_results fetch fails', async () => {
      const constructorId = 1;
      const error = { message: 'Database connection failed' };

      (supabaseService.client.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: null, error }),
        }),
      });

      await expect(service.getPointsPerSeason(constructorId)).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should throw error when races fetch fails', async () => {
      const constructorId = 1;
      const mockRaceResults = [{ race_id: 1, points: 25 }];
      const error = { message: 'Races fetch failed' };

      (supabaseService.client.from as jest.Mock).mockImplementation((table) => {
        if (table === 'race_results') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: mockRaceResults, error: null }),
            }),
          };
        } else if (table === 'races') {
          return {
            select: jest.fn().mockReturnValue({
              in: jest.fn().mockResolvedValue({ data: null, error }),
            }),
          };
        }
      });

      await expect(service.getPointsPerSeason(constructorId)).rejects.toThrow(
        'Races fetch failed'
      );
    });
  });

  describe('getConstructorPointsPerSeason', () => {
    it('should return constructor points per season with stats', async () => {
      const constructorId = 1;
      const mockRaceResults = [
        { session_id: 1, points: 25, position: 1 },
        { session_id: 2, points: 18, position: 2 },
        { session_id: 3, points: 15, position: 3 },
      ];
      const mockSessions = [
        { id: 1, race_id: 1 },
        { id: 2, race_id: 2 },
        { id: 3, race_id: 3 },
      ];
      const mockRaces = [
        { id: 1, season_id: 2023 },
        { id: 2, season_id: 2023 },
        { id: 3, season_id: 2024 },
      ];

      (supabaseService.client.from as jest.Mock).mockImplementation((table) => {
        if (table === 'race_results') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: mockRaceResults, error: null }),
            }),
          };
        } else if (table === 'sessions') {
          return {
            select: jest.fn().mockReturnValue({
              in: jest.fn().mockResolvedValue({ data: mockSessions, error: null }),
            }),
          };
        } else if (table === 'races') {
          return {
            select: jest.fn().mockReturnValue({
              in: jest.fn().mockResolvedValue({ data: mockRaces, error: null }),
            }),
          };
        }
      });

      const result = await service.getConstructorPointsPerSeason(constructorId);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        season: 2023,
        points: 43,
        wins: 1,
        podiums: 2,
        totalRaces: 2,
      });
      expect(result[1]).toEqual({
        season: 2024,
        points: 15,
        wins: 0,
        podiums: 1,
        totalRaces: 1,
      });
    });

    it('should return empty array when no results', async () => {
      const constructorId = 1;

      (supabaseService.client.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

      const result = await service.getConstructorPointsPerSeason(constructorId);

      expect(result).toEqual([]);
    });

    it('should throw error when race_results fetch fails', async () => {
      const constructorId = 1;
      const error = { message: 'Database error' };

      (supabaseService.client.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: null, error }),
        }),
      });

      await expect(service.getConstructorPointsPerSeason(constructorId)).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('getConstructorPointsProgression', () => {
    it('should return constructor points progression for a season', async () => {
      const constructorId = 1;
      const seasonId = 2023;
      const mockRaceResults = [
        { session_id: 1, points: 25 },
        { session_id: 2, points: 18 },
      ];
      const mockSessions = [
        { id: 1, race_id: 1 },
        { id: 2, race_id: 2 },
      ];
      const mockRaces = [
        { id: 1, season_id: 2023, round: 1, name: 'Bahrain GP' },
        { id: 2, season_id: 2023, round: 2, name: 'Saudi Arabian GP' },
      ];

      (supabaseService.client.from as jest.Mock).mockImplementation((table) => {
        if (table === 'race_results') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: mockRaceResults, error: null }),
            }),
          };
        } else if (table === 'sessions') {
          return {
            select: jest.fn().mockReturnValue({
              in: jest.fn().mockResolvedValue({ data: mockSessions, error: null }),
            }),
          };
        } else if (table === 'races') {
          return {
            select: jest.fn().mockReturnValue({
              in: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({ data: mockRaces, error: null }),
              }),
            }),
          };
        }
      });

      const result = await service.getConstructorPointsProgression(constructorId, seasonId);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        round: 1,
        raceName: 'Bahrain GP',
        racePoints: 25,
        cumulativePoints: 25,
      });
      expect(result[1]).toEqual({
        round: 2,
        raceName: 'Saudi Arabian GP',
        racePoints: 18,
        cumulativePoints: 43,
      });
    });

    it('should return empty array when no results', async () => {
      const constructorId = 1;
      const seasonId = 2023;

      (supabaseService.client.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

      const result = await service.getConstructorPointsProgression(constructorId, seasonId);

      expect(result).toEqual([]);
    });

    it('should throw error when fetch fails', async () => {
      const constructorId = 1;
      const seasonId = 2023;
      const error = { message: 'Database error' };

      (supabaseService.client.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: null, error }),
        }),
      });

      await expect(service.getConstructorPointsProgression(constructorId, seasonId)).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('debugConstructorRaces', () => {
    it('should return debug information for constructor races', async () => {
      const constructorId = 1;
      const seasonId = 2023;
      const mockRaces = [
        { id: 1, name: 'Bahrain GP', season_id: 2023 },
        { id: 2, name: 'Saudi Arabian GP', season_id: 2023 },
      ];
      const mockSessions = [
        { id: 1, race_id: 1 },
        { id: 2, race_id: 2 },
      ];
      const mockResults = [
        { id: 1, session_id: 1, constructor_id: 1, position: 1, points: 25 },
        { id: 2, session_id: 2, constructor_id: 1, position: 2, points: 18 },
      ];

      (supabaseService.client.from as jest.Mock).mockImplementation((table) => {
        if (table === 'races') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: mockRaces, error: null }),
            }),
          };
        } else if (table === 'sessions') {
          return {
            select: jest.fn().mockReturnValue({
              in: jest.fn().mockResolvedValue({ data: mockSessions, error: null }),
            }),
          };
        } else if (table === 'race_results') {
          return {
            select: jest.fn().mockReturnValue({
              in: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({ data: mockResults, error: null }),
              }),
            }),
          };
        }
      });

      const result = await service.debugConstructorRaces(constructorId, seasonId);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        season: 2023,
        race: 'Bahrain GP',
        position: 1,
        points: 25,
      });
    });

    it('should throw error when races fetch fails', async () => {
      const constructorId = 1;
      const seasonId = 2023;
      const error = { message: 'Races fetch failed' };

      (supabaseService.client.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: null, error }),
        }),
      });

      await expect(service.debugConstructorRaces(constructorId, seasonId)).rejects.toThrow(
        'Races fetch failed'
      );
    });
  });

  describe('getAllConstructorsProgression', () => {
    it('should return progression for all active constructors', async () => {
      const seasonId = 2023;
      const mockConstructors = [
        { id: 1, name: 'Mercedes' },
        { id: 2, name: 'Ferrari' },
      ];
      const mockRaceResults = [
        { session_id: 1, points: 25 },
      ];
      const mockSessions = [{ id: 1, race_id: 1 }];
      const mockRaces = [
        { id: 1, season_id: 2023, round: 1, name: 'Bahrain GP' },
      ];

      (supabaseService.client.from as jest.Mock).mockImplementation((table) => {
        if (table === 'constructors') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: mockConstructors, error: null }),
            }),
          };
        } else if (table === 'race_results') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: mockRaceResults, error: null }),
            }),
          };
        } else if (table === 'sessions') {
          return {
            select: jest.fn().mockReturnValue({
              in: jest.fn().mockResolvedValue({ data: mockSessions, error: null }),
            }),
          };
        } else if (table === 'races') {
          return {
            select: jest.fn().mockReturnValue({
              in: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({ data: mockRaces, error: null }),
              }),
            }),
          };
        }
      });

      const result = await service.getAllConstructorsProgression(seasonId);

      expect(result).toHaveLength(2);
      expect(result[0].constructorId).toBe(1);
      expect(result[0].constructorName).toBe('Mercedes');
    });

    it('should return empty array when no constructors', async () => {
      const seasonId = 2023;

      (supabaseService.client.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

      const result = await service.getAllConstructorsProgression(seasonId);

      expect(result).toEqual([]);
    });

    it('should throw error when constructors fetch fails', async () => {
      const seasonId = 2023;
      const error = { message: 'Constructors fetch failed' };

      (supabaseService.client.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: null, error }),
        }),
      });

      await expect(service.getAllConstructorsProgression(seasonId)).rejects.toThrow(
        'Constructors fetch failed'
      );
    });
  });

  describe('getDriversPointsProgression', () => {
    it('should return drivers points progression for a season', async () => {
      const seasonId = 2023;
      const mockDrivers = [
        { id: 1, first_name: 'Lewis', last_name: 'Hamilton' },
        { id: 2, first_name: 'Max', last_name: 'Verstappen' },
      ];
      const mockRaceResults = [
        { driver_id: 1, points: 25, session_id: 1 },
        { driver_id: 2, points: 18, session_id: 1 },
      ];
      const mockSessions = [{ id: 1, race_id: 1 }];
      const mockRaces = [
        { id: 1, season_id: 2023, round: 1, name: 'Bahrain GP' },
      ];

      (supabaseService.client.from as jest.Mock).mockImplementation((table) => {
        if (table === 'drivers') {
          return {
            select: jest.fn().mockResolvedValue({ data: mockDrivers, error: null }),
          };
        } else if (table === 'race_results') {
          return {
            select: jest.fn().mockReturnValue({
              in: jest.fn().mockResolvedValue({ data: mockRaceResults, error: null }),
            }),
          };
        } else if (table === 'sessions') {
          return {
            select: jest.fn().mockReturnValue({
              in: jest.fn().mockResolvedValue({ data: mockSessions, error: null }),
            }),
          };
        } else if (table === 'races') {
          return {
            select: jest.fn().mockReturnValue({
              in: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({ data: mockRaces, error: null }),
              }),
            }),
          };
        }
      });

      const result = await service.getDriversPointsProgression(seasonId);

      expect(result).toHaveLength(2);
      expect(result[0].driverName).toBe('Lewis Hamilton');
      expect(result[0].progression[0].cumulativePoints).toBe(25);
    });

    it('should return empty array when no results', async () => {
      const seasonId = 2023;
      const mockDrivers = [{ id: 1, first_name: 'Lewis', last_name: 'Hamilton' }];

      (supabaseService.client.from as jest.Mock).mockImplementation((table) => {
        if (table === 'drivers') {
          return {
            select: jest.fn().mockResolvedValue({ data: mockDrivers, error: null }),
          };
        } else if (table === 'race_results') {
          return {
            select: jest.fn().mockReturnValue({
              in: jest.fn().mockResolvedValue({ data: [], error: null }),
            }),
          };
        }
      });

      const result = await service.getDriversPointsProgression(seasonId);

      expect(result).toEqual([]);
    });

    it('should throw error when drivers fetch fails', async () => {
      const seasonId = 2023;
      const error = { message: 'Drivers fetch failed' };

      (supabaseService.client.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: null, error }),
      });

      await expect(service.getDriversPointsProgression(seasonId)).rejects.toThrow(
        'Drivers fetch failed'
      );
    });
  });

  describe('getDriversProgression', () => {
    it('should return drivers progression using SQL query', async () => {
      const seasonId = 2023;
      const mockSeason = { id: 2023, year: 2023 };
      const mockDriverStandings = [
        { driverId: 1, driverFullName: 'Lewis Hamilton' },
        { driverId: 2, driverFullName: 'Max Verstappen' },
      ];
      const mockProgressionData = [
        {
          driverId: 1,
          driverName: 'Lewis Hamilton',
          round: 1,
          raceName: 'Bahrain GP',
          cumulativePoints: 25,
          racePoints: 25,
        },
        {
          driverId: 2,
          driverName: 'Max Verstappen',
          round: 1,
          raceName: 'Bahrain GP',
          cumulativePoints: 18,
          racePoints: 18,
        },
      ];

      seasonRepository.findOne = jest.fn().mockResolvedValue(mockSeason);
      driverStandingsRepo.find = jest.fn().mockResolvedValue(mockDriverStandings);
      dataSource.query = jest.fn().mockResolvedValue(mockProgressionData);

      const result = await service.getDriversProgression(seasonId);

      expect(result).toHaveLength(2);
      expect(result[0].driverId).toBe(1);
      expect(result[0].driverName).toBe('Lewis Hamilton');
      expect(result[0].progression).toHaveLength(1);
      expect(seasonRepository.findOne).toHaveBeenCalledWith({
        where: { id: seasonId },
        select: ['year'],
      });
    });

    it('should throw error when season not found', async () => {
      const seasonId = 2023;

      seasonRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.getDriversProgression(seasonId)).rejects.toThrow(
        'Season with ID 2023 not found'
      );
    });

    it('should return empty array when no active drivers', async () => {
      const seasonId = 2023;
      const mockSeason = { id: 2023, year: 2023 };

      seasonRepository.findOne = jest.fn().mockResolvedValue(mockSeason);
      driverStandingsRepo.find = jest.fn().mockResolvedValue([]);

      const result = await service.getDriversProgression(seasonId);

      expect(result).toEqual([]);
    });
  });

  describe('getDriversPointsProgression3', () => {
    it('should return drivers points progression for latest season', async () => {
      const mockSeason = { id: 2023, year: 2023 };
      const mockDrivers = [
        { driverId: 1, driverFullName: 'Lewis Hamilton', constructorName: 'Mercedes' },
      ];
      const mockRaceResults = [
        { driver_id: 1, points: 25, session_id: 1 },
      ];
      const mockSessions = [{ id: 1, race_id: 1 }];
      const mockRaces = [
        { id: 1, round: 1, name: 'Bahrain GP' },
      ];

      (supabaseService.client.from as jest.Mock).mockImplementation((table) => {
        if (table === 'seasons') {
          return {
            select: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                limit: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({ data: mockSeason, error: null }),
                }),
              }),
            }),
          };
        } else if (table === 'driver_standings_materialized') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: mockDrivers, error: null }),
            }),
          };
        } else if (table === 'race_results') {
          return {
            select: jest.fn().mockReturnValue({
              in: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({ data: mockRaceResults, error: null }),
              }),
            }),
          };
        } else if (table === 'sessions') {
          return {
            select: jest.fn().mockReturnValue({
              in: jest.fn().mockResolvedValue({ data: mockSessions, error: null }),
            }),
          };
        } else if (table === 'races') {
          return {
            select: jest.fn().mockReturnValue({
              in: jest.fn().mockResolvedValue({ data: mockRaces, error: null }),
            }),
          };
        }
      });

      const result = await service.getDriversPointsProgression3();

      expect(result).toHaveLength(1);
      expect(result[0].driverName).toBe('Lewis Hamilton');
      expect(result[0].driverTeam).toBe('Mercedes');
      expect(result[0].progression[0].cumulativePoints).toBe(25);
    });

    it('should throw error when latest season not found', async () => {
      (supabaseService.client.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
            }),
          }),
        }),
      });

      await expect(service.getDriversPointsProgression3()).rejects.toThrow('Not found');
    });

    it('should return empty array when no drivers in latest season', async () => {
      const mockSeason = { id: 2023, year: 2023 };

      (supabaseService.client.from as jest.Mock).mockImplementation((table) => {
        if (table === 'seasons') {
          return {
            select: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                limit: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({ data: mockSeason, error: null }),
                }),
              }),
            }),
          };
        } else if (table === 'driver_standings_materialized') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: [], error: null }),
            }),
          };
        }
      });

      const result = await service.getDriversPointsProgression3();

      expect(result).toEqual([]);
    });
  });

  describe('service structure', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should be an instance of RaceResultsService', () => {
      expect(service).toBeInstanceOf(RaceResultsService);
    });

    it('should have all required methods', () => {
      expect(typeof service.getBySessionId).toBe('function');
      expect(typeof service.getByConstructor).toBe('function');
      expect(typeof service.getConstructorStats).toBe('function');
      expect(typeof service.getPointsPerSeason).toBe('function');
      expect(typeof service.getConstructorPointsPerSeason).toBe('function');
      expect(typeof service.getConstructorPointsProgression).toBe('function');
      expect(typeof service.debugConstructorRaces).toBe('function');
      expect(typeof service.getAllConstructorsProgression).toBe('function');
      expect(typeof service.getDriversPointsProgression).toBe('function');
      expect(typeof service.getDriversProgression).toBe('function');
      expect(typeof service.getDriversPointsProgression3).toBe('function');
    });
  });
});