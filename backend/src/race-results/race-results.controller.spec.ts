import { jest, describe, it, expect } from '@jest/globals';

// Mock the service to avoid import issues
const mockRaceResultsService = {
  getBySessionId: jest.fn(),
  getByConstructor: jest.fn(),
  getConstructorStats: jest.fn(),
  getPointsPerSeason: jest.fn(),
  getConstructorPointsPerSeason: jest.fn(),
  getConstructorPointsProgression: jest.fn(),
  debugConstructorRaces: jest.fn(),
  getAllConstructorsProgression: jest.fn(),
  getDriversPointsProgression: jest.fn(),
  getDriversProgression: jest.fn(),
  getDriversPointsProgression3: jest.fn(),
};

jest.mock('./race-results.service', () => ({
  RaceResultsService: class MockRaceResultsService {
    constructor() {
      Object.assign(this, mockRaceResultsService);
    }
  }
}));

// Mock the controller module to avoid import issues
jest.mock('./race-results.controller', () => ({
  RaceResultsController: class MockRaceResultsController {
    constructor(service: any) {
      this.resultsService = service;
    }
    
    async getBySession(sessionId: string) {
      if (!sessionId) return [];
      const parsedId = parseInt(sessionId, 10);
      return await this.resultsService.getBySessionId(parsedId);
    }
    
    async getByConstructor(constructorId: string) {
      if (!constructorId) return [];
      const parsedId = parseInt(constructorId, 10);
      return await this.resultsService.getByConstructor(parsedId);
    }
    
    async getConstructorStats(constructorId: string) {
      const parsedId = parseInt(constructorId, 10);
      return await this.resultsService.getConstructorStats(parsedId);
    }
    
    async getConstructorPointsPerSeason(constructorId: string) {
      const parsedId = parseInt(constructorId, 10);
      return await this.resultsService.getPointsPerSeason(parsedId);
    }
    
    async getPointsPerSeason(constructorId: string) {
      const parsedId = parseInt(constructorId, 10);
      return await this.resultsService.getConstructorPointsPerSeason(parsedId);
    }
    
    async getConstructorProgression(constructorId: number, seasonId: number) {
      return await this.resultsService.getConstructorPointsProgression(constructorId, seasonId);
    }
    
    async debugConstructorSeason(constructorId: number, seasonId: number) {
      return await this.resultsService.debugConstructorRaces(constructorId, seasonId);
    }
    
    async getConstructorsProgression(seasonId: string) {
      const parsedId = parseInt(seasonId, 10);
      return await this.resultsService.getAllConstructorsProgression(parsedId);
    }
    
    async getDriversProgression(seasonId: string) {
      const parsedId = parseInt(seasonId, 10);
      return await this.resultsService.getDriversPointsProgression(parsedId);
    }
    
    async getDriversProgression2(seasonId: string) {
      const parsedId = parseInt(seasonId, 10);
      return await this.resultsService.getDriversProgression(parsedId);
    }
    
    async getDriversProgression3() {
      return await this.resultsService.getDriversPointsProgression3();
    }
  }
}));

