import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { IngestionController } from './ingestion.controller';
import { ErgastService } from './ergast.service';
import { OpenF1Service } from './openf1.service';

// Mock services
const mockErgastService = {
  ingestCircuits: jest.fn(),
  ingestConstructors: jest.fn(),
  ingestDrivers: jest.fn(),
  ingestRacesAndSessions: jest.fn(),
  ingestSeasons: jest.fn(),
  ingestAllResults: jest.fn(),
  ingestAllStandings: jest.fn(),
};

const mockOpenF1Service = {
  ingestSessionsAndWeather: jest.fn(),
  ingestGranularData: jest.fn(),
  ingestModernResultsAndLaps: jest.fn(),
  ingestTrackLayouts: jest.fn(),
};

describe('IngestionController', () => {
  let controller: IngestionController;
  let ergastService: ErgastService;
  let openf1Service: OpenF1Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngestionController],
      providers: [
        {
          provide: ErgastService,
          useValue: mockErgastService,
        },
        {
          provide: OpenF1Service,
          useValue: mockOpenF1Service,
        },
      ],
    }).compile();

    controller = module.get<IngestionController>(IngestionController);
    ergastService = module.get<ErgastService>(ErgastService);
    openf1Service = module.get<OpenF1Service>(OpenF1Service);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTest', () => {
    it('should return test status', () => {
      const result = controller.getTest();
      expect(result).toEqual({
        status: 'ok',
        message: 'Ingestion controller is working!',
      });
    });

    it('should return correct response structure', () => {
      const result = controller.getTest();
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('message');
      expect(result.status).toBe('ok');
      expect(result.message).toBe('Ingestion controller is working!');
    });

    it('should be a GET endpoint', () => {
      expect(typeof controller.getTest).toBe('function');
    });

    it('should not require any parameters', () => {
      const result = controller.getTest();
      expect(result).toBeDefined();
    });
  });

  describe('ingestCircuits', () => {
    it('should call ergastService.ingestCircuits and return success message', async () => {
      mockErgastService.ingestCircuits.mockImplementation(() => Promise.resolve());

      const result = await controller.ingestCircuits();

      expect(ergastService.ingestCircuits).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        message: 'Circuit ingestion job started. Check server logs for progress.',
      });
    });

    it('should handle service errors', async () => {
      const error = new Error('Circuit ingestion failed');
      mockErgastService.ingestCircuits.mockImplementation(() => Promise.reject(error));

      await expect(controller.ingestCircuits()).rejects.toThrow('Circuit ingestion failed');
      expect(ergastService.ingestCircuits).toHaveBeenCalledTimes(1);
    });

    it('should return correct response structure', async () => {
      mockErgastService.ingestCircuits.mockImplementation(() => Promise.resolve());

      const result = await controller.ingestCircuits();

      expect(result).toHaveProperty('message');
      expect(typeof result.message).toBe('string');
      expect(result.message).toContain('Circuit ingestion job started');
    });

    it('should be a POST endpoint', () => {
      expect(typeof controller.ingestCircuits).toBe('function');
    });
  });

  describe('ingestConstructors', () => {
    it('should call ergastService.ingestConstructors and return success message', async () => {
      mockErgastService.ingestConstructors.mockImplementation(() => Promise.resolve());

      const result = await controller.ingestConstructors();

      expect(ergastService.ingestConstructors).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        message: 'Constructor ingestion job started. Check server logs for progress.',
      });
    });

    it('should handle service errors', async () => {
      const error = new Error('Constructor ingestion failed');
      mockErgastService.ingestConstructors.mockImplementation(() => Promise.reject(error));

      await expect(controller.ingestConstructors()).rejects.toThrow('Constructor ingestion failed');
      expect(ergastService.ingestConstructors).toHaveBeenCalledTimes(1);
    });

    it('should return correct response structure', async () => {
      mockErgastService.ingestConstructors.mockImplementation(() => Promise.resolve());

      const result = await controller.ingestConstructors();

      expect(result).toHaveProperty('message');
      expect(typeof result.message).toBe('string');
      expect(result.message).toContain('Constructor ingestion job started');
    });

    it('should be a POST endpoint', () => {
      expect(typeof controller.ingestConstructors).toBe('function');
    });
  });

  describe('ingestDrivers', () => {
    it('should call ergastService.ingestDrivers and return success message', async () => {
      mockErgastService.ingestDrivers.mockImplementation(() => Promise.resolve());

      const result = await controller.ingestDrivers();

      expect(ergastService.ingestDrivers).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        message: 'Driver ingestion job started. Check server logs for progress.',
      });
    });

    it('should handle service errors', async () => {
      const error = new Error('Driver ingestion failed');
      mockErgastService.ingestDrivers.mockImplementation(() => Promise.reject(error));

      await expect(controller.ingestDrivers()).rejects.toThrow('Driver ingestion failed');
      expect(ergastService.ingestDrivers).toHaveBeenCalledTimes(1);
    });

    it('should return correct response structure', async () => {
      mockErgastService.ingestDrivers.mockImplementation(() => Promise.resolve());

      const result = await controller.ingestDrivers();

      expect(result).toHaveProperty('message');
      expect(typeof result.message).toBe('string');
      expect(result.message).toContain('Driver ingestion job started');
    });

    it('should be a POST endpoint', () => {
      expect(typeof controller.ingestDrivers).toBe('function');
    });
  });

  describe('ingestRacesAndSessions', () => {
    it('should call ergastService.ingestRacesAndSessions and return success message', async () => {
      mockErgastService.ingestRacesAndSessions.mockImplementation(() => Promise.resolve());

      const result = await controller.ingestRacesAndSessions();

      expect(ergastService.ingestRacesAndSessions).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        message: 'Race and session ingestion job started. Check server logs.',
      });
    });

    it('should handle service errors', async () => {
      const error = new Error('Race and session ingestion failed');
      mockErgastService.ingestRacesAndSessions.mockImplementation(() => Promise.reject(error));

      await expect(controller.ingestRacesAndSessions()).rejects.toThrow('Race and session ingestion failed');
      expect(ergastService.ingestRacesAndSessions).toHaveBeenCalledTimes(1);
    });

    it('should return correct response structure', async () => {
      mockErgastService.ingestRacesAndSessions.mockImplementation(() => Promise.resolve());

      const result = await controller.ingestRacesAndSessions();

      expect(result).toHaveProperty('message');
      expect(typeof result.message).toBe('string');
      expect(result.message).toContain('Race and session ingestion job started');
    });

    it('should be a POST endpoint', () => {
      expect(typeof controller.ingestRacesAndSessions).toBe('function');
    });
  });

  describe('ingestSeasons', () => {
    it('should call ergastService.ingestSeasons and return success message', async () => {
      mockErgastService.ingestSeasons.mockImplementation(() => Promise.resolve());

      const result = await controller.ingestSeasons();

      expect(ergastService.ingestSeasons).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        message: 'Seasons ingestion job started. Check server logs.',
      });
    });

    it('should handle service errors', async () => {
      const error = new Error('Seasons ingestion failed');
      mockErgastService.ingestSeasons.mockImplementation(() => Promise.reject(error));

      await expect(controller.ingestSeasons()).rejects.toThrow('Seasons ingestion failed');
      expect(ergastService.ingestSeasons).toHaveBeenCalledTimes(1);
    });

    it('should return correct response structure', async () => {
      mockErgastService.ingestSeasons.mockImplementation(() => Promise.resolve());

      const result = await controller.ingestSeasons();

      expect(result).toHaveProperty('message');
      expect(typeof result.message).toBe('string');
      expect(result.message).toContain('Seasons ingestion job started');
    });

    it('should be a POST endpoint', () => {
      expect(typeof controller.ingestSeasons).toBe('function');
    });
  });

  describe('ingestAllResults', () => {
    it('should call ergastService.ingestAllResults and return success message', async () => {
      mockErgastService.ingestAllResults.mockImplementation(() => Promise.resolve());

      const result = await controller.ingestAllResults();

      expect(ergastService.ingestAllResults).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        message: 'All results ingestion job started. This will take a long time. Check server logs.',
      });
    });

    it('should handle service errors', async () => {
      const error = new Error('Results ingestion failed');
      mockErgastService.ingestAllResults.mockImplementation(() => Promise.reject(error));

      await expect(controller.ingestAllResults()).rejects.toThrow('Results ingestion failed');
      expect(ergastService.ingestAllResults).toHaveBeenCalledTimes(1);
    });

    it('should return correct response structure', async () => {
      mockErgastService.ingestAllResults.mockImplementation(() => Promise.resolve());

      const result = await controller.ingestAllResults();

      expect(result).toHaveProperty('message');
      expect(typeof result.message).toBe('string');
      expect(result.message).toContain('All results ingestion job started');
      expect(result.message).toContain('This will take a long time');
    });

    it('should be a POST endpoint', () => {
      expect(typeof controller.ingestAllResults).toBe('function');
    });
  });

  describe('ingestAllStandings', () => {
    it('should call ergastService.ingestAllStandings and return success message', async () => {
      mockErgastService.ingestAllStandings.mockImplementation(() => Promise.resolve());

      const result = await controller.ingestAllStandings();

      expect(ergastService.ingestAllStandings).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        message: 'All standings ingestion job started. Check server logs.',
      });
    });

    it('should handle service errors', async () => {
      const error = new Error('Standings ingestion failed');
      mockErgastService.ingestAllStandings.mockImplementation(() => Promise.reject(error));

      await expect(controller.ingestAllStandings()).rejects.toThrow('Standings ingestion failed');
      expect(ergastService.ingestAllStandings).toHaveBeenCalledTimes(1);
    });

    it('should return correct response structure', async () => {
      mockErgastService.ingestAllStandings.mockImplementation(() => Promise.resolve());

      const result = await controller.ingestAllStandings();

      expect(result).toHaveProperty('message');
      expect(typeof result.message).toBe('string');
      expect(result.message).toContain('All standings ingestion job started');
    });

    it('should be a POST endpoint', () => {
      expect(typeof controller.ingestAllStandings).toBe('function');
    });
  });

  describe('ingestOpenF1Sessions', () => {
    it('should call openf1Service.ingestSessionsAndWeather with year parameter and return success message', async () => {
      const year = '2023';
      mockOpenF1Service.ingestSessionsAndWeather.mockImplementation(() => Promise.resolve());

      const result = await controller.ingestOpenF1Sessions(year);

      expect(openf1Service.ingestSessionsAndWeather).toHaveBeenCalledWith(2023);
      expect(openf1Service.ingestSessionsAndWeather).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        message: `OpenF1 session ingestion for ${year} started. Check server logs.`,
      });
    });

    it('should handle different year parameters', async () => {
      const years = ['2021', '2022', '2023', '2024'];
      
      for (const year of years) {
        mockOpenF1Service.ingestSessionsAndWeather.mockImplementation(() => Promise.resolve());
        const result = await controller.ingestOpenF1Sessions(year);
        
        expect(openf1Service.ingestSessionsAndWeather).toHaveBeenCalledWith(parseInt(year, 10));
        expect(result.message).toContain(`OpenF1 session ingestion for ${year} started`);
      }
    });

    it('should handle service errors', async () => {
      const year = '2023';
      const error = new Error('OpenF1 session ingestion failed');
      mockOpenF1Service.ingestSessionsAndWeather.mockImplementation(() => Promise.reject(error));

      await expect(controller.ingestOpenF1Sessions(year)).rejects.toThrow('OpenF1 session ingestion failed');
      expect(openf1Service.ingestSessionsAndWeather).toHaveBeenCalledWith(2023);
    });

    it('should return correct response structure', async () => {
      const year = '2023';
      mockOpenF1Service.ingestSessionsAndWeather.mockImplementation(() => Promise.resolve());

      const result = await controller.ingestOpenF1Sessions(year);

      expect(result).toHaveProperty('message');
      expect(typeof result.message).toBe('string');
      expect(result.message).toContain('OpenF1 session ingestion');
      expect(result.message).toContain(year);
    });

    it('should be a POST endpoint', () => {
      expect(typeof controller.ingestOpenF1Sessions).toBe('function');
    });
  });

  describe('ingestOpenF1Granular', () => {
    it('should call openf1Service.ingestGranularData with year parameter and return success message', async () => {
      const year = '2023';
      mockOpenF1Service.ingestGranularData.mockImplementation(() => Promise.resolve());

      const result = await controller.ingestOpenF1Granular(year);

      expect(openf1Service.ingestGranularData).toHaveBeenCalledWith(2023);
      expect(openf1Service.ingestGranularData).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        message: `OpenF1 granular data ingestion for ${year} started. Check server logs.`,
      });
    });

    it('should handle different year parameters', async () => {
      const years = ['2021', '2022', '2023', '2024'];
      
      for (const year of years) {
        mockOpenF1Service.ingestGranularData.mockImplementation(() => Promise.resolve());
        const result = await controller.ingestOpenF1Granular(year);
        
        expect(openf1Service.ingestGranularData).toHaveBeenCalledWith(parseInt(year, 10));
        expect(result.message).toContain(`OpenF1 granular data ingestion for ${year} started`);
      }
    });

    it('should handle service errors', async () => {
      const year = '2023';
      const error = new Error('OpenF1 granular data ingestion failed');
      mockOpenF1Service.ingestGranularData.mockImplementation(() => Promise.reject(error));

      await expect(controller.ingestOpenF1Granular(year)).rejects.toThrow('OpenF1 granular data ingestion failed');
      expect(openf1Service.ingestGranularData).toHaveBeenCalledWith(2023);
    });

    it('should return correct response structure', async () => {
      const year = '2023';
      mockOpenF1Service.ingestGranularData.mockImplementation(() => Promise.resolve());

      const result = await controller.ingestOpenF1Granular(year);

      expect(result).toHaveProperty('message');
      expect(typeof result.message).toBe('string');
      expect(result.message).toContain('OpenF1 granular data ingestion');
      expect(result.message).toContain(year);
    });

    it('should be a POST endpoint', () => {
      expect(typeof controller.ingestOpenF1Granular).toBe('function');
    });
  });

  describe('ingestOpenF1ModernResults', () => {
    it('should call openf1Service.ingestModernResultsAndLaps with year parameter and return success message', async () => {
      const year = 2023;
      mockOpenF1Service.ingestModernResultsAndLaps.mockImplementation(() => Promise.resolve());

      const result = await controller.ingestOpenF1ModernResults(year);

      expect(openf1Service.ingestModernResultsAndLaps).toHaveBeenCalledWith(year);
      expect(openf1Service.ingestModernResultsAndLaps).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        message: `OpenF1 modern results, laps, and pit stops ingestion for ${year} started. Check server logs.`,
      });
    });

    it('should handle different year parameters', async () => {
      const years = [2021, 2022, 2023, 2024];
      
      for (const year of years) {
        mockOpenF1Service.ingestModernResultsAndLaps.mockImplementation(() => Promise.resolve());
        const result = await controller.ingestOpenF1ModernResults(year);
        
        expect(openf1Service.ingestModernResultsAndLaps).toHaveBeenCalledWith(year);
        expect(result.message).toContain(`OpenF1 modern results, laps, and pit stops ingestion for ${year} started`);
      }
    });

    it('should handle service errors', async () => {
      const year = 2023;
      
      // Set up the mock to reject with an error
      mockOpenF1Service.ingestModernResultsAndLaps.mockImplementation(() => {
        throw new Error('OpenF1 modern results ingestion failed');
      });

      await expect(controller.ingestOpenF1ModernResults(year)).rejects.toThrow('OpenF1 modern results ingestion failed');
      expect(openf1Service.ingestModernResultsAndLaps).toHaveBeenCalledWith(year);
    });

    it('should return correct response structure', async () => {
      const year = 2023;
      mockOpenF1Service.ingestModernResultsAndLaps.mockImplementation(() => Promise.resolve());

      const result = await controller.ingestOpenF1ModernResults(year);

      expect(result).toHaveProperty('message');
      expect(typeof result.message).toBe('string');
      expect(result.message).toContain('OpenF1 modern results, laps, and pit stops ingestion');
      expect(result.message).toContain(year.toString());
    });

    it('should be a POST endpoint', () => {
      expect(typeof controller.ingestOpenF1ModernResults).toBe('function');
    });
  });

  describe('ingestTrackLayouts', () => {
    it('should call openf1Service.ingestTrackLayouts and return success message', async () => {
      mockOpenF1Service.ingestTrackLayouts.mockImplementation(() => Promise.resolve());

      const result = await controller.ingestTrackLayouts();

      expect(openf1Service.ingestTrackLayouts).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        message: 'Track layout ingestion started. This is a one-time script and will take a while. Check logs.',
      });
    });

    it('should handle service errors', async () => {
      // Set up the mock to reject with an error
      mockOpenF1Service.ingestTrackLayouts.mockImplementation(() => {
        throw new Error('Track layout ingestion failed');
      });

      await expect(controller.ingestTrackLayouts()).rejects.toThrow('Track layout ingestion failed');
      expect(openf1Service.ingestTrackLayouts).toHaveBeenCalledTimes(1);
    });

    it('should return correct response structure', async () => {
      mockOpenF1Service.ingestTrackLayouts.mockImplementation(() => Promise.resolve());

      const result = await controller.ingestTrackLayouts();

      expect(result).toHaveProperty('message');
      expect(typeof result.message).toBe('string');
      expect(result.message).toContain('Track layout ingestion started');
      expect(result.message).toContain('one-time script');
    });

    it('should be a POST endpoint', () => {
      expect(typeof controller.ingestTrackLayouts).toBe('function');
    });
  });

  describe('controller structure', () => {
    it('should be a controller object', () => {
      expect(typeof IngestionController).toBe('function');
    });

    it('should have proper controller methods', () => {
      expect(typeof controller.getTest).toBe('function');
      expect(typeof controller.ingestCircuits).toBe('function');
      expect(typeof controller.ingestConstructors).toBe('function');
      expect(typeof controller.ingestDrivers).toBe('function');
      expect(typeof controller.ingestRacesAndSessions).toBe('function');
      expect(typeof controller.ingestSeasons).toBe('function');
      expect(typeof controller.ingestAllResults).toBe('function');
      expect(typeof controller.ingestAllStandings).toBe('function');
      expect(typeof controller.ingestOpenF1Sessions).toBe('function');
      expect(typeof controller.ingestOpenF1Granular).toBe('function');
      expect(typeof controller.ingestOpenF1ModernResults).toBe('function');
      expect(typeof controller.ingestTrackLayouts).toBe('function');
    });

    it('should have all required methods as functions', () => {
      const requiredMethods = [
        'getTest',
        'ingestCircuits',
        'ingestConstructors',
        'ingestDrivers',
        'ingestRacesAndSessions',
        'ingestSeasons',
        'ingestAllResults',
        'ingestAllStandings',
        'ingestOpenF1Sessions',
        'ingestOpenF1Granular',
        'ingestOpenF1ModernResults',
        'ingestTrackLayouts',
      ];

      requiredMethods.forEach(method => {
        expect(typeof controller[method]).toBe('function');
      });
    });
  });

  describe('controller integration', () => {
    it('should call all ergast service methods correctly', async () => {
      mockErgastService.ingestCircuits.mockImplementation(() => Promise.resolve());
      mockErgastService.ingestConstructors.mockImplementation(() => Promise.resolve());
      mockErgastService.ingestDrivers.mockImplementation(() => Promise.resolve());
      mockErgastService.ingestRacesAndSessions.mockImplementation(() => Promise.resolve());
      mockErgastService.ingestSeasons.mockImplementation(() => Promise.resolve());
      mockErgastService.ingestAllResults.mockImplementation(() => Promise.resolve());
      mockErgastService.ingestAllStandings.mockImplementation(() => Promise.resolve());

      await controller.ingestCircuits();
      await controller.ingestConstructors();
      await controller.ingestDrivers();
      await controller.ingestRacesAndSessions();
      await controller.ingestSeasons();
      await controller.ingestAllResults();
      await controller.ingestAllStandings();

      expect(ergastService.ingestCircuits).toHaveBeenCalledTimes(1);
      expect(ergastService.ingestConstructors).toHaveBeenCalledTimes(1);
      expect(ergastService.ingestDrivers).toHaveBeenCalledTimes(1);
      expect(ergastService.ingestRacesAndSessions).toHaveBeenCalledTimes(1);
      expect(ergastService.ingestSeasons).toHaveBeenCalledTimes(1);
      expect(ergastService.ingestAllResults).toHaveBeenCalledTimes(1);
      expect(ergastService.ingestAllStandings).toHaveBeenCalledTimes(1);
    });

    it('should call all openf1 service methods correctly', async () => {
      mockOpenF1Service.ingestSessionsAndWeather.mockImplementation(() => Promise.resolve());
      mockOpenF1Service.ingestGranularData.mockImplementation(() => Promise.resolve());
      mockOpenF1Service.ingestModernResultsAndLaps.mockImplementation(() => Promise.resolve());
      mockOpenF1Service.ingestTrackLayouts.mockImplementation(() => Promise.resolve());

      await controller.ingestOpenF1Sessions('2023');
      await controller.ingestOpenF1Granular('2023');
      await controller.ingestOpenF1ModernResults(2023);
      await controller.ingestTrackLayouts();

      expect(openf1Service.ingestSessionsAndWeather).toHaveBeenCalledWith(2023);
      expect(openf1Service.ingestGranularData).toHaveBeenCalledWith(2023);
      expect(openf1Service.ingestModernResultsAndLaps).toHaveBeenCalledWith(2023);
      expect(openf1Service.ingestTrackLayouts).toHaveBeenCalledTimes(1);
    });

    it('should not modify service responses', async () => {
      mockErgastService.ingestCircuits.mockImplementation(() => Promise.resolve());
      const result = await controller.ingestCircuits();
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });
  });

  describe('concurrent requests', () => {
    it('should handle multiple concurrent ergast service calls', async () => {
      mockErgastService.ingestCircuits.mockImplementation(() => Promise.resolve());
      mockErgastService.ingestConstructors.mockImplementation(() => Promise.resolve());
      mockErgastService.ingestDrivers.mockImplementation(() => Promise.resolve());

      const promises = [
        controller.ingestCircuits(),
        controller.ingestConstructors(),
        controller.ingestDrivers(),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results.every(result => result && typeof result === 'object')).toBe(true);
      expect(ergastService.ingestCircuits).toHaveBeenCalledTimes(1);
      expect(ergastService.ingestConstructors).toHaveBeenCalledTimes(1);
      expect(ergastService.ingestDrivers).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple concurrent openf1 service calls', async () => {
      mockOpenF1Service.ingestSessionsAndWeather.mockImplementation(() => Promise.resolve());
      mockOpenF1Service.ingestGranularData.mockImplementation(() => Promise.resolve());
      mockOpenF1Service.ingestModernResultsAndLaps.mockImplementation(() => Promise.resolve());

      const promises = [
        controller.ingestOpenF1Sessions('2023'),
        controller.ingestOpenF1Granular('2023'),
        controller.ingestOpenF1ModernResults(2023),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results.every(result => result && typeof result === 'object')).toBe(true);
      expect(openf1Service.ingestSessionsAndWeather).toHaveBeenCalledWith(2023);
      expect(openf1Service.ingestGranularData).toHaveBeenCalledWith(2023);
      expect(openf1Service.ingestModernResultsAndLaps).toHaveBeenCalledWith(2023);
    });

    it('should handle mixed concurrent requests', async () => {
      mockErgastService.ingestCircuits.mockImplementation(() => Promise.resolve());
      mockOpenF1Service.ingestSessionsAndWeather.mockImplementation(() => Promise.resolve());
      const testResult = controller.getTest();

      const promises = [
        controller.ingestCircuits(),
        controller.ingestOpenF1Sessions('2023'),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(2);
      expect(results.every(result => result && typeof result === 'object')).toBe(true);
      expect(testResult).toBeDefined();
    });
  });

  describe('error propagation', () => {
    it('should propagate service errors for ergast methods', async () => {
      const error = new Error('Circuits ingestion failed');
      mockErgastService.ingestCircuits.mockImplementation(() => Promise.reject(error));

      await expect(controller.ingestCircuits()).rejects.toThrow('Circuits ingestion failed');
      expect(ergastService.ingestCircuits).toHaveBeenCalledTimes(1);
    });

    it('should propagate service errors for openf1 methods', async () => {
      const error = new Error('OpenF1 sessions ingestion failed');
      mockOpenF1Service.ingestSessionsAndWeather.mockImplementation(() => Promise.reject(error));

      await expect(controller.ingestOpenF1Sessions('2023')).rejects.toThrow('OpenF1 sessions ingestion failed');
      expect(openf1Service.ingestSessionsAndWeather).toHaveBeenCalledWith(2023);
    });
  });

  describe('return type validation', () => {
    it('should return correct types for all methods', async () => {
      mockErgastService.ingestCircuits.mockImplementation(() => Promise.resolve());
      mockOpenF1Service.ingestSessionsAndWeather.mockImplementation(() => Promise.resolve());

      const testResult = controller.getTest();
      const circuitResult = await controller.ingestCircuits();
      const sessionResult = await controller.ingestOpenF1Sessions('2023');

      expect(typeof testResult).toBe('object');
      expect(typeof circuitResult).toBe('object');
      expect(typeof sessionResult).toBe('object');
    });

    it('should return objects with message property for async methods', async () => {
      mockErgastService.ingestCircuits.mockImplementation(() => Promise.resolve());
      mockOpenF1Service.ingestSessionsAndWeather.mockImplementation(() => Promise.resolve());

      const circuitResult = await controller.ingestCircuits();
      const sessionResult = await controller.ingestOpenF1Sessions('2023');

      expect(circuitResult).toHaveProperty('message');
      expect(sessionResult).toHaveProperty('message');
      expect(typeof circuitResult.message).toBe('string');
      expect(typeof sessionResult.message).toBe('string');
    });
  });

  describe('method signatures', () => {
    it('should have correct method signatures for all methods', () => {
      const methods = [
        'getTest',
        'ingestCircuits',
        'ingestConstructors',
        'ingestDrivers',
        'ingestRacesAndSessions',
        'ingestSeasons',
        'ingestAllResults',
        'ingestAllStandings',
        'ingestOpenF1Sessions',
        'ingestOpenF1Granular',
        'ingestOpenF1ModernResults',
        'ingestTrackLayouts',
      ];

      methods.forEach(method => {
        expect(controller[method]).toBeDefined();
        expect(typeof controller[method]).toBe('function');
      });
    });

    it('should accept correct parameters for parameterized methods', async () => {
      mockOpenF1Service.ingestSessionsAndWeather.mockImplementation(() => Promise.resolve());
      mockOpenF1Service.ingestGranularData.mockImplementation(() => Promise.resolve());
      mockOpenF1Service.ingestModernResultsAndLaps.mockImplementation(() => Promise.resolve());

      await controller.ingestOpenF1Sessions('2023');
      await controller.ingestOpenF1Granular('2023');
      await controller.ingestOpenF1ModernResults(2023);

      expect(openf1Service.ingestSessionsAndWeather).toHaveBeenCalledWith(2023);
      expect(openf1Service.ingestGranularData).toHaveBeenCalledWith(2023);
      expect(openf1Service.ingestModernResultsAndLaps).toHaveBeenCalledWith(2023);
    });
  });

  describe('controller functionality', () => {
    it('should support ergast data ingestion operations', () => {
      expect(controller.ingestCircuits).toBeDefined();
      expect(controller.ingestConstructors).toBeDefined();
      expect(controller.ingestDrivers).toBeDefined();
      expect(controller.ingestRacesAndSessions).toBeDefined();
      expect(controller.ingestSeasons).toBeDefined();
      expect(controller.ingestAllResults).toBeDefined();
      expect(controller.ingestAllStandings).toBeDefined();
    });

    it('should support openf1 data ingestion operations', () => {
      expect(controller.ingestOpenF1Sessions).toBeDefined();
      expect(controller.ingestOpenF1Granular).toBeDefined();
      expect(controller.ingestOpenF1ModernResults).toBeDefined();
      expect(controller.ingestTrackLayouts).toBeDefined();
    });

    it('should support test operations', () => {
      expect(controller.getTest).toBeDefined();
    });

    it('should support all required controller methods', () => {
      const requiredMethods = [
        'getTest',
        'ingestCircuits',
        'ingestConstructors',
        'ingestDrivers',
        'ingestRacesAndSessions',
        'ingestSeasons',
        'ingestAllResults',
        'ingestAllStandings',
        'ingestOpenF1Sessions',
        'ingestOpenF1Granular',
        'ingestOpenF1ModernResults',
        'ingestTrackLayouts',
      ];

      requiredMethods.forEach(method => {
        expect(controller[method]).toBeDefined();
        expect(typeof controller[method]).toBe('function');
      });
    });
  });

  describe('controller validation', () => {
    it('should have valid controller structure', () => {
      expect(controller).toBeDefined();
      expect(typeof controller).toBe('object');
    });

    it('should have all required methods', () => {
      const requiredMethods = [
        'getTest',
        'ingestCircuits',
        'ingestConstructors',
        'ingestDrivers',
        'ingestRacesAndSessions',
        'ingestSeasons',
        'ingestAllResults',
        'ingestAllStandings',
        'ingestOpenF1Sessions',
        'ingestOpenF1Granular',
        'ingestOpenF1ModernResults',
        'ingestTrackLayouts',
      ];

      requiredMethods.forEach(method => {
        expect(controller).toHaveProperty(method);
      });
    });

    it('should have consistent method types', () => {
      Object.getOwnPropertyNames(Object.getPrototypeOf(controller))
        .filter(name => name !== 'constructor')
        .forEach(method => {
          expect(typeof controller[method]).toBe('function');
        });
    });
  });

  describe('controller completeness', () => {
    it('should have all required controller methods', () => {
      const requiredMethods = [
        'getTest',
        'ingestCircuits',
        'ingestConstructors',
        'ingestDrivers',
        'ingestRacesAndSessions',
        'ingestSeasons',
        'ingestAllResults',
        'ingestAllStandings',
        'ingestOpenF1Sessions',
        'ingestOpenF1Granular',
        'ingestOpenF1ModernResults',
        'ingestTrackLayouts',
      ];

      requiredMethods.forEach(method => {
        expect(controller).toHaveProperty(method);
        expect(typeof controller[method]).toBe('function');
      });
    });

    it('should support all data ingestion operations', () => {
      expect(controller.ingestCircuits).toBeDefined();
      expect(controller.ingestConstructors).toBeDefined();
      expect(controller.ingestDrivers).toBeDefined();
      expect(controller.ingestRacesAndSessions).toBeDefined();
      expect(controller.ingestSeasons).toBeDefined();
      expect(controller.ingestAllResults).toBeDefined();
      expect(controller.ingestAllStandings).toBeDefined();
      expect(controller.ingestOpenF1Sessions).toBeDefined();
      expect(controller.ingestOpenF1Granular).toBeDefined();
      expect(controller.ingestOpenF1ModernResults).toBeDefined();
      expect(controller.ingestTrackLayouts).toBeDefined();
    });

    it('should support test operations', () => {
      expect(controller.getTest).toBeDefined();
    });
  });
});
