import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock fetch globally
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

// Mock window and process objects
const mockWindow = {
  __API_BASE__: 'https://api.example.com'
};

const mockProcess = {
  env: {
    VITE_API_BASE_URL: 'https://vite-api.example.com',
    NX_API_BASE_URL: 'https://nx-api.example.com',
    API_BASE_URL: 'https://api.example.com'
  }
};

// Mock global objects
Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true
});

Object.defineProperty(global, 'process', {
  value: mockProcess,
  writable: true
});

// Import the module after mocking globals
import {
  fetchRaceResultsByRaceId,
  fetchQualifyingResultsByRaceId,
  fetchPitStopsByRaceId,
  fetchLapsByRaceId,
  fetchRaceEventsByRaceId,
  RaceResult,
  QualiResult,
  PitStop,
  Lap,
  RaceEvent
} from './racesDetails.services';

// Since the internal functions are not exported, we'll test them indirectly through the public functions
// and create our own test implementations for the internal logic

describe('RacesDetails Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset fetch mock
    (global.fetch as jest.MockedFunction<typeof fetch>).mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Internal Function Behavior', () => {
    it('should use correct base URL from environment', async () => {
      const mockData = { id: 1, name: 'Test' };
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockData)
      };
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponse as any);

      await fetchRaceResultsByRaceId(123);

      // The base URL should be resolved from environment variables
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('race-results?raceId=123'),
        expect.any(Object)
      );
    });

    it('should try multiple candidate paths when first fails', async () => {
      const mockData = { id: 1, name: 'Test' };
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockData)
      };
      
      (global.fetch as jest.MockedFunction<typeof fetch>)
        .mockRejectedValueOnce(new Error('First path failed'))
        .mockResolvedValueOnce(mockResponse as any);

      await fetchRaceResultsByRaceId(123);

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should handle special characters in raceId encoding', async () => {
      const mockData = { id: 1, name: 'Test' };
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockData)
      };
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponse as any);

      await fetchRaceResultsByRaceId('race-123&special=chars');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('race-123%26special%3Dchars'),
        expect.any(Object)
      );
    });
  });

  describe('fetchRaceResultsByRaceId', () => {
    it('should fetch race results successfully', async () => {
      const mockRaceResults: RaceResult[] = [
        {
          driver_id: 1,
          driver_code: 'HAM',
          driver_name: 'Lewis Hamilton',
          constructor_id: 1,
          constructor_name: 'Mercedes',
          position: 1,
          points: 25,
          grid: 1,
          time_ms: 90000,
          status: 'Finished',
          fastest_lap_rank: 1,
          points_for_fastest_lap: 1
        }
      ];

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockRaceResults)
      };
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponse as any);

      const result = await fetchRaceResultsByRaceId(123);

      expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/race-results?raceId=123', expect.any(Object));
      expect(result).toEqual(mockRaceResults);
    });

    it('should handle string raceId', async () => {
      const mockRaceResults: RaceResult[] = [];
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockRaceResults)
      };
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponse as any);

      await fetchRaceResultsByRaceId('race-123');

      expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/race-results?raceId=race-123', expect.any(Object));
    });
  });

  describe('fetchQualifyingResultsByRaceId', () => {
    it('should fetch qualifying results successfully', async () => {
      const mockQualiResults: QualiResult[] = [
        {
          driver_id: 1,
          driver_code: 'HAM',
          driver_name: 'Lewis Hamilton',
          constructor_id: 1,
          constructor_name: 'Mercedes',
          position: 1,
          q1_time_ms: 90000,
          q2_time_ms: 89000,
          q3_time_ms: 88000
        }
      ];

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockQualiResults)
      };
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponse as any);

      const result = await fetchQualifyingResultsByRaceId(123);

      expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/qualifying-results?raceId=123', expect.any(Object));
      expect(result).toEqual(mockQualiResults);
    });

    it('should handle number raceId', async () => {
      const mockQualiResults: QualiResult[] = [];
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockQualiResults)
      };
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponse as any);

      await fetchQualifyingResultsByRaceId(456);

      expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/qualifying-results?raceId=456', expect.any(Object));
    });
  });

  describe('fetchPitStopsByRaceId', () => {
    it('should fetch pit stops successfully', async () => {
      const mockPitStops: PitStop[] = [
        {
          race_id: 123,
          driver_id: 1,
          driver_code: 'HAM',
          stop_number: 1,
          lap_number: 10,
          total_duration_in_pit_ms: 3000,
          stationary_duration_ms: 2500
        }
      ];

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockPitStops)
      };
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponse as any);

      const result = await fetchPitStopsByRaceId(123);

      expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/pit-stops?raceId=123', expect.any(Object));
      expect(result).toEqual(mockPitStops);
    });

    it('should handle string raceId', async () => {
      const mockPitStops: PitStop[] = [];
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockPitStops)
      };
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponse as any);

      await fetchPitStopsByRaceId('race-456');

      expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/pit-stops?raceId=race-456', expect.any(Object));
    });
  });

  describe('fetchLapsByRaceId', () => {
    it('should fetch laps successfully', async () => {
      const mockLaps: Lap[] = [
        {
          id: 1,
          race_id: 123,
          driver_id: 1,
          driver_code: 'HAM',
          lap_number: 1,
          position: 1,
          time_ms: 90000,
          sector_1_ms: 30000,
          sector_2_ms: 30000,
          sector_3_ms: 30000,
          is_pit_out_lap: false
        }
      ];

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockLaps)
      };
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponse as any);

      const result = await fetchLapsByRaceId(123);

      expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/laps?raceId=123', expect.any(Object));
      expect(result).toEqual(mockLaps);
    });

    it('should handle number raceId', async () => {
      const mockLaps: Lap[] = [];
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockLaps)
      };
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponse as any);

      await fetchLapsByRaceId(789);

      expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/laps?raceId=789', expect.any(Object));
    });
  });

  describe('fetchRaceEventsByRaceId', () => {
    it('should fetch race events successfully', async () => {
      const mockRaceEvents: RaceEvent[] = [
        {
          id: 1,
          session_id: 1,
          lap_number: 5,
          type: 'yellow_flag',
          message: 'Yellow flag deployed',
          metadata: { x: 100, y: 200 }
        }
      ];

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockRaceEvents)
      };
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponse as any);

      const result = await fetchRaceEventsByRaceId(123);

      expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/race-events?raceId=123', expect.any(Object));
      expect(result).toEqual(mockRaceEvents);
    });

    it('should handle string raceId', async () => {
      const mockRaceEvents: RaceEvent[] = [];
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockRaceEvents)
      };
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponse as any);

      await fetchRaceEventsByRaceId('race-999');

      expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/race-events?raceId=race-999', expect.any(Object));
    });
  });

  describe('Type Definitions', () => {
    it('should have correct RaceResult type structure', () => {
      const raceResult: RaceResult = {
        session_id: 1,
        driver_id: 1,
        driver_code: 'HAM',
        driver_name: 'Lewis Hamilton',
        constructor_id: 1,
        constructor_name: 'Mercedes',
        position: 1,
        points: 25,
        grid: 1,
        time_ms: 90000,
        status: 'Finished',
        fastest_lap_rank: 1,
        points_for_fastest_lap: 1
      };

      expect(raceResult).toBeDefined();
      expect(typeof raceResult.driver_id).toBe('number');
      expect(typeof raceResult.position).toBe('number');
    });

    it('should have correct QualiResult type structure', () => {
      const qualiResult: QualiResult = {
        session_id: 1,
        driver_id: 1,
        driver_code: 'HAM',
        driver_name: 'Lewis Hamilton',
        constructor_id: 1,
        constructor_name: 'Mercedes',
        position: 1,
        q1_time_ms: 90000,
        q2_time_ms: 89000,
        q3_time_ms: 88000
      };

      expect(qualiResult).toBeDefined();
      expect(typeof qualiResult.driver_id).toBe('number');
      expect(typeof qualiResult.position).toBe('number');
    });

    it('should have correct PitStop type structure', () => {
      const pitStop: PitStop = {
        race_id: 123,
        driver_id: 1,
        driver_code: 'HAM',
        stop_number: 1,
        lap_number: 10,
        total_duration_in_pit_ms: 3000,
        stationary_duration_ms: 2500
      };

      expect(pitStop).toBeDefined();
      expect(typeof pitStop.race_id).toBe('number');
      expect(typeof pitStop.driver_id).toBe('number');
    });

    it('should have correct Lap type structure', () => {
      const lap: Lap = {
        id: 1,
        race_id: 123,
        driver_id: 1,
        driver_code: 'HAM',
        lap_number: 1,
        position: 1,
        time_ms: 90000,
        sector_1_ms: 30000,
        sector_2_ms: 30000,
        sector_3_ms: 30000,
        is_pit_out_lap: false
      };

      expect(lap).toBeDefined();
      expect(typeof lap.race_id).toBe('number');
      expect(typeof lap.driver_id).toBe('number');
    });

    it('should have correct RaceEvent type structure', () => {
      const raceEvent: RaceEvent = {
        id: 1,
        session_id: 1,
        lap_number: 5,
        type: 'yellow_flag',
        message: 'Yellow flag deployed',
        metadata: { x: 100, y: 200 }
      };

      expect(raceEvent).toBeDefined();
      expect(typeof raceEvent.id).toBe('number');
      expect(typeof raceEvent.type).toBe('string');
    });
  });

  describe('Error Handling', () => {
    it('should handle fetch errors in public functions', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(new Error('Network error'));

      await expect(fetchRaceResultsByRaceId(123)).rejects.toThrow('Network error');
    });

    it('should handle JSON parsing errors', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
      };
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponse as any);

      await expect(fetchRaceResultsByRaceId(123)).rejects.toThrow('Invalid JSON');
    });

    it('should handle HTTP error responses', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      };
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponse as any);

      await expect(fetchRaceResultsByRaceId(123)).rejects.toThrow('Internal Server Error');
    });
  });

  describe('Integration Tests', () => {
    it('should work with all fetch functions together', async () => {
      const mockData = { id: 1, name: 'Test' };
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockData)
      };
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponse as any);

      const raceId = 123;
      
      await fetchRaceResultsByRaceId(raceId);
      await fetchQualifyingResultsByRaceId(raceId);
      await fetchPitStopsByRaceId(raceId);
      await fetchLapsByRaceId(raceId);
      await fetchRaceEventsByRaceId(raceId);

      expect(global.fetch).toHaveBeenCalledTimes(5);
    });

    it('should handle mixed success and failure scenarios', async () => {
      const mockData = { id: 1, name: 'Test' };
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockData)
      };
      
      (global.fetch as jest.MockedFunction<typeof fetch>)
        .mockRejectedValueOnce(new Error('First call failed'))
        .mockResolvedValueOnce(mockResponse as any);

      const result = await fetchRaceResultsByRaceId(123);

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null and undefined values in type definitions', () => {
      const raceResult: RaceResult = {
        driver_id: 1,
        position: null,
        points: null,
        grid: null,
        time_ms: null,
        status: null,
        fastest_lap_rank: null,
        points_for_fastest_lap: null
      };

      expect(raceResult).toBeDefined();
      expect(raceResult.position).toBeNull();
      expect(raceResult.points).toBeNull();
    });

    it('should handle string and number types for IDs', () => {
      const raceResult: RaceResult = {
        driver_id: 'driver-123',
        constructor_id: 'constructor-456'
      };

      expect(typeof raceResult.driver_id).toBe('string');
      expect(typeof raceResult.constructor_id).toBe('string');
    });

    it('should handle special characters in raceId encoding', async () => {
      const mockData = { id: 1, name: 'Test' };
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockData)
      };
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponse as any);

      await fetchRaceResultsByRaceId('race@123#special');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('race%40123%23special'),
        expect.any(Object)
      );
    });
  });
});
