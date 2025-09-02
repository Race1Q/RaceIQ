import { Test, TestingModule } from '@nestjs/testing';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { CountriesController } from './countries.controller';
import { CountriesService } from './countries.service';
import { CountryIngestService } from './countries-ingest.service';
import { Country } from './countries.entity';

describe('CountriesController', () => {
  let controller: CountriesController;
  let countriesService: CountriesService;
  let countryIngestService: CountryIngestService;

  const mockCountriesService = {
    getAllCountries: jest.fn(),
    testConnection: jest.fn(),
    searchCountries: jest.fn(),
    getCountryByCode: jest.fn(),
    createCountry: jest.fn(),
    updateCountry: jest.fn(),
    deleteCountry: jest.fn(),
  };

  const mockCountryIngestService = {
    ingestCountries: jest.fn(),
  };

  const mockCountry: Country = {
    iso3: 'USA',
    country_name: 'United States',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CountriesController],
      providers: [
        {
          provide: CountriesService,
          useValue: mockCountriesService,
        },
        {
          provide: CountryIngestService,
          useValue: mockCountryIngestService,
        },
      ],
    }).compile();

    controller = module.get<CountriesController>(CountriesController);
    countriesService = module.get<CountriesService>(CountriesService);
    countryIngestService = module.get<CountryIngestService>(CountryIngestService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('ingestCountries', () => {
    it('should call countryIngestService.ingestCountries', async () => {
      const mockResult = { created: 5, updated: 2 };
      mockCountryIngestService.ingestCountries.mockResolvedValue(mockResult);

      const result = await controller.ingestCountries();

      expect(result).toEqual(mockResult);
      expect(countryIngestService.ingestCountries).toHaveBeenCalled();
    });
  });

  describe('getAllCountries', () => {
    it('should return all countries', async () => {
      const mockCountries = [mockCountry];
      mockCountriesService.getAllCountries.mockResolvedValue(mockCountries);

      const result = await controller.getAllCountries();

      expect(result).toEqual(mockCountries);
      expect(countriesService.getAllCountries).toHaveBeenCalled();
    });
  });

  describe('testConnection', () => {
    it('should return connection test result', async () => {
      mockCountriesService.testConnection.mockResolvedValue(true);

      const result = await controller.testConnection();

      expect(result).toEqual({ success: true });
      expect(countriesService.testConnection).toHaveBeenCalled();
    });

    it('should handle connection failure', async () => {
      mockCountriesService.testConnection.mockResolvedValue(false);

      const result = await controller.testConnection();

      expect(result).toEqual({ success: false });
      expect(countriesService.testConnection).toHaveBeenCalled();
    });
  });

  describe('searchCountries', () => {
    it('should search countries by query', async () => {
      const query = 'USA';
      const mockCountries = [mockCountry];
      mockCountriesService.searchCountries.mockResolvedValue(mockCountries);

      const result = await controller.searchCountries(query);

      expect(result).toEqual(mockCountries);
      expect(countriesService.searchCountries).toHaveBeenCalledWith(query);
    });
  });

  describe('getCountryByCode', () => {
    it('should return country by ISO3 code', async () => {
      const iso3 = 'USA';
      mockCountriesService.getCountryByCode.mockResolvedValue(mockCountry);

      const result = await controller.getCountryByCode(iso3);

      expect(result).toEqual(mockCountry);
      expect(countriesService.getCountryByCode).toHaveBeenCalledWith(iso3);
    });

    it('should return null for non-existent country', async () => {
      const iso3 = 'XXX';
      mockCountriesService.getCountryByCode.mockResolvedValue(null);

      const result = await controller.getCountryByCode(iso3);

      expect(result).toBeNull();
      expect(countriesService.getCountryByCode).toHaveBeenCalledWith(iso3);
    });
  });

  describe('createCountry', () => {
    it('should create a new country', async () => {
      const newCountry: Country = {
        iso3: 'CAN',
        country_name: 'Canada',
      };
      mockCountriesService.createCountry.mockResolvedValue(undefined);

      await controller.createCountry(newCountry);

      expect(countriesService.createCountry).toHaveBeenCalledWith(newCountry);
    });
  });

  describe('updateCountry', () => {
    it('should update an existing country', async () => {
      const iso3 = 'USA';
      const updateData = { country_name: 'United States of America' };
      mockCountriesService.updateCountry.mockResolvedValue(undefined);

      await controller.updateCountry(iso3, updateData);

      expect(countriesService.updateCountry).toHaveBeenCalledWith(iso3, updateData);
    });
  });

  describe('deleteCountry', () => {
    it('should delete a country', async () => {
      const iso3 = 'USA';
      mockCountriesService.deleteCountry.mockResolvedValue(undefined);

      await controller.deleteCountry(iso3);

      expect(countriesService.deleteCountry).toHaveBeenCalledWith(iso3);
    });
  });

  describe('controller structure', () => {
    it('should have all required methods', () => {
      expect(typeof controller.ingestCountries).toBe('function');
      expect(typeof controller.getAllCountries).toBe('function');
      expect(typeof controller.testConnection).toBe('function');
      expect(typeof controller.searchCountries).toBe('function');
      expect(typeof controller.getCountryByCode).toBe('function');
      expect(typeof controller.createCountry).toBe('function');
      expect(typeof controller.updateCountry).toBe('function');
      expect(typeof controller.deleteCountry).toBe('function');
    });

    it('should be injectable', () => {
      expect(controller).toBeDefined();
      expect(controller).toBeInstanceOf(CountriesController);
    });
  });
});
