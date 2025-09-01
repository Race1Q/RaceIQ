import { Test, TestingModule } from '@nestjs/testing';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { CountriesService } from './countries.service';
import { SupabaseService } from '../supabase/supabase.service';
import { Country } from './countries.entity';

describe('CountriesService', () => {
  let service: CountriesService;
  let supabaseService: SupabaseService;

  const mockSupabaseService = {
    client: {
      from: jest.fn(),
    },
  };

  const mockCountry: Country = {
    iso3: 'USA',
    country_name: 'United States',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountriesService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<CountriesService>(CountriesService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('testConnection', () => {
    it('should return true when connection is successful', async () => {
      const mockChain = {
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockImplementation(() => Promise.resolve({ data: [{ count: 1 }], error: null }))
        })
      };
      mockSupabaseService.client.from.mockReturnValue(mockChain);

      const result = await service.testConnection();

      expect(result).toBe(true);
      expect(mockSupabaseService.client.from).toHaveBeenCalledWith('countries');
    });

    it('should return false when connection fails', async () => {
      const mockChain = {
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockImplementation(() => Promise.resolve({ data: null, error: { message: 'Connection failed' } }))
        })
      };
      mockSupabaseService.client.from.mockReturnValue(mockChain);

      const result = await service.testConnection();

      expect(result).toBe(false);
      expect(mockSupabaseService.client.from).toHaveBeenCalledWith('countries');
    });

    it('should return false when exception occurs', async () => {
      const mockChain = {
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockImplementation(() => Promise.reject(new Error('Database error')))
        })
      };
      mockSupabaseService.client.from.mockReturnValue(mockChain);

      const result = await service.testConnection();

      expect(result).toBe(false);
      expect(mockSupabaseService.client.from).toHaveBeenCalledWith('countries');
    });
  });

  describe('getAllCountries', () => {
    it('should return all countries successfully', async () => {
      const mockCountries = [mockCountry];
      const mockChain = {
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockImplementation(() => Promise.resolve({ data: mockCountries, error: null }))
        })
      };
      mockSupabaseService.client.from.mockReturnValue(mockChain);

      const result = await service.getAllCountries();

      expect(result).toEqual(mockCountries);
      expect(mockSupabaseService.client.from).toHaveBeenCalledWith('countries');
    });

    it('should throw error when database query fails', async () => {
      const mockChain = {
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockImplementation(() => Promise.resolve({ data: null, error: { message: 'Query failed' } }))
        })
      };
      mockSupabaseService.client.from.mockReturnValue(mockChain);

      await expect(service.getAllCountries()).rejects.toThrow('Failed to fetch countries');
      expect(mockSupabaseService.client.from).toHaveBeenCalledWith('countries');
    });
  });

  describe('getCountryByCode', () => {
    it('should return country by ISO3 code', async () => {
      const mockChain = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockImplementation(() => Promise.resolve({ data: mockCountry, error: null }))
          })
        })
      };
      mockSupabaseService.client.from.mockReturnValue(mockChain);

      const result = await service.getCountryByCode('USA');

      expect(result).toEqual(mockCountry);
      expect(mockSupabaseService.client.from).toHaveBeenCalledWith('countries');
    });

    it('should return null when country not found', async () => {
      const mockChain = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockImplementation(() => Promise.resolve({ data: null, error: { code: 'PGRST116' } }))
          })
        })
      };
      mockSupabaseService.client.from.mockReturnValue(mockChain);

      const result = await service.getCountryByCode('XXX');

      expect(result).toBeNull();
      expect(mockSupabaseService.client.from).toHaveBeenCalledWith('countries');
    });

    it('should return null when database error occurs', async () => {
      const mockChain = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockImplementation(() => Promise.resolve({ data: null, error: { message: 'Database error' } }))
          })
        })
      };
      mockSupabaseService.client.from.mockReturnValue(mockChain);

      const result = await service.getCountryByCode('999');

      expect(result).toBeNull();
      expect(mockSupabaseService.client.from).toHaveBeenCalledWith('countries');
    });
  });

  describe('searchCountries', () => {
    it('should search countries successfully', async () => {
      const mockCountries = [mockCountry];
      const mockChain = {
        select: jest.fn().mockReturnValue({
          or: jest.fn().mockReturnValue({
            order: jest.fn().mockImplementation(() => Promise.resolve({ data: mockCountries, error: null }))
          })
        })
      };
      mockSupabaseService.client.from.mockReturnValue(mockChain);

      const result = await service.searchCountries('USA');

      expect(result).toEqual(mockCountries);
      expect(mockSupabaseService.client.from).toHaveBeenCalledWith('countries');
    });

    it('should throw error when search fails', async () => {
      const mockChain = {
        select: jest.fn().mockReturnValue({
          or: jest.fn().mockReturnValue({
            order: jest.fn().mockImplementation(() => Promise.resolve({ data: null, error: { message: 'Search failed' } }))
          })
        })
      };
      mockSupabaseService.client.from.mockReturnValue(mockChain);

      await expect(service.searchCountries('USA')).rejects.toThrow('Failed to search countries');
      expect(mockSupabaseService.client.from).toHaveBeenCalledWith('countries');
    });
  });

  describe('createCountry', () => {
    it('should create country successfully', async () => {
      const mockChain = {
        insert: jest.fn().mockImplementation(() => Promise.resolve({ data: null, error: null }))
      };
      mockSupabaseService.client.from.mockReturnValue(mockChain);

      await service.createCountry(mockCountry);

      expect(mockSupabaseService.client.from).toHaveBeenCalledWith('countries');
    });

    it('should throw error when creation fails', async () => {
      const mockChain = {
        insert: jest.fn().mockImplementation(() => Promise.resolve({ data: null, error: { message: 'Creation failed' } }))
      };
      mockSupabaseService.client.from.mockReturnValue(mockChain);

      await expect(service.createCountry(mockCountry)).rejects.toThrow('Failed to create country: Creation failed');
      expect(mockSupabaseService.client.from).toHaveBeenCalledWith('countries');
    });
  });

  describe('updateCountry', () => {
    it('should update country successfully', async () => {
      const mockChain = {
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockImplementation(() => Promise.resolve({ data: null, error: null }))
        })
      };
      mockSupabaseService.client.from.mockReturnValue(mockChain);

      await service.updateCountry('USA', { country_name: 'United States of America' });

      expect(mockSupabaseService.client.from).toHaveBeenCalledWith('countries');
    });

    it('should throw error when update fails', async () => {
      const mockChain = {
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockImplementation(() => Promise.resolve({ data: null, error: { message: 'Update failed' } }))
        })
      };
      mockSupabaseService.client.from.mockReturnValue(mockChain);

      await expect(service.updateCountry('USA', { country_name: 'United States of America' })).rejects.toThrow('Failed to update country: Update failed');
      expect(mockSupabaseService.client.from).toHaveBeenCalledWith('countries');
    });
  });

  describe('deleteCountry', () => {
    it('should delete country successfully', async () => {
      const mockChain = {
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockImplementation(() => Promise.resolve({ data: null, error: null }))
        })
      };
      mockSupabaseService.client.from.mockReturnValue(mockChain);

      await service.deleteCountry('USA');

      expect(mockSupabaseService.client.from).toHaveBeenCalledWith('countries');
    });

    it('should throw error when deletion fails', async () => {
      const mockChain = {
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockImplementation(() => Promise.resolve({ data: null, error: { message: 'Deletion failed' } }))
        })
      };
      mockSupabaseService.client.from.mockReturnValue(mockChain);

      await expect(service.deleteCountry('USA')).rejects.toThrow('Failed to delete country: Deletion failed');
      expect(mockSupabaseService.client.from).toHaveBeenCalledWith('countries');
    });
  });

  describe('service structure', () => {
    it('should have all required methods', () => {
      expect(typeof service.testConnection).toBe('function');
      expect(typeof service.getAllCountries).toBe('function');
      expect(typeof service.getCountryByCode).toBe('function');
      expect(typeof service.searchCountries).toBe('function');
      expect(typeof service.createCountry).toBe('function');
      expect(typeof service.updateCountry).toBe('function');
      expect(typeof service.deleteCountry).toBe('function');
    });

    it('should be injectable', () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(CountriesService);
    });
  });
});
