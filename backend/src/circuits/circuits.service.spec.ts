import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CircuitsService } from './circuits.service';
import { Circuit } from './circuits.entity';
import { NotFoundException } from '@nestjs/common';

describe('CircuitsService', () => {
  let service: CircuitsService;
  let repository: Repository<Circuit>;

  const mockRepository = {
    find: jest.fn() as jest.MockedFunction<Repository<Circuit>['find']>,
    findOne: jest.fn() as jest.MockedFunction<Repository<Circuit>['findOne']>,
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
      providers: [
        CircuitsService,
        {
          provide: getRepositoryToken(Circuit),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CircuitsService>(CircuitsService);
    repository = module.get<Repository<Circuit>>(getRepositoryToken(Circuit));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of circuits with country relations', async () => {
      mockRepository.find.mockResolvedValue(mockCircuits);

      const result = await service.findAll();

      expect(result).toEqual(mockCircuits);
      expect(repository.find).toHaveBeenCalledTimes(1);
      expect(repository.find).toHaveBeenCalledWith({ relations: ['country'] });
    });

    it('should return empty array when no circuits exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(repository.find).toHaveBeenCalledTimes(1);
      expect(repository.find).toHaveBeenCalledWith({ relations: ['country'] });
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database connection failed');
      mockRepository.find.mockRejectedValue(error);

      await expect(service.findAll()).rejects.toThrow('Database connection failed');
      expect(repository.find).toHaveBeenCalledTimes(1);
    });

    it('should propagate repository exceptions', async () => {
      const error = new Error('Query timeout');
      mockRepository.find.mockRejectedValue(error);

      await expect(service.findAll()).rejects.toThrow('Query timeout');
      expect(repository.find).toHaveBeenCalledTimes(1);
    });

    it('should return circuits with all required properties', async () => {
      mockRepository.find.mockResolvedValue(mockCircuits);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('location');
      expect(result[0]).toHaveProperty('country_code');
      expect(result[0]).toHaveProperty('map_url');
      expect(result[0]).toHaveProperty('length_km');
      expect(result[0]).toHaveProperty('race_distance_km');
      expect(result[0]).toHaveProperty('track_layout');
      expect(result[0]).toHaveProperty('country');
    });

    it('should handle circuits with null values', async () => {
      const circuitsWithNulls: Circuit[] = [
        {
          id: 1,
          name: 'Test Circuit',
          location: null,
          country_code: null,
          map_url: null,
          length_km: null,
          race_distance_km: null,
          track_layout: null,
          country: null,
        },
      ];

      mockRepository.find.mockResolvedValue(circuitsWithNulls);

      const result = await service.findAll();

      expect(result).toEqual(circuitsWithNulls);
      expect(result[0].location).toBeNull();
      expect(result[0].country_code).toBeNull();
      expect(result[0].map_url).toBeNull();
      expect(result[0].length_km).toBeNull();
      expect(result[0].race_distance_km).toBeNull();
      expect(result[0].track_layout).toBeNull();
      expect(result[0].country).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should return a circuit when valid id is provided', async () => {
      const circuitId = 1;
      mockRepository.findOne.mockResolvedValue(mockCircuit);

      const result = await service.findOne(circuitId);

      expect(result).toEqual(mockCircuit);
      expect(repository.findOne).toHaveBeenCalledTimes(1);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: circuitId },
        relations: ['country'],
      });
    });

    it('should return circuit with all properties', async () => {
      const circuitId = 1;
      mockRepository.findOne.mockResolvedValue(mockCircuit);

      const result = await service.findOne(circuitId);

      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('name', 'Monaco');
      expect(result).toHaveProperty('location', 'Monte Carlo');
      expect(result).toHaveProperty('country_code', 'MCO');
      expect(result).toHaveProperty('map_url');
      expect(result).toHaveProperty('length_km');
      expect(result).toHaveProperty('race_distance_km');
      expect(result).toHaveProperty('track_layout');
      expect(result).toHaveProperty('country');
    });

    it('should throw NotFoundException when circuit is not found', async () => {
      const circuitId = 999;
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(circuitId)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(circuitId)).rejects.toThrow(`Circuit with ID ${circuitId} not found`);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: circuitId },
        relations: ['country'],
      });
    });

    it('should handle different circuit IDs', async () => {
      const circuitIds = [1, 2, 10, 100];
      
      for (const id of circuitIds) {
        const circuit = { ...mockCircuit, id };
        mockRepository.findOne.mockResolvedValueOnce(circuit);

        const result = await service.findOne(id);

        expect(result.id).toBe(id);
        expect(repository.findOne).toHaveBeenCalledWith({
          where: { id },
          relations: ['country'],
        });
      }
    });

    it('should handle repository errors for findOne', async () => {
      const circuitId = 1;
      const error = new Error('Database query failed');
      mockRepository.findOne.mockRejectedValue(error);

      await expect(service.findOne(circuitId)).rejects.toThrow('Database query failed');
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: circuitId },
        relations: ['country'],
      });
    });

    it('should handle zero id', async () => {
      const circuitId = 0;
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(circuitId)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(circuitId)).rejects.toThrow(`Circuit with ID ${circuitId} not found`);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: circuitId },
        relations: ['country'],
      });
    });

    it('should handle negative id', async () => {
      const circuitId = -1;
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(circuitId)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(circuitId)).rejects.toThrow(`Circuit with ID ${circuitId} not found`);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: circuitId },
        relations: ['country'],
      });
    });

    it('should handle circuit with null country relation', async () => {
      const circuitId = 1;
      const circuitWithNullCountry = { ...mockCircuit, country: null };
      mockRepository.findOne.mockResolvedValue(circuitWithNullCountry);

      const result = await service.findOne(circuitId);

      expect(result).toEqual(circuitWithNullCountry);
      expect(result.country).toBeNull();
    });

    it('should handle circuit with partial data', async () => {
      const circuitId = 1;
      const partialCircuit = {
        id: 1,
        name: 'Test Circuit',
        location: null,
        country_code: 'TST',
        map_url: null,
        length_km: 5.0,
        race_distance_km: null,
        track_layout: null,
        country: {
          country_code: 'TST',
          country_name: 'Test Country',
          drivers: [],
        },
      };
      mockRepository.findOne.mockResolvedValue(partialCircuit);

      const result = await service.findOne(circuitId);

      expect(result).toEqual(partialCircuit);
      expect(result.name).toBe('Test Circuit');
      expect(result.location).toBeNull();
    });
  });

  describe('service structure', () => {
    it('should be a class', () => {
      expect(typeof CircuitsService).toBe('function');
    });

    it('should be injectable', () => {
      expect(service).toBeInstanceOf(CircuitsService);
    });

    it('should have repository injected correctly', () => {
      expect(repository).toBeDefined();
      expect(repository).toBe(mockRepository);
    });

    it('should have findAll method', () => {
      expect(typeof service.findAll).toBe('function');
    });

    it('should have findOne method', () => {
      expect(typeof service.findOne).toBe('function');
    });
  });

  describe('repository integration', () => {
    it('should call repository.find exactly once for findAll', async () => {
      mockRepository.find.mockResolvedValue(mockCircuits);

      await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledTimes(1);
      expect(mockRepository.find).toHaveBeenCalledWith({ relations: ['country'] });
    });

    it('should call repository.findOne exactly once for findOne', async () => {
      const circuitId = 1;
      mockRepository.findOne.mockResolvedValue(mockCircuit);

      await service.findOne(circuitId);

      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: circuitId },
        relations: ['country'],
      });
    });

    it('should not modify repository responses', async () => {
      const originalCircuit = { ...mockCircuit };
      mockRepository.findOne.mockResolvedValue(mockCircuit);

      const result = await service.findOne(1);

      expect(result).toEqual(originalCircuit);
      expect(result).toBe(mockCircuit); // Same reference
    });

    it('should handle repository returning null for findOne', async () => {
      const circuitId = 999;
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(circuitId)).rejects.toThrow(NotFoundException);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: circuitId },
        relations: ['country'],
      });
    });
  });

  describe('concurrent requests', () => {
    it('should handle multiple concurrent findAll requests', async () => {
      mockRepository.find.mockResolvedValue(mockCircuits);

      const promises = [
        service.findAll(),
        service.findAll(),
        service.findAll(),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results.every(result => result === mockCircuits)).toBe(true);
      expect(mockRepository.find).toHaveBeenCalledTimes(3);
    });

    it('should handle multiple concurrent findOne requests', async () => {
      const circuitIds = [1, 2, 3];
      const circuits = circuitIds.map(id => ({ ...mockCircuit, id }));
      
      circuitIds.forEach((id, index) => {
        mockRepository.findOne.mockResolvedValueOnce(circuits[index]);
      });

      const promises = circuitIds.map(id => service.findOne(id));

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results[0].id).toBe(1);
      expect(results[1].id).toBe(2);
      expect(results[2].id).toBe(3);
      expect(mockRepository.findOne).toHaveBeenCalledTimes(3);
    });

    it('should handle mixed concurrent requests', async () => {
      mockRepository.find.mockResolvedValue(mockCircuits);
      mockRepository.findOne.mockResolvedValue(mockCircuit);

      const promises = [
        service.findAll(),
        service.findOne(1),
        service.findAll(),
        service.findOne(2),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(4);
      expect(results[0]).toBe(mockCircuits);
      expect(results[1]).toBe(mockCircuit);
      expect(results[2]).toBe(mockCircuits);
      expect(results[3]).toBe(mockCircuit);
      expect(mockRepository.find).toHaveBeenCalledTimes(2);
      expect(mockRepository.findOne).toHaveBeenCalledTimes(2);
    });
  });

  describe('error propagation', () => {
    it('should propagate all repository errors for findAll', async () => {
      const errors = [
        new Error('Connection timeout'),
        new Error('Permission denied'),
        new Error('Resource not available'),
      ];

      for (const error of errors) {
        mockRepository.find.mockRejectedValueOnce(error);
        
        await expect(service.findAll()).rejects.toThrow(error.message);
        expect(repository.find).toHaveBeenCalled();
      }
    });

    it('should propagate all repository errors for findOne', async () => {
      const errors = [
        new Error('Database error'),
        new Error('Validation failed'),
        new Error('Constraint violation'),
      ];

      for (const error of errors) {
        mockRepository.findOne.mockRejectedValueOnce(error);
        
        await expect(service.findOne(1)).rejects.toThrow();
        expect(repository.findOne).toHaveBeenCalledWith({
          where: { id: 1 },
          relations: ['country'],
        });
      }
    });
  });

  describe('return type validation', () => {
    it('should return Promise<Circuit[]> for findAll', async () => {
      mockRepository.find.mockResolvedValue(mockCircuits);

      const result = await service.findAll();

      expect(Array.isArray(result)).toBe(true);
      expect(result).toBeInstanceOf(Array);
    });

    it('should return Promise<Circuit> for findOne', async () => {
      mockRepository.findOne.mockResolvedValue(mockCircuit);

      const result = await service.findOne(1);

      expect(result).toBeInstanceOf(Object);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
    });
  });

  describe('method signatures', () => {
    it('should have findAll method with correct signature', () => {
      expect(service.findAll).toBeDefined();
      expect(typeof service.findAll).toBe('function');
    });

    it('should have findOne method with correct signature', () => {
      expect(service.findOne).toBeDefined();
      expect(typeof service.findOne).toBe('function');
    });

    it('should accept number parameter for findOne', async () => {
      const circuitId = 42;
      mockRepository.findOne.mockResolvedValue(mockCircuit);

      const result = await service.findOne(circuitId);

      expect(result).toBeDefined();
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: circuitId },
        relations: ['country'],
      });
    });
  });

  describe('data validation', () => {
    it('should handle circuits with valid track_layout JSON', async () => {
      const circuitWithValidLayout = {
        ...mockCircuit,
        track_layout: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: [[0, 0], [1, 1], [2, 2]],
              },
            },
          ],
        },
      };

      mockRepository.findOne.mockResolvedValue(circuitWithValidLayout);

      const result = await service.findOne(1);

      expect(result.track_layout).toEqual(circuitWithValidLayout.track_layout);
      expect(result.track_layout.type).toBe('FeatureCollection');
      expect(Array.isArray(result.track_layout.features)).toBe(true);
    });

    it('should handle circuits with numeric values', async () => {
      const circuitWithNumericValues = {
        ...mockCircuit,
        length_km: 5.123,
        race_distance_km: 305.456,
      };

      mockRepository.findOne.mockResolvedValue(circuitWithNumericValues);

      const result = await service.findOne(1);

      expect(typeof result.length_km).toBe('number');
      expect(typeof result.race_distance_km).toBe('number');
      expect(result.length_km).toBe(5.123);
      expect(result.race_distance_km).toBe(305.456);
    });

    it('should handle circuits with string values', async () => {
      const circuitWithStringValues = {
        ...mockCircuit,
        name: 'Test Circuit Name',
        location: 'Test Location',
        country_code: 'TST',
        map_url: 'https://example.com/test-map',
      };

      mockRepository.findOne.mockResolvedValue(circuitWithStringValues);

      const result = await service.findOne(1);

      expect(typeof result.name).toBe('string');
      expect(typeof result.location).toBe('string');
      expect(typeof result.country_code).toBe('string');
      expect(typeof result.map_url).toBe('string');
    });
  });
});
