import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StandingsService } from './standings.service';
import { DriverStandingMaterialized } from './driver-standings-materialized.entity';
import { Season } from '../seasons/seasons.entity';
import { Race } from '../races/races.entity';
import { Session } from '../sessions/sessions.entity';
import { RaceResult } from '../race-results/race-results.entity';
import { Driver } from '../drivers/drivers.entity';
import { ConstructorEntity } from '../constructors/constructors.entity';
import { NotFoundException } from '@nestjs/common';

describe('StandingsService', () => {
  let service: StandingsService;
  let standingsViewRepository: jest.Mocked<Repository<DriverStandingMaterialized>>;
  let seasonRepository: jest.Mocked<Repository<Season>>;
  let raceRepository: jest.Mocked<Repository<Race>>;
  let sessionRepository: jest.Mocked<Repository<Session>>;
  let raceResultRepository: jest.Mocked<Repository<RaceResult>>;
  let driverRepository: jest.Mocked<Repository<Driver>>;
  let constructorRepository: jest.Mocked<Repository<ConstructorEntity>>;

  const mockStandingsData: DriverStandingMaterialized[] = [
    {
      driverId: 1,
      seasonYear: 2023,
      seasonPoints: 500,
      seasonWins: 10,
      driverFullName: 'Max Verstappen',
      constructorName: 'Red Bull Racing',
      driverNumber: 1,
      countryCode: 'NLD',
      profileImageUrl: 'http://example.com/verstappen.jpg',
    } as DriverStandingMaterialized,
    {
      driverId: 2,
      seasonYear: 2023,
      seasonPoints: 350,
      seasonWins: 5,
      driverFullName: 'Sergio Perez',
      constructorName: 'Red Bull Racing',
      driverNumber: 11,
      countryCode: 'MEX',
      profileImageUrl: 'http://example.com/perez.jpg',
    } as DriverStandingMaterialized,
    {
      driverId: 3,
      seasonYear: 2023,
      seasonPoints: 280,
      seasonWins: 2,
      driverFullName: 'Lewis Hamilton',
      constructorName: 'Mercedes',
      driverNumber: 44,
      countryCode: 'GBR',
      profileImageUrl: 'http://example.com/hamilton.jpg',
    } as DriverStandingMaterialized,
  ];

  beforeEach(async () => {
    const mockStandingsRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const mockSeasonRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const mockRaceRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const mockSessionRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const mockRaceResultRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
      manager: {
        find: jest.fn(),
      },
    };

    const mockDriverRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const mockConstructorRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StandingsService,
        {
          provide: getRepositoryToken(DriverStandingMaterialized),
          useValue: mockStandingsRepo,
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
          provide: getRepositoryToken(Session),
          useValue: mockSessionRepo,
        },
        {
          provide: getRepositoryToken(RaceResult),
          useValue: mockRaceResultRepo,
        },
        {
          provide: getRepositoryToken(Driver),
          useValue: mockDriverRepo,
        },
        {
          provide: getRepositoryToken(ConstructorEntity),
          useValue: mockConstructorRepo,
        },
      ],
    }).compile();

    service = module.get<StandingsService>(StandingsService);
    standingsViewRepository = module.get(getRepositoryToken(DriverStandingMaterialized));
    seasonRepository = module.get(getRepositoryToken(Season));
    raceRepository = module.get(getRepositoryToken(Race));
    sessionRepository = module.get(getRepositoryToken(Session));
    raceResultRepository = module.get(getRepositoryToken(RaceResult));
    driverRepository = module.get(getRepositoryToken(Driver));
    constructorRepository = module.get(getRepositoryToken(ConstructorEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('service initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should be an instance of StandingsService', () => {
      expect(service).toBeInstanceOf(StandingsService);
    });

    it('should have all required methods', () => {
      expect(typeof service.getStandingsByYearAndRound).toBe('function');
      expect(typeof service.getStandingsByYear).toBe('function');
    });
  });

  describe('getStandingsByYearAndRound', () => {
    it('should return driver standings for a given year and round', async () => {
      standingsViewRepository.find.mockResolvedValue(mockStandingsData);

      const result = await service.getStandingsByYearAndRound(2023, 10);

      expect(result).toBeDefined();
      expect(result.driverStandings).toHaveLength(3);
      expect(result.constructorStandings).toEqual([]);
      
      expect(result.driverStandings[0]).toEqual({
        position: 1,
        points: 500,
        wins: 10,
        constructorName: 'Red Bull Racing',
        driverId: 1,
        driverFullName: 'Max Verstappen',
        driverNumber: 1,
        driverCountryCode: 'NLD',
        driverProfileImageUrl: 'http://example.com/verstappen.jpg',
      });

      expect(standingsViewRepository.find).toHaveBeenCalledWith({
        where: { seasonYear: 2023 },
        order: { seasonPoints: 'DESC' },
      });
    });

    it('should return empty standings when no data found', async () => {
      standingsViewRepository.find.mockResolvedValue([]);

      const result = await service.getStandingsByYearAndRound(2023, 10);

      expect(result).toBeDefined();
      expect(result.driverStandings).toEqual([]);
      expect(result.constructorStandings).toEqual([]);
    });

    it('should correctly order drivers by points descending', async () => {
      const unorderedData = [
        { ...mockStandingsData[2], seasonPoints: 280 },
        { ...mockStandingsData[0], seasonPoints: 500 },
        { ...mockStandingsData[1], seasonPoints: 350 },
      ];

      standingsViewRepository.find.mockResolvedValue(unorderedData);

      const result = await service.getStandingsByYearAndRound(2023, 10);

      expect(result.driverStandings[0].points).toBe(280);
      expect(result.driverStandings[0].position).toBe(1);
      expect(result.driverStandings[1].points).toBe(500);
      expect(result.driverStandings[1].position).toBe(2);
      expect(result.driverStandings[2].points).toBe(350);
      expect(result.driverStandings[2].position).toBe(3);
    });

    it('should handle null optional fields correctly', async () => {
      const dataWithNulls: DriverStandingMaterialized[] = [
        {
          driverId: 1,
          seasonYear: 2023,
          seasonPoints: 500,
          seasonWins: 10,
          driverFullName: 'Test Driver',
          constructorName: 'Test Team',
          driverNumber: null,
          countryCode: null,
          profileImageUrl: null,
        } as DriverStandingMaterialized,
      ];

      standingsViewRepository.find.mockResolvedValue(dataWithNulls);

      const result = await service.getStandingsByYearAndRound(2023, 10);

      expect(result.driverStandings[0].driverNumber).toBeNull();
      expect(result.driverStandings[0].driverCountryCode).toBeNull();
      expect(result.driverStandings[0].driverProfileImageUrl).toBeNull();
    });

    it('should convert points to number type', async () => {
      standingsViewRepository.find.mockResolvedValue(mockStandingsData);

      const result = await service.getStandingsByYearAndRound(2023, 10);

      expect(typeof result.driverStandings[0].points).toBe('number');
      expect(result.driverStandings[0].points).toBe(500);
    });

    it('should handle different years correctly', async () => {
      const data2024: DriverStandingMaterialized[] = [
        {
          ...mockStandingsData[0],
          seasonYear: 2024,
        },
      ];

      standingsViewRepository.find.mockResolvedValue(data2024);

      await service.getStandingsByYearAndRound(2024, 5);

      expect(standingsViewRepository.find).toHaveBeenCalledWith({
        where: { seasonYear: 2024 },
        order: { seasonPoints: 'DESC' },
      });
    });
  });

  describe('getStandingsByYear', () => {
    it('should return standings for the latest round of a year', async () => {
      const mockSeason = { id: 1, year: 2023 } as Season;
      const mockRace = { id: 10, season: mockSeason, round: 22 } as Race;

      seasonRepository.findOne.mockResolvedValue(mockSeason);
      raceRepository.findOne.mockResolvedValue(mockRace);
      standingsViewRepository.find.mockResolvedValue(mockStandingsData);

      const result = await service.getStandingsByYear(2023);

      expect(result).toBeDefined();
      expect(result.driverStandings).toHaveLength(3);
      
      expect(seasonRepository.findOne).toHaveBeenCalledWith({
        where: { year: 2023 },
      });
      
      expect(raceRepository.findOne).toHaveBeenCalledWith({
        where: { season: { id: 1 } },
        order: { round: 'DESC' },
      });
      
      expect(standingsViewRepository.find).toHaveBeenCalledWith({
        where: { seasonYear: 2023 },
        order: { seasonPoints: 'DESC' },
      });
    });

    it('should throw NotFoundException when season not found', async () => {
      seasonRepository.findOne.mockResolvedValue(null);

      await expect(service.getStandingsByYear(2023)).rejects.toThrow(
        NotFoundException,
      );
      
      await expect(service.getStandingsByYear(2023)).rejects.toThrow(
        'Season 2023 not found',
      );

      expect(raceRepository.findOne).not.toHaveBeenCalled();
      expect(standingsViewRepository.find).not.toHaveBeenCalled();
    });

    it('should return empty standings when no races found', async () => {
      const mockSeason = { id: 1, year: 2023 } as Season;

      seasonRepository.findOne.mockResolvedValue(mockSeason);
      raceRepository.findOne.mockResolvedValue(null);

      const result = await service.getStandingsByYear(2023);

      expect(result).toEqual({
        driverStandings: [],
        constructorStandings: [],
      });

      expect(standingsViewRepository.find).not.toHaveBeenCalled();
    });

    it('should handle multiple years correctly', async () => {
      const mockSeason2024 = { id: 2, year: 2024 } as Season;
      const mockRace2024 = { id: 20, season: mockSeason2024, round: 24 } as Race;

      seasonRepository.findOne.mockResolvedValue(mockSeason2024);
      raceRepository.findOne.mockResolvedValue(mockRace2024);
      standingsViewRepository.find.mockResolvedValue([]);

      await service.getStandingsByYear(2024);

      expect(seasonRepository.findOne).toHaveBeenCalledWith({
        where: { year: 2024 },
      });
      
      expect(raceRepository.findOne).toHaveBeenCalledWith({
        where: { season: { id: 2 } },
        order: { round: 'DESC' },
      });
    });
  });

  describe('addPositions (private helper)', () => {
    it('should add position numbers to standings array', () => {
      const unsortedStandings = [
        { points: 100, name: 'Driver B' },
        { points: 200, name: 'Driver A' },
        { points: 50, name: 'Driver C' },
      ];

      const result = service['addPositions'](unsortedStandings);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ points: 200, name: 'Driver A', position: 1 });
      expect(result[1]).toEqual({ points: 100, name: 'Driver B', position: 2 });
      expect(result[2]).toEqual({ points: 50, name: 'Driver C', position: 3 });
    });

    it('should sort by points descending', () => {
      const standings = [
        { points: 50 },
        { points: 150 },
        { points: 100 },
        { points: 200 },
      ];

      const result = service['addPositions'](standings);

      expect(result[0].points).toBe(200);
      expect(result[1].points).toBe(150);
      expect(result[2].points).toBe(100);
      expect(result[3].points).toBe(50);
    });

    it('should handle empty array', () => {
      const result = service['addPositions']([]);
      expect(result).toEqual([]);
    });

    it('should handle single element', () => {
      const standings = [{ points: 100, driver: 'Test' }];
      const result = service['addPositions'](standings);
      
      expect(result).toHaveLength(1);
      expect(result[0].position).toBe(1);
      expect(result[0].points).toBe(100);
    });

    it('should handle tied points correctly', () => {
      const standings = [
        { points: 100, name: 'Driver A' },
        { points: 100, name: 'Driver B' },
        { points: 50, name: 'Driver C' },
      ];

      const result = service['addPositions'](standings);

      expect(result[0].position).toBe(1);
      expect(result[1].position).toBe(2);
      expect(result[2].position).toBe(3);
      expect(result[0].points).toBe(100);
      expect(result[1].points).toBe(100);
    });
  });

  describe('calculateConstructorStandings (private method)', () => {
    it('should calculate constructor standings from session IDs', async () => {
      const mockConstructors = [
        { id: 1, name: 'Red Bull Racing' } as ConstructorEntity,
        { id: 2, name: 'Mercedes' } as ConstructorEntity,
      ];

      const mockRawStandings = [
        { teamId: 1, points: '500', wins: 10 },
        { teamId: 2, points: '350', wins: 5 },
      ];

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockRawStandings),
      };

      raceResultRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);
      raceResultRepository.manager.find = jest.fn().mockResolvedValue(mockConstructors);

      const result = await service['calculateConstructorStandings']([1, 2, 3]);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        team: mockConstructors[0],
        points: 500,
        wins: 10,
      });
      expect(result[1]).toEqual({
        team: mockConstructors[1],
        points: 350,
        wins: 5,
      });

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'rr.session_id IN (:...sessionIds)',
        { sessionIds: [1, 2, 3] },
      );
    });

    it('should handle empty session IDs array', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      raceResultRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);
      raceResultRepository.manager.find = jest.fn().mockResolvedValue([]);

      const result = await service['calculateConstructorStandings']([]);

      expect(result).toEqual([]);
    });

    it('should parse points as float', async () => {
      const mockConstructors = [
        { id: 1, name: 'Red Bull Racing' } as ConstructorEntity,
      ];

      const mockRawStandings = [
        { teamId: 1, points: '123.5', wins: 5 },
      ];

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockRawStandings),
      };

      raceResultRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);
      raceResultRepository.manager.find = jest.fn().mockResolvedValue(mockConstructors);

      const result = await service['calculateConstructorStandings']([1]);

      expect(result[0].points).toBe(123.5);
      expect(typeof result[0].points).toBe('number');
    });

    it('should handle null points and wins', async () => {
      const mockConstructors = [
        { id: 1, name: 'Test Team' } as ConstructorEntity,
      ];

      const mockRawStandings = [
        { teamId: 1, points: null, wins: null },
      ];

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockRawStandings),
      };

      raceResultRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);
      raceResultRepository.manager.find = jest.fn().mockResolvedValue(mockConstructors);

      const result = await service['calculateConstructorStandings']([1]);

      expect(result[0].points).toBe(0);
      expect(result[0].wins).toBe(0);
    });

    it('should map constructors correctly', async () => {
      const mockConstructors = [
        { id: 1, name: 'Red Bull Racing' } as ConstructorEntity,
        { id: 2, name: 'Mercedes' } as ConstructorEntity,
        { id: 3, name: 'Ferrari' } as ConstructorEntity,
      ];

      const mockRawStandings = [
        { teamId: 2, points: '350', wins: 5 },
        { teamId: 3, points: '250', wins: 3 },
        { teamId: 1, points: '500', wins: 10 },
      ];

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockRawStandings),
      };

      raceResultRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);
      raceResultRepository.manager.find = jest.fn().mockResolvedValue(mockConstructors);

      const result = await service['calculateConstructorStandings']([1, 2, 3]);

      expect(result[0].team?.name).toBe('Mercedes');
      expect(result[1].team?.name).toBe('Ferrari');
      expect(result[2].team?.name).toBe('Red Bull Racing');
    });
  });
});
