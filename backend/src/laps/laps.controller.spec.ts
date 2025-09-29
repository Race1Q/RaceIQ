import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LapsController } from './laps.controller';
import { Lap } from './laps.entity';

// Mock repository
const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
  create: jest.fn(),
  findAndCount: jest.fn(),
  count: jest.fn(),
  query: jest.fn(),
  manager: {
    transaction: jest.fn(),
  },
};

// Mock lap data
const mockLapData = [
  {
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
  },
  {
    id: 2,
    race_id: 1,
    driver_id: 2,
    lap_number: 1,
    position: 2,
    time_ms: 91000,
    sector_1_ms: 31000,
    sector_2_ms: 30000,
    sector_3_ms: 30000,
    is_pit_out_lap: false,
  },
];

describe('LapsController', () => {
  let controller: LapsController;
  let repository: Repository<Lap>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LapsController],
      providers: [
        {
          provide: getRepositoryToken(Lap),
          useValue: mockRepository,
        },
      ],
    }).compile();

    controller = module.get<LapsController>(LapsController);
    repository = module.get<Repository<Lap>>(getRepositoryToken(Lap));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findByRaceId', () => {
    it('should return laps for valid race_id parameter', async () => {
      mockRepository.find.mockImplementation(() => Promise.resolve(mockLapData));

      const result = await controller.findByRaceId(1);

      expect(repository.find).toHaveBeenCalledWith({ where: { race_id: 1 } });
      expect(result).toEqual(mockLapData);
    });

    it('should return laps for valid raceId parameter', async () => {
      mockRepository.find.mockImplementation(() => Promise.resolve(mockLapData));

      const result = await controller.findByRaceId(undefined, 1);

      expect(repository.find).toHaveBeenCalledWith({ where: { race_id: 1 } });
      expect(result).toEqual(mockLapData);
    });

    it('should prioritize race_id over raceId when both are provided', async () => {
      mockRepository.find.mockImplementation(() => Promise.resolve(mockLapData));

      const result = await controller.findByRaceId(1, 2);

      expect(repository.find).toHaveBeenCalledWith({ where: { race_id: 1 } });
      expect(result).toEqual(mockLapData);
    });

    it('should handle string race_id parameter', async () => {
      mockRepository.find.mockImplementation(() => Promise.resolve(mockLapData));

      const result = await controller.findByRaceId('1' as any);

      expect(repository.find).toHaveBeenCalledWith({ where: { race_id: 1 } });
      expect(result).toEqual(mockLapData);
    });

    it('should handle string raceId parameter', async () => {
      mockRepository.find.mockImplementation(() => Promise.resolve(mockLapData));

      const result = await controller.findByRaceId(undefined, '1' as any);

      expect(repository.find).toHaveBeenCalledWith({ where: { race_id: 1 } });
      expect(result).toEqual(mockLapData);
    });

    it('should handle numeric string conversion', async () => {
      mockRepository.find.mockImplementation(() => Promise.resolve(mockLapData));

      const result = await controller.findByRaceId('123' as any);

      expect(repository.find).toHaveBeenCalledWith({ where: { race_id: 123 } });
      expect(result).toEqual(mockLapData);
    });

    it('should return empty array when no laps found', async () => {
      mockRepository.find.mockImplementation(() => Promise.resolve([]));

      const result = await controller.findByRaceId(1);

      expect(repository.find).toHaveBeenCalledWith({ where: { race_id: 1 } });
      expect(result).toEqual([]);
    });

    it('should throw error when race_id is missing', async () => {
      await expect(controller.findByRaceId()).rejects.toThrow('Missing or invalid race_id');
      expect(repository.find).not.toHaveBeenCalled();
    });

    it('should throw error when race_id is null', async () => {
      await expect(controller.findByRaceId(null as any)).rejects.toThrow('Missing or invalid race_id');
      expect(repository.find).not.toHaveBeenCalled();
    });

    it('should throw error when race_id is undefined', async () => {
      await expect(controller.findByRaceId(undefined)).rejects.toThrow('Missing or invalid race_id');
      expect(repository.find).not.toHaveBeenCalled();
    });

    it('should throw error when race_id is NaN', async () => {
      await expect(controller.findByRaceId('invalid' as any)).rejects.toThrow('Missing or invalid race_id');
      expect(repository.find).not.toHaveBeenCalled();
    });

    it('should throw error when race_id is empty string', async () => {
      await expect(controller.findByRaceId('' as any)).rejects.toThrow('Missing or invalid race_id');
      expect(repository.find).not.toHaveBeenCalled();
    });

    it('should throw error when race_id is 0', async () => {
      await expect(controller.findByRaceId(0)).rejects.toThrow('Missing or invalid race_id');
      expect(repository.find).not.toHaveBeenCalled();
    });

    it('should handle negative race_id values', async () => {
      mockRepository.find.mockImplementation(() => Promise.resolve(mockLapData));

      const result = await controller.findByRaceId(-1);

      expect(repository.find).toHaveBeenCalledWith({ where: { race_id: -1 } });
      expect(result).toEqual(mockLapData);
    });

    it('should throw error when raceId is 0', async () => {
      await expect(controller.findByRaceId(undefined, 0)).rejects.toThrow('Missing or invalid race_id');
      expect(repository.find).not.toHaveBeenCalled();
    });

    it('should handle negative raceId values', async () => {
      mockRepository.find.mockImplementation(() => Promise.resolve(mockLapData));

      const result = await controller.findByRaceId(undefined, -1);

      expect(repository.find).toHaveBeenCalledWith({ where: { race_id: -1 } });
      expect(result).toEqual(mockLapData);
    });

    it('should throw error when raceId is NaN', async () => {
      await expect(controller.findByRaceId(undefined, 'invalid' as any)).rejects.toThrow('Missing or invalid race_id');
      expect(repository.find).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      const error = new Error('Database connection failed');
      mockRepository.find.mockImplementation(() => Promise.reject(error));

      await expect(controller.findByRaceId(1)).rejects.toThrow('Database connection failed');
      expect(repository.find).toHaveBeenCalledWith({ where: { race_id: 1 } });
    });

    it('should handle repository errors gracefully', async () => {
      const error = new Error('Repository error');
      mockRepository.find.mockImplementation(() => Promise.reject(error));

      await expect(controller.findByRaceId(1)).rejects.toThrow('Repository error');
    });

    it('should convert race_id to number correctly', async () => {
      mockRepository.find.mockImplementation(() => Promise.resolve(mockLapData));

      const result = await controller.findByRaceId('42' as any);

      expect(repository.find).toHaveBeenCalledWith({ where: { race_id: 42 } });
      expect(result).toEqual(mockLapData);
    });

    it('should convert raceId to number correctly', async () => {
      mockRepository.find.mockImplementation(() => Promise.resolve(mockLapData));

      const result = await controller.findByRaceId(undefined, '42' as any);

      expect(repository.find).toHaveBeenCalledWith({ where: { race_id: 42 } });
      expect(result).toEqual(mockLapData);
    });

    it('should handle large race_id values', async () => {
      mockRepository.find.mockImplementation(() => Promise.resolve(mockLapData));

      const result = await controller.findByRaceId(999999);

      expect(repository.find).toHaveBeenCalledWith({ where: { race_id: 999999 } });
      expect(result).toEqual(mockLapData);
    });

    it('should handle decimal race_id values', async () => {
      mockRepository.find.mockImplementation(() => Promise.resolve(mockLapData));

      const result = await controller.findByRaceId(1.5 as any);

      expect(repository.find).toHaveBeenCalledWith({ where: { race_id: 1.5 } });
      expect(result).toEqual(mockLapData);
    });

    it('should handle decimal raceId values', async () => {
      mockRepository.find.mockImplementation(() => Promise.resolve(mockLapData));

      const result = await controller.findByRaceId(undefined, 1.5 as any);

      expect(repository.find).toHaveBeenCalledWith({ where: { race_id: 1.5 } });
      expect(result).toEqual(mockLapData);
    });
  });

  describe('controller structure', () => {
    it('should be a controller object', () => {
      expect(typeof LapsController).toBe('function');
    });

    it('should have correct controller name', () => {
      expect(LapsController.name).toBe('LapsController');
    });

    it('should be properly instantiated', () => {
      expect(controller).toBeDefined();
      expect(typeof controller).toBe('object');
    });

    it('should have repository injected', () => {
      expect(repository).toBeDefined();
      expect(repository).toBe(mockRepository);
    });
  });

  describe('controller methods', () => {
    it('should have findByRaceId method', () => {
      expect(typeof controller.findByRaceId).toBe('function');
    });

    it('should have all required methods', () => {
      const requiredMethods = ['findByRaceId'];
      requiredMethods.forEach(method => {
        expect(controller).toHaveProperty(method);
        expect(typeof controller[method]).toBe('function');
      });
    });
  });

  describe('parameter handling', () => {
    it('should handle valid integer race_id', async () => {
      mockRepository.find.mockImplementation(() => Promise.resolve(mockLapData));

      const result = await controller.findByRaceId(123);

      expect(repository.find).toHaveBeenCalledWith({ where: { race_id: 123 } });
      expect(result).toEqual(mockLapData);
    });

    it('should handle valid integer raceId', async () => {
      mockRepository.find.mockImplementation(() => Promise.resolve(mockLapData));

      const result = await controller.findByRaceId(undefined, 123);

      expect(repository.find).toHaveBeenCalledWith({ where: { race_id: 123 } });
      expect(result).toEqual(mockLapData);
    });

    it('should handle valid string race_id', async () => {
      mockRepository.find.mockImplementation(() => Promise.resolve(mockLapData));

      const result = await controller.findByRaceId('123' as any);

      expect(repository.find).toHaveBeenCalledWith({ where: { race_id: 123 } });
      expect(result).toEqual(mockLapData);
    });

    it('should handle valid string raceId', async () => {
      mockRepository.find.mockImplementation(() => Promise.resolve(mockLapData));

      const result = await controller.findByRaceId(undefined, '123' as any);

      expect(repository.find).toHaveBeenCalledWith({ where: { race_id: 123 } });
      expect(result).toEqual(mockLapData);
    });

    it('should reject invalid string race_id', async () => {
      await expect(controller.findByRaceId('abc' as any)).rejects.toThrow('Missing or invalid race_id');
      expect(repository.find).not.toHaveBeenCalled();
    });

    it('should reject invalid string raceId', async () => {
      await expect(controller.findByRaceId(undefined, 'abc' as any)).rejects.toThrow('Missing or invalid race_id');
      expect(repository.find).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle repository errors', async () => {
      const error = new Error('Database error');
      mockRepository.find.mockImplementation(() => Promise.reject(error));

      await expect(controller.findByRaceId(1)).rejects.toThrow('Database error');
    });

    it('should handle network errors', async () => {
      const error = new Error('Network timeout');
      mockRepository.find.mockImplementation(() => Promise.reject(error));

      await expect(controller.findByRaceId(1)).rejects.toThrow('Network timeout');
    });

    it('should handle typeorm errors', async () => {
      const error = new Error('TypeORM connection failed');
      mockRepository.find.mockImplementation(() => Promise.reject(error));

      await expect(controller.findByRaceId(1)).rejects.toThrow('TypeORM connection failed');
    });

    it('should propagate errors correctly', async () => {
      const error = new Error('Custom error');
      mockRepository.find.mockImplementation(() => Promise.reject(error));

      await expect(controller.findByRaceId(1)).rejects.toThrow('Custom error');
      expect(repository.find).toHaveBeenCalledWith({ where: { race_id: 1 } });
    });
  });

  describe('data validation', () => {
    it('should return correct data structure', async () => {
      mockRepository.find.mockImplementation(() => Promise.resolve(mockLapData));

      const result = await controller.findByRaceId(1);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('race_id');
      expect(result[0]).toHaveProperty('driver_id');
      expect(result[0]).toHaveProperty('lap_number');
      expect(result[0]).toHaveProperty('position');
      expect(result[0]).toHaveProperty('time_ms');
      expect(result[0]).toHaveProperty('sector_1_ms');
      expect(result[0]).toHaveProperty('sector_2_ms');
      expect(result[0]).toHaveProperty('sector_3_ms');
      expect(result[0]).toHaveProperty('is_pit_out_lap');
    });

    it('should return empty array for non-existent race', async () => {
      mockRepository.find.mockImplementation(() => Promise.resolve([]));

      const result = await controller.findByRaceId(999);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });

    it('should handle null data from repository', async () => {
      mockRepository.find.mockImplementation(() => Promise.resolve(null));

      const result = await controller.findByRaceId(1);

      expect(result).toBeNull();
    });
  });

  describe('query parameters', () => {
    it('should handle race_id query parameter', async () => {
      mockRepository.find.mockImplementation(() => Promise.resolve(mockLapData));

      const result = await controller.findByRaceId(1);

      expect(repository.find).toHaveBeenCalledWith({ where: { race_id: 1 } });
      expect(result).toEqual(mockLapData);
    });

    it('should handle raceId query parameter', async () => {
      mockRepository.find.mockImplementation(() => Promise.resolve(mockLapData));

      const result = await controller.findByRaceId(undefined, 1);

      expect(repository.find).toHaveBeenCalledWith({ where: { race_id: 1 } });
      expect(result).toEqual(mockLapData);
    });

    it('should prioritize race_id over raceId', async () => {
      mockRepository.find.mockImplementation(() => Promise.resolve(mockLapData));

      const result = await controller.findByRaceId(1, 2);

      expect(repository.find).toHaveBeenCalledWith({ where: { race_id: 1 } });
      expect(result).toEqual(mockLapData);
    });
  });

  describe('controller functionality', () => {
    it('should support lap data retrieval', () => {
      expect(typeof controller.findByRaceId).toBe('function');
    });

    it('should support race-based filtering', async () => {
      mockRepository.find.mockImplementation(() => Promise.resolve(mockLapData));

      const result = await controller.findByRaceId(1);

      expect(repository.find).toHaveBeenCalledWith({ where: { race_id: 1 } });
      expect(result).toBeDefined();
    });

    it('should support error handling', async () => {
      const error = new Error('Test error');
      mockRepository.find.mockImplementation(() => Promise.reject(error));

      await expect(controller.findByRaceId(1)).rejects.toThrow('Test error');
    });
  });

  describe('controller validation', () => {
    it('should have valid controller structure', () => {
      expect(controller).toBeDefined();
      expect(typeof controller).toBe('object');
    });

    it('should have required methods', () => {
      expect(controller.findByRaceId).toBeDefined();
      expect(typeof controller.findByRaceId).toBe('function');
    });

    it('should have proper dependencies', () => {
      expect(repository).toBeDefined();
      expect(repository).toBe(mockRepository);
    });
  });

  describe('controller completeness', () => {
    it('should have all required methods', () => {
      const requiredMethods = ['findByRaceId'];
      requiredMethods.forEach(method => {
        expect(controller).toHaveProperty(method);
        expect(typeof controller[method]).toBe('function');
      });
    });

    it('should support lap data operations', () => {
      expect(controller.findByRaceId).toBeDefined();
    });

    it('should support race-based queries', () => {
      expect(controller.findByRaceId).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle very large race_id values', async () => {
      mockRepository.find.mockImplementation(() => Promise.resolve(mockLapData));

      const result = await controller.findByRaceId(Number.MAX_SAFE_INTEGER);

      expect(repository.find).toHaveBeenCalledWith({ where: { race_id: Number.MAX_SAFE_INTEGER } });
      expect(result).toEqual(mockLapData);
    });

    it('should handle very large raceId values', async () => {
      mockRepository.find.mockImplementation(() => Promise.resolve(mockLapData));

      const result = await controller.findByRaceId(undefined, Number.MAX_SAFE_INTEGER);

      expect(repository.find).toHaveBeenCalledWith({ where: { race_id: Number.MAX_SAFE_INTEGER } });
      expect(result).toEqual(mockLapData);
    });

    it('should handle Infinity race_id', async () => {
      mockRepository.find.mockImplementation(() => Promise.resolve(mockLapData));

      const result = await controller.findByRaceId(Infinity as any);

      expect(repository.find).toHaveBeenCalledWith({ where: { race_id: Infinity } });
      expect(result).toEqual(mockLapData);
    });

    it('should handle Infinity raceId', async () => {
      mockRepository.find.mockImplementation(() => Promise.resolve(mockLapData));

      const result = await controller.findByRaceId(undefined, Infinity as any);

      expect(repository.find).toHaveBeenCalledWith({ where: { race_id: Infinity } });
      expect(result).toEqual(mockLapData);
    });

    it('should handle -Infinity race_id', async () => {
      mockRepository.find.mockImplementation(() => Promise.resolve(mockLapData));

      const result = await controller.findByRaceId(-Infinity as any);

      expect(repository.find).toHaveBeenCalledWith({ where: { race_id: -Infinity } });
      expect(result).toEqual(mockLapData);
    });

    it('should handle -Infinity raceId', async () => {
      mockRepository.find.mockImplementation(() => Promise.resolve(mockLapData));

      const result = await controller.findByRaceId(undefined, -Infinity as any);

      expect(repository.find).toHaveBeenCalledWith({ where: { race_id: -Infinity } });
      expect(result).toEqual(mockLapData);
    });

    it('should handle NaN race_id', async () => {
      await expect(controller.findByRaceId(NaN as any)).rejects.toThrow('Missing or invalid race_id');
      expect(repository.find).not.toHaveBeenCalled();
    });

    it('should handle NaN raceId', async () => {
      await expect(controller.findByRaceId(undefined, NaN as any)).rejects.toThrow('Missing or invalid race_id');
      expect(repository.find).not.toHaveBeenCalled();
    });
  });

  describe('concurrent requests', () => {
    it('should handle multiple concurrent requests', async () => {
      mockRepository.find.mockImplementation(() => Promise.resolve(mockLapData));

      const promises = [
        controller.findByRaceId(1),
        controller.findByRaceId(2),
        controller.findByRaceId(3),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results.every(result => Array.isArray(result))).toBe(true);
      expect(repository.find).toHaveBeenCalledTimes(3);
    });

    it('should handle mixed parameter types in concurrent requests', async () => {
      mockRepository.find.mockImplementation(() => Promise.resolve(mockLapData));

      const promises = [
        controller.findByRaceId(1),
        controller.findByRaceId(undefined, 2),
        controller.findByRaceId('3' as any),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results.every(result => Array.isArray(result))).toBe(true);
      expect(repository.find).toHaveBeenCalledTimes(3);
    });
  });

  describe('return type validation', () => {
    it('should return correct types for valid requests', async () => {
      mockRepository.find.mockImplementation(() => Promise.resolve(mockLapData));

      const result = await controller.findByRaceId(1);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toBeDefined();
    });

    it('should return array type for successful requests', async () => {
      mockRepository.find.mockImplementation(() => Promise.resolve([]));

      const result = await controller.findByRaceId(1);

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('method signatures', () => {
    it('should have correct method signature for findByRaceId', () => {
      expect(typeof controller.findByRaceId).toBe('function');
    });

    it('should accept optional race_id parameter', async () => {
      mockRepository.find.mockImplementation(() => Promise.resolve(mockLapData));

      const result = await controller.findByRaceId(1);

      expect(result).toBeDefined();
    });

    it('should accept optional raceId parameter', async () => {
      mockRepository.find.mockImplementation(() => Promise.resolve(mockLapData));

      const result = await controller.findByRaceId(undefined, 1);

      expect(result).toBeDefined();
    });
  });
});
