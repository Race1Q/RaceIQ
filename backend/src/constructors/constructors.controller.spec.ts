import { Test, TestingModule } from '@nestjs/testing';
import { ConstructorsController } from './constructors.controller';
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

describe('ConstructorsController', () => {
  let controller: ConstructorsController;
  let service: jest.Mocked<ConstructorsService>;

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

  const mockPointsPerSeason = [
    { season: 2023, points: 409 },
    { season: 2024, points: 523 },
  ];

  beforeEach(async () => {
    const mockConstructorsService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      getPointsPerSeason: jest.fn(),
      findAllActive: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConstructorsController],
      providers: [
        {
          provide: ConstructorsService,
          useValue: mockConstructorsService,
        },
      ],
    }).compile();

    controller = module.get<ConstructorsController>(ConstructorsController);
    service = module.get(ConstructorsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of constructors', async () => {
      service.findAll.mockResolvedValue(mockConstructors);

      const result = await controller.findAll();

      expect(result).toEqual(mockConstructors);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no constructors exist', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors', async () => {
      const error = new Error('Database connection failed');
      service.findAll.mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow('Database connection failed');
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });

    it('should propagate service exceptions', async () => {
      const error = new Error('Service unavailable');
      service.findAll.mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow('Service unavailable');
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a constructor when valid id is provided', async () => {
      service.findOne.mockResolvedValue(mockConstructor);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockConstructor);
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(service.findOne).toHaveBeenCalledTimes(1);
    });

    it('should return constructor with all properties', async () => {
      service.findOne.mockResolvedValue(mockConstructor);

      const result = await controller.findOne(1);

      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('name', 'Mercedes');
      expect(result).toHaveProperty('nationality', 'German');
      expect(result).toHaveProperty('url', 'https://example.com/mercedes');
      expect(result).toHaveProperty('is_active', true);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('should handle NotFoundException from service', async () => {
      service.findOne.mockRejectedValue(new NotFoundException('Constructor not found'));

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(999);
    });

    it('should handle different constructor IDs', async () => {
      const ferrariConstructor = mockConstructors[1];
      service.findOne.mockResolvedValue(ferrariConstructor);

      const result = await controller.findOne(2);

      expect(result).toEqual(ferrariConstructor);
      expect(service.findOne).toHaveBeenCalledWith(2);
    });

    it('should handle service errors for findOne', async () => {
      const error = new Error('Database connection failed');
      service.findOne.mockRejectedValue(error);

      await expect(controller.findOne(1)).rejects.toThrow('Database connection failed');
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('should handle zero id', async () => {
      service.findOne.mockResolvedValue(null);

      const result = await controller.findOne(0);

      expect(result).toBeNull();
      expect(service.findOne).toHaveBeenCalledWith(0);
    });

    it('should handle negative id', async () => {
      service.findOne.mockResolvedValue(null);

      const result = await controller.findOne(-1);

      expect(result).toBeNull();
      expect(service.findOne).toHaveBeenCalledWith(-1);
    });
  });

  describe('getPointsPerSeason', () => {
    it('should return points per season for valid constructor', async () => {
      service.getPointsPerSeason.mockResolvedValue(mockPointsPerSeason);

      const result = await controller.getPointsPerSeason(1);

      expect(result).toEqual(mockPointsPerSeason);
      expect(service.getPointsPerSeason).toHaveBeenCalledWith(1);
      expect(service.getPointsPerSeason).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no points data exists', async () => {
      service.getPointsPerSeason.mockResolvedValue([]);

      const result = await controller.getPointsPerSeason(999);

      expect(result).toEqual([]);
      expect(service.getPointsPerSeason).toHaveBeenCalledWith(999);
    });

    it('should handle NotFoundException from service', async () => {
      service.getPointsPerSeason.mockRejectedValue(new NotFoundException('Constructor not found'));

      await expect(controller.getPointsPerSeason(999)).rejects.toThrow(NotFoundException);
      expect(service.getPointsPerSeason).toHaveBeenCalledWith(999);
    });

    it('should handle different constructor IDs', async () => {
      const customPointsData = [{ season: 2023, points: 300 }];
      service.getPointsPerSeason.mockResolvedValue(customPointsData);

      const result = await controller.getPointsPerSeason(2);

      expect(result).toEqual(customPointsData);
      expect(service.getPointsPerSeason).toHaveBeenCalledWith(2);
    });

    it('should handle service errors for getPointsPerSeason', async () => {
      const error = new Error('Query failed');
      service.getPointsPerSeason.mockRejectedValue(error);

      await expect(controller.getPointsPerSeason(1)).rejects.toThrow('Query failed');
      expect(service.getPointsPerSeason).toHaveBeenCalledWith(1);
    });

    it('should return data with correct structure', async () => {
      service.getPointsPerSeason.mockResolvedValue(mockPointsPerSeason);

      const result = await controller.getPointsPerSeason(1);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(result[0]).toHaveProperty('season');
      expect(result[0]).toHaveProperty('points');
      expect(typeof result[0].season).toBe('number');
      expect(typeof result[0].points).toBe('number');
    });
  });

  describe('getActiveConstructors', () => {
    it('should return an array of active constructors', async () => {
      const activeConstructors = mockConstructors.filter(c => c.is_active);
      service.findAllActive.mockResolvedValue(activeConstructors);

      const result = await controller.getActiveConstructors();

      expect(result).toEqual(activeConstructors);
      expect(service.findAllActive).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no active constructors exist', async () => {
      service.findAllActive.mockResolvedValue([]);

      const result = await controller.getActiveConstructors();

      expect(result).toEqual([]);
      expect(service.findAllActive).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors', async () => {
      const error = new Error('Database connection failed');
      service.findAllActive.mockRejectedValue(error);

      await expect(controller.getActiveConstructors()).rejects.toThrow('Database connection failed');
      expect(service.findAllActive).toHaveBeenCalledTimes(1);
    });

    it('should return only active constructors', async () => {
      const activeConstructors = mockConstructors.filter(c => c.is_active);
      service.findAllActive.mockResolvedValue(activeConstructors);

      const result = await controller.getActiveConstructors();

      expect(result.every(constructor => constructor.is_active)).toBe(true);
      expect(service.findAllActive).toHaveBeenCalledTimes(1);
    });
  });

  describe('controller structure', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should be an instance of ConstructorsController', () => {
      expect(controller).toBeInstanceOf(ConstructorsController);
    });

    it('should have proper constructor injection', () => {
      expect(controller).toHaveProperty('constructorsService');
    });

    it('should have service injected correctly', () => {
      expect((controller as any).constructorsService).toBe(service);
    });

    it('should have findAll method', () => {
      expect(typeof controller.findAll).toBe('function');
    });

    it('should have findOne method', () => {
      expect(typeof controller.findOne).toBe('function');
    });

    it('should have getPointsPerSeason method', () => {
      expect(typeof controller.getPointsPerSeason).toBe('function');
    });

    it('should have getActiveConstructors method', () => {
      expect(typeof controller.getActiveConstructors).toBe('function');
    });
  });

  describe('service integration', () => {
    it('should call service.findAll exactly once', async () => {
      service.findAll.mockResolvedValue(mockConstructors);

      await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
    });

    it('should call service.findOne exactly once', async () => {
      service.findOne.mockResolvedValue(mockConstructor);

      await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledTimes(1);
    });

    it('should call service.getPointsPerSeason exactly once', async () => {
      service.getPointsPerSeason.mockResolvedValue(mockPointsPerSeason);

      await controller.getPointsPerSeason(1);

      expect(service.getPointsPerSeason).toHaveBeenCalledTimes(1);
    });

    it('should call service.findAllActive exactly once', async () => {
      service.findAllActive.mockResolvedValue(mockConstructors);

      await controller.getActiveConstructors();

      expect(service.findAllActive).toHaveBeenCalledTimes(1);
    });

    it('should not modify service responses', async () => {
      service.findAll.mockResolvedValue(mockConstructors);

      const result = await controller.findAll();

      expect(result).toBe(mockConstructors);
      expect(result).toEqual(mockConstructors);
    });

    it('should handle service returning null', async () => {
      service.findOne.mockResolvedValue(null);

      const result = await controller.findOne(999);

      expect(result).toBeNull();
      expect(service.findOne).toHaveBeenCalledWith(999);
    });
  });

  describe('concurrent requests', () => {
    it('should handle multiple concurrent findAll requests', async () => {
      service.findAll.mockResolvedValue(mockConstructors);

      const promises = [controller.findAll(), controller.findAll(), controller.findAll()];
      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results.every(result => result === mockConstructors)).toBe(true);
      expect(service.findAll).toHaveBeenCalledTimes(3);
    });

    it('should handle multiple concurrent findOne requests', async () => {
      service.findOne.mockResolvedValue(mockConstructor);

      const promises = [controller.findOne(1), controller.findOne(2), controller.findOne(3)];
      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results.every(result => result === mockConstructor)).toBe(true);
      expect(service.findOne).toHaveBeenCalledTimes(3);
    });

    it('should handle multiple concurrent getPointsPerSeason requests', async () => {
      service.getPointsPerSeason.mockResolvedValue(mockPointsPerSeason);

      const promises = [controller.getPointsPerSeason(1), controller.getPointsPerSeason(2)];
      const results = await Promise.all(promises);

      expect(results).toHaveLength(2);
      expect(results.every(result => result === mockPointsPerSeason)).toBe(true);
      expect(service.getPointsPerSeason).toHaveBeenCalledTimes(2);
    });

    it('should handle mixed concurrent requests', async () => {
      service.findAll.mockResolvedValue(mockConstructors);
      service.findOne.mockResolvedValue(mockConstructor);
      service.getPointsPerSeason.mockResolvedValue(mockPointsPerSeason);

      const promises = [
        controller.findAll(),
        controller.findOne(1),
        controller.getPointsPerSeason(1),
        controller.getActiveConstructors()
      ];
      const results = await Promise.all(promises);

      expect(results).toHaveLength(4);
      expect(results[0]).toBe(mockConstructors);
      expect(results[1]).toBe(mockConstructor);
      expect(results[2]).toBe(mockPointsPerSeason);
    });
  });

  describe('error propagation', () => {
    it('should propagate all service errors for findAll', async () => {
      const error = new Error('Service error');
      service.findAll.mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow('Service error');
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });

    it('should propagate all service errors for findOne', async () => {
      const error = new Error('Service error');
      service.findOne.mockRejectedValue(error);

      await expect(controller.findOne(1)).rejects.toThrow('Service error');
      expect(service.findOne).toHaveBeenCalledTimes(1);
    });

    it('should propagate all service errors for getPointsPerSeason', async () => {
      const error = new Error('Service error');
      service.getPointsPerSeason.mockRejectedValue(error);

      await expect(controller.getPointsPerSeason(1)).rejects.toThrow('Service error');
      expect(service.getPointsPerSeason).toHaveBeenCalledTimes(1);
    });

    it('should propagate all service errors for getActiveConstructors', async () => {
      const error = new Error('Service error');
      service.findAllActive.mockRejectedValue(error);

      await expect(controller.getActiveConstructors()).rejects.toThrow('Service error');
      expect(service.findAllActive).toHaveBeenCalledTimes(1);
    });
  });

  describe('return type validation', () => {
    it('should return Promise<ConstructorEntity[]> for findAll', async () => {
      service.findAll.mockResolvedValue(mockConstructors);
      const result = controller.findAll();
      expect(result).toBeInstanceOf(Promise);
      
      const resolved = await result;
      expect(Array.isArray(resolved)).toBe(true);
      expect(resolved.length).toBeGreaterThan(0);
    });

    it('should return Promise<ConstructorEntity> for findOne', async () => {
      service.findOne.mockResolvedValue(mockConstructor);
      const result = controller.findOne(1);
      expect(result).toBeInstanceOf(Promise);
      
      const resolved = await result;
      expect(resolved).toHaveProperty('id');
      expect(resolved).toHaveProperty('name');
      expect(resolved).toHaveProperty('nationality');
    });

    it('should return Promise<{ season: number; points: number }[]> for getPointsPerSeason', async () => {
      service.getPointsPerSeason.mockResolvedValue(mockPointsPerSeason);
      const result = controller.getPointsPerSeason(1);
      expect(result).toBeInstanceOf(Promise);
      
      const resolved = await result;
      expect(Array.isArray(resolved)).toBe(true);
      if (resolved.length > 0) {
        expect(resolved[0]).toHaveProperty('season');
        expect(resolved[0]).toHaveProperty('points');
      }
    });

    it('should return Promise<ConstructorEntity[]> for getActiveConstructors', async () => {
      service.findAllActive.mockResolvedValue(mockConstructors);
      const result = controller.getActiveConstructors();
      expect(result).toBeInstanceOf(Promise);
      
      const resolved = await result;
      expect(Array.isArray(resolved)).toBe(true);
    });
  });

  describe('method signatures', () => {
    it('should have findAll method with correct signature', () => {
      expect(controller.findAll.length).toBe(0);
    });

    it('should have findOne method with correct signature', () => {
      expect(controller.findOne.length).toBe(1);
    });

    it('should have getPointsPerSeason method with correct signature', () => {
      expect(controller.getPointsPerSeason.length).toBe(1);
    });

    it('should have getActiveConstructors method with correct signature', () => {
      expect(controller.getActiveConstructors.length).toBe(0);
    });

    it('should accept number parameter for findOne', async () => {
      service.findOne.mockResolvedValue(mockConstructor);

      await controller.findOne(123);

      expect(service.findOne).toHaveBeenCalledWith(123);
    });

    it('should accept number parameter for getPointsPerSeason', async () => {
      service.getPointsPerSeason.mockResolvedValue(mockPointsPerSeason);

      await controller.getPointsPerSeason(456);

      expect(service.getPointsPerSeason).toHaveBeenCalledWith(456);
    });
  });
});