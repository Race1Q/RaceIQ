import { Test, TestingModule } from '@nestjs/testing';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { CircuitsService } from './circuits.service';
import { SupabaseService } from '../supabase/supabase.service';
import { Circuit, ApiCircuit } from './circuits.entity';

describe('CircuitsService', () => {
  let service: CircuitsService;
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

  const mockCircuit: Circuit = {
    id: 1,
    name: 'Silverstone Circuit',
    location: 'Silverstone',
    country_code: 'GB',
    map_url: 'https://example.com/silverstone-map.jpg',
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
        CircuitsService,
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

    service = module.get<CircuitsService>(CircuitsService);
    httpService = module.get<HttpService>(HttpService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fetchCircuitsFromAPI', () => {
    it('should fetch circuits from API successfully', async () => {
      const mockResponse = { data: mockApiResponse };
      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.fetchCircuitsFromAPI();

      expect(httpService.get).toHaveBeenCalledWith('https://api.jolpi.ca/ergast/f1/circuits/?format=json');
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

      const result = await service.fetchCircuitsFromAPI();

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

      const result = await service.fetchCircuitsFromAPI();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should throw error when API call fails', async () => {
      const mockError = new Error('Network error');
      mockHttpService.get.mockImplementation(() => {
        throw mockError;
      });

      await expect(service.fetchCircuitsFromAPI()).rejects.toThrow('Failed to fetch circuits data');
    });

    it('should throw error when API response is malformed', async () => {
      const malformedResponse = { data: { invalid: 'structure' } };
      mockHttpService.get.mockReturnValue(of(malformedResponse));

      await expect(service.fetchCircuitsFromAPI()).rejects.toThrow('Failed to fetch circuits data');
    });
  });

  describe('testConnection', () => {
    it('should return true when Supabase connection test succeeds', async () => {
      // Create a mock that actually chains methods
      const mockChain = {
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockImplementation(() => Promise.resolve({ data: [{ count: 1 }], error: null }))
        })
      };
      mockSupabaseService.client.from.mockReturnValue(mockChain);

      const result = await service.testConnection();

      expect(result).toBe(true);
      expect(mockSupabaseService.client.from).toHaveBeenCalledWith('circuits');
    });

    it('should return false when Supabase connection test fails with error', async () => {
      const mockChain = {
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockImplementation(() => Promise.resolve({ data: null, error: { message: 'Connection failed' } }))
        })
      };
      mockSupabaseService.client.from.mockReturnValue(mockChain);

      const result = await service.testConnection();

      expect(result).toBe(false);
    });

    it('should return false when Supabase connection test throws exception', async () => {
      const mockChain = {
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockImplementation(() => Promise.reject(new Error('Database error')))
        })
      };
      mockSupabaseService.client.from.mockReturnValue(mockChain);

      const result = await service.testConnection();

      expect(result).toBe(false);
    });
  });

  describe('getAllCircuits', () => {
    it('should fetch all circuits successfully', async () => {
      const mockChain = {
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockImplementation(() => Promise.resolve({ data: [mockCircuit], error: null }))
        })
      };
      mockSupabaseService.client.from.mockReturnValue(mockChain);

      const result = await service.getAllCircuits();

      expect(result).toEqual([mockCircuit]);
      expect(mockSupabaseService.client.from).toHaveBeenCalledWith('circuits');
    });

    it('should throw error when Supabase query fails', async () => {
      const mockChain = {
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockImplementation(() => Promise.resolve({ data: null, error: { message: 'Query failed' } }))
        })
      };
      mockSupabaseService.client.from.mockReturnValue(mockChain);

      await expect(service.getAllCircuits()).rejects.toThrow('Failed to fetch circuits');
    });

    it('should return empty array when no circuits found', async () => {
      const mockChain = {
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockImplementation(() => Promise.resolve({ data: [], error: null }))
        })
      };
      mockSupabaseService.client.from.mockReturnValue(mockChain);

      const result = await service.getAllCircuits();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('getCircuitById', () => {
    it('should fetch circuit by ID successfully', async () => {
      const mockChain = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockImplementation(() => Promise.resolve({ data: mockCircuit, error: null }))
          })
        })
      };
      mockSupabaseService.client.from.mockReturnValue(mockChain);

      const result = await service.getCircuitById(1);

      expect(result).toEqual(mockCircuit);
      expect(mockSupabaseService.client.from).toHaveBeenCalledWith('circuits');
    });

    it('should return null when circuit not found', async () => {
      const mockChain = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockImplementation(() => Promise.resolve({ data: null, error: { code: 'PGRST116' } }))
          })
        })
      };
      mockSupabaseService.client.from.mockReturnValue(mockChain);

      const result = await service.getCircuitById(999);

      expect(result).toBeNull();
    });

    it('should return null when Supabase query fails', async () => {
      const mockChain = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockImplementation(() => Promise.resolve({ data: null, error: { message: 'Query failed' } }))
          })
        })
      };
      mockSupabaseService.client.from.mockReturnValue(mockChain);

      const result = await service.getCircuitById(1);

      expect(result).toBeNull();
    });
  });

  describe('getCircuitByName', () => {
    it('should fetch circuit by name successfully', async () => {
      const mockChain = {
        select: jest.fn().mockReturnValue({
          ilike: jest.fn().mockReturnValue({
            single: jest.fn().mockImplementation(() => Promise.resolve({ data: mockCircuit, error: null }))
          })
        })
      };
      mockSupabaseService.client.from.mockReturnValue(mockChain);

      const result = await service.getCircuitByName('Silverstone Circuit');

      expect(result).toEqual(mockCircuit);
      expect(mockSupabaseService.client.from).toHaveBeenCalledWith('circuits');
    });

    it('should return null when circuit not found by name', async () => {
      const mockChain = {
        select: jest.fn().mockReturnValue({
          ilike: jest.fn().mockReturnValue({
            single: jest.fn().mockImplementation(() => Promise.resolve({ data: null, error: { code: 'PGRST116' } }))
          })
        })
      };
      mockSupabaseService.client.from.mockReturnValue(mockChain);

      const result = await service.getCircuitByName('Nonexistent Circuit');

      expect(result).toBeNull();
    });

    it('should return null when Supabase query fails', async () => {
      const mockChain = {
        select: jest.fn().mockReturnValue({
          ilike: jest.fn().mockReturnValue({
            single: jest.fn().mockImplementation(() => Promise.resolve({ data: null, error: { message: 'Query failed' } }))
          })
        })
      };
      mockSupabaseService.client.from.mockReturnValue(mockChain);

      const result = await service.getCircuitByName('Test Circuit');

      expect(result).toBeNull();
    });
  });

  describe('searchCircuits', () => {
    it('should search circuits successfully', async () => {
      const mockChain = {
        select: jest.fn().mockReturnValue({
          or: jest.fn().mockReturnValue({
            order: jest.fn().mockImplementation(() => Promise.resolve({ data: [mockCircuit], error: null }))
          })
        })
      };
      mockSupabaseService.client.from.mockReturnValue(mockChain);

      const result = await service.searchCircuits('silverstone');

      expect(result).toEqual([mockCircuit]);
      expect(mockSupabaseService.client.from).toHaveBeenCalledWith('circuits');
    });

    it('should throw error when Supabase search fails', async () => {
      const mockChain = {
        select: jest.fn().mockReturnValue({
          or: jest.fn().mockReturnValue({
            order: jest.fn().mockImplementation(() => Promise.resolve({ data: null, error: { message: 'Search failed' } }))
          })
        })
      };
      mockSupabaseService.client.from.mockReturnValue(mockChain);

      await expect(service.searchCircuits('test')).rejects.toThrow('Failed to search circuits');
    });

    it('should return empty array when no search results found', async () => {
      const mockChain = {
        select: jest.fn().mockReturnValue({
          or: jest.fn().mockReturnValue({
            order: jest.fn().mockImplementation(() => Promise.resolve({ data: [], error: null }))
          })
        })
      };
      mockSupabaseService.client.from.mockReturnValue(mockChain);

      const result = await service.searchCircuits('nonexistent');

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('getCircuitsByCountry', () => {
    it('should fetch circuits by country successfully', async () => {
      const mockChain = {
        select: jest.fn().mockReturnValue({
          ilike: jest.fn().mockReturnValue({
            order: jest.fn().mockImplementation(() => Promise.resolve({ data: [mockCircuit], error: null }))
          })
        })
      };
      mockSupabaseService.client.from.mockReturnValue(mockChain);

      const result = await service.getCircuitsByCountry('GB');

      expect(result).toEqual([mockCircuit]);
      expect(mockSupabaseService.client.from).toHaveBeenCalledWith('circuits');
    });

    it('should throw error when Supabase query fails', async () => {
      const mockChain = {
        select: jest.fn().mockReturnValue({
          ilike: jest.fn().mockReturnValue({
            order: jest.fn().mockImplementation(() => Promise.resolve({ data: null, error: { message: 'Query failed' } }))
          })
        })
      };
      mockSupabaseService.client.from.mockReturnValue(mockChain);

      await expect(service.getCircuitsByCountry('GB')).rejects.toThrow('Failed to fetch circuits by country');
    });

    it('should return empty array when no circuits found for country', async () => {
      const mockChain = {
        select: jest.fn().mockReturnValue({
          ilike: jest.fn().mockReturnValue({
            order: jest.fn().mockImplementation(() => Promise.resolve({ data: [], error: null }))
          })
        })
      };
      mockSupabaseService.client.from.mockReturnValue(mockChain);

      const result = await service.getCircuitsByCountry('XX');

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('service structure', () => {
    it('should have all required methods', () => {
      expect(typeof service.fetchCircuitsFromAPI).toBe('function');
      expect(typeof service.testConnection).toBe('function');
      expect(typeof service.getAllCircuits).toBe('function');
      expect(typeof service.getCircuitById).toBe('function');
      expect(typeof service.getCircuitByName).toBe('function');
      expect(typeof service.searchCircuits).toBe('function');
      expect(typeof service.getCircuitsByCountry).toBe('function');
    });

    it('should be injectable', () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(CircuitsService);
    });
  });
});
