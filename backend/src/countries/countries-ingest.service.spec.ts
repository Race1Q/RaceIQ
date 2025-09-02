import { Test, TestingModule } from '@nestjs/testing';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { CountryIngestService } from './countries-ingest.service';
import { SupabaseService } from '../supabase/supabase.service';
import { Country } from './countries.entity';

describe('CountryIngestService', () => {
  let service: CountryIngestService;
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

  const mockApiCircuit = {
    circuitId: 'silverstone',
    circuitName: 'Silverstone Circuit',
    Location: {
      locality: 'Silverstone',
      country: 'Great Britain',
      lat: '52.0786',
      long: '-1.0169'
    },
    url: 'https://en.wikipedia.org/wiki/Silverstone_Circuit',
  };

  const mockApiResponse = {
    MRData: {
      CircuitTable: {
        Circuits: [mockApiCircuit],
      },
      total: '1',
      limit: '30',
      offset: '0'
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountryIngestService,
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

    service = module.get<CountryIngestService>(CountryIngestService);
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

      expect(httpService.get).toHaveBeenCalledWith('https://api.jolpi.ca/ergast/f1/circuits/?format=json&offset=0&limit=30');
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
            lat: '43.7347',
            long: '7.4206'
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
            total: '2',
            limit: '30',
            offset: '0'
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
            total: '0',
            limit: '30',
            offset: '0'
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

      await expect(service.fetchAllCircuitsFromAPI()).rejects.toThrow('Failed to fetch circuits data');
    });

    it('should throw error when API response is malformed', async () => {
      const malformedResponse = { data: { invalid: 'structure' } };
      mockHttpService.get.mockReturnValue(of(malformedResponse));

      await expect(service.fetchAllCircuitsFromAPI()).rejects.toThrow('Failed to fetch circuits data');
    });
  });

  describe('getCountryCode', () => {
    it('should return correct country codes for known countries', () => {
      const countryMap = {
        'Australia': 'AUS',
        'United Kingdom': 'GBR',
        'United States': 'USA',
        'France': 'FRA',
        'Germany': 'DEU',
        'Italy': 'ITA',
        'Spain': 'ESP'
      };

      Object.entries(countryMap).forEach(([countryName, expectedCode]) => {
        const result = (service as any).getCountryCode(countryName);
        expect(result).toBe(expectedCode);
      });
    });

    it('should generate country code for unknown countries', () => {
      const unknownCountry = 'TestCountry';
      const result = (service as any).getCountryCode(unknownCountry);
      expect(result).toBe('TES');
    });

    it('should handle special cases like UK and USA', () => {
      expect((service as any).getCountryCode('UK')).toBe('GBR');
      expect((service as any).getCountryCode('USA')).toBe('USA');
      expect((service as any).getCountryCode('United States')).toBe('USA');
    });
  });

  describe('ingestCountries', () => {
    it('should ingest countries successfully', async () => {
      // Mock the HTTP service to return the circuits data
      const mockResponse = { data: mockApiResponse };
      mockHttpService.get.mockReturnValue(of(mockResponse));

      // Mock the private processCountry method to return 'created'
      const processCountrySpy = jest.spyOn(service as any, 'processCountry')
        .mockResolvedValue('created');

      const result = await service.ingestCountries();

      expect(result).toEqual({ created: 1, updated: 0 });
      expect(processCountrySpy).toHaveBeenCalledWith('GRE', 'Great Britain');
      expect(mockHttpService.get).toHaveBeenCalledWith('https://api.jolpi.ca/ergast/f1/circuits/?format=json&offset=0&limit=30');
    });

    it('should handle multiple circuits with different countries', async () => {
      const multipleCircuits = [
        {
          circuitId: 'silverstone',
          circuitName: 'Silverstone Circuit',
          Location: {
            locality: 'Silverstone',
            country: 'Great Britain',
            lat: '52.0786',
            long: '-1.0169'
          },
          url: 'https://en.wikipedia.org/wiki/Silverstone_Circuit',
        },
        {
          circuitId: 'monaco',
          circuitName: 'Monaco Circuit',
          Location: {
            locality: 'Monte Carlo',
            country: 'Monaco',
            lat: '43.7347',
            long: '7.4206'
          },
          url: 'https://en.wikipedia.org/wiki/Monaco_Circuit',
        },
        {
          circuitId: 'spa',
          circuitName: 'Circuit de Spa-Francorchamps',
          Location: {
            locality: 'Spa',
            country: 'Belgium',
            lat: '50.4372',
            long: '5.9714'
          },
          url: 'https://en.wikipedia.org/wiki/Circuit_de_Spa-Francorchamps',
        }
      ];

      const mockResponse = {
        data: {
          MRData: {
            CircuitTable: {
              Circuits: multipleCircuits,
            },
            total: '3',
            limit: '30',
            offset: '0'
          },
        },
      };

      // Mock the HTTP service to return the circuits data
      mockHttpService.get.mockReturnValue(of(mockResponse));

      // Mock the private processCountry method to return 'created' for all countries
      const processCountrySpy = jest.spyOn(service as any, 'processCountry')
        .mockResolvedValue('created');

      const result = await service.ingestCountries();

      expect(result).toEqual({ created: 3, updated: 0 });
      expect(processCountrySpy).toHaveBeenCalledTimes(3);
      expect(processCountrySpy).toHaveBeenCalledWith('GRE', 'Great Britain');
      expect(processCountrySpy).toHaveBeenCalledWith('MCO', 'Monaco');
      expect(processCountrySpy).toHaveBeenCalledWith('BEL', 'Belgium');
    });

    it('should handle empty circuits array', async () => {
      // Mock the HTTP service to return empty circuits
      const emptyResponse = {
        data: {
          MRData: {
            CircuitTable: {
              Circuits: [],
            },
            total: '0',
            limit: '30',
            offset: '0'
          },
        },
      };
      mockHttpService.get.mockReturnValue(of(emptyResponse));

      const result = await service.ingestCountries();

      expect(result).toEqual({ created: 0, updated: 0 });
    });

    it('should handle duplicate countries from multiple circuits', async () => {
      const circuitsWithSameCountry = [
        {
          circuitId: 'silverstone',
          circuitName: 'Silverstone Circuit',
          Location: {
            locality: 'Silverstone',
            country: 'Great Britain',
            lat: '52.0786',
            long: '-1.0169'
          },
          url: 'https://en.wikipedia.org/wiki/Silverstone_Circuit',
        },
        {
          circuitId: 'brands_hatch',
          circuitName: 'Brands Hatch',
          Location: {
            locality: 'Kent',
            country: 'Great Britain',
            lat: '51.3569',
            long: '0.2639'
          },
          url: 'https://en.wikipedia.org/wiki/Brands_Hatch',
        }
      ];

      const mockResponse = {
        data: {
          MRData: {
            CircuitTable: {
              Circuits: circuitsWithSameCountry,
            },
            total: '2',
            limit: '30',
            offset: '0'
          },
        },
      };

      // Mock the HTTP service to return the circuits data
      mockHttpService.get.mockReturnValue(of(mockResponse));

      // Mock the private processCountry method to return 'created' for the unique country
      const processCountrySpy = jest.spyOn(service as any, 'processCountry')
        .mockResolvedValue('created');

      const result = await service.ingestCountries();

      // Should only process one unique country (Great Britain)
      expect(result).toEqual({ created: 1, updated: 0 });
      expect(processCountrySpy).toHaveBeenCalledTimes(1);
      expect(processCountrySpy).toHaveBeenCalledWith('GRE', 'Great Britain');
    });

    it('should handle mixed created and updated results', async () => {
      const mockResponse = { data: mockApiResponse };
      mockHttpService.get.mockReturnValue(of(mockResponse));

      // Mock the private processCountry method to return mixed results
      const processCountrySpy = jest.spyOn(service as any, 'processCountry')
        .mockResolvedValueOnce('created')
        .mockResolvedValueOnce('updated');

      const result = await service.ingestCountries();

      expect(result).toEqual({ created: 1, updated: 0 }); // Only one country in this case
      expect(processCountrySpy).toHaveBeenCalledTimes(1);
    });

    it('should handle errors during country processing gracefully', async () => {
      const mockResponse = { data: mockApiResponse };
      mockHttpService.get.mockReturnValue(of(mockResponse));

      // Mock the private processCountry method to throw an error
      const processCountrySpy = jest.spyOn(service as any, 'processCountry')
        .mockRejectedValue(new Error('Database error'));

      const result = await service.ingestCountries();

      // Should continue processing and return 0 created/updated due to error
      expect(result).toEqual({ created: 0, updated: 0 });
      expect(processCountrySpy).toHaveBeenCalledWith('GRE', 'Great Britain');
    });
  });

  describe('verifyCountries', () => {
    it('should fetch countries from database successfully', async () => {
      const mockCountries = [
        { iso3: 'USA', country_name: 'United States' },
        { iso3: 'GBR', country_name: 'Great Britain' }
      ];

      const mockChain = {
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockImplementation(() => Promise.resolve({ data: mockCountries, error: null }))
        })
      };
      mockSupabaseService.client.from.mockReturnValue(mockChain);

      await service.verifyCountries();

      expect(mockSupabaseService.client.from).toHaveBeenCalledWith('countries');
    });

    it('should handle database errors gracefully', async () => {
      const mockChain = {
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockImplementation(() => Promise.resolve({ data: null, error: { message: 'Database error' } }))
        })
      };
      mockSupabaseService.client.from.mockReturnValue(mockChain);

      await expect(service.verifyCountries()).resolves.toBeUndefined();
      expect(mockSupabaseService.client.from).toHaveBeenCalledWith('countries');
    });
  });

  describe('service structure', () => {
    it('should have all required methods', () => {
      expect(typeof service.fetchAllCircuitsFromAPI).toBe('function');
      expect(typeof service.ingestCountries).toBe('function');
      expect(typeof service.verifyCountries).toBe('function');
    });

    it('should be injectable', () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(CountryIngestService);
    });
  });
});
