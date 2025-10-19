import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConstructorsService } from './constructors.service';
import { ConstructorEntity } from './constructors.entity';
import { NotFoundException } from '@nestjs/common';
import { DriverStandingMaterialized } from '../standings/driver-standings-materialized.entity';
import { ConstructorStandingsMaterialized } from './constructor-standings-materialized.entity';
import { RaceResult } from '../race-results/race-results.entity';
import { Race } from '../races/races.entity';

describe('ConstructorsService', () => {
  let service: ConstructorsService;
  let constructorRepository: jest.Mocked<Repository<ConstructorEntity>>;
  let raceResultRepository: jest.Mocked<Repository<any>>;
  let raceRepository: jest.Mocked<Repository<any>>;
  let standingsViewRepository: jest.Mocked<Repository<DriverStandingMaterialized>>;
  let constructorStandingsRepository: jest.Mocked<Repository<ConstructorStandingsMaterialized>>;
  let dataSource: jest.Mocked<DataSource>;

  const mockConstructor: ConstructorEntity = {
    id: 1,
    name: 'Mercedes',
    nationality: 'German',
    url: 'https://example.com/mercedes',
    is_active: true,
    raceResults: [],
    qualifyingResults: [],
    constructorDriverEntries: [],
  } as ConstructorEntity;

  const mockConstructors: ConstructorEntity[] = [
    mockConstructor,
    {
      id: 2,
      name: 'Ferrari',
      nationality: 'Italian',
      url: 'https://example.com/ferrari',
      is_active: true,
      raceResults: [],
      qualifyingResults: [],
      constructorDriverEntries: [],
    } as ConstructorEntity,
  ];

  beforeEach(async () => {
    const mockConstructorRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const mockRaceResultRepo = {
      createQueryBuilder: jest.fn(),
    };

    const mockRaceRepo = {
      createQueryBuilder: jest.fn(),
    };

    const mockStandingsViewRepo = {
      find: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const mockConstructorStandingsRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const mockDataSource = {
      query: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConstructorsService,
        {
          provide: getRepositoryToken(ConstructorEntity),
          useValue: mockConstructorRepo,
        },
        {
          provide: getRepositoryToken(RaceResult),
          useValue: mockRaceResultRepo,
        },
        {
          provide: getRepositoryToken(Race),
          useValue: mockRaceRepo,
        },
        {
          provide: getRepositoryToken(DriverStandingMaterialized),
          useValue: mockStandingsViewRepo,
        },
        {
          provide: getRepositoryToken(ConstructorStandingsMaterialized),
          useValue: mockConstructorStandingsRepo,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<ConstructorsService>(ConstructorsService);
    constructorRepository = module.get(getRepositoryToken(ConstructorEntity));
    raceResultRepository = module.get(getRepositoryToken(RaceResult));
    raceRepository = module.get(getRepositoryToken(Race));
    standingsViewRepository = module.get(getRepositoryToken(DriverStandingMaterialized));
    constructorStandingsRepository = module.get(getRepositoryToken(ConstructorStandingsMaterialized));
    dataSource = module.get(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of constructors when no year provided', async () => {
      // Mock the standings view query to return latest year
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        getRawOne: (jest.fn() as any).mockResolvedValue({ max: 2024 }),
      } as any;
      standingsViewRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      
      // Mock standings data
      standingsViewRepository.find.mockResolvedValue([
        { constructorName: 'Mercedes' } as any,
        { constructorName: 'Ferrari' } as any,
      ]);
      
      // Mock constructor repository
      constructorRepository.find.mockResolvedValue(mockConstructors);

      const result = await service.findAll();

      expect(result).toEqual(mockConstructors);
      expect(standingsViewRepository.createQueryBuilder).toHaveBeenCalledWith('ds');
      expect(standingsViewRepository.find).toHaveBeenCalledWith({ 
        where: { seasonYear: 2024 }, 
        select: ['constructorName'] 
      });
      expect(constructorRepository.find).toHaveBeenCalledWith({ 
        where: { name: expect.any(Object) }, 
        order: { name: 'ASC' } 
      });
    });

    it('should return constructors for specific year', async () => {
      // Mock standings data for specific year
      standingsViewRepository.find.mockResolvedValue([
        { constructorName: 'Mercedes' } as any,
        { constructorName: 'Ferrari' } as any,
      ]);
      
      // Mock constructor repository
      constructorRepository.find.mockResolvedValue(mockConstructors);

      const result = await service.findAll(2024);

      expect(result).toEqual(mockConstructors);
      expect(standingsViewRepository.find).toHaveBeenCalledWith({ 
        where: { seasonYear: 2024 }, 
        select: ['constructorName'] 
      });
      expect(constructorRepository.find).toHaveBeenCalledWith({ 
        where: { name: expect.any(Object) }, 
        order: { name: 'ASC' } 
      });
    });

    it('should fallback to latest year when no standings found for specific year', async () => {
      // Mock no standings for requested year
      standingsViewRepository.find.mockResolvedValueOnce([]);
      
      // Mock fallback query
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        getRawOne: (jest.fn() as any).mockResolvedValue({ max: 2023 }),
      } as any;
      standingsViewRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      
      // Mock standings for fallback year
      standingsViewRepository.find.mockResolvedValueOnce([
        { constructorName: 'Mercedes' } as any,
      ]);
      
      // Mock constructor repository
      constructorRepository.find.mockResolvedValue([mockConstructor]);

      const result = await service.findAll(2025);

      expect(result).toEqual([mockConstructor]);
      expect(standingsViewRepository.find).toHaveBeenCalledTimes(2);
    });

    it('should return all constructors when no standings data available', async () => {
      // Mock no latest year found
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        getRawOne: (jest.fn() as any).mockResolvedValue({ max: null }),
      } as any;
      standingsViewRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      
      // Mock constructor repository fallback
      constructorRepository.find.mockResolvedValue(mockConstructors);

      const result = await service.findAll();

      expect(result).toEqual(mockConstructors);
      expect(constructorRepository.find).toHaveBeenCalledWith({ order: { name: 'ASC' } });
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database connection failed');
      standingsViewRepository.createQueryBuilder.mockImplementation(() => {
        throw error;
      });

      await expect(service.findAll()).rejects.toThrow('Database connection failed');
    });
  });

  describe('findOne', () => {
    it('should return a constructor when valid id is provided', async () => {
      constructorRepository.findOne.mockResolvedValue(mockConstructor);

      const result = await service.findOne(1);

      expect(result).toEqual(mockConstructor);
      expect(constructorRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException when constructor not found', async () => {
      constructorRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(constructorRepository.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database connection failed');
      constructorRepository.findOne.mockRejectedValue(error);

      await expect(service.findOne(1)).rejects.toThrow('Database connection failed');
      expect(constructorRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should handle different constructor IDs', async () => {
      const ferrariConstructor = mockConstructors[1];
      constructorRepository.findOne.mockResolvedValue(ferrariConstructor);

      const result = await service.findOne(2);

      expect(result).toEqual(ferrariConstructor);
      expect(constructorRepository.findOne).toHaveBeenCalledWith({ where: { id: 2 } });
    });

    it('should handle zero id', async () => {
      constructorRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(0)).rejects.toThrow(NotFoundException);
      expect(constructorRepository.findOne).toHaveBeenCalledWith({ where: { id: 0 } });
    });

    it('should handle negative id', async () => {
      constructorRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(-1)).rejects.toThrow(NotFoundException);
      expect(constructorRepository.findOne).toHaveBeenCalledWith({ where: { id: -1 } });
    });
  });

  describe('getPointsPerSeason', () => {
    it('should return points per season for valid constructor', async () => {
      // Mock constructor exists check
      constructorRepository.findOne.mockResolvedValue(mockConstructor);
      
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: (jest.fn() as any).mockResolvedValue([
          { season: 2023, points: '409' },
          { season: 2024, points: '523' },
        ]),
      } as any;

      raceResultRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getPointsPerSeason(1);

      expect(result).toEqual([
        { season: 2023, points: 409 },
        { season: 2024, points: 523 },
      ]);
      expect(constructorRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(raceResultRepository.createQueryBuilder).toHaveBeenCalledWith('result');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('race.season_id', 'season');
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith('SUM(result.points)', 'points');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('result.constructor_id = :constructorId', { constructorId: 1 });
    });

    it('should return empty array when no points data exists', async () => {
      // Mock constructor exists check
      constructorRepository.findOne.mockResolvedValue(mockConstructor);
      
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: (jest.fn() as any).mockResolvedValue([]),
      } as any;

      raceResultRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getPointsPerSeason(999);

      expect(result).toEqual([]);
    });

    it('should handle query builder errors', async () => {
      // Mock constructor exists check
      constructorRepository.findOne.mockResolvedValue(mockConstructor);
      
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: (jest.fn() as any).mockRejectedValue(new Error('Query failed')),
      } as any;

      raceResultRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.getPointsPerSeason(1)).rejects.toThrow('Query failed');
    });

    it('should handle different constructor IDs', async () => {
      // Mock constructor exists check
      constructorRepository.findOne.mockResolvedValue(mockConstructors[1]);
      
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: (jest.fn() as any).mockResolvedValue([
          { season: 2023, points: '300' },
        ]),
      } as any;

      raceResultRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getPointsPerSeason(2);

      expect(result).toEqual([{ season: 2023, points: 300 }]);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('result.constructor_id = :constructorId', { constructorId: 2 });
    });

    it('should handle zero id', async () => {
      // Mock constructor exists check
      constructorRepository.findOne.mockResolvedValue(mockConstructor);
      
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: (jest.fn() as any).mockResolvedValue([]),
      } as any;

      raceResultRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getPointsPerSeason(0);

      expect(result).toEqual([]);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('result.constructor_id = :constructorId', { constructorId: 0 });
    });

    it('should handle negative id', async () => {
      // Mock constructor exists check
      constructorRepository.findOne.mockResolvedValue(mockConstructor);
      
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: (jest.fn() as any).mockResolvedValue([]),
      } as any;

      raceResultRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getPointsPerSeason(-1);

      expect(result).toEqual([]);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('result.constructor_id = :constructorId', { constructorId: -1 });
    });
  });

  describe('findAllActive', () => {
    it('should return only active constructors', async () => {
      const activeConstructors = mockConstructors.filter(c => c.is_active);
      constructorRepository.find.mockResolvedValue(activeConstructors);

      const result = await service.findAllActive();

      expect(result).toEqual(activeConstructors);
      expect(constructorRepository.find).toHaveBeenCalledWith({ where: { is_active: true } });
    });

    it('should return empty array when no active constructors exist', async () => {
      constructorRepository.find.mockResolvedValue([]);

      const result = await service.findAllActive();

      expect(result).toEqual([]);
      expect(constructorRepository.find).toHaveBeenCalledWith({ where: { is_active: true } });
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database connection failed');
      constructorRepository.find.mockRejectedValue(error);

      await expect(service.findAllActive()).rejects.toThrow('Database connection failed');
      expect(constructorRepository.find).toHaveBeenCalledWith({ where: { is_active: true } });
    });
  });

  describe('service structure', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should be an instance of ConstructorsService', () => {
      expect(service).toBeInstanceOf(ConstructorsService);
    });

    it('should have all required methods', () => {
      expect(typeof service.findAll).toBe('function');
      expect(typeof service.findOne).toBe('function');
      expect(typeof service.getPointsPerSeason).toBe('function');
      expect(typeof service.findAllActive).toBe('function');
    });
  });

  describe('method signatures', () => {
    it('should have findAll method with correct signature', () => {
      expect(service.findAll.length).toBe(1);
    });

    it('should have findOne method with correct signature', () => {
      expect(service.findOne.length).toBe(1);
    });

    it('should have getPointsPerSeason method with correct signature', () => {
      expect(service.getPointsPerSeason.length).toBe(1);
    });

    it('should have findAllActive method with correct signature', () => {
      expect(service.findAllActive.length).toBe(0);
    });
  });

  describe('findAllConstructors', () => {
    it('should return all constructors ordered by name', async () => {
      constructorRepository.find.mockResolvedValue(mockConstructors);

      const result = await service.findAllConstructors();

      expect(result).toEqual(mockConstructors);
      expect(constructorRepository.find).toHaveBeenCalledWith({ 
        order: { name: 'ASC' } 
      });
    });

    it('should return empty array when no constructors exist', async () => {
      constructorRepository.find.mockResolvedValue([]);

      const result = await service.findAllConstructors();

      expect(result).toEqual([]);
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database error');
      constructorRepository.find.mockRejectedValue(error);

      await expect(service.findAllConstructors()).rejects.toThrow('Database error');
    });
  });

  describe('getConstructorStatsAllYears', () => {
    it('should return mock data for valid constructor', async () => {
      constructorRepository.findOne.mockResolvedValue(mockConstructor);

      const result = await service.getConstructorStatsAllYears(1);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('year');
      expect(result[0]).toHaveProperty('stats');
      expect(result[0].year).toBe(2024);
      expect(constructorRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException when constructor not found', async () => {
      constructorRepository.findOne.mockResolvedValue(null);

      await expect(service.getConstructorStatsAllYears(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getConstructorStats', () => {
    it('should return career stats when no year provided', async () => {
      constructorRepository.findOne.mockResolvedValue(mockConstructor);

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: (jest.fn() as any).mockResolvedValue({
          wins: '10',
          podiums: '25',
          poles: '8',
          fastestLaps: '12',
          points: '500',
          dnfs: '5',
          races: '100',
        }),
      } as any;

      raceResultRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getConstructorStats(1);

      expect(result).toHaveProperty('constructorId', 1);
      expect(result).toHaveProperty('year', null);
      expect(result).toHaveProperty('career');
      expect(result.career.wins).toBe(10);
      expect(result.career.podiums).toBe(25);
    });

    it('should return career and year stats when year provided', async () => {
      constructorRepository.findOne.mockResolvedValue(mockConstructor);

      const mockCareerQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: (jest.fn() as any).mockResolvedValue({
          wins: '10',
          podiums: '25',
          poles: '8',
          fastestLaps: '12',
          points: '500',
          dnfs: '5',
          races: '100',
        }),
      } as any;

      const mockYearQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: (jest.fn() as any).mockResolvedValue({
          wins: '2',
          podiums: '5',
          poles: '1',
          fastestLaps: '3',
          points: '100',
          dnfs: '1',
          races: '20',
        }),
      } as any;

      raceResultRepository.createQueryBuilder
        .mockReturnValueOnce(mockCareerQueryBuilder)
        .mockReturnValueOnce(mockYearQueryBuilder);

      const result = await service.getConstructorStats(1, 2024);

      expect(result).toHaveProperty('year', 2024);
      expect(result).toHaveProperty('yearStats');
      expect(result.yearStats?.wins).toBe(2);
    });

    it('should throw NotFoundException when constructor not found', async () => {
      constructorRepository.findOne.mockResolvedValue(null);

      await expect(service.getConstructorStats(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getConstructorWorldChampionships', () => {
    it('should return number of championships', async () => {
      dataSource.query.mockResolvedValue([{ championships: '5' }]);

      const result = await service.getConstructorWorldChampionships(1);

      expect(result).toEqual({ championships: 5 });
      expect(dataSource.query).toHaveBeenCalledWith(expect.any(String), [1]);
    });

    it('should return 0 championships when constructor has none', async () => {
      dataSource.query.mockResolvedValue([{ championships: '0' }]);

      const result = await service.getConstructorWorldChampionships(999);

      expect(result).toEqual({ championships: 0 });
    });

    it('should return 0 when query fails', async () => {
      dataSource.query.mockRejectedValue(new Error('Query failed'));

      const result = await service.getConstructorWorldChampionships(1);

      expect(result).toEqual({ championships: 0 });
    });

    it('should handle empty result set', async () => {
      dataSource.query.mockResolvedValue([]);

      const result = await service.getConstructorWorldChampionships(1);

      expect(result).toEqual({ championships: 0 });
    });
  });

  describe('getConstructorBestTrack', () => {
    it('should return best track with stats', async () => {
      dataSource.query.mockResolvedValue([{
        circuit_name: 'Monaco',
        total_points: '150.5',
        races: '25',
        wins: '8',
      }]);

      const result = await service.getConstructorBestTrack(1);

      expect(result).toEqual({
        circuitName: 'Monaco',
        totalPoints: 150.5,
        races: 25,
        wins: 8,
      });
    });

    it('should return N/A when no data exists', async () => {
      dataSource.query.mockResolvedValue([]);

      const result = await service.getConstructorBestTrack(1);

      expect(result).toEqual({
        circuitName: 'N/A',
        totalPoints: 0,
        races: 0,
        wins: 0,
      });
    });

    it('should return N/A when query fails', async () => {
      dataSource.query.mockRejectedValue(new Error('Query failed'));

      const result = await service.getConstructorBestTrack(1);

      expect(result).toEqual({
        circuitName: 'N/A',
        totalPoints: 0,
        races: 0,
        wins: 0,
      });
    });
  });

  describe('getBulkConstructorStats', () => {
    it('should return bulk stats for current year with active constructors', async () => {
      const mockStandings = [
        {
          constructorId: 1,
          seasonYear: 2024,
          position: 1,
          seasonPoints: 500,
          seasonWins: 10,
          seasonPodiums: 25,
        },
      ];

      constructorStandingsRepository.find.mockResolvedValue(mockStandings as any);
      constructorRepository.find.mockResolvedValue([mockConstructor]);

      const result = await service.getBulkConstructorStats(2024, false);

      expect(result).toHaveProperty('seasonYear', 2024);
      expect(result).toHaveProperty('constructors');
      expect(result.constructors).toHaveLength(1);
      expect(result.constructors[0].constructorId).toBe(1);
      expect(result.constructors[0].stats.points).toBe(500);
    });

    it('should include historical constructors when requested', async () => {
      const mockStandings = [
        {
          constructorId: 1,
          seasonYear: 2020,
          position: 1,
          seasonPoints: 400,
          seasonWins: 8,
          seasonPodiums: 20,
        },
      ];

      constructorStandingsRepository.find.mockResolvedValue(mockStandings as any);
      constructorRepository.find.mockResolvedValue(mockConstructors);

      const result = await service.getBulkConstructorStats(2020, true);

      expect(result.seasonYear).toBe(2020);
      expect(constructorRepository.find).toHaveBeenCalledWith({ 
        order: { name: 'ASC' } 
      });
    });

    it('should return zero stats for constructors without standings', async () => {
      const mockStandings = [];

      constructorStandingsRepository.find.mockResolvedValue(mockStandings);
      constructorRepository.find.mockResolvedValue([mockConstructor]);

      const result = await service.getBulkConstructorStats(2024, false);

      expect(result.constructors[0].stats).toEqual({
        points: 0,
        wins: 0,
        podiums: 0,
        position: 0,
      });
    });

    it('should throw NotFoundException when query fails', async () => {
      constructorStandingsRepository.find.mockRejectedValue(new Error('DB Error'));

      await expect(service.getBulkConstructorStats(2024)).rejects.toThrow(NotFoundException);
    });
  });

  describe('return type validation', () => {
    it('should return Promise<ConstructorEntity[]> for findAll', async () => {
      // Mock the standings view query to return latest year
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        getRawOne: (jest.fn() as any).mockResolvedValue({ max: 2024 }),
      } as any;
      standingsViewRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      
      // Mock standings data
      standingsViewRepository.find.mockResolvedValue([
        { constructorName: 'Mercedes' } as any,
        { constructorName: 'Ferrari' } as any,
      ]);
      
      // Mock constructor repository
      constructorRepository.find.mockResolvedValue(mockConstructors);
      
      const result = service.findAll();
      expect(result).toBeInstanceOf(Promise);
      
      const resolved = await result;
      expect(Array.isArray(resolved)).toBe(true);
      expect(resolved.length).toBeGreaterThan(0);
    });

    it('should return Promise<ConstructorEntity> for findOne', async () => {
      constructorRepository.findOne.mockResolvedValue(mockConstructor);
      const result = service.findOne(1);
      expect(result).toBeInstanceOf(Promise);
      
      const resolved = await result;
      expect(resolved).toHaveProperty('id');
      expect(resolved).toHaveProperty('name');
      expect(resolved).toHaveProperty('nationality');
    });

    it('should return Promise<{season: number, points: number}[]> for getPointsPerSeason', async () => {
      // Mock constructor exists check
      constructorRepository.findOne.mockResolvedValue(mockConstructor);
      
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: (jest.fn() as any).mockResolvedValue([
          { season: 2023, points: '409' },
        ]),
      } as any;

      raceResultRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      
      const result = service.getPointsPerSeason(1);
      expect(result).toBeInstanceOf(Promise);
      
      const resolved = await result;
      expect(Array.isArray(resolved)).toBe(true);
      if (resolved.length > 0) {
        expect(resolved[0]).toHaveProperty('season');
        expect(resolved[0]).toHaveProperty('points');
      }
    });

    it('should return Promise<ConstructorEntity[]> for findAllActive', async () => {
      constructorRepository.find.mockResolvedValue(mockConstructors);
      const result = service.findAllActive();
      expect(result).toBeInstanceOf(Promise);
      
      const resolved = await result;
      expect(Array.isArray(resolved)).toBe(true);
    });
  });
});