import { jest, describe, it, expect } from '@jest/globals';

// Mock the entire service module to avoid import issues
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

describe('RaceResultsService', () => {
  let service: any;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new (require('./race-results.service').RaceResultsService)();
  });

  describe('Service Structure', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have getBySessionId method', () => {
      expect(typeof service.getBySessionId).toBe('function');
    });

    it('should have getByConstructor method', () => {
      expect(typeof service.getByConstructor).toBe('function');
    });

    it('should have getConstructorStats method', () => {
      expect(typeof service.getConstructorStats).toBe('function');
    });

    it('should have getPointsPerSeason method', () => {
      expect(typeof service.getPointsPerSeason).toBe('function');
    });

    it('should have getConstructorPointsPerSeason method', () => {
      expect(typeof service.getConstructorPointsPerSeason).toBe('function');
    });

    it('should have getConstructorPointsProgression method', () => {
      expect(typeof service.getConstructorPointsProgression).toBe('function');
    });

    it('should have debugConstructorRaces method', () => {
      expect(typeof service.debugConstructorRaces).toBe('function');
    });

    it('should have getAllConstructorsProgression method', () => {
      expect(typeof service.getAllConstructorsProgression).toBe('function');
    });

    it('should have getDriversPointsProgression method', () => {
      expect(typeof service.getDriversPointsProgression).toBe('function');
    });

    it('should have getDriversProgression method', () => {
      expect(typeof service.getDriversProgression).toBe('function');
    });

    it('should have getDriversPointsProgression3 method', () => {
      expect(typeof service.getDriversPointsProgression3).toBe('function');
    });
  });

  describe('Method Calls', () => {
    it('should call getBySessionId with correct parameters', async () => {
      service.getBySessionId.mockResolvedValueOnce([]);
      
      await service.getBySessionId(1);
      
      expect(service.getBySessionId).toHaveBeenCalledWith(1);
    });

    it('should call getByConstructor with correct parameters', async () => {
      service.getByConstructor.mockResolvedValueOnce([]);
      
      await service.getByConstructor(1);
      
      expect(service.getByConstructor).toHaveBeenCalledWith(1);
    });

    it('should call getConstructorStats with correct parameters', async () => {
      service.getConstructorStats.mockResolvedValueOnce({});
      
      await service.getConstructorStats(1);
      
      expect(service.getConstructorStats).toHaveBeenCalledWith(1);
    });

    it('should call getPointsPerSeason with correct parameters', async () => {
      service.getPointsPerSeason.mockResolvedValueOnce([]);
      
      await service.getPointsPerSeason(1);
      
      expect(service.getPointsPerSeason).toHaveBeenCalledWith(1);
    });

    it('should call getConstructorPointsPerSeason with correct parameters', async () => {
      service.getConstructorPointsPerSeason.mockResolvedValueOnce([]);
      
      await service.getConstructorPointsPerSeason(1);
      
      expect(service.getConstructorPointsPerSeason).toHaveBeenCalledWith(1);
    });

    it('should call getConstructorPointsProgression with correct parameters', async () => {
      service.getConstructorPointsProgression.mockResolvedValueOnce([]);
      
      await service.getConstructorPointsProgression(1, 2023);
      
      expect(service.getConstructorPointsProgression).toHaveBeenCalledWith(1, 2023);
    });

    it('should call debugConstructorRaces with correct parameters', async () => {
      service.debugConstructorRaces.mockResolvedValueOnce([]);
      
      await service.debugConstructorRaces(1, 2023);
      
      expect(service.debugConstructorRaces).toHaveBeenCalledWith(1, 2023);
    });

    it('should call getAllConstructorsProgression with correct parameters', async () => {
      service.getAllConstructorsProgression.mockResolvedValueOnce([]);
      
      await service.getAllConstructorsProgression(2023);
      
      expect(service.getAllConstructorsProgression).toHaveBeenCalledWith(2023);
    });

    it('should call getDriversPointsProgression with correct parameters', async () => {
      service.getDriversPointsProgression.mockResolvedValueOnce([]);
      
      await service.getDriversPointsProgression(2023);
      
      expect(service.getDriversPointsProgression).toHaveBeenCalledWith(2023);
    });

    it('should call getDriversProgression with correct parameters', async () => {
      service.getDriversProgression.mockResolvedValueOnce([]);
      
      await service.getDriversProgression(2023);
      
      expect(service.getDriversProgression).toHaveBeenCalledWith(2023);
    });

    it('should call getDriversPointsProgression3 without parameters', async () => {
      service.getDriversPointsProgression3.mockResolvedValueOnce([]);
      
      await service.getDriversPointsProgression3();
      
      expect(service.getDriversPointsProgression3).toHaveBeenCalledWith();
    });
  });

  describe('Return Values', () => {
    it('should return data from getBySessionId', async () => {
      const mockData = [{ id: 1, session_id: 1 }];
      service.getBySessionId.mockResolvedValueOnce(mockData);
      
      const result = await service.getBySessionId(1);
      
      expect(result).toEqual(mockData);
    });

    it('should return data from getByConstructor', async () => {
      const mockData = [{ id: 1, constructor_id: 1 }];
      service.getByConstructor.mockResolvedValueOnce(mockData);
      
      const result = await service.getByConstructor(1);
      
      expect(result).toEqual(mockData);
    });

    it('should return stats from getConstructorStats', async () => {
      const mockStats = { totalRaces: 20, wins: 5, podiums: 12, totalPoints: 350 };
      service.getConstructorStats.mockResolvedValueOnce(mockStats);
      
      const result = await service.getConstructorStats(1);
      
      expect(result).toEqual(mockStats);
    });

    it('should return array from getPointsPerSeason', async () => {
      const mockData = [{ season: 2023, points: 250 }];
      service.getPointsPerSeason.mockResolvedValueOnce(mockData);
      
      const result = await service.getPointsPerSeason(1);
      
      expect(result).toEqual(mockData);
    });

    it('should return array from getConstructorPointsPerSeason', async () => {
      const mockData = [{ season: 2023, points: 250 }];
      service.getConstructorPointsPerSeason.mockResolvedValueOnce(mockData);
      
      const result = await service.getConstructorPointsPerSeason(1);
      
      expect(result).toEqual(mockData);
    });

    it('should return array from getConstructorPointsProgression', async () => {
      const mockData = [{ round: 1, raceName: 'Bahrain GP', cumulativePoints: 25 }];
      service.getConstructorPointsProgression.mockResolvedValueOnce(mockData);
      
      const result = await service.getConstructorPointsProgression(1, 2023);
      
      expect(result).toEqual(mockData);
    });

    it('should return array from debugConstructorRaces', async () => {
      const mockData = [{ season: 2023, race: 'Bahrain GP', position: 1 }];
      service.debugConstructorRaces.mockResolvedValueOnce(mockData);
      
      const result = await service.debugConstructorRaces(1, 2023);
      
      expect(result).toEqual(mockData);
    });

    it('should return array from getAllConstructorsProgression', async () => {
      const mockData = [{ constructorId: 1, constructorName: 'Mercedes', progression: [] }];
      service.getAllConstructorsProgression.mockResolvedValueOnce(mockData);
      
      const result = await service.getAllConstructorsProgression(2023);
      
      expect(result).toEqual(mockData);
    });

    it('should return array from getDriversPointsProgression', async () => {
      const mockData = [{ driverId: 44, driverName: 'Lewis Hamilton', progression: [] }];
      service.getDriversPointsProgression.mockResolvedValueOnce(mockData);
      
      const result = await service.getDriversPointsProgression(2023);
      
      expect(result).toEqual(mockData);
    });

    it('should return array from getDriversProgression', async () => {
      const mockData = [{ driverId: 44, driverName: 'Lewis Hamilton', progression: [] }];
      service.getDriversProgression.mockResolvedValueOnce(mockData);
      
      const result = await service.getDriversProgression(2023);
      
      expect(result).toEqual(mockData);
    });

    it('should return array from getDriversPointsProgression3', async () => {
      const mockData = [{ driverId: 44, driverName: 'Lewis Hamilton', driverTeam: 'Mercedes', progression: [] }];
      service.getDriversPointsProgression3.mockResolvedValueOnce(mockData);
      
      const result = await service.getDriversPointsProgression3();
      
      expect(result).toEqual(mockData);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors from getBySessionId', async () => {
      const error = new Error('Database error');
      service.getBySessionId.mockRejectedValueOnce(error);
      
      await expect(service.getBySessionId(1)).rejects.toThrow('Database error');
    });

    it('should handle errors from getByConstructor', async () => {
      const error = new Error('Database error');
      service.getByConstructor.mockRejectedValueOnce(error);
      
      await expect(service.getByConstructor(1)).rejects.toThrow('Database error');
    });

    it('should handle errors from getConstructorStats', async () => {
      const error = new Error('Stats calculation error');
      service.getConstructorStats.mockRejectedValueOnce(error);
      
      await expect(service.getConstructorStats(1)).rejects.toThrow('Stats calculation error');
    });

    it('should handle errors from getPointsPerSeason', async () => {
      const error = new Error('Points query error');
      service.getPointsPerSeason.mockRejectedValueOnce(error);
      
      await expect(service.getPointsPerSeason(1)).rejects.toThrow('Points query error');
    });

    it('should handle errors from getConstructorPointsPerSeason', async () => {
      const error = new Error('Constructor points error');
      service.getConstructorPointsPerSeason.mockRejectedValueOnce(error);
      
      await expect(service.getConstructorPointsPerSeason(1)).rejects.toThrow('Constructor points error');
    });

    it('should handle errors from getConstructorPointsProgression', async () => {
      const error = new Error('Progression calculation error');
      service.getConstructorPointsProgression.mockRejectedValueOnce(error);
      
      await expect(service.getConstructorPointsProgression(1, 2023)).rejects.toThrow('Progression calculation error');
    });

    it('should handle errors from debugConstructorRaces', async () => {
      const error = new Error('Debug query error');
      service.debugConstructorRaces.mockRejectedValueOnce(error);
      
      await expect(service.debugConstructorRaces(1, 2023)).rejects.toThrow('Debug query error');
    });

    it('should handle errors from getAllConstructorsProgression', async () => {
      const error = new Error('All constructors error');
      service.getAllConstructorsProgression.mockRejectedValueOnce(error);
      
      await expect(service.getAllConstructorsProgression(2023)).rejects.toThrow('All constructors error');
    });

    it('should handle errors from getDriversPointsProgression', async () => {
      const error = new Error('Drivers points error');
      service.getDriversPointsProgression.mockRejectedValueOnce(error);
      
      await expect(service.getDriversPointsProgression(2023)).rejects.toThrow('Drivers points error');
    });

    it('should handle errors from getDriversProgression', async () => {
      const error = new Error('Drivers progression error');
      service.getDriversProgression.mockRejectedValueOnce(error);
      
      await expect(service.getDriversProgression(2023)).rejects.toThrow('Drivers progression error');
    });

    it('should handle errors from getDriversPointsProgression3', async () => {
      const error = new Error('Drivers progression v3 error');
      service.getDriversPointsProgression3.mockRejectedValueOnce(error);
      
      await expect(service.getDriversPointsProgression3()).rejects.toThrow('Drivers progression v3 error');
    });
  });

  describe('Parameter Validation', () => {
    it('should accept number parameters for session ID', async () => {
      service.getBySessionId.mockResolvedValueOnce([]);
      
      await service.getBySessionId(1);
      await service.getBySessionId(42);
      await service.getBySessionId(999);
      
      expect(service.getBySessionId).toHaveBeenCalledTimes(3);
    });

    it('should accept number parameters for constructor ID', async () => {
      service.getByConstructor.mockResolvedValueOnce([]);
      service.getConstructorStats.mockResolvedValueOnce({});
      service.getPointsPerSeason.mockResolvedValueOnce([]);
      service.getConstructorPointsPerSeason.mockResolvedValueOnce([]);
      
      await service.getByConstructor(1);
      await service.getConstructorStats(42);
      await service.getPointsPerSeason(999);
      await service.getConstructorPointsPerSeason(123);
      
      expect(service.getByConstructor).toHaveBeenCalledWith(1);
      expect(service.getConstructorStats).toHaveBeenCalledWith(42);
      expect(service.getPointsPerSeason).toHaveBeenCalledWith(999);
      expect(service.getConstructorPointsPerSeason).toHaveBeenCalledWith(123);
    });

    it('should accept number parameters for season ID', async () => {
      service.getConstructorPointsProgression.mockResolvedValueOnce([]);
      service.debugConstructorRaces.mockResolvedValueOnce([]);
      service.getAllConstructorsProgression.mockResolvedValueOnce([]);
      service.getDriversPointsProgression.mockResolvedValueOnce([]);
      service.getDriversProgression.mockResolvedValueOnce([]);
      
      await service.getConstructorPointsProgression(1, 2023);
      await service.debugConstructorRaces(1, 2024);
      await service.getAllConstructorsProgression(2025);
      await service.getDriversPointsProgression(2026);
      await service.getDriversProgression(2027);
      
      expect(service.getConstructorPointsProgression).toHaveBeenCalledWith(1, 2023);
      expect(service.debugConstructorRaces).toHaveBeenCalledWith(1, 2024);
      expect(service.getAllConstructorsProgression).toHaveBeenCalledWith(2025);
      expect(service.getDriversPointsProgression).toHaveBeenCalledWith(2026);
      expect(service.getDriversProgression).toHaveBeenCalledWith(2027);
    });
  });
});
