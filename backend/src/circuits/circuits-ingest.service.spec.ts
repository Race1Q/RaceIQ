import { Test, TestingModule } from '@nestjs/testing';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { CircuitIngestService } from './circuits-ingest.service';
import { SupabaseService } from '../supabase/supabase.service';
import { ApiCircuit } from './circuits.entity';

describe('CircuitIngestService', () => {
  let service: CircuitIngestService;
  let httpService: HttpService;
  let supabaseService: SupabaseService;

  const mockHttpService = {
    get: jest.fn(),
  };

  const mockSupabaseService = {
    client: {
      from: jest.fn(),
    },
  };

  const mockApiCircuit: ApiCircuit = {
    circuitId: 'silverstone',
    circuitName: 'Silverstone Circuit',
    Location: {
      locality: 'Silverstone',
      country: 'Great Britain',
    },
    url: 'https://en.wikipedia.org/wiki/Silverstone_Circuit',
  };

  const mockApiResponse = {
    MRData: {
      CircuitTable: {
        Circuits: [mockApiCircuit],
      },
    },
  };

  beforeEach(async () => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CircuitIngestService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<CircuitIngestService>(CircuitIngestService);
    httpService = module.get<HttpService>(HttpService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fetchAllCircuitsFromAPI', () => {
    it('should fetch all circuits from API successfully', async () => {
      const mockResponse = { data: mockApiResponse };
      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.fetchAllCircuitsFromAPI();

      expect(httpService.get).toHaveBeenCalledWith('https://api.jolpi.ca/ergast/f1/circuits.json?limit=30&offset=0');
      expect(result).toEqual([mockApiCircuit]);
    });

    it('should handle API response with multiple circuits', async () => {
      const multipleCircuits = [
        mockApiCircuit,
        {
          circuitId: 'monaco',
          circuitName: 'Monaco Circuit',
          Location: {
            locality: 'Monte Carlo',
            country: 'Monaco',
          },
          url: 'https://en.wikipedia.org/wiki/Monaco_Circuit',
        },
      ];

      const mockResponse = {
        data: {
          MRData: {
            CircuitTable: {
              Circuits: multipleCircuits,
            },
          },
        },
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.fetchAllCircuitsFromAPI();

      expect(result).toEqual(multipleCircuits);
      expect(result).toHaveLength(2);
    });

    it('should handle empty API response', async () => {
      const emptyResponse = {
        data: {
          MRData: {
            CircuitTable: {
              Circuits: [],
            },
          },
        },
      };

      mockHttpService.get.mockReturnValue(of(emptyResponse));

      const result = await service.fetchAllCircuitsFromAPI();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should throw error when API call fails', async () => {
      const mockError = new Error('Network error');
      mockHttpService.get.mockImplementation(() => {
        throw mockError;
      });

      await expect(service.fetchAllCircuitsFromAPI()).rejects.toThrow('Failed to fetch circuits data from Ergast API');
    });

    it('should throw error when API response is malformed', async () => {
      const malformedResponse = { data: { invalid: 'structure' } };
      mockHttpService.get.mockReturnValue(of(malformedResponse));

      await expect(service.fetchAllCircuitsFromAPI()).rejects.toThrow('Failed to fetch circuits data from Ergast API');
    });
  });

  describe('ingestCircuits', () => {
    it('should ingest circuits successfully', async () => {
      // Mock the HTTP service to return the circuits data
      const mockResponse = { data: mockApiResponse };
      mockHttpService.get.mockReturnValue(of(mockResponse));

      // Mock the private processCircuit method to return 'created'
      const processCircuitSpy = jest.spyOn(service as any, 'processCircuit')
        .mockResolvedValue('created');

      const result = await service.ingestCircuits();

      expect(result).toEqual({ created: 1, updated: 0 });
      expect(processCircuitSpy).toHaveBeenCalledWith(mockApiCircuit);
      expect(mockHttpService.get).toHaveBeenCalledWith('https://api.jolpi.ca/ergast/f1/circuits.json?limit=30&offset=0');
    });

    it('should handle multiple circuits ingestion', async () => {
      const multipleCircuits = [
        mockApiCircuit,
        {
          circuitId: 'monaco',
          circuitName: 'Monaco Circuit',
          Location: {
            locality: 'Monte Carlo',
            country: 'Monaco',
          },
          url: 'https://en.wikipedia.org/wiki/Monaco_Circuit',
        },
      ];

      const mockResponse = {
        data: {
          MRData: {
            CircuitTable: {
              Circuits: multipleCircuits,
            },
          },
        },
      };

      // Mock the HTTP service to return the circuits data
      mockHttpService.get.mockReturnValue(of(mockResponse));

      // Mock the private processCircuit method to return 'created' for both circuits
      const processCircuitSpy = jest.spyOn(service as any, 'processCircuit')
        .mockResolvedValue('created');

      const result = await service.ingestCircuits();

      expect(result).toEqual({ created: 2, updated: 0 });
      expect(processCircuitSpy).toHaveBeenCalledTimes(2);
    });

    it('should handle empty circuits array', async () => {
      // Mock the HTTP service to return empty circuits
      const emptyResponse = {
        data: {
          MRData: {
            CircuitTable: {
              Circuits: [],
            },
          },
        },
      };
      mockHttpService.get.mockReturnValue(of(emptyResponse));

      const result = await service.ingestCircuits();

      expect(result).toEqual({ created: 0, updated: 0 });
    });

    it('should handle update existing circuit', async () => {
      // Mock the HTTP service to return the circuits data
      const mockResponse = { data: mockApiResponse };
      mockHttpService.get.mockReturnValue(of(mockResponse));

      // Mock the private processCircuit method to return 'updated'
      const processCircuitSpy = jest.spyOn(service as any, 'processCircuit')
        .mockResolvedValue('updated');

      const result = await service.ingestCircuits();

      expect(result).toEqual({ created: 0, updated: 1 });
      expect(processCircuitSpy).toHaveBeenCalledWith(mockApiCircuit);
    });

    it('should handle database errors gracefully', async () => {
      // Mock the HTTP service to return the circuits data
      const mockResponse = { data: mockApiResponse };
      mockHttpService.get.mockReturnValue(of(mockResponse));

      // Mock the private processCircuit method to throw an error
      const processCircuitSpy = jest.spyOn(service as any, 'processCircuit')
        .mockRejectedValue(new Error('Database error'));

      const result = await service.ingestCircuits();

      // Should continue processing and return 0 created/updated due to error
      expect(result).toEqual({ created: 0, updated: 0 });
      expect(processCircuitSpy).toHaveBeenCalledWith(mockApiCircuit);
    });
  });

  describe('service structure', () => {
    it('should have all required methods', () => {
      expect(typeof service.fetchAllCircuitsFromAPI).toBe('function');
      expect(typeof service.ingestCircuits).toBe('function');
    });

    it('should be injectable', () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(CircuitIngestService);
    });
  });
});
