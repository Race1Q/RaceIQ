import { Test, TestingModule } from '@nestjs/testing';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { CircuitsController } from './circuits.controller';
import { CircuitsService } from './circuits.service';
import { CircuitIngestService } from './circuits-ingest.service';
import { Circuit } from './circuits.entity';

describe('CircuitsController', () => {
  let controller: CircuitsController;
  let circuitsService: CircuitsService;
  let circuitIngestService: CircuitIngestService;

  const mockCircuitsService = {
    getAllCircuits: jest.fn(),
    testConnection: jest.fn(),
    searchCircuits: jest.fn(),
    getCircuitsByCountry: jest.fn(),
    getCircuitById: jest.fn(),
    getCircuitByName: jest.fn(),
  };

  const mockCircuitIngestService = {
    ingestCircuits: jest.fn(),
  };

  const mockCircuit: Circuit = {
    id: 1,
    name: 'Silverstone Circuit',
    location: 'Silverstone',
    country_code: 'GB',
    map_url: 'https://example.com/silverstone-map.jpg',
  };

  const mockCircuits: Circuit[] = [
    mockCircuit,
    {
      id: 2,
      name: 'Monaco Circuit',
      location: 'Monte Carlo',
      country_code: 'MC',
      map_url: 'https://example.com/monaco-map.jpg',
    },
  ];

  beforeEach(async () => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CircuitsController],
      providers: [
        {
          provide: CircuitsService,
          useValue: mockCircuitsService,
        },
        {
          provide: CircuitIngestService,
          useValue: mockCircuitIngestService,
        },
      ],
    }).compile();

    controller = module.get<CircuitsController>(CircuitsController);
    circuitsService = module.get<CircuitsService>(CircuitsService);
    circuitIngestService = module.get<CircuitIngestService>(CircuitIngestService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('ingestCircuits', () => {
    it('should call circuitIngestService.ingestCircuits', async () => {
      const mockResult = { created: 5, updated: 3 };
      mockCircuitIngestService.ingestCircuits.mockResolvedValue(mockResult);

      const result = await controller.ingestCircuits();

      expect(circuitIngestService.ingestCircuits).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResult);
    });

    it('should return the result from ingest service', async () => {
      const mockResult = { created: 10, updated: 0 };
      mockCircuitIngestService.ingestCircuits.mockResolvedValue(mockResult);

      const result = await controller.ingestCircuits();

      expect(result).toEqual(mockResult);
    });

    it('should handle ingest service errors', async () => {
      const mockError = new Error('Ingest failed');
      mockCircuitIngestService.ingestCircuits.mockRejectedValue(mockError);

      await expect(controller.ingestCircuits()).rejects.toThrow('Ingest failed');
      expect(circuitIngestService.ingestCircuits).toHaveBeenCalledTimes(1);
    });
  });

  describe('getAllCircuits', () => {
    it('should call circuitsService.getAllCircuits', async () => {
      mockCircuitsService.getAllCircuits.mockResolvedValue(mockCircuits);

      const result = await controller.getAllCircuits();

      expect(circuitsService.getAllCircuits).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockCircuits);
    });

    it('should return all circuits', async () => {
      mockCircuitsService.getAllCircuits.mockResolvedValue(mockCircuits);

      const result = await controller.getAllCircuits();

      expect(result).toEqual(mockCircuits);
      expect(result).toHaveLength(2);
    });

    it('should handle service errors', async () => {
      const mockError = new Error('Failed to fetch circuits');
      mockCircuitsService.getAllCircuits.mockRejectedValue(mockError);

      await expect(controller.getAllCircuits()).rejects.toThrow('Failed to fetch circuits');
      expect(circuitsService.getAllCircuits).toHaveBeenCalledTimes(1);
    });
  });

  describe('testConnection', () => {
    it('should call circuitsService.testConnection', async () => {
      mockCircuitsService.testConnection.mockResolvedValue(true);

      const result = await controller.testConnection();

      expect(circuitsService.testConnection).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ success: true });
    });

    it('should return success true when connection test passes', async () => {
      mockCircuitsService.testConnection.mockResolvedValue(true);

      const result = await controller.testConnection();

      expect(result).toEqual({ success: true });
    });

    it('should return success false when connection test fails', async () => {
      mockCircuitsService.testConnection.mockResolvedValue(false);

      const result = await controller.testConnection();

      expect(result).toEqual({ success: false });
    });

    it('should handle service errors', async () => {
      const mockError = new Error('Connection test failed');
      mockCircuitsService.testConnection.mockRejectedValue(mockError);

      await expect(controller.testConnection()).rejects.toThrow('Connection test failed');
      expect(circuitsService.testConnection).toHaveBeenCalledTimes(1);
    });
  });

  describe('searchCircuits', () => {
    it('should call circuitsService.searchCircuits with query parameter', async () => {
      const query = 'silverstone';
      mockCircuitsService.searchCircuits.mockResolvedValue([mockCircuit]);

      const result = await controller.searchCircuits(query);

      expect(circuitsService.searchCircuits).toHaveBeenCalledWith(query);
      expect(result).toEqual([mockCircuit]);
    });

    it('should return search results', async () => {
      const query = 'monaco';
      const searchResults = [mockCircuits[1]];
      mockCircuitsService.searchCircuits.mockResolvedValue(searchResults);

      const result = await controller.searchCircuits(query);

      expect(result).toEqual(searchResults);
      expect(result).toHaveLength(1);
    });

    it('should handle empty search results', async () => {
      const query = 'nonexistent';
      mockCircuitsService.searchCircuits.mockResolvedValue([]);

      const result = await controller.searchCircuits(query);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle service errors', async () => {
      const query = 'test';
      const mockError = new Error('Search failed');
      mockCircuitsService.searchCircuits.mockRejectedValue(mockError);

      await expect(controller.searchCircuits(query)).rejects.toThrow('Search failed');
      expect(circuitsService.searchCircuits).toHaveBeenCalledWith(query);
    });
  });

  describe('getCircuitsByCountry', () => {
    it('should call circuitsService.getCircuitsByCountry with country code', async () => {
      const countryCode = 'GB';
      mockCircuitsService.getCircuitsByCountry.mockResolvedValue([mockCircuit]);

      const result = await controller.getCircuitsByCountry(countryCode);

      expect(circuitsService.getCircuitsByCountry).toHaveBeenCalledWith(countryCode);
      expect(result).toEqual([mockCircuit]);
    });

    it('should return circuits for specific country', async () => {
      const countryCode = 'MC';
      const countryCircuits = [mockCircuits[1]];
      mockCircuitsService.getCircuitsByCountry.mockResolvedValue(countryCircuits);

      const result = await controller.getCircuitsByCountry(countryCode);

      expect(result).toEqual(countryCircuits);
      expect(result).toHaveLength(1);
    });

    it('should handle empty country results', async () => {
      const countryCode = 'XX';
      mockCircuitsService.getCircuitsByCountry.mockResolvedValue([]);

      const result = await controller.getCircuitsByCountry(countryCode);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle service errors', async () => {
      const countryCode = 'GB';
      const mockError = new Error('Failed to fetch circuits by country');
      mockCircuitsService.getCircuitsByCountry.mockRejectedValue(mockError);

      await expect(controller.getCircuitsByCountry(countryCode)).rejects.toThrow('Failed to fetch circuits by country');
      expect(circuitsService.getCircuitsByCountry).toHaveBeenCalledWith(countryCode);
    });
  });

  describe('getCircuitById', () => {
    it('should call circuitsService.getCircuitById with id parameter', async () => {
      const id = 1;
      mockCircuitsService.getCircuitById.mockResolvedValue(mockCircuit);

      const result = await controller.getCircuitById(id);

      expect(circuitsService.getCircuitById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockCircuit);
    });

    it('should return circuit when found', async () => {
      const id = 2;
      mockCircuitsService.getCircuitById.mockResolvedValue(mockCircuits[1]);

      const result = await controller.getCircuitById(id);

      expect(result).toEqual(mockCircuits[1]);
      expect(result?.id).toBe(id);
    });

    it('should return null when circuit not found', async () => {
      const id = 999;
      mockCircuitsService.getCircuitById.mockResolvedValue(null);

      const result = await controller.getCircuitById(id);

      expect(result).toBeNull();
    });

    it('should handle service errors', async () => {
      const id = 1;
      const mockError = new Error('Failed to fetch circuit by ID');
      mockCircuitsService.getCircuitById.mockRejectedValue(mockError);

      await expect(controller.getCircuitById(id)).rejects.toThrow('Failed to fetch circuit by ID');
      expect(circuitsService.getCircuitById).toHaveBeenCalledWith(id);
    });
  });

  describe('getCircuitByName', () => {
    it('should call circuitsService.getCircuitByName with name parameter', async () => {
      const name = 'Silverstone Circuit';
      mockCircuitsService.getCircuitByName.mockResolvedValue(mockCircuit);

      const result = await controller.getCircuitByName(name);

      expect(circuitsService.getCircuitByName).toHaveBeenCalledWith(name);
      expect(result).toEqual(mockCircuit);
    });

    it('should return circuit when found by name', async () => {
      const name = 'Monaco Circuit';
      mockCircuitsService.getCircuitByName.mockResolvedValue(mockCircuits[1]);

      const result = await controller.getCircuitByName(name);

      expect(result).toEqual(mockCircuits[1]);
      expect(result?.name).toBe(name);
    });

    it('should return null when circuit not found by name', async () => {
      const name = 'Nonexistent Circuit';
      mockCircuitsService.getCircuitByName.mockResolvedValue(null);

      const result = await controller.getCircuitByName(name);

      expect(result).toBeNull();
    });

    it('should handle service errors', async () => {
      const name = 'Test Circuit';
      const mockError = new Error('Failed to fetch circuit by name');
      mockCircuitsService.getCircuitByName.mockRejectedValue(mockError);

      await expect(controller.getCircuitByName(name)).rejects.toThrow('Failed to fetch circuit by name');
      expect(circuitsService.getCircuitByName).toHaveBeenCalledWith(name);
    });
  });

  describe('controller structure', () => {
    it('should have all required methods', () => {
      expect(typeof controller.ingestCircuits).toBe('function');
      expect(typeof controller.getAllCircuits).toBe('function');
      expect(typeof controller.testConnection).toBe('function');
      expect(typeof controller.searchCircuits).toBe('function');
      expect(typeof controller.getCircuitsByCountry).toBe('function');
      expect(typeof controller.getCircuitById).toBe('function');
      expect(typeof controller.getCircuitByName).toBe('function');
    });

    it('should be injectable', () => {
      expect(controller).toBeDefined();
      expect(controller).toBeInstanceOf(CircuitsController);
    });
  });
});
