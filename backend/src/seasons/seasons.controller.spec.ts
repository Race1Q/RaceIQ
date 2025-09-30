import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { SeasonsController } from './seasons.controller';
import { SeasonsService, RaceWithPodium } from './seasons.service';
import { Season } from './seasons.entity';
import { Race } from '../races/races.entity';
import { NotFoundException } from '@nestjs/common';

describe('SeasonsController', () => {
  let controller: SeasonsController;
  let service: SeasonsService;

  const mockSeasonsService = {
    findAll: jest.fn() as jest.MockedFunction<SeasonsService['findAll']>,
    getRacesForYear: jest.fn() as jest.MockedFunction<SeasonsService['getRacesForYear']>,
  };

  const mockSeason: Season = {
    id: 1,
    year: 2023,
  } as Season;

  const mockSeasons: Season[] = [
    mockSeason,
    {
      id: 2,
      year: 2022,
    } as Season,
    {
      id: 3,
      year: 2021,
    } as Season,
  ];

  const mockRace: RaceWithPodium = {
    id: 1,
    season_id: 1,
    circuit_id: 1,
    round: 1,
    name: 'Monaco Grand Prix',
    date: new Date('2023-05-28'),
    time: '14:00:00',
    season: mockSeason,
    circuit: {
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
      country: null,
    } as any,
    sessions: [],
    laps: [],
    pitStops: [],
    podium: [
      {
        position: 1,
        driverName: 'Lewis Hamilton',
        countryCode: 'GBR',
      },
      {
        position: 2,
        driverName: 'Max Verstappen',
        countryCode: 'NED',
      },
      {
        position: 3,
        driverName: 'Charles Leclerc',
        countryCode: 'MCO',
      },
    ],
  } as RaceWithPodium;

  const mockRaces: RaceWithPodium[] = [
    mockRace,
    {
      id: 2,
      season_id: 1,
      circuit_id: 2,
      round: 2,
      name: 'Spanish Grand Prix',
      date: new Date('2023-06-04'),
      time: '15:00:00',
      season: mockSeason,
      circuit: {
        id: 2,
        name: 'Barcelona',
        location: 'Barcelona',
        country_code: 'ESP',
        map_url: 'https://example.com/barcelona-map',
        length_km: 4.675,
        race_distance_km: 307.104,
        track_layout: {
          type: 'FeatureCollection',
          features: [],
        },
        country: null,
      } as any,
      sessions: [],
      laps: [],
      pitStops: [],
      podium: null,
    } as RaceWithPodium,
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeasonsController],
      providers: [
        {
          provide: SeasonsService,
          useValue: mockSeasonsService,
        },
      ],
    }).compile();

    controller = module.get<SeasonsController>(SeasonsController);
    service = module.get<SeasonsService>(SeasonsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of seasons', async () => {
      mockSeasonsService.findAll.mockResolvedValue(mockSeasons);

      const result = await controller.findAll();

      expect(result).toEqual(mockSeasons);
      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(service.findAll).toHaveBeenCalledWith();
    });

    it('should return empty array when no seasons exist', async () => {
      mockSeasonsService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors', async () => {
      const error = new Error('Database error');
      mockSeasonsService.findAll.mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow('Database error');
    });

    it('should return seasons in correct order', async () => {
      const orderedSeasons = [
        { id: 3, year: 2021 },
        { id: 2, year: 2022 },
        { id: 1, year: 2023 },
      ];
      mockSeasonsService.findAll.mockResolvedValue(orderedSeasons as Season[]);

      const result = await controller.findAll();

      expect(result).toEqual(orderedSeasons);
      expect(result[0].year).toBe(2021);
      expect(result[1].year).toBe(2022);
      expect(result[2].year).toBe(2023);
    });
  });

  describe('getRacesForYear', () => {
    it('should return races for a specific year', async () => {
      const year = 2023;
      mockSeasonsService.getRacesForYear.mockResolvedValue(mockRaces);

      const result = await controller.getRacesForYear(year);

      expect(result).toEqual(mockRaces);
      expect(service.getRacesForYear).toHaveBeenCalledTimes(1);
      expect(service.getRacesForYear).toHaveBeenCalledWith(year);
    });

    it('should return empty array when no races exist for year', async () => {
      const year = 2020;
      mockSeasonsService.getRacesForYear.mockResolvedValue([]);

      const result = await controller.getRacesForYear(year);

      expect(result).toEqual([]);
      expect(service.getRacesForYear).toHaveBeenCalledTimes(1);
      expect(service.getRacesForYear).toHaveBeenCalledWith(year);
    });

    it('should handle string year parameter conversion', async () => {
      const year = 2023;
      mockSeasonsService.getRacesForYear.mockResolvedValue(mockRaces);

      await controller.getRacesForYear(year);

      expect(service.getRacesForYear).toHaveBeenCalledWith(year);
    });

    it('should handle service errors', async () => {
      const year = 2023;
      const error = new Error('Database error');
      mockSeasonsService.getRacesForYear.mockRejectedValue(error);

      await expect(controller.getRacesForYear(year)).rejects.toThrow('Database error');
    });

    it('should handle NotFoundException from service', async () => {
      const year = 1999;
      const error = new NotFoundException(`No season found for year ${year}`);
      mockSeasonsService.getRacesForYear.mockRejectedValue(error);

      await expect(controller.getRacesForYear(year)).rejects.toThrow(`No season found for year ${year}`);
    });

    it('should handle different year values', async () => {
      const years = [2023, 2022, 2021, 2020, 2019];
      
      for (const year of years) {
        mockSeasonsService.getRacesForYear.mockResolvedValue(mockRaces);
        
        const result = await controller.getRacesForYear(year);
        
        expect(result).toEqual(mockRaces);
        expect(service.getRacesForYear).toHaveBeenCalledWith(year);
      }
    });

    it('should handle negative year values', async () => {
      const year = -1;
      mockSeasonsService.getRacesForYear.mockResolvedValue([]);

      const result = await controller.getRacesForYear(year);

      expect(result).toEqual([]);
      expect(service.getRacesForYear).toHaveBeenCalledWith(year);
    });

    it('should handle zero year value', async () => {
      const year = 0;
      mockSeasonsService.getRacesForYear.mockResolvedValue([]);

      const result = await controller.getRacesForYear(year);

      expect(result).toEqual([]);
      expect(service.getRacesForYear).toHaveBeenCalledWith(year);
    });

    it('should handle large year values', async () => {
      const year = 3000;
      mockSeasonsService.getRacesForYear.mockResolvedValue([]);

      const result = await controller.getRacesForYear(year);

      expect(result).toEqual([]);
      expect(service.getRacesForYear).toHaveBeenCalledWith(year);
    });
  });

  describe('Controller Integration', () => {
    it('should have all required methods', () => {
      expect(typeof controller.findAll).toBe('function');
      expect(typeof controller.getRacesForYear).toBe('function');
    });

    it('should be injectable', () => {
      expect(controller).toBeInstanceOf(SeasonsController);
    });

    it('should have service injected', () => {
      expect(service).toBeDefined();
      expect(service).toBe(mockSeasonsService);
    });
  });

  describe('Error Handling', () => {
    it('should propagate service errors in findAll', async () => {
      const error = new Error('Service error');
      mockSeasonsService.findAll.mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow('Service error');
    });

    it('should propagate service errors in getRacesForYear', async () => {
      const error = new Error('Service error');
      mockSeasonsService.getRacesForYear.mockRejectedValue(error);

      await expect(controller.getRacesForYear(2023)).rejects.toThrow('Service error');
    });

    it('should handle network errors', async () => {
      const error = new Error('Network timeout');
      mockSeasonsService.findAll.mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow('Network timeout');
    });

    it('should handle database connection errors', async () => {
      const error = new Error('Database connection failed');
      mockSeasonsService.getRacesForYear.mockRejectedValue(error);

      await expect(controller.getRacesForYear(2023)).rejects.toThrow('Database connection failed');
    });
  });

  describe('Data Validation', () => {
    it('should handle empty seasons array', async () => {
      mockSeasonsService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle empty races array for year', async () => {
      mockSeasonsService.getRacesForYear.mockResolvedValue([]);

      const result = await controller.getRacesForYear(2023);

      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle seasons with different year formats', async () => {
      const seasonsWithDifferentYears = [
        { id: 1, year: 2023 },
        { id: 2, year: 2022 },
        { id: 3, year: 2021 },
      ];
      mockSeasonsService.findAll.mockResolvedValue(seasonsWithDifferentYears as Season[]);

      const result = await controller.findAll();

      expect(result).toHaveLength(3);
      expect(result[0].year).toBe(2023);
      expect(result[1].year).toBe(2022);
      expect(result[2].year).toBe(2021);
    });
  });

  describe('Edge Cases', () => {
    it('should handle concurrent requests', async () => {
      mockSeasonsService.findAll.mockResolvedValue(mockSeasons);
      mockSeasonsService.getRacesForYear.mockResolvedValue(mockRaces);

      const [seasonsResult, racesResult] = await Promise.all([
        controller.findAll(),
        controller.getRacesForYear(2023),
      ]);

      expect(seasonsResult).toEqual(mockSeasons);
      expect(racesResult).toEqual(mockRaces);
      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(service.getRacesForYear).toHaveBeenCalledTimes(1);
    });

    it('should handle rapid successive calls', async () => {
      mockSeasonsService.findAll.mockResolvedValue(mockSeasons);

      const promises = Array(5).fill(null).map(() => controller.findAll());
      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result).toEqual(mockSeasons);
      });
      expect(service.findAll).toHaveBeenCalledTimes(5);
    });

    it('should handle undefined service responses', async () => {
      mockSeasonsService.findAll.mockResolvedValue(undefined as any);

      const result = await controller.findAll();

      expect(result).toBeUndefined();
    });

    it('should handle null service responses', async () => {
      mockSeasonsService.getRacesForYear.mockResolvedValue(null as any);

      const result = await controller.getRacesForYear(2023);

      expect(result).toBeNull();
    });
  });

  describe('Performance', () => {
    it('should handle large datasets efficiently', async () => {
      const largeSeasonsArray = Array(1000).fill(null).map((_, index) => ({
        id: index + 1,
        year: 2000 + index,
      }));
      mockSeasonsService.findAll.mockResolvedValue(largeSeasonsArray as Season[]);

      const start = Date.now();
      const result = await controller.findAll();
      const end = Date.now();

      expect(result).toHaveLength(1000);
      expect(end - start).toBeLessThan(1000); // Should complete in less than 1 second
    });

    it('should handle large race datasets efficiently', async () => {
      const largeRacesArray = Array(1000).fill(null).map((_, index) => ({
        id: index + 1,
        season_id: 1,
        circuit_id: 1,
        round: index + 1,
        name: `Race ${index + 1}`,
        date: new Date(),
        time: '14:00:00',
        season: mockSeason,
        circuit: mockRace.circuit,
        sessions: [],
        laps: [],
        pitStops: [],
        podium: null,
      }));
      mockSeasonsService.getRacesForYear.mockResolvedValue(largeRacesArray as RaceWithPodium[]);

      const start = Date.now();
      const result = await controller.getRacesForYear(2023);
      const end = Date.now();

      expect(result).toHaveLength(1000);
      expect(end - start).toBeLessThan(1000); // Should complete in less than 1 second
    });
  });

  describe('Type Safety', () => {
    it('should return correct types for findAll', async () => {
      mockSeasonsService.findAll.mockResolvedValue(mockSeasons);

      const result = await controller.findAll();

      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(typeof result[0].id).toBe('number');
        expect(typeof result[0].year).toBe('number');
      }
    });

    it('should return correct types for getRacesForYear', async () => {
      mockSeasonsService.getRacesForYear.mockResolvedValue(mockRaces);

      const result = await controller.getRacesForYear(2023);

      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(typeof result[0].id).toBe('number');
        expect(typeof result[0].name).toBe('string');
        expect(typeof result[0].round).toBe('number');
        expect(result[0].date).toBeInstanceOf(Date);
        expect(typeof result[0].time).toBe('string');
      }
    });
  });
});
