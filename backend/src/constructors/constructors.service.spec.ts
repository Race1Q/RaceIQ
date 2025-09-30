import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConstructorsService } from './constructors.service';
import { ConstructorEntity } from './constructors.entity';
import { NotFoundException } from '@nestjs/common';

// Mock the problematic imports
jest.mock('src/race-results/race-results.entity', () => ({
  RaceResult: 'RaceResult',
}), { virtual: true });

jest.mock('src/races/races.entity', () => ({
  Race: 'Race',
}), { virtual: true });

describe('ConstructorsService', () => {
  let service: ConstructorsService;
  let constructorRepository: jest.Mocked<Repository<ConstructorEntity>>;
  let raceResultRepository: jest.Mocked<Repository<any>>;
  let raceRepository: jest.Mocked<Repository<any>>;

  const mockConstructor: ConstructorEntity = {
    id: 1,
    name: 'Mercedes',
    nationality: 'German',
    url: 'https://example.com/mercedes',
    is_active: true,
    raceResults: [],
    qualifyingResults: [],
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConstructorsService,
        {
          provide: getRepositoryToken(ConstructorEntity),
          useValue: mockConstructorRepo,
        },
        {
          provide: getRepositoryToken('RaceResult'),
          useValue: mockRaceResultRepo,
        },
        {
          provide: getRepositoryToken('Race'),
          useValue: mockRaceRepo,
        },
      ],
    }).compile();

    service = module.get<ConstructorsService>(ConstructorsService);
    constructorRepository = module.get(getRepositoryToken(ConstructorEntity));
    raceResultRepository = module.get(getRepositoryToken('RaceResult'));
    raceRepository = module.get(getRepositoryToken('Race'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of constructors', async () => {
      constructorRepository.find.mockResolvedValue(mockConstructors);

      const result = await service.findAll();

      expect(result).toEqual(mockConstructors);
      expect(constructorRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no constructors exist', async () => {
      constructorRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(constructorRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database connection failed');
      constructorRepository.find.mockRejectedValue(error);

      await expect(service.findAll()).rejects.toThrow('Database connection failed');
      expect(constructorRepository.find).toHaveBeenCalledTimes(1);
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
        getRawMany: jest.fn().mockResolvedValue([
          { season: 2023, points: '409' },
          { season: 2024, points: '523' },
        ]),
      };

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
        getRawMany: jest.fn().mockResolvedValue([]),
      };

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
        getRawMany: jest.fn().mockRejectedValue(new Error('Query failed')),
      };

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
        getRawMany: jest.fn().mockResolvedValue([
          { season: 2023, points: '300' },
        ]),
      };

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
        getRawMany: jest.fn().mockResolvedValue([]),
      };

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
        getRawMany: jest.fn().mockResolvedValue([]),
      };

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
      expect(service.findAll.length).toBe(0);
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

  describe('return type validation', () => {
    it('should return Promise<ConstructorEntity[]> for findAll', async () => {
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
        getRawMany: jest.fn().mockResolvedValue([
          { season: 2023, points: '409' },
        ]),
      };

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