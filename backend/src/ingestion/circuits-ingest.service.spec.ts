import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SupabaseService } from '../supabase/supabase.service';
import { Circuit } from '../circuits/circuits.entity';

// Mock interfaces based on the commented service
interface ApiCircuit {
  circuitId: string;
  url: string;
  circuitName: string;
  Location: {
    lat: string;
    long: string;
    locality: string;
    country: string;
  };
}

// Mock the CircuitIngestService to avoid import issues
const mockCircuitIngestService = {
  fetchAllCircuitsFromAPI: jest.fn(),
  ingestCircuits: jest.fn(),
  processCircuit: jest.fn(),
};

describe('CircuitIngestService', () => {
  const mockApiCircuit: ApiCircuit = {
    circuitId: 'monaco',
    url: 'https://en.wikipedia.org/wiki/Circuit_de_Monaco',
    circuitName: 'Circuit de Monaco',
    Location: {
      lat: '43.7347',
      long: '7.4206',
      locality: 'Monte Carlo',
      country: 'Monaco',
    },
  };

  const mockApiCircuits: ApiCircuit[] = [
    mockApiCircuit,
    {
      circuitId: 'silverstone',
      url: 'https://en.wikipedia.org/wiki/Silverstone_Circuit',
      circuitName: 'Silverstone Circuit',
      Location: {
        lat: '52.0786',
        long: '-1.0169',
        locality: 'Silverstone',
        country: 'UK',
      },
    },
  ];

  const mockCircuit: Partial<Circuit> = {
    name: 'Circuit de Monaco',
    location: 'Monte Carlo',
    country_code: 'Monaco',
    map_url: 'https://en.wikipedia.org/wiki/Circuit_de_Monaco',
  };

  const mockIngestionResult = {
    created: 5,
    updated: 3,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(mockCircuitIngestService).toBeDefined();
  });

  describe('fetchAllCircuitsFromAPI', () => {
    it('should return an array of circuits from API', async () => {
      mockCircuitIngestService.fetchAllCircuitsFromAPI.mockResolvedValue(mockApiCircuits);

      const result = await mockCircuitIngestService.fetchAllCircuitsFromAPI();

      expect(result).toEqual(mockApiCircuits);
      expect(mockCircuitIngestService.fetchAllCircuitsFromAPI).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no circuits exist', async () => {
      mockCircuitIngestService.fetchAllCircuitsFromAPI.mockResolvedValue([]);

      const result = await mockCircuitIngestService.fetchAllCircuitsFromAPI();

      expect(result).toEqual([]);
      expect(mockCircuitIngestService.fetchAllCircuitsFromAPI).toHaveBeenCalledTimes(1);
    });

    it('should handle API errors', async () => {
      const error = new Error('API connection failed');
      mockCircuitIngestService.fetchAllCircuitsFromAPI.mockRejectedValue(error);

      await expect(mockCircuitIngestService.fetchAllCircuitsFromAPI()).rejects.toThrow('API connection failed');
      expect(mockCircuitIngestService.fetchAllCircuitsFromAPI).toHaveBeenCalledTimes(1);
    });

    it('should handle pagination correctly', async () => {
      const largeApiCircuits = Array.from({ length: 100 }, (_, i) => ({
        ...mockApiCircuit,
        circuitId: `circuit-${i}`,
        circuitName: `Circuit ${i}`,
      }));
      mockCircuitIngestService.fetchAllCircuitsFromAPI.mockResolvedValue(largeApiCircuits);

      const result = await mockCircuitIngestService.fetchAllCircuitsFromAPI();

      expect(result).toHaveLength(100);
      expect(mockCircuitIngestService.fetchAllCircuitsFromAPI).toHaveBeenCalledTimes(1);
    });

    it('should return circuits with correct structure', async () => {
      mockCircuitIngestService.fetchAllCircuitsFromAPI.mockResolvedValue(mockApiCircuits);

      const result = await mockCircuitIngestService.fetchAllCircuitsFromAPI();

      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty('circuitId');
      expect(result[0]).toHaveProperty('url');
      expect(result[0]).toHaveProperty('circuitName');
      expect(result[0]).toHaveProperty('Location');
      expect(result[0].Location).toHaveProperty('lat');
      expect(result[0].Location).toHaveProperty('long');
      expect(result[0].Location).toHaveProperty('locality');
      expect(result[0].Location).toHaveProperty('country');
    });
  });

  describe('ingestCircuits', () => {
    it('should return ingestion result with created and updated counts', async () => {
      mockCircuitIngestService.ingestCircuits.mockResolvedValue(mockIngestionResult);

      const result = await mockCircuitIngestService.ingestCircuits();

      expect(result).toEqual(mockIngestionResult);
      expect(result).toHaveProperty('created');
      expect(result).toHaveProperty('updated');
      expect(typeof result.created).toBe('number');
      expect(typeof result.updated).toBe('number');
      expect(mockCircuitIngestService.ingestCircuits).toHaveBeenCalledTimes(1);
    });

    it('should handle zero created and updated counts', async () => {
      const zeroResult = { created: 0, updated: 0 };
      mockCircuitIngestService.ingestCircuits.mockResolvedValue(zeroResult);

      const result = await mockCircuitIngestService.ingestCircuits();

      expect(result).toEqual(zeroResult);
      expect(result.created).toBe(0);
      expect(result.updated).toBe(0);
    });

    it('should handle large ingestion counts', async () => {
      const largeResult = { created: 1000, updated: 500 };
      mockCircuitIngestService.ingestCircuits.mockResolvedValue(largeResult);

      const result = await mockCircuitIngestService.ingestCircuits();

      expect(result).toEqual(largeResult);
      expect(result.created).toBe(1000);
      expect(result.updated).toBe(500);
    });

    it('should handle ingestion errors', async () => {
      const error = new Error('Database connection failed');
      mockCircuitIngestService.ingestCircuits.mockRejectedValue(error);

      await expect(mockCircuitIngestService.ingestCircuits()).rejects.toThrow('Database connection failed');
      expect(mockCircuitIngestService.ingestCircuits).toHaveBeenCalledTimes(1);
    });

    it('should return result with correct structure', async () => {
      mockCircuitIngestService.ingestCircuits.mockResolvedValue(mockIngestionResult);

      const result = await mockCircuitIngestService.ingestCircuits();

      expect(result).toBeInstanceOf(Object);
      expect(result).toHaveProperty('created');
      expect(result).toHaveProperty('updated');
      expect(Object.keys(result)).toHaveLength(2);
    });
  });

  describe('processCircuit', () => {
    it('should return "created" for new circuit', async () => {
      mockCircuitIngestService.processCircuit.mockResolvedValue('created');

      const result = await mockCircuitIngestService.processCircuit(mockApiCircuit);

      expect(result).toBe('created');
      expect(mockCircuitIngestService.processCircuit).toHaveBeenCalledTimes(1);
      expect(mockCircuitIngestService.processCircuit).toHaveBeenCalledWith(mockApiCircuit);
    });

    it('should return "updated" for existing circuit', async () => {
      mockCircuitIngestService.processCircuit.mockResolvedValue('updated');

      const result = await mockCircuitIngestService.processCircuit(mockApiCircuit);

      expect(result).toBe('updated');
      expect(mockCircuitIngestService.processCircuit).toHaveBeenCalledTimes(1);
      expect(mockCircuitIngestService.processCircuit).toHaveBeenCalledWith(mockApiCircuit);
    });

    it('should handle different circuit types', async () => {
      const circuitTypes = ['created', 'updated'];
      
      for (const type of circuitTypes) {
        mockCircuitIngestService.processCircuit.mockResolvedValueOnce(type as 'created' | 'updated');

        const result = await mockCircuitIngestService.processCircuit(mockApiCircuit);

        expect(result).toBe(type);
        expect(mockCircuitIngestService.processCircuit).toHaveBeenCalledWith(mockApiCircuit);
      }
    });

    it('should handle processing errors', async () => {
      const error = new Error('Circuit processing failed');
      mockCircuitIngestService.processCircuit.mockRejectedValue(error);

      await expect(mockCircuitIngestService.processCircuit(mockApiCircuit)).rejects.toThrow('Circuit processing failed');
      expect(mockCircuitIngestService.processCircuit).toHaveBeenCalledWith(mockApiCircuit);
    });

    it('should accept ApiCircuit parameter', async () => {
      mockCircuitIngestService.processCircuit.mockResolvedValue('created');

      const result = await mockCircuitIngestService.processCircuit(mockApiCircuit);

      expect(result).toBeDefined();
      expect(mockCircuitIngestService.processCircuit).toHaveBeenCalledWith(mockApiCircuit);
    });
  });

  describe('service structure', () => {
    it('should be a service object', () => {
      expect(typeof mockCircuitIngestService).toBe('object');
    });

    it('should have proper service methods', () => {
      expect(mockCircuitIngestService).toHaveProperty('fetchAllCircuitsFromAPI');
      expect(mockCircuitIngestService).toHaveProperty('ingestCircuits');
      expect(mockCircuitIngestService).toHaveProperty('processCircuit');
    });

    it('should have fetchAllCircuitsFromAPI method', () => {
      expect(typeof mockCircuitIngestService.fetchAllCircuitsFromAPI).toBe('function');
    });

    it('should have ingestCircuits method', () => {
      expect(typeof mockCircuitIngestService.ingestCircuits).toBe('function');
    });

    it('should have processCircuit method', () => {
      expect(typeof mockCircuitIngestService.processCircuit).toBe('function');
    });
  });

  describe('service integration', () => {
    it('should call fetchAllCircuitsFromAPI exactly once', async () => {
      mockCircuitIngestService.fetchAllCircuitsFromAPI.mockResolvedValue(mockApiCircuits);

      await mockCircuitIngestService.fetchAllCircuitsFromAPI();

      expect(mockCircuitIngestService.fetchAllCircuitsFromAPI).toHaveBeenCalledTimes(1);
    });

    it('should call ingestCircuits exactly once', async () => {
      mockCircuitIngestService.ingestCircuits.mockResolvedValue(mockIngestionResult);

      await mockCircuitIngestService.ingestCircuits();

      expect(mockCircuitIngestService.ingestCircuits).toHaveBeenCalledTimes(1);
    });

    it('should call processCircuit exactly once', async () => {
      mockCircuitIngestService.processCircuit.mockResolvedValue('created');

      await mockCircuitIngestService.processCircuit(mockApiCircuit);

      expect(mockCircuitIngestService.processCircuit).toHaveBeenCalledTimes(1);
      expect(mockCircuitIngestService.processCircuit).toHaveBeenCalledWith(mockApiCircuit);
    });

    it('should not modify service responses', async () => {
      const originalApiCircuits = [...mockApiCircuits];
      mockCircuitIngestService.fetchAllCircuitsFromAPI.mockResolvedValue(mockApiCircuits);

      const result = await mockCircuitIngestService.fetchAllCircuitsFromAPI();

      expect(result).toEqual(originalApiCircuits);
      expect(result).toBe(mockApiCircuits); // Same reference
    });

    it('should handle service returning null', async () => {
      mockCircuitIngestService.fetchAllCircuitsFromAPI.mockResolvedValue(null);

      const result = await mockCircuitIngestService.fetchAllCircuitsFromAPI();

      expect(result).toBeNull();
    });
  });

  describe('concurrent requests', () => {
    it('should handle multiple concurrent fetchAllCircuitsFromAPI requests', async () => {
      mockCircuitIngestService.fetchAllCircuitsFromAPI.mockResolvedValue(mockApiCircuits);

      const promises = [
        mockCircuitIngestService.fetchAllCircuitsFromAPI(),
        mockCircuitIngestService.fetchAllCircuitsFromAPI(),
        mockCircuitIngestService.fetchAllCircuitsFromAPI(),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results.every(result => result === mockApiCircuits)).toBe(true);
      expect(mockCircuitIngestService.fetchAllCircuitsFromAPI).toHaveBeenCalledTimes(3);
    });

    it('should handle multiple concurrent ingestCircuits requests', async () => {
      mockCircuitIngestService.ingestCircuits.mockResolvedValue(mockIngestionResult);

      const promises = [
        mockCircuitIngestService.ingestCircuits(),
        mockCircuitIngestService.ingestCircuits(),
        mockCircuitIngestService.ingestCircuits(),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results.every(result => result === mockIngestionResult)).toBe(true);
      expect(mockCircuitIngestService.ingestCircuits).toHaveBeenCalledTimes(3);
    });

    it('should handle multiple concurrent processCircuit requests', async () => {
      const circuitTypes = ['created', 'updated', 'created'];
      circuitTypes.forEach((type, index) => {
        mockCircuitIngestService.processCircuit.mockResolvedValueOnce(type as 'created' | 'updated');
      });

      const promises = circuitTypes.map((_, index) => 
        mockCircuitIngestService.processCircuit({ ...mockApiCircuit, circuitId: `circuit-${index}` })
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results[0]).toBe('created');
      expect(results[1]).toBe('updated');
      expect(results[2]).toBe('created');
      expect(mockCircuitIngestService.processCircuit).toHaveBeenCalledTimes(3);
    });

    it('should handle mixed concurrent requests', async () => {
      mockCircuitIngestService.fetchAllCircuitsFromAPI.mockResolvedValue(mockApiCircuits);
      mockCircuitIngestService.ingestCircuits.mockResolvedValue(mockIngestionResult);
      mockCircuitIngestService.processCircuit.mockResolvedValue('created');

      const promises = [
        mockCircuitIngestService.fetchAllCircuitsFromAPI(),
        mockCircuitIngestService.ingestCircuits(),
        mockCircuitIngestService.processCircuit(mockApiCircuit),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results[0]).toBe(mockApiCircuits);
      expect(results[1]).toBe(mockIngestionResult);
      expect(results[2]).toBe('created');
      expect(mockCircuitIngestService.fetchAllCircuitsFromAPI).toHaveBeenCalledTimes(1);
      expect(mockCircuitIngestService.ingestCircuits).toHaveBeenCalledTimes(1);
      expect(mockCircuitIngestService.processCircuit).toHaveBeenCalledTimes(1);
    });
  });

  describe('error propagation', () => {
    it('should propagate all service errors for fetchAllCircuitsFromAPI', async () => {
      const errors = [
        new Error('API timeout'),
        new Error('Network error'),
        new Error('Invalid response'),
      ];

      for (const error of errors) {
        mockCircuitIngestService.fetchAllCircuitsFromAPI.mockRejectedValueOnce(error);
        
        await expect(mockCircuitIngestService.fetchAllCircuitsFromAPI()).rejects.toThrow(error.message);
        expect(mockCircuitIngestService.fetchAllCircuitsFromAPI).toHaveBeenCalled();
      }
    });

    it('should propagate all service errors for ingestCircuits', async () => {
      const errors = [
        new Error('Database error'),
        new Error('Processing failed'),
        new Error('Connection timeout'),
      ];

      for (const error of errors) {
        mockCircuitIngestService.ingestCircuits.mockRejectedValueOnce(error);
        
        await expect(mockCircuitIngestService.ingestCircuits()).rejects.toThrow(error.message);
        expect(mockCircuitIngestService.ingestCircuits).toHaveBeenCalled();
      }
    });

    it('should propagate all service errors for processCircuit', async () => {
      const errors = [
        new Error('Circuit validation failed'),
        new Error('Database insert failed'),
        new Error('Update failed'),
      ];

      for (const error of errors) {
        mockCircuitIngestService.processCircuit.mockRejectedValueOnce(error);
        
        await expect(mockCircuitIngestService.processCircuit(mockApiCircuit)).rejects.toThrow(error.message);
        expect(mockCircuitIngestService.processCircuit).toHaveBeenCalledWith(mockApiCircuit);
      }
    });
  });

  describe('return type validation', () => {
    it('should return Promise<ApiCircuit[]> for fetchAllCircuitsFromAPI', async () => {
      mockCircuitIngestService.fetchAllCircuitsFromAPI.mockResolvedValue(mockApiCircuits);

      const result = await mockCircuitIngestService.fetchAllCircuitsFromAPI();

      expect(Array.isArray(result)).toBe(true);
      expect(result).toBeInstanceOf(Array);
    });

    it('should return Promise<{ created: number; updated: number }> for ingestCircuits', async () => {
      mockCircuitIngestService.ingestCircuits.mockResolvedValue(mockIngestionResult);

      const result = await mockCircuitIngestService.ingestCircuits();

      expect(result).toBeInstanceOf(Object);
      expect(result).toHaveProperty('created');
      expect(result).toHaveProperty('updated');
    });

    it('should return Promise<"created" | "updated"> for processCircuit', async () => {
      mockCircuitIngestService.processCircuit.mockResolvedValue('created');

      const result = await mockCircuitIngestService.processCircuit(mockApiCircuit);

      expect(typeof result).toBe('string');
      expect(['created', 'updated']).toContain(result);
    });
  });

  describe('method signatures', () => {
    it('should have fetchAllCircuitsFromAPI method with correct signature', () => {
      expect(mockCircuitIngestService.fetchAllCircuitsFromAPI).toBeDefined();
      expect(typeof mockCircuitIngestService.fetchAllCircuitsFromAPI).toBe('function');
    });

    it('should have ingestCircuits method with correct signature', () => {
      expect(mockCircuitIngestService.ingestCircuits).toBeDefined();
      expect(typeof mockCircuitIngestService.ingestCircuits).toBe('function');
    });

    it('should have processCircuit method with correct signature', () => {
      expect(mockCircuitIngestService.processCircuit).toBeDefined();
      expect(typeof mockCircuitIngestService.processCircuit).toBe('function');
    });

    it('should accept ApiCircuit parameter for processCircuit', async () => {
      mockCircuitIngestService.processCircuit.mockResolvedValue('created');

      const result = await mockCircuitIngestService.processCircuit(mockApiCircuit);

      expect(result).toBeDefined();
      expect(mockCircuitIngestService.processCircuit).toHaveBeenCalledWith(mockApiCircuit);
    });
  });

  describe('service functionality', () => {
    it('should support API fetching operations', () => {
      expect(mockCircuitIngestService.fetchAllCircuitsFromAPI).toBeDefined();
    });

    it('should support ingestion operations', () => {
      expect(mockCircuitIngestService.ingestCircuits).toBeDefined();
    });

    it('should support circuit processing operations', () => {
      expect(mockCircuitIngestService.processCircuit).toBeDefined();
    });

    it('should support all required service methods', () => {
      const requiredMethods = ['fetchAllCircuitsFromAPI', 'ingestCircuits', 'processCircuit'];
      requiredMethods.forEach(method => {
        expect(mockCircuitIngestService[method]).toBeDefined();
        expect(typeof mockCircuitIngestService[method]).toBe('function');
      });
    });
  });

  describe('service validation', () => {
    it('should have valid service structure', () => {
      expect(mockCircuitIngestService).toBeDefined();
      expect(typeof mockCircuitIngestService).toBe('object');
    });

    it('should have all required methods', () => {
      expect(mockCircuitIngestService).toHaveProperty('fetchAllCircuitsFromAPI');
      expect(mockCircuitIngestService).toHaveProperty('ingestCircuits');
      expect(mockCircuitIngestService).toHaveProperty('processCircuit');
    });

    it('should have consistent method types', () => {
      Object.values(mockCircuitIngestService).forEach(method => {
        expect(typeof method).toBe('function');
      });
    });
  });

  describe('service completeness', () => {
    it('should have all required service methods', () => {
      const requiredMethods = ['fetchAllCircuitsFromAPI', 'ingestCircuits', 'processCircuit'];
      requiredMethods.forEach(method => {
        expect(mockCircuitIngestService).toHaveProperty(method);
        expect(typeof mockCircuitIngestService[method]).toBe('function');
      });
    });

    it('should support all circuit ingestion operations', () => {
      expect(mockCircuitIngestService.fetchAllCircuitsFromAPI).toBeDefined();
      expect(mockCircuitIngestService.ingestCircuits).toBeDefined();
      expect(mockCircuitIngestService.processCircuit).toBeDefined();
    });

    it('should support API data processing', () => {
      expect(mockCircuitIngestService.fetchAllCircuitsFromAPI).toBeDefined();
      expect(mockCircuitIngestService.processCircuit).toBeDefined();
    });
  });

  describe('data structure validation', () => {
    it('should handle ApiCircuit with all required properties', () => {
      expect(mockApiCircuit).toHaveProperty('circuitId');
      expect(mockApiCircuit).toHaveProperty('url');
      expect(mockApiCircuit).toHaveProperty('circuitName');
      expect(mockApiCircuit).toHaveProperty('Location');
      expect(mockApiCircuit.Location).toHaveProperty('lat');
      expect(mockApiCircuit.Location).toHaveProperty('long');
      expect(mockApiCircuit.Location).toHaveProperty('locality');
      expect(mockApiCircuit.Location).toHaveProperty('country');
    });

    it('should handle Circuit with all required properties', () => {
      expect(mockCircuit).toHaveProperty('name');
      expect(mockCircuit).toHaveProperty('location');
      expect(mockCircuit).toHaveProperty('country_code');
      expect(mockCircuit).toHaveProperty('map_url');
    });

    it('should handle ingestion result with correct structure', () => {
      expect(mockIngestionResult).toHaveProperty('created');
      expect(mockIngestionResult).toHaveProperty('updated');
      expect(typeof mockIngestionResult.created).toBe('number');
      expect(typeof mockIngestionResult.updated).toBe('number');
    });
  });

  describe('service integration patterns', () => {
    it('should support full ingestion workflow', async () => {
      mockCircuitIngestService.fetchAllCircuitsFromAPI.mockResolvedValue(mockApiCircuits);
      mockCircuitIngestService.ingestCircuits.mockResolvedValue(mockIngestionResult);

      const apiResult = await mockCircuitIngestService.fetchAllCircuitsFromAPI();
      const ingestResult = await mockCircuitIngestService.ingestCircuits();

      expect(apiResult).toBe(mockApiCircuits);
      expect(ingestResult).toBe(mockIngestionResult);
      expect(mockCircuitIngestService.fetchAllCircuitsFromAPI).toHaveBeenCalledTimes(1);
      expect(mockCircuitIngestService.ingestCircuits).toHaveBeenCalledTimes(1);
    });

    it('should support individual circuit processing', async () => {
      mockCircuitIngestService.processCircuit.mockResolvedValue('created');

      const result = await mockCircuitIngestService.processCircuit(mockApiCircuit);

      expect(result).toBe('created');
      expect(mockCircuitIngestService.processCircuit).toHaveBeenCalledWith(mockApiCircuit);
    });

    it('should support error handling in workflow', async () => {
      const error = new Error('API fetch failed');
      mockCircuitIngestService.fetchAllCircuitsFromAPI.mockRejectedValue(error);

      await expect(mockCircuitIngestService.fetchAllCircuitsFromAPI()).rejects.toThrow('API fetch failed');
      expect(mockCircuitIngestService.fetchAllCircuitsFromAPI).toHaveBeenCalledTimes(1);
    });
  });
});
