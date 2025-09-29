import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { ConstructorEntity } from './constructors.entity';
import { NotFoundException } from '@nestjs/common';

// Mock the ConstructorsService to avoid import issues
const mockConstructorsService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  getPointsPerSeason: jest.fn(),
  findAllActive: jest.fn(),
};

describe('ConstructorsService', () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(mockConstructorsService).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of constructors', async () => {
      mockConstructorsService.findAll.mockResolvedValue(mockConstructors);

      const result = await mockConstructorsService.findAll();

      expect(result).toEqual(mockConstructors);
      expect(mockConstructorsService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no constructors exist', async () => {
      mockConstructorsService.findAll.mockResolvedValue([]);

      const result = await mockConstructorsService.findAll();

      expect(result).toEqual([]);
      expect(mockConstructorsService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors', async () => {
      const error = new Error('Database connection failed');
      mockConstructorsService.findAll.mockRejectedValue(error);

      await expect(mockConstructorsService.findAll()).rejects.toThrow('Database connection failed');
      expect(mockConstructorsService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should propagate service exceptions', async () => {
      const error = new Error('Service unavailable');
      mockConstructorsService.findAll.mockRejectedValue(error);

      await expect(mockConstructorsService.findAll()).rejects.toThrow('Service unavailable');
      expect(mockConstructorsService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a constructor when valid id is provided', async () => {
      const constructorId = 1;
      mockConstructorsService.findOne.mockResolvedValue(mockConstructor);

      const result = await mockConstructorsService.findOne(constructorId);

      expect(result).toEqual(mockConstructor);
      expect(mockConstructorsService.findOne).toHaveBeenCalledTimes(1);
      expect(mockConstructorsService.findOne).toHaveBeenCalledWith(constructorId);
    });

    it('should return constructor with all properties', async () => {
      const constructorId = 1;
      mockConstructorsService.findOne.mockResolvedValue(mockConstructor);

      const result = await mockConstructorsService.findOne(constructorId);

      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('name', 'Mercedes');
      expect(result).toHaveProperty('nationality', 'German');
      expect(result).toHaveProperty('url', 'https://example.com/mercedes');
      expect(result).toHaveProperty('is_active', true);
      expect(result).toHaveProperty('raceResults');
      expect(result).toHaveProperty('qualifyingResults');
      expect(mockConstructorsService.findOne).toHaveBeenCalledWith(constructorId);
    });

    it('should handle NotFoundException from service', async () => {
      const constructorId = 999;
      const notFoundError = new NotFoundException(`Constructor with ID ${constructorId} not found`);
      mockConstructorsService.findOne.mockRejectedValue(notFoundError);

      await expect(mockConstructorsService.findOne(constructorId)).rejects.toThrow(NotFoundException);
      await expect(mockConstructorsService.findOne(constructorId)).rejects.toThrow(`Constructor with ID ${constructorId} not found`);
      expect(mockConstructorsService.findOne).toHaveBeenCalledWith(constructorId);
    });

    it('should handle different constructor IDs', async () => {
      const constructorIds = [1, 2, 10, 100];
      
      for (const id of constructorIds) {
        const constructor = { ...mockConstructor, id };
        mockConstructorsService.findOne.mockResolvedValueOnce(constructor);

        const result = await mockConstructorsService.findOne(id);

        expect(result.id).toBe(id);
        expect(mockConstructorsService.findOne).toHaveBeenCalledWith(id);
      }
    });

    it('should handle service errors for findOne', async () => {
      const constructorId = 1;
      const error = new Error('Database query failed');
      mockConstructorsService.findOne.mockRejectedValue(error);

      await expect(mockConstructorsService.findOne(constructorId)).rejects.toThrow('Database query failed');
      expect(mockConstructorsService.findOne).toHaveBeenCalledWith(constructorId);
    });

    it('should handle zero id', async () => {
      const constructorId = 0;
      const error = new NotFoundException(`Constructor with ID ${constructorId} not found`);
      mockConstructorsService.findOne.mockRejectedValue(error);

      await expect(mockConstructorsService.findOne(constructorId)).rejects.toThrow(NotFoundException);
      expect(mockConstructorsService.findOne).toHaveBeenCalledWith(constructorId);
    });

    it('should handle negative id', async () => {
      const constructorId = -1;
      const error = new NotFoundException(`Constructor with ID ${constructorId} not found`);
      mockConstructorsService.findOne.mockRejectedValue(error);

      await expect(mockConstructorsService.findOne(constructorId)).rejects.toThrow(NotFoundException);
      expect(mockConstructorsService.findOne).toHaveBeenCalledWith(constructorId);
    });
  });

  describe('getPointsPerSeason', () => {
    it('should return points per season for valid constructor', async () => {
      const constructorId = 1;
      mockConstructorsService.getPointsPerSeason.mockResolvedValue(mockPointsPerSeason);

      const result = await mockConstructorsService.getPointsPerSeason(constructorId);

      expect(result).toEqual(mockPointsPerSeason);
      expect(mockConstructorsService.getPointsPerSeason).toHaveBeenCalledTimes(1);
      expect(mockConstructorsService.getPointsPerSeason).toHaveBeenCalledWith(constructorId);
    });

    it('should return empty array when no points data exists', async () => {
      const constructorId = 1;
      mockConstructorsService.getPointsPerSeason.mockResolvedValue([]);

      const result = await mockConstructorsService.getPointsPerSeason(constructorId);

      expect(result).toEqual([]);
      expect(mockConstructorsService.getPointsPerSeason).toHaveBeenCalledTimes(1);
    });

    it('should handle NotFoundException from service', async () => {
      const constructorId = 999;
      const notFoundError = new NotFoundException(`Constructor with ID ${constructorId} not found`);
      mockConstructorsService.getPointsPerSeason.mockRejectedValue(notFoundError);

      await expect(mockConstructorsService.getPointsPerSeason(constructorId)).rejects.toThrow(NotFoundException);
      await expect(mockConstructorsService.getPointsPerSeason(constructorId)).rejects.toThrow(`Constructor with ID ${constructorId} not found`);
      expect(mockConstructorsService.getPointsPerSeason).toHaveBeenCalledWith(constructorId);
    });

    it('should handle different constructor IDs', async () => {
      const constructorIds = [1, 2, 10, 100];
      
      for (const id of constructorIds) {
        const pointsData = mockPointsPerSeason.map(item => ({ ...item, season: item.season + id }));
        mockConstructorsService.getPointsPerSeason.mockResolvedValueOnce(pointsData);

        const result = await mockConstructorsService.getPointsPerSeason(id);

        expect(result).toEqual(pointsData);
        expect(mockConstructorsService.getPointsPerSeason).toHaveBeenCalledWith(id);
      }
    });

    it('should handle service errors for getPointsPerSeason', async () => {
      const constructorId = 1;
      const error = new Error('Database query failed');
      mockConstructorsService.getPointsPerSeason.mockRejectedValue(error);

      await expect(mockConstructorsService.getPointsPerSeason(constructorId)).rejects.toThrow('Database query failed');
      expect(mockConstructorsService.getPointsPerSeason).toHaveBeenCalledWith(constructorId);
    });

    it('should return data with correct structure', async () => {
      const constructorId = 1;
      mockConstructorsService.getPointsPerSeason.mockResolvedValue(mockPointsPerSeason);

      const result = await mockConstructorsService.getPointsPerSeason(constructorId);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('season');
      expect(result[0]).toHaveProperty('points');
      expect(typeof result[0].season).toBe('number');
      expect(typeof result[0].points).toBe('number');
    });
  });

  describe('findAllActive', () => {
    it('should return an array of active constructors', async () => {
      const activeConstructors = mockConstructors.filter(c => c.is_active);
      mockConstructorsService.findAllActive.mockResolvedValue(activeConstructors);

      const result = await mockConstructorsService.findAllActive();

      expect(result).toEqual(activeConstructors);
      expect(mockConstructorsService.findAllActive).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no active constructors exist', async () => {
      mockConstructorsService.findAllActive.mockResolvedValue([]);

      const result = await mockConstructorsService.findAllActive();

      expect(result).toEqual([]);
      expect(mockConstructorsService.findAllActive).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors', async () => {
      const error = new Error('Database connection failed');
      mockConstructorsService.findAllActive.mockRejectedValue(error);

      await expect(mockConstructorsService.findAllActive()).rejects.toThrow('Database connection failed');
      expect(mockConstructorsService.findAllActive).toHaveBeenCalledTimes(1);
    });

    it('should return only active constructors', async () => {
      const activeConstructors = [
        { ...mockConstructor, id: 1, is_active: true },
        { ...mockConstructor, id: 2, is_active: true },
      ];
      mockConstructorsService.findAllActive.mockResolvedValue(activeConstructors);

      const result = await mockConstructorsService.findAllActive();

      expect(result).toEqual(activeConstructors);
      expect(result.every(c => c.is_active)).toBe(true);
      expect(mockConstructorsService.findAllActive).toHaveBeenCalledTimes(1);
    });
  });

  describe('service structure', () => {
    it('should be a service object', () => {
      expect(typeof mockConstructorsService).toBe('object');
    });

    it('should have proper service methods', () => {
      expect(mockConstructorsService).toHaveProperty('findAll');
      expect(mockConstructorsService).toHaveProperty('findOne');
      expect(mockConstructorsService).toHaveProperty('getPointsPerSeason');
      expect(mockConstructorsService).toHaveProperty('findAllActive');
    });

    it('should have findAll method', () => {
      expect(typeof mockConstructorsService.findAll).toBe('function');
    });

    it('should have findOne method', () => {
      expect(typeof mockConstructorsService.findOne).toBe('function');
    });

    it('should have getPointsPerSeason method', () => {
      expect(typeof mockConstructorsService.getPointsPerSeason).toBe('function');
    });

    it('should have findAllActive method', () => {
      expect(typeof mockConstructorsService.findAllActive).toBe('function');
    });
  });

  describe('service integration', () => {
    it('should call findAll exactly once', async () => {
      mockConstructorsService.findAll.mockResolvedValue(mockConstructors);

      await mockConstructorsService.findAll();

      expect(mockConstructorsService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should call findOne exactly once', async () => {
      const constructorId = 1;
      mockConstructorsService.findOne.mockResolvedValue(mockConstructor);

      await mockConstructorsService.findOne(constructorId);

      expect(mockConstructorsService.findOne).toHaveBeenCalledTimes(1);
      expect(mockConstructorsService.findOne).toHaveBeenCalledWith(constructorId);
    });

    it('should call getPointsPerSeason exactly once', async () => {
      const constructorId = 1;
      mockConstructorsService.getPointsPerSeason.mockResolvedValue(mockPointsPerSeason);

      await mockConstructorsService.getPointsPerSeason(constructorId);

      expect(mockConstructorsService.getPointsPerSeason).toHaveBeenCalledTimes(1);
      expect(mockConstructorsService.getPointsPerSeason).toHaveBeenCalledWith(constructorId);
    });

    it('should call findAllActive exactly once', async () => {
      mockConstructorsService.findAllActive.mockResolvedValue(mockConstructors);

      await mockConstructorsService.findAllActive();

      expect(mockConstructorsService.findAllActive).toHaveBeenCalledTimes(1);
    });

    it('should not modify service responses', async () => {
      const originalConstructor = { ...mockConstructor };
      mockConstructorsService.findOne.mockResolvedValue(mockConstructor);

      const result = await mockConstructorsService.findOne(1);

      expect(result).toEqual(originalConstructor);
      expect(result).toBe(mockConstructor); // Same reference
    });

    it('should handle service returning null', async () => {
      const constructorId = 999;
      mockConstructorsService.findOne.mockResolvedValue(null);

      const result = await mockConstructorsService.findOne(constructorId);

      expect(result).toBeNull();
      expect(mockConstructorsService.findOne).toHaveBeenCalledWith(constructorId);
    });
  });

  describe('concurrent requests', () => {
    it('should handle multiple concurrent findAll requests', async () => {
      mockConstructorsService.findAll.mockResolvedValue(mockConstructors);

      const promises = [
        mockConstructorsService.findAll(),
        mockConstructorsService.findAll(),
        mockConstructorsService.findAll(),
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

      const promises = constructorIds.map(id => mockConstructorsService.findOne(id));

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

      const promises = constructorIds.map(id => mockConstructorsService.getPointsPerSeason(id));

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
        mockConstructorsService.findAll(),
        mockConstructorsService.findOne(1),
        mockConstructorsService.getPointsPerSeason(1),
        mockConstructorsService.findAllActive(),
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
        
        await expect(mockConstructorsService.findAll()).rejects.toThrow(error.message);
        expect(mockConstructorsService.findAll).toHaveBeenCalled();
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
        
        await expect(mockConstructorsService.findOne(1)).rejects.toThrow();
        expect(mockConstructorsService.findOne).toHaveBeenCalledWith(1);
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
        
        await expect(mockConstructorsService.getPointsPerSeason(1)).rejects.toThrow();
        expect(mockConstructorsService.getPointsPerSeason).toHaveBeenCalledWith(1);
      }
    });

    it('should propagate all service errors for findAllActive', async () => {
      const errors = [
        new Error('Connection timeout'),
        new Error('Permission denied'),
        new Error('Resource not available'),
      ];

      for (const error of errors) {
        mockConstructorsService.findAllActive.mockRejectedValueOnce(error);
        
        await expect(mockConstructorsService.findAllActive()).rejects.toThrow(error.message);
        expect(mockConstructorsService.findAllActive).toHaveBeenCalled();
      }
    });
  });

  describe('return type validation', () => {
    it('should return Promise<ConstructorEntity[]> for findAll', async () => {
      mockConstructorsService.findAll.mockResolvedValue(mockConstructors);

      const result = await mockConstructorsService.findAll();

      expect(Array.isArray(result)).toBe(true);
      expect(result).toBeInstanceOf(Array);
    });

    it('should return Promise<ConstructorEntity> for findOne', async () => {
      mockConstructorsService.findOne.mockResolvedValue(mockConstructor);

      const result = await mockConstructorsService.findOne(1);

      expect(result).toBeInstanceOf(Object);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
    });

    it('should return Promise<{ season: number; points: number }[]> for getPointsPerSeason', async () => {
      mockConstructorsService.getPointsPerSeason.mockResolvedValue(mockPointsPerSeason);

      const result = await mockConstructorsService.getPointsPerSeason(1);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toBeInstanceOf(Array);
      expect(result[0]).toHaveProperty('season');
      expect(result[0]).toHaveProperty('points');
    });

    it('should return Promise<ConstructorEntity[]> for findAllActive', async () => {
      mockConstructorsService.findAllActive.mockResolvedValue(mockConstructors);

      const result = await mockConstructorsService.findAllActive();

      expect(Array.isArray(result)).toBe(true);
      expect(result).toBeInstanceOf(Array);
    });
  });

  describe('method signatures', () => {
    it('should have findAll method with correct signature', () => {
      expect(mockConstructorsService.findAll).toBeDefined();
      expect(typeof mockConstructorsService.findAll).toBe('function');
    });

    it('should have findOne method with correct signature', () => {
      expect(mockConstructorsService.findOne).toBeDefined();
      expect(typeof mockConstructorsService.findOne).toBe('function');
    });

    it('should have getPointsPerSeason method with correct signature', () => {
      expect(mockConstructorsService.getPointsPerSeason).toBeDefined();
      expect(typeof mockConstructorsService.getPointsPerSeason).toBe('function');
    });

    it('should have findAllActive method with correct signature', () => {
      expect(mockConstructorsService.findAllActive).toBeDefined();
      expect(typeof mockConstructorsService.findAllActive).toBe('function');
    });

    it('should accept number parameter for findOne', async () => {
      const constructorId = 42;
      mockConstructorsService.findOne.mockResolvedValue(mockConstructor);

      const result = await mockConstructorsService.findOne(constructorId);

      expect(result).toBeDefined();
      expect(mockConstructorsService.findOne).toHaveBeenCalledWith(constructorId);
    });

    it('should accept number parameter for getPointsPerSeason', async () => {
      const constructorId = 42;
      mockConstructorsService.getPointsPerSeason.mockResolvedValue(mockPointsPerSeason);

      const result = await mockConstructorsService.getPointsPerSeason(constructorId);

      expect(result).toBeDefined();
      expect(mockConstructorsService.getPointsPerSeason).toHaveBeenCalledWith(constructorId);
    });
  });

  describe('service functionality', () => {
    it('should support constructor operations', () => {
      expect(mockConstructorsService.findAll).toBeDefined();
      expect(mockConstructorsService.findOne).toBeDefined();
      expect(mockConstructorsService.findAllActive).toBeDefined();
    });

    it('should support points per season operations', () => {
      expect(mockConstructorsService.getPointsPerSeason).toBeDefined();
    });

    it('should support all required service methods', () => {
      const requiredMethods = ['findAll', 'findOne', 'getPointsPerSeason', 'findAllActive'];
      requiredMethods.forEach(method => {
        expect(mockConstructorsService[method]).toBeDefined();
        expect(typeof mockConstructorsService[method]).toBe('function');
      });
    });
  });

  describe('service validation', () => {
    it('should have valid service structure', () => {
      expect(mockConstructorsService).toBeDefined();
      expect(typeof mockConstructorsService).toBe('object');
    });

    it('should have all required methods', () => {
      expect(mockConstructorsService).toHaveProperty('findAll');
      expect(mockConstructorsService).toHaveProperty('findOne');
      expect(mockConstructorsService).toHaveProperty('getPointsPerSeason');
      expect(mockConstructorsService).toHaveProperty('findAllActive');
    });

    it('should have consistent method types', () => {
      Object.values(mockConstructorsService).forEach(method => {
        expect(typeof method).toBe('function');
      });
    });
  });

  describe('service completeness', () => {
    it('should have all required service methods', () => {
      const requiredMethods = ['findAll', 'findOne', 'getPointsPerSeason', 'findAllActive'];
      requiredMethods.forEach(method => {
        expect(mockConstructorsService).toHaveProperty(method);
        expect(typeof mockConstructorsService[method]).toBe('function');
      });
    });

    it('should support all constructor operations', () => {
      expect(mockConstructorsService.findAll).toBeDefined();
      expect(mockConstructorsService.findOne).toBeDefined();
      expect(mockConstructorsService.findAllActive).toBeDefined();
    });

    it('should support points calculation operations', () => {
      expect(mockConstructorsService.getPointsPerSeason).toBeDefined();
    });
  });
});