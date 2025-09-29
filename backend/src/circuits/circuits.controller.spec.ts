import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { CircuitsController } from './circuits.controller';
import { CircuitsService } from './circuits.service';
import { Circuit } from './circuits.entity';
import { NotFoundException } from '@nestjs/common';

describe('CircuitsController', () => {
  let controller: CircuitsController;
  let service: CircuitsService;

  const mockCircuitsService = {
    findAll: jest.fn() as jest.MockedFunction<CircuitsService['findAll']>,
    findOne: jest.fn() as jest.MockedFunction<(id: number) => Promise<Circuit | null | undefined>>,
  };

  const mockCircuit: Circuit = {
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
    country: {
      country_code: 'MCO',
      country_name: 'Monaco',
      drivers: [],
    },
  };

  const mockCircuits: Circuit[] = [
    mockCircuit,
    {
      id: 2,
      name: 'Silverstone',
      location: 'Silverstone',
      country_code: 'GBR',
      map_url: 'https://example.com/silverstone-map',
      length_km: 5.891,
      race_distance_km: 306.198,
      track_layout: {
        type: 'FeatureCollection',
        features: [],
      },
      country: {
        country_code: 'GBR',
        country_name: 'United Kingdom',
        drivers: [],
      },
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CircuitsController],
      providers: [
        {
          provide: CircuitsService,
          useValue: mockCircuitsService,
        },
      ],
    }).compile();

    controller = module.get<CircuitsController>(CircuitsController);
    service = module.get<CircuitsService>(CircuitsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of circuits', async () => {
      mockCircuitsService.findAll.mockResolvedValue(mockCircuits);

      const result = await controller.findAll();

      expect(result).toEqual(mockCircuits);
      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(service.findAll).toHaveBeenCalledWith();
    });

    it('should return empty array when no circuits exist', async () => {
      mockCircuitsService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors', async () => {
      const error = new Error('Database connection failed');
      mockCircuitsService.findAll.mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow('Database connection failed');
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });

    it('should propagate service exceptions', async () => {
      const error = new Error('Service unavailable');
      mockCircuitsService.findAll.mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow('Service unavailable');
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a circuit when valid id is provided', async () => {
      const circuitId = 1;
      mockCircuitsService.findOne.mockResolvedValue(mockCircuit);

      const result = await controller.findOne(circuitId);

      expect(result).toEqual(mockCircuit);
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(service.findOne).toHaveBeenCalledWith(circuitId);
    });

    it('should return circuit with all properties', async () => {
      const circuitId = 1;
      mockCircuitsService.findOne.mockResolvedValue(mockCircuit);

      const result = await controller.findOne(circuitId);

      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('name', 'Monaco');
      expect(result).toHaveProperty('location', 'Monte Carlo');
      expect(result).toHaveProperty('country_code', 'MCO');
      expect(result).toHaveProperty('map_url');
      expect(result).toHaveProperty('length_km');
      expect(result).toHaveProperty('race_distance_km');
      expect(result).toHaveProperty('track_layout');
      expect(result).toHaveProperty('country');
      expect(service.findOne).toHaveBeenCalledWith(circuitId);
    });

    it('should handle NotFoundException from service', async () => {
      const circuitId = 999;
      const notFoundError = new NotFoundException(`Circuit with ID ${circuitId} not found`);
      mockCircuitsService.findOne.mockRejectedValue(notFoundError);

      await expect(controller.findOne(circuitId)).rejects.toThrow(NotFoundException);
      await expect(controller.findOne(circuitId)).rejects.toThrow(`Circuit with ID ${circuitId} not found`);
      expect(service.findOne).toHaveBeenCalledWith(circuitId);
    });

    it('should handle different circuit IDs', async () => {
      const circuitIds = [1, 2, 10, 100];
      
      for (const id of circuitIds) {
        const circuit = { ...mockCircuit, id };
        mockCircuitsService.findOne.mockResolvedValueOnce(circuit);

        const result = await controller.findOne(id);

        expect(result.id).toBe(id);
        expect(service.findOne).toHaveBeenCalledWith(id);
      }
    });

    it('should handle service errors for findOne', async () => {
      const circuitId = 1;
      const error = new Error('Database query failed');
      mockCircuitsService.findOne.mockRejectedValue(error);

      await expect(controller.findOne(circuitId)).rejects.toThrow('Database query failed');
      expect(service.findOne).toHaveBeenCalledWith(circuitId);
    });

    it('should handle invalid id parameter', async () => {
      const invalidId = 'invalid';
      
      // The ParseIntPipe will handle this, but we test the service call
      // In a real scenario, this would be caught by the pipe before reaching the controller
      const error = new Error('Invalid ID format');
      mockCircuitsService.findOne.mockRejectedValue(error);

      await expect(controller.findOne(Number(invalidId))).rejects.toThrow('Invalid ID format');
    });

    it('should handle zero id', async () => {
      const circuitId = 0;
      const error = new NotFoundException(`Circuit with ID ${circuitId} not found`);
      mockCircuitsService.findOne.mockRejectedValue(error);

      await expect(controller.findOne(circuitId)).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(circuitId);
    });

    it('should handle negative id', async () => {
      const circuitId = -1;
      const error = new NotFoundException(`Circuit with ID ${circuitId} not found`);
      mockCircuitsService.findOne.mockRejectedValue(error);

      await expect(controller.findOne(circuitId)).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(circuitId);
    });
  });

  describe('controller structure', () => {
    it('should be a class', () => {
      expect(typeof CircuitsController).toBe('function');
    });

    it('should have proper constructor injection', () => {
      expect(controller).toBeInstanceOf(CircuitsController);
    });

    it('should have service injected correctly', () => {
      expect(service).toBeDefined();
      expect(service).toBe(mockCircuitsService);
    });

    it('should have findAll method', () => {
      expect(typeof controller.findAll).toBe('function');
    });

    it('should have findOne method', () => {
      expect(typeof controller.findOne).toBe('function');
    });
  });

  describe('service integration', () => {
    it('should call service.findAll exactly once', async () => {
      mockCircuitsService.findAll.mockResolvedValue(mockCircuits);

      await controller.findAll();

      expect(mockCircuitsService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should call service.findOne exactly once', async () => {
      const circuitId = 1;
      mockCircuitsService.findOne.mockResolvedValue(mockCircuit);

      await controller.findOne(circuitId);

      expect(mockCircuitsService.findOne).toHaveBeenCalledTimes(1);
      expect(mockCircuitsService.findOne).toHaveBeenCalledWith(circuitId);
    });

    it('should not modify service responses', async () => {
      const originalCircuit = { ...mockCircuit };
      mockCircuitsService.findOne.mockResolvedValue(mockCircuit);

      const result = await controller.findOne(1);

      expect(result).toEqual(originalCircuit);
      expect(result).toBe(mockCircuit); // Same reference
    });

    it('should handle service returning null', async () => {
      const circuitId = 999;
      mockCircuitsService.findOne.mockResolvedValue(null);

      const result = await controller.findOne(circuitId);

      expect(result).toBeNull();
      expect(service.findOne).toHaveBeenCalledWith(circuitId);
    });

    it('should handle service returning undefined', async () => {
      const circuitId = 999;
      mockCircuitsService.findOne.mockResolvedValue(undefined);

      const result = await controller.findOne(circuitId);

      expect(result).toBeUndefined();
      expect(service.findOne).toHaveBeenCalledWith(circuitId);
    });
  });

  describe('concurrent requests', () => {
    it('should handle multiple concurrent findAll requests', async () => {
      mockCircuitsService.findAll.mockResolvedValue(mockCircuits);

      const promises = [
        controller.findAll(),
        controller.findAll(),
        controller.findAll(),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results.every(result => result === mockCircuits)).toBe(true);
      expect(mockCircuitsService.findAll).toHaveBeenCalledTimes(3);
    });

    it('should handle multiple concurrent findOne requests', async () => {
      const circuitIds = [1, 2, 3];
      const circuits = circuitIds.map(id => ({ ...mockCircuit, id }));
      
      circuitIds.forEach((id, index) => {
        mockCircuitsService.findOne.mockResolvedValueOnce(circuits[index]);
      });

      const promises = circuitIds.map(id => controller.findOne(id));

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results[0].id).toBe(1);
      expect(results[1].id).toBe(2);
      expect(results[2].id).toBe(3);
      expect(mockCircuitsService.findOne).toHaveBeenCalledTimes(3);
    });

    it('should handle mixed concurrent requests', async () => {
      mockCircuitsService.findAll.mockResolvedValue(mockCircuits);
      mockCircuitsService.findOne.mockResolvedValue(mockCircuit);

      const promises = [
        controller.findAll(),
        controller.findOne(1),
        controller.findAll(),
        controller.findOne(2),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(4);
      expect(results[0]).toBe(mockCircuits);
      expect(results[1]).toBe(mockCircuit);
      expect(results[2]).toBe(mockCircuits);
      expect(results[3]).toBe(mockCircuit);
      expect(mockCircuitsService.findAll).toHaveBeenCalledTimes(2);
      expect(mockCircuitsService.findOne).toHaveBeenCalledTimes(2);
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
        mockCircuitsService.findAll.mockRejectedValueOnce(error);
        
        await expect(controller.findAll()).rejects.toThrow(error.message);
        expect(service.findAll).toHaveBeenCalled();
      }
    });

    it('should propagate all service errors for findOne', async () => {
      const errors = [
        new NotFoundException('Circuit not found'),
        new Error('Database error'),
        new Error('Validation failed'),
      ];

      for (const error of errors) {
        mockCircuitsService.findOne.mockRejectedValueOnce(error);
        
        await expect(controller.findOne(1)).rejects.toThrow();
        expect(service.findOne).toHaveBeenCalledWith(1);
      }
    });
  });

  describe('return type validation', () => {
    it('should return Promise<Circuit[]> for findAll', async () => {
      mockCircuitsService.findAll.mockResolvedValue(mockCircuits);

      const result = await controller.findAll();

      expect(Array.isArray(result)).toBe(true);
      expect(result).toBeInstanceOf(Array);
    });

    it('should return Promise<Circuit> for findOne', async () => {
      mockCircuitsService.findOne.mockResolvedValue(mockCircuit);

      const result = await controller.findOne(1);

      expect(result).toBeInstanceOf(Object);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
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

    it('should accept number parameter for findOne', async () => {
      const circuitId = 42;
      mockCircuitsService.findOne.mockResolvedValue(mockCircuit);

      const result = await controller.findOne(circuitId);

      expect(result).toBeDefined();
      expect(service.findOne).toHaveBeenCalledWith(circuitId);
    });
  });
});
