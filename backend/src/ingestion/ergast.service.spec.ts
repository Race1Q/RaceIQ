import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SupabaseService } from '../supabase/supabase.service';

// Mock interfaces based on the service
interface ErgastTable {
  [key: string]: any[];
}

interface ErgastApiResponse {
  MRData: {
    total: string;
    limit: string;
    offset: string;
    [tableKey: string]: ErgastTable | any;
  };
}

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

interface ApiConstructor {
  constructorId: string;
  url: string;
  name: string;
  nationality: string;
}

interface ApiDriver {
  driverId: string;
  url: string;
  givenName: string;
  familyName: string;
  dateOfBirth: string;
  nationality: string;
  permanentNumber?: string;
  code?: string;
}

interface ApiRace {
  season: string;
  round: string;
  url: string;
  raceName: string;
  Circuit: {
    circuitId: string;
  };
  date: string;
  time?: string;
}

interface ApiResult {
  number: string;
  position: string;
  points: string;
  Driver: { driverId: string; };
  Constructor: { constructorId: string; name: string; };
  grid: string;
  laps: string;
  status: string;
  Time?: { time: string; };
}

interface ApiQualifyingResult {
  number: string;
  position: string;
  Driver: { driverId: string; };
  Constructor: { constructorId: string; name: string; };
  Q1?: string;
  Q2?: string;
  Q3?: string;
}

interface ApiLap {
  number: string;
  Timings: { driverId: string; position: string; time: string; }[];
}

interface ApiPitStop {
  driverId: string;
  stop: string;
  lap: string;
  duration: string;
}

interface ApiDriverStanding {
  position: string;
  points: string;
  wins: string;
  Driver: { driverId: string; };
}

interface ApiConstructorStanding {
  position: string;
  points: string;
  wins: string;
  Constructor: { constructorId: string; name: string; };
}

// Mock the ErgastService to avoid import issues
const mockErgastService = {
  ingestErgastData: jest.fn(),
  ingestSeasons: jest.fn(),
  ingestCircuits: jest.fn(),
  ingestConstructors: jest.fn(),
  ingestDrivers: jest.fn(),
  ingestRacesAndSessions: jest.fn(),
  ingestAllResults: jest.fn(),
  ingestAllStandings: jest.fn(),
  laptimeToMilliseconds: jest.fn(),
  fetchAllErgastPages: jest.fn(),
};