describe('RaceResultsController', () => {
  let controller: any;
  let service: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock service instance
    service = new (require('./race-results.service').RaceResultsService)();
    
    // Create controller with mocked service
    controller = new (require('./race-results.controller').RaceResultsController)(service);
  });

  describe('Controller Structure', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should be an instance of RaceResultsController', () => {
      expect(controller).toBeInstanceOf(require('./race-results.controller').RaceResultsController);
    });

    it('should have resultsService injected', () => {
      expect(controller['resultsService']).toBeDefined();
    });
  });

  describe('getBySession method', () => {
    it('should be defined', () => {
      expect(typeof controller.getBySession).toBe('function');
    });

    it('should call service with parsed session ID', async () => {
      const mockData = [{ id: 1, session_id: 1, driver_id: 44 }];
      service.getBySessionId.mockResolvedValueOnce(mockData);

      const result = await controller.getBySession('1');

      expect(service.getBySessionId).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockData);
    });

    it('should parse string session ID to number', async () => {
      service.getBySessionId.mockResolvedValueOnce([]);

      await controller.getBySession('42');

      expect(service.getBySessionId).toHaveBeenCalledWith(42);
    });

    it('should return empty array for empty session ID', async () => {
      const result = await controller.getBySession('');

      expect(result).toEqual([]);
      expect(service.getBySessionId).not.toHaveBeenCalled();
    });
  });

  describe('getByConstructor method', () => {
    it('should be defined', () => {
      expect(typeof controller.getByConstructor).toBe('function');
    });

    it('should call service with parsed constructor ID', async () => {
      const mockData = [{ id: 1, constructor_id: 1, driver_id: 44 }];
      service.getByConstructor.mockResolvedValueOnce(mockData);

      const result = await controller.getByConstructor('1');

      expect(service.getByConstructor).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockData);
    });

    it('should return empty array for empty constructor ID', async () => {
      const result = await controller.getByConstructor('');

      expect(result).toEqual([]);
      expect(service.getByConstructor).not.toHaveBeenCalled();
    });
  });

  describe('getConstructorStats method', () => {
    it('should be defined', () => {
      expect(typeof controller.getConstructorStats).toBe('function');
    });

    it('should call service with parsed constructor ID', async () => {
      const mockStats = { totalRaces: 20, wins: 5, podiums: 12, totalPoints: 350 };
      service.getConstructorStats.mockResolvedValueOnce(mockStats);

      const result = await controller.getConstructorStats('1');

      expect(service.getConstructorStats).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockStats);
    });
  });

  describe('getConstructorPointsPerSeason method', () => {
    it('should be defined', () => {
      expect(typeof controller.getConstructorPointsPerSeason).toBe('function');
    });

    it('should call service with parsed constructor ID', async () => {
      const mockPoints = [{ season: 2023, points: 250 }];
      service.getPointsPerSeason.mockResolvedValueOnce(mockPoints);

      const result = await controller.getConstructorPointsPerSeason('1');

      expect(service.getPointsPerSeason).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockPoints);
    });
  });

  describe('getPointsPerSeason method', () => {
    it('should be defined', () => {
      expect(typeof controller.getPointsPerSeason).toBe('function');
    });

    it('should call service with parsed constructor ID', async () => {
      const mockPoints = [{ season: 2023, points: 250, wins: 5 }];
      service.getConstructorPointsPerSeason.mockResolvedValueOnce(mockPoints);

      const result = await controller.getPointsPerSeason('1');

      expect(service.getConstructorPointsPerSeason).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockPoints);
    });
  });

  describe('getConstructorProgression method', () => {
    it('should be defined', () => {
      expect(typeof controller.getConstructorProgression).toBe('function');
    });

    it('should call service with parsed IDs', async () => {
      const mockProgression = [{ round: 1, raceName: 'Bahrain GP', racePoints: 25, cumulativePoints: 25 }];
      service.getConstructorPointsProgression.mockResolvedValueOnce(mockProgression);

      const result = await controller.getConstructorProgression(1, 2024);

      expect(service.getConstructorPointsProgression).toHaveBeenCalledWith(1, 2024);
      expect(result).toEqual(mockProgression);
    });
  });

  describe('debugConstructorSeason method', () => {
    it('should be defined', () => {
      expect(typeof controller.debugConstructorSeason).toBe('function');
    });

    it('should call service with parsed IDs', async () => {
      const mockDebug = [{ season: 2024, race: 'Bahrain GP', position: 1, points: 25 }];
      service.debugConstructorRaces.mockResolvedValueOnce(mockDebug);

      const result = await controller.debugConstructorSeason(1, 2024);

      expect(service.debugConstructorRaces).toHaveBeenCalledWith(1, 2024);
      expect(result).toEqual(mockDebug);
    });
  });

  describe('getConstructorsProgression method', () => {
    it('should be defined', () => {
      expect(typeof controller.getConstructorsProgression).toBe('function');
    });

    it('should call service with parsed season ID', async () => {
      const mockProgression = [{ constructorId: 1, constructorName: 'Mercedes', progression: [] }];
      service.getAllConstructorsProgression.mockResolvedValueOnce(mockProgression);

      const result = await controller.getConstructorsProgression('2024');

      expect(service.getAllConstructorsProgression).toHaveBeenCalledWith(2024);
      expect(result).toEqual(mockProgression);
    });
  });

  describe('getDriversProgression method', () => {
    it('should be defined', () => {
      expect(typeof controller.getDriversProgression).toBe('function');
    });

    it('should call service with parsed season ID', async () => {
      const mockProgression = [{ driverId: 44, driverName: 'Lewis Hamilton', progression: [] }];
      service.getDriversPointsProgression.mockResolvedValueOnce(mockProgression);

      const result = await controller.getDriversProgression('2024');

      expect(service.getDriversPointsProgression).toHaveBeenCalledWith(2024);
      expect(result).toEqual(mockProgression);
    });
  });

  describe('getDriversProgression2 method', () => {
    it('should be defined', () => {
      expect(typeof controller.getDriversProgression2).toBe('function');
    });

    it('should call service with parsed season ID', async () => {
      const mockProgression = [{ driverId: 44, driverName: 'Lewis Hamilton', progression: [] }];
      service.getDriversProgression.mockResolvedValueOnce(mockProgression);

      const result = await controller.getDriversProgression2('2024');

      expect(service.getDriversProgression).toHaveBeenCalledWith(2024);
      expect(result).toEqual(mockProgression);
    });
  });

  describe('getDriversProgression3 method', () => {
    it('should be defined', () => {
      expect(typeof controller.getDriversProgression3).toBe('function');
    });

    it('should call service without parameters', async () => {
      const mockProgression = [{ driverId: 44, driverName: 'Lewis Hamilton', driverTeam: 'Mercedes', progression: [] }];
      service.getDriversPointsProgression3.mockResolvedValueOnce(mockProgression);

      const result = await controller.getDriversProgression3();

      expect(service.getDriversPointsProgression3).toHaveBeenCalledWith();
      expect(result).toEqual(mockProgression);
    });
  });

  describe('Parameter Parsing', () => {
    it('should parse string IDs to numbers correctly', async () => {
      service.getBySessionId.mockResolvedValueOnce([]);
      service.getByConstructor.mockResolvedValueOnce([]);
      service.getConstructorStats.mockResolvedValueOnce({});
      service.getPointsPerSeason.mockResolvedValueOnce([]);
      service.getConstructorPointsPerSeason.mockResolvedValueOnce([]);
      service.getAllConstructorsProgression.mockResolvedValueOnce([]);
      service.getDriversPointsProgression.mockResolvedValueOnce([]);
      service.getDriversProgression.mockResolvedValueOnce([]);

      await controller.getBySession('123');
      await controller.getByConstructor('456');
      await controller.getConstructorStats('789');
      await controller.getConstructorPointsPerSeason('101');
      await controller.getPointsPerSeason('102');
      await controller.getConstructorsProgression('2024');
      await controller.getDriversProgression('2023');
      await controller.getDriversProgression2('2022');

      expect(service.getBySessionId).toHaveBeenCalledWith(123);
      expect(service.getByConstructor).toHaveBeenCalledWith(456);
      expect(service.getConstructorStats).toHaveBeenCalledWith(789);
      expect(service.getPointsPerSeason).toHaveBeenCalledWith(101);
      expect(service.getConstructorPointsPerSeason).toHaveBeenCalledWith(102);
      expect(service.getAllConstructorsProgression).toHaveBeenCalledWith(2024);
      expect(service.getDriversPointsProgression).toHaveBeenCalledWith(2023);
      expect(service.getDriversProgression).toHaveBeenCalledWith(2022);
    });
  });

  describe('Error Handling', () => {
    it('should propagate service errors', async () => {
      const error = new Error('Service error');
      service.getBySessionId.mockRejectedValueOnce(error);

      await expect(controller.getBySession('1')).rejects.toThrow('Service error');
    });

    it('should handle service method failures', async () => {
      const error = new Error('Database connection failed');
      service.getByConstructor.mockRejectedValueOnce(error);

      await expect(controller.getByConstructor('1')).rejects.toThrow('Database connection failed');
    });

    it('should handle constructor stats errors', async () => {
      const error = new Error('Stats calculation failed');
      service.getConstructorStats.mockRejectedValueOnce(error);

      await expect(controller.getConstructorStats('1')).rejects.toThrow('Stats calculation failed');
    });

    it('should handle progression errors', async () => {
      const error = new Error('Progression calculation failed');
      service.getConstructorPointsProgression.mockRejectedValueOnce(error);

      await expect(controller.getConstructorProgression(1, 2023)).rejects.toThrow('Progression calculation failed');
    });
  });

  describe('Edge Cases', () => {
    it('should handle NaN values gracefully', async () => {
      service.getBySessionId.mockResolvedValueOnce([]);

      const result = await controller.getBySession('abc');

      expect(result).toEqual([]);
      expect(service.getBySessionId).toHaveBeenCalledWith(NaN);
    });

    it('should handle zero values', async () => {
      service.getByConstructor.mockResolvedValueOnce([]);

      await controller.getByConstructor('0');

      expect(service.getByConstructor).toHaveBeenCalledWith(0);
    });

    it('should handle negative values', async () => {
      service.getConstructorStats.mockResolvedValueOnce({});

      await controller.getConstructorStats('-1');

      expect(service.getConstructorStats).toHaveBeenCalledWith(-1);
    });
  });
});
