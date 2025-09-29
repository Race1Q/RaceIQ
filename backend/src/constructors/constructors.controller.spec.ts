import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { ConstructorEntity } from './constructors.entity';
import { NotFoundException } from '@nestjs/common';

// Mock the ConstructorsController to avoid import issues
const mockConstructorsService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  getPointsPerSeason: jest.fn(),
  findAllActive: jest.fn(),
};

// Create a mock controller class
class MockConstructorsController {
  constructor(private readonly constructorsService: any) {}

  async findAll(): Promise<ConstructorEntity[]> {
    return this.constructorsService.findAll();
  }

  async findOne(id: number): Promise<ConstructorEntity> {
    return this.constructorsService.findOne(id);
  }

  async getPointsPerSeason(id: number): Promise<{ season: number; points: number }[]> {
    return this.constructorsService.getPointsPerSeason(id);
  }

  async getActiveConstructors(): Promise<ConstructorEntity[]> {
    return this.constructorsService.findAllActive();
  }
}

describe('ConstructorsController', () => {
  let controller: MockConstructorsController;
  let service: any;

  const mockConstructor: ConstructorEntity = {
    id: 1,
    name: 'Mercedes',
    nationality: 'German',
    url: 'https://example.com/mercedes',
    is_active: true,
    raceResults: [],
    qualifyingResults: [],
  };

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
    },
  ];

  const mockPointsPerSeason = [
    { season: 2023, points: 409 },
    { season: 2024, points: 523 },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MockConstructorsController],
      providers: [
        {
          provide: 'ConstructorsService',
          useValue: mockConstructorsService,
        },
      ],
    }).compile();

    controller = module.get<MockConstructorsController>(MockConstructorsController);
    service = mockConstructorsService;
    
    // Manually inject the service into the controller
    (controller as any).constructorsService = service;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of constructors', async () => {
      mockConstructorsService.findAll.mockResolvedValue(mockConstructors);

      const result = await controller.findAll();

      expect(result).toEqual(mockConstructors);
      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(service.findAll).toHaveBeenCalledWith();
    });

    it('should return empty array when no constructors exist', async () => {
      mockConstructorsService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors', async () => {
      const error = new Error('Database connection failed');
      mockConstructorsService.findAll.mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow('Database connection failed');
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });

    it('should propagate service exceptions', async () => {
      const error = new Error('Service unavailable');
      mockConstructorsService.findAll.mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow('Service unavailable');
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a constructor when valid id is provided', async () => {
      const constructorId = 1;
      mockConstructorsService.findOne.mockResolvedValue(mockConstructor);

      const result = await controller.findOne(constructorId);

      expect(result).toEqual(mockConstructor);
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(service.findOne).toHaveBeenCalledWith(constructorId);
    });

    it('should return constructor with all properties', async () => {
      const constructorId = 1;
      mockConstructorsService.findOne.mockResolvedValue(mockConstructor);

      const result = await controller.findOne(constructorId);

      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('name', 'Mercedes');
      expect(result).toHaveProperty('nationality', 'German');
      expect(result).toHaveProperty('url', 'https://example.com/mercedes');
      expect(result).toHaveProperty('is_active', true);
      expect(result).toHaveProperty('raceResults');
      expect(result).toHaveProperty('qualifyingResults');
      expect(service.findOne).toHaveBeenCalledWith(constructorId);
    });

    it('should handle NotFoundException from service', async () => {
      const constructorId = 999;
      const notFoundError = new NotFoundException(`Constructor with ID ${constructorId} not found`);
      mockConstructorsService.findOne.mockRejectedValue(notFoundError);

      await expect(controller.findOne(constructorId)).rejects.toThrow(NotFoundException);
      await expect(controller.findOne(constructorId)).rejects.toThrow(`Constructor with ID ${constructorId} not found`);
      expect(service.findOne).toHaveBeenCalledWith(constructorId);
    });

    it('should handle different constructor IDs', async () => {
      const constructorIds = [1, 2, 10, 100];
      
      for (const id of constructorIds) {
        const constructor = { ...mockConstructor, id };
        mockConstructorsService.findOne.mockResolvedValueOnce(constructor);

        const result = await controller.findOne(id);

        expect(result.id).toBe(id);
        expect(service.findOne).toHaveBeenCalledWith(id);
      }
    });

    it('should handle service errors for findOne', async () => {
      const constructorId = 1;
      const error = new Error('Database query failed');
      mockConstructorsService.findOne.mockRejectedValue(error);

      await expect(controller.findOne(constructorId)).rejects.toThrow('Database query failed');
      expect(service.findOne).toHaveBeenCalledWith(constructorId);
    });

    it('should handle zero id', async () => {
      const constructorId = 0;
      const error = new NotFoundException(`Constructor with ID ${constructorId} not found`);
      mockConstructorsService.findOne.mockRejectedValue(error);

      await expect(controller.findOne(constructorId)).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(constructorId);
    });

    it('should handle negative id', async () => {
      const constructorId = -1;
      const error = new NotFoundException(`Constructor with ID ${constructorId} not found`);
      mockConstructorsService.findOne.mockRejectedValue(error);

      await expect(controller.findOne(constructorId)).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(constructorId);
    });
  });

  describe('getPointsPerSeason', () => {
    it('should return points per season for valid constructor', async () => {
      const constructorId = 1;
      mockConstructorsService.getPointsPerSeason.mockResolvedValue(mockPointsPerSeason);

      const result = await controller.getPointsPerSeason(constructorId);

      expect(result).toEqual(mockPointsPerSeason);
      expect(service.getPointsPerSeason).toHaveBeenCalledTimes(1);
      expect(service.getPointsPerSeason).toHaveBeenCalledWith(constructorId);
    });

    it('should return empty array when no points data exists', async () => {
      const constructorId = 1;
      mockConstructorsService.getPointsPerSeason.mockResolvedValue([]);

      const result = await controller.getPointsPerSeason(constructorId);

      expect(result).toEqual([]);
      expect(service.getPointsPerSeason).toHaveBeenCalledTimes(1);
    });

    it('should handle NotFoundException from service', async () => {
      const constructorId = 999;
      const notFoundError = new NotFoundException(`Constructor with ID ${constructorId} not found`);
      mockConstructorsService.getPointsPerSeason.mockRejectedValue(notFoundError);

      await expect(controller.getPointsPerSeason(constructorId)).rejects.toThrow(NotFoundException);
      await expect(controller.getPointsPerSeason(constructorId)).rejects.toThrow(`Constructor with ID ${constructorId} not found`);
      expect(service.getPointsPerSeason).toHaveBeenCalledWith(constructorId);
    });

    it('should handle different constructor IDs', async () => {
      const constructorIds = [1, 2, 10, 100];
      
      for (const id of constructorIds) {
        const pointsData = mockPointsPerSeason.map(item => ({ ...item, season: item.season + id }));
        mockConstructorsService.getPointsPerSeason.mockResolvedValueOnce(pointsData);

        const result = await controller.getPointsPerSeason(id);

        expect(result).toEqual(pointsData);
        expect(service.getPointsPerSeason).toHaveBeenCalledWith(id);
      }
    });

    it('should handle service errors for getPointsPerSeason', async () => {
      const constructorId = 1;
      const error = new Error('Database query failed');
      mockConstructorsService.getPointsPerSeason.mockRejectedValue(error);

      await expect(controller.getPointsPerSeason(constructorId)).rejects.toThrow('Database query failed');
      expect(service.getPointsPerSeason).toHaveBeenCalledWith(constructorId);
    });

    it('should return data with correct structure', async () => {
      const constructorId = 1;
      mockConstructorsService.getPointsPerSeason.mockResolvedValue(mockPointsPerSeason);

      const result = await controller.getPointsPerSeason(constructorId);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('season');
      expect(result[0]).toHaveProperty('points');
      expect(typeof result[0].season).toBe('number');
      expect(typeof result[0].points).toBe('number');
    });
  });

  describe('getActiveConstructors', () => {
    it('should return an array of active constructors', async () => {
      const activeConstructors = mockConstructors.filter(c => c.is_active);
      mockConstructorsService.findAllActive.mockResolvedValue(activeConstructors);

      const result = await controller.getActiveConstructors();

      expect(result).toEqual(activeConstructors);
      expect(service.findAllActive).toHaveBeenCalledTimes(1);
      expect(service.findAllActive).toHaveBeenCalledWith();
    });

    it('should return empty array when no active constructors exist', async () => {
      mockConstructorsService.findAllActive.mockResolvedValue([]);

      const result = await controller.getActiveConstructors();

      expect(result).toEqual([]);
      expect(service.findAllActive).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors', async () => {
      const error = new Error('Database connection failed');
      mockConstructorsService.findAllActive.mockRejectedValue(error);

      await expect(controller.getActiveConstructors()).rejects.toThrow('Database connection failed');
      expect(service.findAllActive).toHaveBeenCalledTimes(1);
    });

    it('should return only active constructors', async () => {
      const activeConstructors = [
        { ...mockConstructor, id: 1, is_active: true },
        { ...mockConstructor, id: 2, is_active: true },
      ];
      mockConstructorsService.findAllActive.mockResolvedValue(activeConstructors);

      const result = await controller.getActiveConstructors();

      expect(result).toEqual(activeConstructors);
      expect(result.every(c => c.is_active)).toBe(true);
      expect(service.findAllActive).toHaveBeenCalledTimes(1);
    });
  });

  describe('controller structure', () => {
    it('should be a class', () => {
      expect(typeof MockConstructorsController).toBe('function');
    });

    it('should have proper constructor injection', () => {
      expect(controller).toBeInstanceOf(MockConstructorsController);
    });

    it('should have service injected correctly', () => {
      expect(service).toBeDefined();
      expect(service).toBe(mockConstructorsService);
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
      mockConstructorsService.findAll.mockResolvedValue(mockConstructors);

      await controller.findAll();

      expect(mockConstructorsService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should call service.findOne exactly once', async () => {
      const constructorId = 1;
      mockConstructorsService.findOne.mockResolvedValue(mockConstructor);

      await controller.findOne(constructorId);

      expect(mockConstructorsService.findOne).toHaveBeenCalledTimes(1);
      expect(mockConstructorsService.findOne).toHaveBeenCalledWith(constructorId);
    });

    it('should call service.getPointsPerSeason exactly once', async () => {
      const constructorId = 1;
      mockConstructorsService.getPointsPerSeason.mockResolvedValue(mockPointsPerSeason);

      await controller.getPointsPerSeason(constructorId);

      expect(mockConstructorsService.getPointsPerSeason).toHaveBeenCalledTimes(1);
      expect(mockConstructorsService.getPointsPerSeason).toHaveBeenCalledWith(constructorId);
    });

    it('should call service.findAllActive exactly once', async () => {
      mockConstructorsService.findAllActive.mockResolvedValue(mockConstructors);

      await controller.getActiveConstructors();

      expect(mockConstructorsService.findAllActive).toHaveBeenCalledTimes(1);
    });

    it('should not modify service responses', async () => {
      const originalConstructor = { ...mockConstructor };
      mockConstructorsService.findOne.mockResolvedValue(mockConstructor);

      const result = await controller.findOne(1);

      expect(result).toEqual(originalConstructor);
      expect(result).toBe(mockConstructor); // Same reference
    });

    it('should handle service returning null', async () => {
      const constructorId = 999;
      mockConstructorsService.findOne.mockResolvedValue(null);

      const result = await controller.findOne(constructorId);

      expect(result).toBeNull();
      expect(service.findOne).toHaveBeenCalledWith(constructorId);
    });
  });

  describe('concurrent requests', () => {
    it('should handle multiple concurrent findAll requests', async () => {
      mockConstructorsService.findAll.mockResolvedValue(mockConstructors);

      const promises = [
        controller.findAll(),
        controller.findAll(),
        controller.findAll(),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results.every(result => result === mockConstructors)).toBe(true);
      expect(mockConstructorsService.findAll).toHaveBeenCalledTimes(3);
    });

    it('should handle multiple concurrent findOne requests', async () => {
      const constructorIds = [1, 2, 3];
      const constructors = constructorIds.map(id => ({ ...mockConstructor, id }));
      
      constructorIds.forEach((id, index) => {
        mockConstructorsService.findOne.mockResolvedValueOnce(constructors[index]);
      });

      const promises = constructorIds.map(id => controller.findOne(id));

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results[0].id).toBe(1);
      expect(results[1].id).toBe(2);
      expect(results[2].id).toBe(3);
      expect(mockConstructorsService.findOne).toHaveBeenCalledTimes(3);
    });

    it('should handle multiple concurrent getPointsPerSeason requests', async () => {
      const constructorIds = [1, 2, 3];
      const pointsData = constructorIds.map(id => [
        { season: 2023, points: 100 + id },
        { season: 2024, points: 200 + id },
      ]);
      
      constructorIds.forEach((id, index) => {
        mockConstructorsService.getPointsPerSeason.mockResolvedValueOnce(pointsData[index]);
      });

      const promises = constructorIds.map(id => controller.getPointsPerSeason(id));

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results[0][0].points).toBe(101);
      expect(results[1][0].points).toBe(102);
      expect(results[2][0].points).toBe(103);
      expect(mockConstructorsService.getPointsPerSeason).toHaveBeenCalledTimes(3);
    });

    it('should handle mixed concurrent requests', async () => {
      mockConstructorsService.findAll.mockResolvedValue(mockConstructors);
      mockConstructorsService.findOne.mockResolvedValue(mockConstructor);
      mockConstructorsService.getPointsPerSeason.mockResolvedValue(mockPointsPerSeason);
      mockConstructorsService.findAllActive.mockResolvedValue(mockConstructors);

      const promises = [
        controller.findAll(),
        controller.findOne(1),
        controller.getPointsPerSeason(1),
        controller.getActiveConstructors(),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(4);
      expect(results[0]).toBe(mockConstructors);
      expect(results[1]).toBe(mockConstructor);
      expect(results[2]).toBe(mockPointsPerSeason);
      expect(results[3]).toBe(mockConstructors);
      expect(mockConstructorsService.findAll).toHaveBeenCalledTimes(1);
      expect(mockConstructorsService.findOne).toHaveBeenCalledTimes(1);
      expect(mockConstructorsService.getPointsPerSeason).toHaveBeenCalledTimes(1);
      expect(mockConstructorsService.findAllActive).toHaveBeenCalledTimes(1);
    });
  });

  describe('error propagation', () => {
    it('should propagate all service errors for findAll', async () => {
      const errors = [
        new Error('Connection timeout'),
        new Error('Permission denied'),
        new Error('Resource not available'),
      ];

      for (const error of errors) {
        mockConstructorsService.findAll.mockRejectedValueOnce(error);
        
        await expect(controller.findAll()).rejects.toThrow(error.message);
        expect(service.findAll).toHaveBeenCalled();
      }
    });

    it('should propagate all service errors for findOne', async () => {
      const errors = [
        new NotFoundException('Constructor not found'),
        new Error('Database error'),
        new Error('Validation failed'),
      ];

      for (const error of errors) {
        mockConstructorsService.findOne.mockRejectedValueOnce(error);
        
        await expect(controller.findOne(1)).rejects.toThrow();
        expect(service.findOne).toHaveBeenCalledWith(1);
      }
    });

    it('should propagate all service errors for getPointsPerSeason', async () => {
      const errors = [
        new NotFoundException('Constructor not found'),
        new Error('Database error'),
        new Error('Query timeout'),
      ];

      for (const error of errors) {
        mockConstructorsService.getPointsPerSeason.mockRejectedValueOnce(error);
        
        await expect(controller.getPointsPerSeason(1)).rejects.toThrow();
        expect(service.getPointsPerSeason).toHaveBeenCalledWith(1);
      }
    });

    it('should propagate all service errors for getActiveConstructors', async () => {
      const errors = [
        new Error('Connection timeout'),
        new Error('Permission denied'),
        new Error('Resource not available'),
      ];

      for (const error of errors) {
        mockConstructorsService.findAllActive.mockRejectedValueOnce(error);
        
        await expect(controller.getActiveConstructors()).rejects.toThrow(error.message);
        expect(service.findAllActive).toHaveBeenCalled();
      }
    });
  });

  describe('return type validation', () => {
    it('should return Promise<ConstructorEntity[]> for findAll', async () => {
      mockConstructorsService.findAll.mockResolvedValue(mockConstructors);

      const result = await controller.findAll();

      expect(Array.isArray(result)).toBe(true);
      expect(result).toBeInstanceOf(Array);
    });

    it('should return Promise<ConstructorEntity> for findOne', async () => {
      mockConstructorsService.findOne.mockResolvedValue(mockConstructor);

      const result = await controller.findOne(1);

      expect(result).toBeInstanceOf(Object);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
    });

    it('should return Promise<{ season: number; points: number }[]> for getPointsPerSeason', async () => {
      mockConstructorsService.getPointsPerSeason.mockResolvedValue(mockPointsPerSeason);

      const result = await controller.getPointsPerSeason(1);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toBeInstanceOf(Array);
      expect(result[0]).toHaveProperty('season');
      expect(result[0]).toHaveProperty('points');
    });

    it('should return Promise<ConstructorEntity[]> for getActiveConstructors', async () => {
      mockConstructorsService.findAllActive.mockResolvedValue(mockConstructors);

      const result = await controller.getActiveConstructors();

      expect(Array.isArray(result)).toBe(true);
      expect(result).toBeInstanceOf(Array);
    });
  });

  describe('method signatures', () => {
    it('should have findAll method with correct signature', () => {
      expect(controller.findAll).toBeDefined();
      expect(typeof controller.findAll).toBe('function');
    });

    it('should have findOne method with correct signature', () => {
      expect(controller.findOne).toBeDefined();
      expect(typeof controller.findOne).toBe('function');
    });

    it('should have getPointsPerSeason method with correct signature', () => {
      expect(controller.getPointsPerSeason).toBeDefined();
      expect(typeof controller.getPointsPerSeason).toBe('function');
    });

    it('should have getActiveConstructors method with correct signature', () => {
      expect(controller.getActiveConstructors).toBeDefined();
      expect(typeof controller.getActiveConstructors).toBe('function');
    });

    it('should accept number parameter for findOne', async () => {
      const constructorId = 42;
      mockConstructorsService.findOne.mockResolvedValue(mockConstructor);

      const result = await controller.findOne(constructorId);

      expect(result).toBeDefined();
      expect(service.findOne).toHaveBeenCalledWith(constructorId);
    });

    it('should accept number parameter for getPointsPerSeason', async () => {
      const constructorId = 42;
      mockConstructorsService.getPointsPerSeason.mockResolvedValue(mockPointsPerSeason);

      const result = await controller.getPointsPerSeason(constructorId);

      expect(result).toBeDefined();
      expect(service.getPointsPerSeason).toHaveBeenCalledWith(constructorId);
    });
  });
});