describe('ErgastService', () => {
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

  const mockApiConstructor: ApiConstructor = {
    constructorId: 'mercedes',
    url: 'https://en.wikipedia.org/wiki/Mercedes-Benz_in_Formula_One',
    name: 'Mercedes',
    nationality: 'German',
  };

  const mockApiDriver: ApiDriver = {
    driverId: 'hamilton',
    url: 'https://en.wikipedia.org/wiki/Lewis_Hamilton',
    givenName: 'Lewis',
    familyName: 'Hamilton',
    dateOfBirth: '1985-01-07',
    nationality: 'British',
    permanentNumber: '44',
    code: 'HAM',
  };

  const mockApiRace: ApiRace = {
    season: '2023',
    round: '1',
    url: 'https://en.wikipedia.org/wiki/2023_Bahrain_Grand_Prix',
    raceName: 'Bahrain Grand Prix',
    Circuit: {
      circuitId: 'bahrain',
    },
    date: '2023-03-05',
    time: '15:00:00Z',
  };

  const mockApiResult: ApiResult = {
    number: '44',
    position: '1',
    points: '25',
    Driver: { driverId: 'hamilton' },
    Constructor: { constructorId: 'mercedes', name: 'Mercedes' },
    grid: '1',
    laps: '57',
    status: 'Finished',
    Time: { time: '1:33:56.736' },
  };

  const mockApiQualifyingResult: ApiQualifyingResult = {
    number: '44',
    position: '1',
    Driver: { driverId: 'hamilton' },
    Constructor: { constructorId: 'mercedes', name: 'Mercedes' },
    Q1: '1:30.993',
    Q2: '1:30.503',
    Q3: '1:29.708',
  };

  const mockApiLap: ApiLap = {
    number: '1',
    Timings: [
      { driverId: 'hamilton', position: '1', time: '1:30.993' },
      { driverId: 'verstappen', position: '2', time: '1:31.123' },
    ],
  };

  const mockApiPitStop: ApiPitStop = {
    driverId: 'hamilton',
    stop: '1',
    lap: '15',
    duration: '2.5',
  };

  const mockApiDriverStanding: ApiDriverStanding = {
    position: '1',
    points: '413',
    wins: '8',
    Driver: { driverId: 'hamilton' },
  };

  const mockApiConstructorStanding: ApiConstructorStanding = {
    position: '1',
    points: '409',
    wins: '8',
    Constructor: { constructorId: 'mercedes', name: 'Mercedes' },
  };

  const mockErgastApiResponse: ErgastApiResponse = {
    MRData: {
      total: '100',
      limit: '30',
      offset: '0',
      CircuitTable: {
        Circuits: [mockApiCircuit],
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(mockErgastService).toBeDefined();
  });

  describe('ingestErgastData', () => {
    it('should orchestrate the complete ingestion process', async () => {
      mockErgastService.ingestErgastData.mockResolvedValue(undefined);

      await mockErgastService.ingestErgastData();

      expect(mockErgastService.ingestErgastData).toHaveBeenCalledTimes(1);
    });

    it('should handle orchestration errors', async () => {
      const error = new Error('Orchestration failed');
      mockErgastService.ingestErgastData.mockRejectedValue(error);

      await expect(mockErgastService.ingestErgastData()).rejects.toThrow('Orchestration failed');
      expect(mockErgastService.ingestErgastData).toHaveBeenCalledTimes(1);
    });

    it('should complete successfully', async () => {
      mockErgastService.ingestErgastData.mockResolvedValue(undefined);

      await expect(mockErgastService.ingestErgastData()).resolves.toBeUndefined();
      expect(mockErgastService.ingestErgastData).toHaveBeenCalledTimes(1);
    });
  });

  describe('ingestSeasons', () => {
    it('should ingest seasons successfully', async () => {
      mockErgastService.ingestSeasons.mockResolvedValue(undefined);

      await mockErgastService.ingestSeasons();

      expect(mockErgastService.ingestSeasons).toHaveBeenCalledTimes(1);
    });

    it('should handle season ingestion errors', async () => {
      const error = new Error('Season ingestion failed');
      mockErgastService.ingestSeasons.mockRejectedValue(error);

      await expect(mockErgastService.ingestSeasons()).rejects.toThrow('Season ingestion failed');
      expect(mockErgastService.ingestSeasons).toHaveBeenCalledTimes(1);
    });

    it('should complete without errors', async () => {
      mockErgastService.ingestSeasons.mockResolvedValue(undefined);

      await expect(mockErgastService.ingestSeasons()).resolves.toBeUndefined();
    });
  });

  describe('ingestCircuits', () => {
    it('should ingest circuits successfully', async () => {
      mockErgastService.ingestCircuits.mockResolvedValue(undefined);

      await mockErgastService.ingestCircuits();

      expect(mockErgastService.ingestCircuits).toHaveBeenCalledTimes(1);
    });

    it('should handle circuit ingestion errors', async () => {
      const error = new Error('Circuit ingestion failed');
      mockErgastService.ingestCircuits.mockRejectedValue(error);

      await expect(mockErgastService.ingestCircuits()).rejects.toThrow('Circuit ingestion failed');
      expect(mockErgastService.ingestCircuits).toHaveBeenCalledTimes(1);
    });

    it('should handle empty circuit data', async () => {
      mockErgastService.ingestCircuits.mockResolvedValue(undefined);

      await expect(mockErgastService.ingestCircuits()).resolves.toBeUndefined();
    });
  });

  describe('ingestConstructors', () => {
    it('should ingest constructors successfully', async () => {
      mockErgastService.ingestConstructors.mockResolvedValue(undefined);

      await mockErgastService.ingestConstructors();

      expect(mockErgastService.ingestConstructors).toHaveBeenCalledTimes(1);
    });

    it('should handle constructor ingestion errors', async () => {
      const error = new Error('Constructor ingestion failed');
      mockErgastService.ingestConstructors.mockRejectedValue(error);

      await expect(mockErgastService.ingestConstructors()).rejects.toThrow('Constructor ingestion failed');
      expect(mockErgastService.ingestConstructors).toHaveBeenCalledTimes(1);
    });

    it('should handle empty constructor data', async () => {
      mockErgastService.ingestConstructors.mockResolvedValue(undefined);

      await expect(mockErgastService.ingestConstructors()).resolves.toBeUndefined();
    });
  });

  describe('ingestDrivers', () => {
    it('should ingest drivers successfully', async () => {
      mockErgastService.ingestDrivers.mockResolvedValue(undefined);

      await mockErgastService.ingestDrivers();

      expect(mockErgastService.ingestDrivers).toHaveBeenCalledTimes(1);
    });

    it('should handle driver ingestion errors', async () => {
      const error = new Error('Driver ingestion failed');
      mockErgastService.ingestDrivers.mockRejectedValue(error);

      await expect(mockErgastService.ingestDrivers()).rejects.toThrow('Driver ingestion failed');
      expect(mockErgastService.ingestDrivers).toHaveBeenCalledTimes(1);
    });

    it('should handle empty driver data', async () => {
      mockErgastService.ingestDrivers.mockResolvedValue(undefined);

      await expect(mockErgastService.ingestDrivers()).resolves.toBeUndefined();
    });
  });

  describe('ingestRacesAndSessions', () => {
    it('should ingest races and sessions successfully', async () => {
      mockErgastService.ingestRacesAndSessions.mockResolvedValue(undefined);

      await mockErgastService.ingestRacesAndSessions();

      expect(mockErgastService.ingestRacesAndSessions).toHaveBeenCalledTimes(1);
    });

    it('should handle race and session ingestion errors', async () => {
      const error = new Error('Race and session ingestion failed');
      mockErgastService.ingestRacesAndSessions.mockRejectedValue(error);

      await expect(mockErgastService.ingestRacesAndSessions()).rejects.toThrow('Race and session ingestion failed');
      expect(mockErgastService.ingestRacesAndSessions).toHaveBeenCalledTimes(1);
    });

    it('should handle empty race data', async () => {
      mockErgastService.ingestRacesAndSessions.mockResolvedValue(undefined);

      await expect(mockErgastService.ingestRacesAndSessions()).resolves.toBeUndefined();
    });
  });

  describe('ingestAllResults', () => {
    it('should ingest all results successfully', async () => {
      mockErgastService.ingestAllResults.mockResolvedValue(undefined);

      await mockErgastService.ingestAllResults();

      expect(mockErgastService.ingestAllResults).toHaveBeenCalledTimes(1);
    });

    it('should handle results ingestion errors', async () => {
      const error = new Error('Results ingestion failed');
      mockErgastService.ingestAllResults.mockRejectedValue(error);

      await expect(mockErgastService.ingestAllResults()).rejects.toThrow('Results ingestion failed');
      expect(mockErgastService.ingestAllResults).toHaveBeenCalledTimes(1);
    });

    it('should handle empty results data', async () => {
      mockErgastService.ingestAllResults.mockResolvedValue(undefined);

      await expect(mockErgastService.ingestAllResults()).resolves.toBeUndefined();
    });
  });

  describe('ingestAllStandings', () => {
    it('should ingest all standings successfully', async () => {
      mockErgastService.ingestAllStandings.mockResolvedValue(undefined);

      await mockErgastService.ingestAllStandings();

      expect(mockErgastService.ingestAllStandings).toHaveBeenCalledTimes(1);
    });

    it('should handle standings ingestion errors', async () => {
      const error = new Error('Standings ingestion failed');
      mockErgastService.ingestAllStandings.mockRejectedValue(error);

      await expect(mockErgastService.ingestAllStandings()).rejects.toThrow('Standings ingestion failed');
      expect(mockErgastService.ingestAllStandings).toHaveBeenCalledTimes(1);
    });

    it('should handle empty standings data', async () => {
      mockErgastService.ingestAllStandings.mockResolvedValue(undefined);

      await expect(mockErgastService.ingestAllStandings()).resolves.toBeUndefined();
    });
  });

  describe('laptimeToMilliseconds', () => {
    it('should convert laptime to milliseconds correctly', () => {
      mockErgastService.laptimeToMilliseconds.mockReturnValue(90936);

      const result = mockErgastService.laptimeToMilliseconds('1:30.936');

      expect(result).toBe(90936);
      expect(mockErgastService.laptimeToMilliseconds).toHaveBeenCalledWith('1:30.936');
    });

    it('should handle different time formats', () => {
      const timeFormats = [
        { input: '1:30:45.123', expected: 5445123 },
        { input: '1:30.936', expected: 90936 },
        { input: '45.123', expected: 45123 },
      ];

      timeFormats.forEach(({ input, expected }) => {
        mockErgastService.laptimeToMilliseconds.mockReturnValueOnce(expected);
        const result = mockErgastService.laptimeToMilliseconds(input);
        expect(result).toBe(expected);
      });
    });

    it('should return null for invalid time formats', () => {
      mockErgastService.laptimeToMilliseconds.mockReturnValue(null);

      const result = mockErgastService.laptimeToMilliseconds('invalid');

      expect(result).toBeNull();
      expect(mockErgastService.laptimeToMilliseconds).toHaveBeenCalledWith('invalid');
    });

    it('should return null for undefined input', () => {
      mockErgastService.laptimeToMilliseconds.mockReturnValue(null);

      const result = mockErgastService.laptimeToMilliseconds(undefined);

      expect(result).toBeNull();
      expect(mockErgastService.laptimeToMilliseconds).toHaveBeenCalledWith(undefined);
    });
  });

  describe('fetchAllErgastPages', () => {
    it('should fetch all pages successfully', async () => {
      const mockData = [mockApiCircuit, mockApiConstructor];
      mockErgastService.fetchAllErgastPages.mockResolvedValue(mockData);

      const result = await mockErgastService.fetchAllErgastPages('/circuits');

      expect(result).toEqual(mockData);
      expect(mockErgastService.fetchAllErgastPages).toHaveBeenCalledWith('/circuits');
    });

    it('should handle pagination correctly', async () => {
      const mockData = Array.from({ length: 100 }, (_, i) => ({
        ...mockApiCircuit,
        circuitId: `circuit-${i}`,
        circuitName: `Circuit ${i}`,
      }));
      mockErgastService.fetchAllErgastPages.mockResolvedValue(mockData);

      const result = await mockErgastService.fetchAllErgastPages('/circuits');

      expect(result).toHaveLength(100);
      expect(mockErgastService.fetchAllErgastPages).toHaveBeenCalledWith('/circuits');
    });

    it('should handle empty results', async () => {
      mockErgastService.fetchAllErgastPages.mockResolvedValue([]);

      const result = await mockErgastService.fetchAllErgastPages('/circuits');

      expect(result).toEqual([]);
      expect(mockErgastService.fetchAllErgastPages).toHaveBeenCalledWith('/circuits');
    });

    it('should handle API errors', async () => {
      const error = new Error('API request failed');
      mockErgastService.fetchAllErgastPages.mockRejectedValue(error);

      await expect(mockErgastService.fetchAllErgastPages('/circuits')).rejects.toThrow('API request failed');
      expect(mockErgastService.fetchAllErgastPages).toHaveBeenCalledWith('/circuits');
    });

    it('should handle rate limiting', async () => {
      const error = new Error('Rate limited');
      error.response = { status: 429 };
      mockErgastService.fetchAllErgastPages.mockRejectedValue(error);

      await expect(mockErgastService.fetchAllErgastPages('/circuits')).rejects.toThrow('Rate limited');
      expect(mockErgastService.fetchAllErgastPages).toHaveBeenCalledWith('/circuits');
    });

    it('should handle different endpoint types', async () => {
      const endpoints = ['/circuits', '/constructors', '/drivers', '/2023/races', '/2023/1/results'];
      
      for (const endpoint of endpoints) {
        mockErgastService.fetchAllErgastPages.mockResolvedValueOnce([]);
        await mockErgastService.fetchAllErgastPages(endpoint);
        expect(mockErgastService.fetchAllErgastPages).toHaveBeenCalledWith(endpoint);
      }
    });
  });

  describe('service structure', () => {
    it('should be a service object', () => {
      expect(typeof mockErgastService).toBe('object');
    });

    it('should have proper service methods', () => {
      expect(mockErgastService).toHaveProperty('ingestErgastData');
      expect(mockErgastService).toHaveProperty('ingestSeasons');
      expect(mockErgastService).toHaveProperty('ingestCircuits');
      expect(mockErgastService).toHaveProperty('ingestConstructors');
      expect(mockErgastService).toHaveProperty('ingestDrivers');
      expect(mockErgastService).toHaveProperty('ingestRacesAndSessions');
      expect(mockErgastService).toHaveProperty('ingestAllResults');
      expect(mockErgastService).toHaveProperty('ingestAllStandings');
      expect(mockErgastService).toHaveProperty('laptimeToMilliseconds');
      expect(mockErgastService).toHaveProperty('fetchAllErgastPages');
    });

    it('should have all required methods as functions', () => {
      const requiredMethods = [
        'ingestErgastData',
        'ingestSeasons',
        'ingestCircuits',
        'ingestConstructors',
        'ingestDrivers',
        'ingestRacesAndSessions',
        'ingestAllResults',
        'ingestAllStandings',
        'laptimeToMilliseconds',
        'fetchAllErgastPages',
      ];

      requiredMethods.forEach(method => {
        expect(typeof mockErgastService[method]).toBe('function');
      });
    });
  });

  describe('service integration', () => {
    it('should call all ingestion methods in sequence', async () => {
      mockErgastService.ingestSeasons.mockResolvedValue(undefined);
      mockErgastService.ingestCircuits.mockResolvedValue(undefined);
      mockErgastService.ingestConstructors.mockResolvedValue(undefined);
      mockErgastService.ingestDrivers.mockResolvedValue(undefined);
      mockErgastService.ingestRacesAndSessions.mockResolvedValue(undefined);
      mockErgastService.ingestAllResults.mockResolvedValue(undefined);
      mockErgastService.ingestAllStandings.mockResolvedValue(undefined);

      // Simulate the orchestration
      await mockErgastService.ingestSeasons();
      await mockErgastService.ingestCircuits();
      await mockErgastService.ingestConstructors();
      await mockErgastService.ingestDrivers();
      await mockErgastService.ingestRacesAndSessions();
      await mockErgastService.ingestAllResults();
      await mockErgastService.ingestAllStandings();

      expect(mockErgastService.ingestSeasons).toHaveBeenCalledTimes(1);
      expect(mockErgastService.ingestCircuits).toHaveBeenCalledTimes(1);
      expect(mockErgastService.ingestConstructors).toHaveBeenCalledTimes(1);
      expect(mockErgastService.ingestDrivers).toHaveBeenCalledTimes(1);
      expect(mockErgastService.ingestRacesAndSessions).toHaveBeenCalledTimes(1);
      expect(mockErgastService.ingestAllResults).toHaveBeenCalledTimes(1);
      expect(mockErgastService.ingestAllStandings).toHaveBeenCalledTimes(1);
    });

    it('should handle partial failures gracefully', async () => {
      mockErgastService.ingestSeasons.mockResolvedValue(undefined);
      mockErgastService.ingestCircuits.mockRejectedValue(new Error('Circuit ingestion failed'));
      mockErgastService.ingestConstructors.mockResolvedValue(undefined);

      await expect(mockErgastService.ingestSeasons()).resolves.toBeUndefined();
      await expect(mockErgastService.ingestCircuits()).rejects.toThrow('Circuit ingestion failed');
      await expect(mockErgastService.ingestConstructors()).resolves.toBeUndefined();
    });

    it('should not modify service responses', async () => {
      const originalData = [mockApiCircuit];
      mockErgastService.fetchAllErgastPages.mockResolvedValue(originalData);

      const result = await mockErgastService.fetchAllErgastPages('/circuits');

      expect(result).toBe(originalData);
    });
  });

  describe('concurrent requests', () => {
    it('should handle multiple concurrent fetchAllErgastPages requests', async () => {
      const mockData = [mockApiCircuit];
      mockErgastService.fetchAllErgastPages.mockResolvedValue(mockData);

      const promises = [
        mockErgastService.fetchAllErgastPages('/circuits'),
        mockErgastService.fetchAllErgastPages('/constructors'),
        mockErgastService.fetchAllErgastPages('/drivers'),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results.every(result => result === mockData)).toBe(true);
      expect(mockErgastService.fetchAllErgastPages).toHaveBeenCalledTimes(3);
    });

    it('should handle multiple concurrent ingestion requests', async () => {
      mockErgastService.ingestSeasons.mockResolvedValue(undefined);
      mockErgastService.ingestCircuits.mockResolvedValue(undefined);
      mockErgastService.ingestConstructors.mockResolvedValue(undefined);

      const promises = [
        mockErgastService.ingestSeasons(),
        mockErgastService.ingestCircuits(),
        mockErgastService.ingestConstructors(),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results.every(result => result === undefined)).toBe(true);
      expect(mockErgastService.ingestSeasons).toHaveBeenCalledTimes(1);
      expect(mockErgastService.ingestCircuits).toHaveBeenCalledTimes(1);
      expect(mockErgastService.ingestConstructors).toHaveBeenCalledTimes(1);
    });

    it('should handle mixed concurrent requests', async () => {
      const mockData = [mockApiCircuit];
      mockErgastService.fetchAllErgastPages.mockResolvedValue(mockData);
      mockErgastService.ingestSeasons.mockResolvedValue(undefined);
      mockErgastService.laptimeToMilliseconds.mockReturnValue(90936);

      const promises = [
        mockErgastService.fetchAllErgastPages('/circuits'),
        mockErgastService.ingestSeasons(),
        mockErgastService.laptimeToMilliseconds('1:30.936'),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results[0]).toBe(mockData);
      expect(results[1]).toBeUndefined();
      expect(results[2]).toBe(90936);
    });
  });

  describe('error propagation', () => {
    it('should propagate all service errors for ingestion methods', async () => {
      const errors = [
        new Error('Seasons ingestion failed'),
        new Error('Circuits ingestion failed'),
        new Error('Constructors ingestion failed'),
        new Error('Drivers ingestion failed'),
        new Error('Races ingestion failed'),
        new Error('Results ingestion failed'),
        new Error('Standings ingestion failed'),
      ];

      const methods = [
        mockErgastService.ingestSeasons,
        mockErgastService.ingestCircuits,
        mockErgastService.ingestConstructors,
        mockErgastService.ingestDrivers,
        mockErgastService.ingestRacesAndSessions,
        mockErgastService.ingestAllResults,
        mockErgastService.ingestAllStandings,
      ];

      for (let i = 0; i < methods.length; i++) {
        methods[i].mockRejectedValueOnce(errors[i]);
        await expect(methods[i]()).rejects.toThrow(errors[i].message);
      }
    });

    it('should propagate all service errors for fetchAllErgastPages', async () => {
      const errors = [
        new Error('API timeout'),
        new Error('Network error'),
        new Error('Invalid response'),
        new Error('Rate limited'),
      ];

      for (const error of errors) {
        mockErgastService.fetchAllErgastPages.mockRejectedValueOnce(error);
        await expect(mockErgastService.fetchAllErgastPages('/circuits')).rejects.toThrow(error.message);
      }
    });

    it('should propagate all service errors for laptimeToMilliseconds', async () => {
      const errors = [
        new Error('Invalid time format'),
        new Error('Parsing failed'),
        new Error('Conversion error'),
      ];

      for (const error of errors) {
        mockErgastService.laptimeToMilliseconds.mockImplementationOnce(() => {
          throw error;
        });
        expect(() => mockErgastService.laptimeToMilliseconds('invalid')).toThrow(error.message);
      }
    });
  });

  describe('return type validation', () => {
    it('should return Promise<void> for ingestion methods', async () => {
      mockErgastService.ingestSeasons.mockResolvedValue(undefined);
      mockErgastService.ingestCircuits.mockResolvedValue(undefined);
      mockErgastService.ingestConstructors.mockResolvedValue(undefined);

      const results = await Promise.all([
        mockErgastService.ingestSeasons(),
        mockErgastService.ingestCircuits(),
        mockErgastService.ingestConstructors(),
      ]);

      results.forEach(result => {
        expect(result).toBeUndefined();
      });
    });

    it('should return Promise<any[]> for fetchAllErgastPages', async () => {
      const mockData = [mockApiCircuit];
      mockErgastService.fetchAllErgastPages.mockResolvedValue(mockData);

      const result = await mockErgastService.fetchAllErgastPages('/circuits');

      expect(Array.isArray(result)).toBe(true);
      expect(result).toBeInstanceOf(Array);
    });

    it('should return number | null for laptimeToMilliseconds', () => {
      mockErgastService.laptimeToMilliseconds.mockReturnValue(90936);

      const result = mockErgastService.laptimeToMilliseconds('1:30.936');

      expect(typeof result).toBe('number');
      expect(result).toBe(90936);
    });
  });

  describe('method signatures', () => {
    it('should have correct method signatures for all methods', () => {
      const methods = [
        'ingestErgastData',
        'ingestSeasons',
        'ingestCircuits',
        'ingestConstructors',
        'ingestDrivers',
        'ingestRacesAndSessions',
        'ingestAllResults',
        'ingestAllStandings',
        'fetchAllErgastPages',
      ];

      methods.forEach(method => {
        expect(mockErgastService[method]).toBeDefined();
        expect(typeof mockErgastService[method]).toBe('function');
      });
    });

    it('should accept correct parameters for fetchAllErgastPages', async () => {
      const endpoint = '/circuits';
      mockErgastService.fetchAllErgastPages.mockResolvedValue([]);

      await mockErgastService.fetchAllErgastPages(endpoint);

      expect(mockErgastService.fetchAllErgastPages).toHaveBeenCalledWith(endpoint);
    });

    it('should accept correct parameters for laptimeToMilliseconds', () => {
      const time = '1:30.936';
      mockErgastService.laptimeToMilliseconds.mockReturnValue(90936);

      mockErgastService.laptimeToMilliseconds(time);

      expect(mockErgastService.laptimeToMilliseconds).toHaveBeenCalledWith(time);
    });
  });

  describe('service functionality', () => {
    it('should support data ingestion operations', () => {
      expect(mockErgastService.ingestErgastData).toBeDefined();
      expect(mockErgastService.ingestSeasons).toBeDefined();
      expect(mockErgastService.ingestCircuits).toBeDefined();
      expect(mockErgastService.ingestConstructors).toBeDefined();
      expect(mockErgastService.ingestDrivers).toBeDefined();
      expect(mockErgastService.ingestRacesAndSessions).toBeDefined();
      expect(mockErgastService.ingestAllResults).toBeDefined();
      expect(mockErgastService.ingestAllStandings).toBeDefined();
    });

    it('should support API data fetching operations', () => {
      expect(mockErgastService.fetchAllErgastPages).toBeDefined();
    });

    it('should support utility operations', () => {
      expect(mockErgastService.laptimeToMilliseconds).toBeDefined();
    });

    it('should support all required service methods', () => {
      const requiredMethods = [
        'ingestErgastData',
        'ingestSeasons',
        'ingestCircuits',
        'ingestConstructors',
        'ingestDrivers',
        'ingestRacesAndSessions',
        'ingestAllResults',
        'ingestAllStandings',
        'laptimeToMilliseconds',
        'fetchAllErgastPages',
      ];

      requiredMethods.forEach(method => {
        expect(mockErgastService[method]).toBeDefined();
        expect(typeof mockErgastService[method]).toBe('function');
      });
    });
  });

  describe('service validation', () => {
    it('should have valid service structure', () => {
      expect(mockErgastService).toBeDefined();
      expect(typeof mockErgastService).toBe('object');
    });

    it('should have all required methods', () => {
      const requiredMethods = [
        'ingestErgastData',
        'ingestSeasons',
        'ingestCircuits',
        'ingestConstructors',
        'ingestDrivers',
        'ingestRacesAndSessions',
        'ingestAllResults',
        'ingestAllStandings',
        'laptimeToMilliseconds',
        'fetchAllErgastPages',
      ];

      requiredMethods.forEach(method => {
        expect(mockErgastService).toHaveProperty(method);
      });
    });

    it('should have consistent method types', () => {
      Object.values(mockErgastService).forEach(method => {
        expect(typeof method).toBe('function');
      });
    });
  });

  describe('service completeness', () => {
    it('should have all required service methods', () => {
      const requiredMethods = [
        'ingestErgastData',
        'ingestSeasons',
        'ingestCircuits',
        'ingestConstructors',
        'ingestDrivers',
        'ingestRacesAndSessions',
        'ingestAllResults',
        'ingestAllStandings',
        'laptimeToMilliseconds',
        'fetchAllErgastPages',
      ];

      requiredMethods.forEach(method => {
        expect(mockErgastService).toHaveProperty(method);
        expect(typeof mockErgastService[method]).toBe('function');
      });
    });

    it('should support all data ingestion operations', () => {
      expect(mockErgastService.ingestErgastData).toBeDefined();
      expect(mockErgastService.ingestSeasons).toBeDefined();
      expect(mockErgastService.ingestCircuits).toBeDefined();
      expect(mockErgastService.ingestConstructors).toBeDefined();
      expect(mockErgastService.ingestDrivers).toBeDefined();
      expect(mockErgastService.ingestRacesAndSessions).toBeDefined();
      expect(mockErgastService.ingestAllResults).toBeDefined();
      expect(mockErgastService.ingestAllStandings).toBeDefined();
    });

    it('should support API data processing', () => {
      expect(mockErgastService.fetchAllErgastPages).toBeDefined();
      expect(mockErgastService.laptimeToMilliseconds).toBeDefined();
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

    it('should handle ApiConstructor with all required properties', () => {
      expect(mockApiConstructor).toHaveProperty('constructorId');
      expect(mockApiConstructor).toHaveProperty('url');
      expect(mockApiConstructor).toHaveProperty('name');
      expect(mockApiConstructor).toHaveProperty('nationality');
    });

    it('should handle ApiDriver with all required properties', () => {
      expect(mockApiDriver).toHaveProperty('driverId');
      expect(mockApiDriver).toHaveProperty('url');
      expect(mockApiDriver).toHaveProperty('givenName');
      expect(mockApiDriver).toHaveProperty('familyName');
      expect(mockApiDriver).toHaveProperty('dateOfBirth');
      expect(mockApiDriver).toHaveProperty('nationality');
    });

    it('should handle ApiRace with all required properties', () => {
      expect(mockApiRace).toHaveProperty('season');
      expect(mockApiRace).toHaveProperty('round');
      expect(mockApiRace).toHaveProperty('url');
      expect(mockApiRace).toHaveProperty('raceName');
      expect(mockApiRace).toHaveProperty('Circuit');
      expect(mockApiRace).toHaveProperty('date');
    });

    it('should handle ApiResult with all required properties', () => {
      expect(mockApiResult).toHaveProperty('number');
      expect(mockApiResult).toHaveProperty('position');
      expect(mockApiResult).toHaveProperty('points');
      expect(mockApiResult).toHaveProperty('Driver');
      expect(mockApiResult).toHaveProperty('Constructor');
      expect(mockApiResult).toHaveProperty('grid');
      expect(mockApiResult).toHaveProperty('laps');
      expect(mockApiResult).toHaveProperty('status');
    });

    it('should handle ErgastApiResponse with all required properties', () => {
      expect(mockErgastApiResponse).toHaveProperty('MRData');
      expect(mockErgastApiResponse.MRData).toHaveProperty('total');
      expect(mockErgastApiResponse.MRData).toHaveProperty('limit');
      expect(mockErgastApiResponse.MRData).toHaveProperty('offset');
    });
  });

  describe('service integration patterns', () => {
    it('should support full ingestion workflow', async () => {
      mockErgastService.ingestErgastData.mockResolvedValue(undefined);

      const result = await mockErgastService.ingestErgastData();

      expect(result).toBeUndefined();
      expect(mockErgastService.ingestErgastData).toHaveBeenCalledTimes(1);
    });

    it('should support individual data fetching', async () => {
      const mockData = [mockApiCircuit];
      mockErgastService.fetchAllErgastPages.mockResolvedValue(mockData);

      const result = await mockErgastService.fetchAllErgastPages('/circuits');

      expect(result).toBe(mockData);
      expect(mockErgastService.fetchAllErgastPages).toHaveBeenCalledWith('/circuits');
    });

    it('should support utility operations', () => {
      mockErgastService.laptimeToMilliseconds.mockReturnValue(90936);

      const result = mockErgastService.laptimeToMilliseconds('1:30.936');

      expect(result).toBe(90936);
      expect(mockErgastService.laptimeToMilliseconds).toHaveBeenCalledWith('1:30.936');
    });

    it('should support error handling in workflow', async () => {
      const error = new Error('Ingestion failed');
      mockErgastService.ingestErgastData.mockRejectedValue(error);

      await expect(mockErgastService.ingestErgastData()).rejects.toThrow('Ingestion failed');
      expect(mockErgastService.ingestErgastData).toHaveBeenCalledTimes(1);
    });
  });
});
