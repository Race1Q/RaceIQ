import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { ErgastService } from './ergast.service';
import { SupabaseService } from '../supabase/supabase.service';

// Mock the country mapping module
jest.mock('../mapping/countries', () => ({
  countryCodeMap: { 'Monaco': 'MCO', 'United Kingdom': 'GBR' },
  nationalityToCountryCodeMap: { 'British': 'GBR', 'German': 'DEU' }
}));

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

// Global timeout for all tests in this suite
jest.setTimeout(30000);

describe('ErgastService', () => {
  let service: ErgastService;
  let httpService: HttpService;
  let supabaseService: SupabaseService;

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
      total: '1',
      limit: '30',
      offset: '0',
      CircuitTable: {
        Circuits: [mockApiCircuit],
      },
    },
  };

  // Create a chainable mock builder that returns Promises at terminal methods
  let mockResponseQueue: any[] = [];
  
  const getNextMockResponse = () => {
    if (mockResponseQueue.length > 0) {
      const response = mockResponseQueue.shift();
      // Ensure we always return a Promise
      return Promise.resolve(response);
    }
    return Promise.resolve({ data: [], error: null });
  };
  
  const mockSupabaseClient: any = {
    from: jest.fn(function(this: any) {
      return mockSupabaseClient;
    }),
    select: jest.fn(function(this: any) {
      // select() can return a Promise (terminal) or be chainable
      // We make it both by adding a then method that returns the queued response
      return mockSupabaseClient;
    }),
    insert: jest.fn(function(this: any) {
      // insert() can be chained with .select()
      return mockSupabaseClient;
    }),
    upsert: jest.fn(function(this: any) {
      // upsert() is terminal and returns a Promise
      return getNextMockResponse();
    }),
    delete: jest.fn(function(this: any) {
      return mockSupabaseClient;
    }),
    eq: jest.fn(function(this: any) {
      return mockSupabaseClient;
    }),
    in: jest.fn(function(this: any) {
      return mockSupabaseClient;
    }),
    order: jest.fn(function(this: any) {
      return mockSupabaseClient;
    }),
    limit: jest.fn(function(this: any) {
      return mockSupabaseClient;
    }),
    single: jest.fn(function(this: any) {
      return getNextMockResponse();
    }),
    gte: jest.fn(function(this: any) {
      return mockSupabaseClient;
    }),
    lte: jest.fn(function(this: any) {
      return mockSupabaseClient;
    }),
    returns: jest.fn(function(this: any) {
      return mockSupabaseClient;
    }),
    // Make the mock itself awaitable for terminal operations like select()
    then: function(onFulfilled: any) {
      return getNextMockResponse().then(onFulfilled);
    },
  };
  
  // Helper to queue mock responses
  const queueMockResponses = (...responses: any[]) => {
    mockResponseQueue = responses;
  };

  beforeEach(async () => {
    const mockHttpService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ErgastService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: SupabaseService,
          useValue: {
            client: mockSupabaseClient,
          },
        },
      ],
    }).compile();

    service = module.get<ErgastService>(ErgastService);
    httpService = module.get(HttpService);
    supabaseService = module.get(SupabaseService);

    // Clear previous mock calls and response queue
    jest.clearAllMocks();
    mockResponseQueue = [];
    
    // Setup default mock implementations AFTER clearing
    (httpService.get as jest.Mock).mockReturnValue(of({
      data: mockErgastApiResponse,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  // Helper function to limit year range for faster tests
  const setTestYearRange = (start: number = 2000, end: number = 2000) => {
    (service as any).startYear = start;
    (service as any).endYear = end;
  };

  describe('Service Initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should be an instance of ErgastService', () => {
      expect(service).toBeInstanceOf(ErgastService);
    });

    it('should have required dependencies injected', () => {
      expect(httpService).toBeDefined();
      expect(supabaseService).toBeDefined();
    });
  });

  describe('laptimeToMilliseconds', () => {
    it('should convert laptime to milliseconds correctly', () => {
      expect(service['laptimeToMilliseconds']('1:30.936')).toBe(90936);
    });

    it('should handle different time formats', () => {
      expect(service['laptimeToMilliseconds']('45.123')).toBe(45123);
      expect(service['laptimeToMilliseconds']('1:00.000')).toBe(60000);
      expect(service['laptimeToMilliseconds']('59:59.999')).toBe(3599999);
    });

    it('should return null for invalid time formats', () => {
      expect(service['laptimeToMilliseconds']('invalid')).toBeNull();
      expect(service['laptimeToMilliseconds']('abc.def')).toBeNaN();
    });

    it('should handle edge cases', () => {
      expect(service['laptimeToMilliseconds'](undefined)).toBeNull();
      expect(service['laptimeToMilliseconds'](null as any)).toBeNull();
      expect(service['laptimeToMilliseconds']('')).toBeNull();
    });
  });

  describe('Service Configuration', () => {
    it('should have correct configuration', () => {
      expect(service['apiBaseUrl']).toBe('https://api.jolpi.ca/ergast/f1');
      expect(service['startYear']).toBe(2000);
      expect(service['endYear']).toBe(2025);
      expect(service['pageLimit']).toBe(100);
    });

    it('should have logger configured', () => {
      expect(service['logger']).toBeDefined();
    });
  });

  describe('Service Integration', () => {
    it('should work with all dependencies', () => {
      expect(service['httpService']).toBe(httpService);
      expect(service['supabaseService']).toBe(supabaseService);
    });
  });

  describe('Error Handling', () => {
    it('should handle HTTP service errors', async () => {
      const error = new Error('Network timeout');
      (httpService.get as jest.Mock).mockReturnValue(throwError(() => ({
        response: { status: 504, data: 'Gateway Timeout' },
        message: error.message
      })));

      await expect(service.ingestCircuits()).rejects.toThrow();
    }, 10000);

    it('should handle invalid API responses', async () => {
      (httpService.get as jest.Mock).mockReturnValue(of({
        data: null, // Invalid data structure
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      }));

      await expect(service.ingestCircuits()).rejects.toThrow();
    });
  });

  describe('Method Signatures', () => {
    it('should have all required public methods', () => {
      expect(typeof service.ingestErgastData).toBe('function');
      expect(typeof service.ingestSeasons).toBe('function');
      expect(typeof service.ingestCircuits).toBe('function');
      expect(typeof service.ingestConstructors).toBe('function');
      expect(typeof service.ingestDrivers).toBe('function');
      expect(typeof service.ingestRacesAndSessions).toBe('function');
      expect(typeof service.ingestAllResults).toBe('function');
      expect(typeof service.ingestAllStandings).toBe('function');
    });

    it('should have private utility methods', () => {
      expect(typeof service['laptimeToMilliseconds']).toBe('function');
      expect(typeof service['fetchAllErgastPages']).toBe('function');
    });
  });

  describe('Service Structure', () => {
    it('should be a service object', () => {
      expect(service).toBeDefined();
      expect(typeof service).toBe('object');
    });

    it('should have proper service methods', () => {
      expect(service.ingestErgastData).toBeDefined();
      expect(service.ingestSeasons).toBeDefined();
      expect(service.ingestCircuits).toBeDefined();
      expect(service.ingestConstructors).toBeDefined();
      expect(service.ingestDrivers).toBeDefined();
      expect(service.ingestRacesAndSessions).toBeDefined();
      expect(service.ingestAllResults).toBeDefined();
      expect(service.ingestAllStandings).toBeDefined();
    });
  });

  describe('Main Ingestion Methods', () => {
    it('should ingest seasons successfully', async () => {
      setTestYearRange(2000, 2001); // Only test 2 years for speed

      await service.ingestSeasons();

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('seasons');
      expect(mockSupabaseClient.upsert).toHaveBeenCalled();
      expect(mockSupabaseClient.upsert).toHaveBeenCalledWith(
        expect.arrayContaining([
          { year: 2000 },
          { year: 2001 }
        ]),
        { onConflict: 'year' }
      );
    });

    it('should handle seasons upsert error', async () => {
      setTestYearRange(2000, 2000);
      mockSupabaseClient.upsert.mockReturnValue(
        Promise.resolve({ data: null, error: { message: 'Database error' } })
      );

      await expect(service.ingestSeasons()).rejects.toThrow('Failed to upsert seasons');
    });

    it('should handle circuits country fetch error', async () => {
      jest.spyOn(service as any, 'fetchAllErgastPages').mockResolvedValue([mockApiCircuit]);
      queueMockResponses(
        { data: null, error: { message: 'Country fetch error' } }
      );

      await expect(service.ingestCircuits()).rejects.toThrow('Failed to fetch existing countries');
    });

    it('should handle constructors upsert error', async () => {
      jest.spyOn(service as any, 'fetchAllErgastPages').mockResolvedValue([mockApiConstructor]);
      queueMockResponses(
        { data: null, error: { message: 'Upsert error' } }
      );

      await expect(service.ingestConstructors()).rejects.toThrow('Failed to upsert constructors');
    });

    it('should handle drivers upsert error', async () => {
      jest.spyOn(service as any, 'fetchAllErgastPages').mockResolvedValue([mockApiDriver]);
      queueMockResponses(
        { data: null, error: { message: 'Driver upsert error' } }
      );

      await expect(service.ingestDrivers()).rejects.toThrow('Failed to upsert drivers');
    });

    it('should handle empty circuit data gracefully', async () => {
      // Mock the private fetchAllErgastPages method to return empty array
      jest.spyOn(service as any, 'fetchAllErgastPages').mockResolvedValue([]);

      await service.ingestCircuits();

      expect(service['fetchAllErgastPages']).toHaveBeenCalledWith('/circuits');
      expect(mockSupabaseClient.upsert).not.toHaveBeenCalled();
    });

    it('should handle constructor API errors', async () => {
      // Mock the private fetchAllErgastPages method to return empty array
      jest.spyOn(service as any, 'fetchAllErgastPages').mockResolvedValue([]);

      await expect(service.ingestConstructors()).rejects.toThrow('Failed to fetch constructors from API.');
    });

    it('should handle driver API errors', async () => {
      // Mock the private fetchAllErgastPages method to return empty array
      jest.spyOn(service as any, 'fetchAllErgastPages').mockResolvedValue([]);

      await expect(service.ingestDrivers()).rejects.toThrow('Failed to fetch drivers from API.');
    });

    it('should handle circuits upsert error', async () => {
      jest.spyOn(service as any, 'fetchAllErgastPages').mockResolvedValue([mockApiCircuit]);
      queueMockResponses(
        { data: [], error: null }
      );
      await expect(service.ingestCircuits()).rejects.toThrow('Failed to upsert circuits');
    });

  });

  describe('Main Orchestrator Method', () => {
    it('should run complete ingestion process', async () => {
      const ingestSeasonsSpy = jest.spyOn(service, 'ingestSeasons').mockResolvedValue(undefined);
      const ingestCircuitsSpy = jest.spyOn(service, 'ingestCircuits').mockResolvedValue(undefined);
      const ingestConstructorsSpy = jest.spyOn(service, 'ingestConstructors').mockResolvedValue(undefined);
      const ingestDriversSpy = jest.spyOn(service, 'ingestDrivers').mockResolvedValue(undefined);
      const ingestRacesSpy = jest.spyOn(service, 'ingestRacesAndSessions').mockResolvedValue(undefined);
      const ingestResultsSpy = jest.spyOn(service, 'ingestAllResults').mockResolvedValue(undefined);
      const ingestStandingsSpy = jest.spyOn(service, 'ingestAllStandings').mockResolvedValue(undefined);

      await service.ingestErgastData();

      expect(ingestSeasonsSpy).toHaveBeenCalled();
      expect(ingestCircuitsSpy).toHaveBeenCalled();
      expect(ingestConstructorsSpy).toHaveBeenCalled();
      expect(ingestDriversSpy).toHaveBeenCalled();
      expect(ingestRacesSpy).toHaveBeenCalled();
      expect(ingestResultsSpy).toHaveBeenCalled();
      expect(ingestStandingsSpy).toHaveBeenCalled();
    });
  });

  describe('Races and Sessions Ingestion', () => {
    it('should ingest races and sessions successfully', async () => {
      setTestYearRange(2000, 2000);
      const mockSeasons = [{ id: 1, year: 2000 }];
      const mockCircuits = [{ id: 1, name: 'Circuit de Monaco' }];
      const mockRaces = [{ id: 1, round: 1 }];

      jest.spyOn(service as any, 'fetchAllErgastPages')
        .mockResolvedValueOnce([mockApiRace]) // races for season
        .mockResolvedValueOnce([mockApiCircuit]); // circuit details

      queueMockResponses(
        { data: mockSeasons, error: null },
        { data: mockCircuits, error: null },
        { data: mockRaces, error: null },
        { data: [], error: null }
      );
      await service.ingestRacesAndSessions();

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('seasons');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('circuits');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('races');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('sessions');
    }, 10000);

    it('should skip race with missing circuit data', async () => {
      setTestYearRange(2000, 2000);
      const mockSeasons = [{ id: 1, year: 2000 }];
      const mockCircuits = [{ id: 1, name: 'Circuit de Monaco' }];
      const mockRaceWithoutCircuit = { ...mockApiRace, Circuit: undefined };

      jest.spyOn(service as any, 'fetchAllErgastPages')
        .mockResolvedValueOnce([mockRaceWithoutCircuit]);

      queueMockResponses(
        { data: mockSeasons, error: null },
        { data: mockCircuits, error: null },
        { data: [], error: null },
        { data: [], error: null }
      );
      await service.ingestRacesAndSessions();

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('seasons');
    });
  });

  describe('Results Ingestion', () => {
    it('should ingest all results successfully', async () => {
      const mockSeasons = [{ id: 1 }];
      const mockRaces = [{ id: 1, round: 1, season: { year: 2020 } }];
      const mockSessions = [{ id: 1, race_id: 1, type: 'RACE' }, { id: 2, race_id: 1, type: 'QUALIFYING' }];
      const mockDrivers = [{ id: 1, ergast_driver_ref: 'hamilton' }];
      const mockConstructors = [{ id: 1, name: 'Mercedes' }];

      jest.spyOn(service as any, 'fetchAllErgastPages')
        .mockResolvedValueOnce([{ Results: [mockApiResult] }]) // race results
        .mockResolvedValueOnce([{ QualifyingResults: [mockApiQualifyingResult] }]) // qualifying
        .mockResolvedValueOnce([{ Laps: [mockApiLap] }]) // laps
        .mockResolvedValueOnce([{ PitStops: [mockApiPitStop] }]); // pit stops

      queueMockResponses(
        { data: mockSeasons, error: null },
        { data: mockRaces, error: null },
        { data: mockSessions, error: null },
        { data: mockDrivers, error: null },
        { data: mockConstructors, error: null },
        { data: [], error: null }
      );
      await service.ingestAllResults();

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('seasons');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('races');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('sessions');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('drivers');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('constructors');
    }, 15000);

    it('should handle no seasons found', async () => {
      queueMockResponses({  data: [], error: null  });

      const fetchSpy = jest.spyOn(service as any, 'fetchAllErgastPages');

      await service.ingestAllResults();

      // Should return early if no seasons found
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('should handle empty qualifying results', async () => {
      const mockSeasons = [{ id: 1 }];
      const mockRaces = [{ id: 1, round: 1, season: { year: 2020 } }];
      const mockSessions = [{ id: 1, race_id: 1, type: 'RACE' }, { id: 2, race_id: 1, type: 'QUALIFYING' }];
      const mockDrivers = [{ id: 1, ergast_driver_ref: 'hamilton' }];
      const mockConstructors = [{ id: 1, name: 'Mercedes' }];

      jest.spyOn(service as any, 'fetchAllErgastPages')
        .mockResolvedValueOnce([{ Results: [mockApiResult] }])
        .mockResolvedValueOnce([{ QualifyingResults: [] }]) // Empty qualifying results
        .mockResolvedValueOnce([{ Laps: [] }])
        .mockResolvedValueOnce([{ PitStops: [] }]);

      queueMockResponses(
        { data: mockSeasons, error: null },
        { data: mockRaces, error: null },
        { data: mockSessions, error: null },
        { data: mockDrivers, error: null },
        { data: mockConstructors, error: null },
        { data: [], error: null }
      );
      await service.ingestAllResults();

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('seasons');
    }, 15000);
  });

  describe('Standings Ingestion', () => {
    it('should ingest standings successfully', async () => {
      setTestYearRange(2000, 2000);
      const mockDrivers = [{ id: 1, ergast_driver_ref: 'hamilton' }];
      const mockConstructors = [{ id: 1, name: 'Mercedes' }];
      const mockSeasons = [{ id: 1, year: 2000 }];
      const mockRaces = [{ id: 1, round: 1, season_id: 1 }];

      jest.spyOn(service as any, 'fetchAllErgastPages')
        .mockResolvedValueOnce([{ DriverStandings: [mockApiDriverStanding] }]) // driver standings
        .mockResolvedValueOnce([{ ConstructorStandings: [mockApiConstructorStanding] }]); // constructor standings

      queueMockResponses(
        { data: mockDrivers, error: null },
        { data: mockConstructors, error: null },
        { data: mockSeasons, error: null },
        { data: mockRaces, error: null },
        { data: [], error: null }
      );
      await service.ingestAllStandings();

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('drivers');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('constructors');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('seasons');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('races');
    }, 10000);

    it('should handle no final race found for year', async () => {
      setTestYearRange(2000, 2000);
      const mockDrivers = [{ id: 1, ergast_driver_ref: 'hamilton' }];
      const mockConstructors = [{ id: 1, name: 'Mercedes' }];
      const mockSeasons = [{ id: 1, year: 2000 }];
      const mockRaces: any[] = []; // No races

      jest.spyOn(service as any, 'fetchAllErgastPages')
        .mockResolvedValue([]);

      queueMockResponses(
        { data: mockDrivers, error: null },
        { data: mockConstructors, error: null },
        { data: mockSeasons, error: null },
        { data: mockRaces, error: null },
        { data: [], error: null }
      );
      await service.ingestAllStandings();

      // Should complete even with no races
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('seasons');
    });

  });

  describe('fetchAllErgastPages Helper Method', () => {
    it('should fetch all pages successfully', async () => {
      const mockResponse1 = {
        MRData: {
          total: '2',
          limit: '1',
          offset: '0',
          CircuitTable: {
            Circuits: [mockApiCircuit]
          }
        }
      };
      
      const mockResponse2 = {
        MRData: {
          total: '2',
          limit: '1',
          offset: '1',
          CircuitTable: {
            Circuits: [{ ...mockApiCircuit, circuitId: 'silverstone' }]
          }
        }
      };

      const mockResponse3 = {
        MRData: {
          total: '2',
          limit: '1',
          offset: '2',
          CircuitTable: {
            Circuits: []
          }
        }
      };

      (httpService.get as jest.Mock)
        .mockReturnValueOnce(of({ data: mockResponse1, status: 200, statusText: 'OK', headers: {}, config: {} as any }))
        .mockReturnValueOnce(of({ data: mockResponse2, status: 200, statusText: 'OK', headers: {}, config: {} as any }))
        .mockReturnValueOnce(of({ data: mockResponse3, status: 200, statusText: 'OK', headers: {}, config: {} as any }));

      const result = await service['fetchAllErgastPages']<ApiCircuit>('/circuits');

      expect(result).toHaveLength(2);
      // The service breaks early when allData.length >= total, so only 2 calls are made
      expect(httpService.get).toHaveBeenCalledTimes(2);
    });

    it('should handle rate limiting', async () => {
      const mockResponse = {
        MRData: {
          total: '1',
          limit: '1',
          offset: '0',
          CircuitTable: {
            Circuits: [mockApiCircuit]
          }
        }
      };

      const rateLimitError = {
        response: { status: 429 },
        message: 'Too Many Requests'
      };

      (httpService.get as jest.Mock)
        .mockReturnValueOnce(throwError(() => rateLimitError))
        .mockReturnValueOnce(of({ data: mockResponse, status: 200, statusText: 'OK', headers: {}, config: {} as any }));

      const result = await service['fetchAllErgastPages']<ApiCircuit>('/circuits');

      expect(result).toHaveLength(1);
      expect(httpService.get).toHaveBeenCalledTimes(2);
    });

    it('should handle network errors', async () => {
      const networkError = {
        response: { status: 500 },
        message: 'Internal Server Error'
      };

      (httpService.get as jest.Mock).mockReturnValue(throwError(() => networkError));

      await expect(service['fetchAllErgastPages']<ApiCircuit>('/circuits'))
        .rejects.toThrow('Failed to fetch complete dataset from /circuits due to network error.');
    });

    it('should handle laps endpoint pagination correctly', async () => {
      const mockLapResponse1 = {
        MRData: {
          total: '100',  // This is wrong for laps endpoint, but we should ignore it
          limit: '1',
          offset: '0',
          RaceTable: {
            Races: [{ Laps: [mockApiLap] }]
          }
        }
      };
      
      const mockLapResponse2 = {
        MRData: {
          total: '100',
          limit: '1',
          offset: '1',
          RaceTable: {
            Races: []  // Empty indicates end
          }
        }
      };

      (httpService.get as jest.Mock)
        .mockReturnValueOnce(of({ data: mockLapResponse1, status: 200, statusText: 'OK', headers: {}, config: {} as any }))
        .mockReturnValueOnce(of({ data: mockLapResponse2, status: 200, statusText: 'OK', headers: {}, config: {} as any }));

      const result = await service['fetchAllErgastPages']<any>('/2023/1/laps');

      expect(result).toHaveLength(1);
      expect(httpService.get).toHaveBeenCalledTimes(2);
    });

    it('should break early for non-laps endpoints when total is reached', async () => {
      const mockResponse = {
        MRData: {
          total: '1',
          limit: '100',
          offset: '0',
          CircuitTable: {
            Circuits: [mockApiCircuit]
          }
        }
      };

      (httpService.get as jest.Mock)
        .mockReturnValue(of({ data: mockResponse, status: 200, statusText: 'OK', headers: {}, config: {} as any }));

      const result = await service['fetchAllErgastPages']<ApiCircuit>('/circuits');

      expect(result).toHaveLength(1);
      expect(httpService.get).toHaveBeenCalledTimes(1); // Should only call once
    });

    it('should handle response with no table key', async () => {
      const mockResponse = {
        MRData: {
          total: '0',
          limit: '100',
          offset: '0'
        }
      };

      (httpService.get as jest.Mock)
        .mockReturnValue(of({ data: mockResponse, status: 200, statusText: 'OK', headers: {}, config: {} as any }));

      const result = await service['fetchAllErgastPages']<ApiCircuit>('/circuits');

      expect(result).toHaveLength(0);
    });

    it('should handle response with no data key', async () => {
      const mockResponse = {
        MRData: {
          total: '0',
          limit: '100',
          offset: '0',
          CircuitTable: {}
        }
      };

      (httpService.get as jest.Mock)
        .mockReturnValue(of({ data: mockResponse, status: 200, statusText: 'OK', headers: {}, config: {} as any }));

      const result = await service['fetchAllErgastPages']<ApiCircuit>('/circuits');

      expect(result).toHaveLength(0);
    });
  });

});