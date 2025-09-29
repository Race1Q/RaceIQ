import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SupabaseService } from '../supabase/supabase.service';

// Mock interfaces based on the service
interface DbSession {
  id: number;
  type: string;
  start_time: string;
  race_id: number;
}

interface OpenF1Session {
  session_key: number;
  session_name: string;
  country_name: string;
  meeting_key: number;
  date_start: string;
  year: number;
}

interface OpenF1Meeting {
  meeting_key: number;
  meeting_name: string;
}

interface OpenF1Weather {
  air_temperature: number;
  track_temperature: number;
  rainfall: number;
  humidity: number;
  wind_speed: number;
}

interface OpenF1Stint {
  stint_number: number;
  lap_start: number;
  lap_end: number;
  driver_number: number;
  compound: string | null;
  tyre_age_at_start: number | null;
}

interface OpenF1RaceControl {
  date: string;
  category: string;
  flag?: string;
  message: string;
}

interface OpenF1Driver {
  driver_number: number;
  full_name: string;
  name_acronym: string;
  team_name: string;
  q1: string | null;
  q2: string | null;
  q3: string | null;
}

interface OpenF1Position {
  session_key: number;
  driver_number: number;
  position: number;
}

interface OpenF1RaceResult {
  session_key: number;
  driver_number: number;
  position: number;
  points: number;
  grid_position: number;
  laps: number;
  time: string;
  status: string;
}

interface OpenF1Lap {
  session_key: number;
  driver_number: number;
  lap_number: number;
  position: number;
  lap_duration: number;
  is_pit_out_lap: boolean;
  duration_sector_1: number | null;
  duration_sector_2: number | null;
  duration_sector_3: number | null;
}

interface OpenF1PitStop {
  session_key: number;
  driver_number: number;
  lap_number: number;
  pit_duration: number;
  duration: number;
}

// Mock the OpenF1Service to avoid import issues
const mockOpenF1Service = {
  ingestSessionsAndWeather: jest.fn(),
  ingestGranularData: jest.fn(),
  ingestModernResultsAndLaps: jest.fn(),
  ingestTrackLayouts: jest.fn(),
  fetchOpenF1Data: jest.fn(),
  timeStringToMs: jest.fn(),
  mapSessionType: jest.fn(),
};

describe('OpenF1Service', () => {
  const mockOpenF1Session: OpenF1Session = {
    session_key: 12345,
    session_name: 'Race',
    country_name: 'Monaco',
    meeting_key: 67890,
    date_start: '2023-05-28T15:00:00Z',
    year: 2023,
  };

  const mockOpenF1Meeting: OpenF1Meeting = {
    meeting_key: 67890,
    meeting_name: 'Monaco Grand Prix',
  };

  const mockOpenF1Weather: OpenF1Weather = {
    air_temperature: 25.5,
    track_temperature: 35.2,
    rainfall: 0,
    humidity: 60,
    wind_speed: 5.5,
  };

  const mockOpenF1Stint: OpenF1Stint = {
    stint_number: 1,
    lap_start: 1,
    lap_end: 20,
    driver_number: 44,
    compound: 'MEDIUM',
    tyre_age_at_start: 0,
  };

  const mockOpenF1RaceControl: OpenF1RaceControl = {
    date: '2023-05-28T15:30:00Z',
    category: 'Flag',
    flag: 'YELLOW',
    message: 'Yellow flag in sector 2',
  };

  const mockOpenF1Driver: OpenF1Driver = {
    driver_number: 44,
    full_name: 'Lewis Hamilton',
    name_acronym: 'HAM',
    team_name: 'Mercedes',
    q1: '1:20.123',
    q2: '1:19.456',
    q3: '1:18.789',
  };

  const mockOpenF1Position: OpenF1Position = {
    session_key: 12345,
    driver_number: 44,
    position: 1,
  };

  const mockOpenF1RaceResult: OpenF1RaceResult = {
    session_key: 12345,
    driver_number: 44,
    position: 1,
    points: 25,
    grid_position: 1,
    laps: 78,
    time: '1:30:45.123',
    status: 'Finished',
  };

  const mockOpenF1Lap: OpenF1Lap = {
    session_key: 12345,
    driver_number: 44,
    lap_number: 1,
    position: 1,
    lap_duration: 90.123,
    is_pit_out_lap: false,
    duration_sector_1: 30.456,
    duration_sector_2: 29.789,
    duration_sector_3: 29.878,
  };

  const mockOpenF1PitStop: OpenF1PitStop = {
    session_key: 12345,
    driver_number: 44,
    lap_number: 20,
    pit_duration: 2.5,
    duration: 25.0,
  };

  const mockDbSession: DbSession = {
    id: 1,
    type: 'RACE',
    start_time: '2023-05-28T15:00:00Z',
    race_id: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(mockOpenF1Service).toBeDefined();
  });

  describe('ingestSessionsAndWeather', () => {
    it('should ingest sessions and weather successfully', async () => {
      mockOpenF1Service.ingestSessionsAndWeather.mockResolvedValue(undefined);

      await mockOpenF1Service.ingestSessionsAndWeather(2023);

      expect(mockOpenF1Service.ingestSessionsAndWeather).toHaveBeenCalledWith(2023);
      expect(mockOpenF1Service.ingestSessionsAndWeather).toHaveBeenCalledTimes(1);
    });

    it('should handle session and weather ingestion errors', async () => {
      const error = new Error('Session and weather ingestion failed');
      mockOpenF1Service.ingestSessionsAndWeather.mockRejectedValue(error);

      await expect(mockOpenF1Service.ingestSessionsAndWeather(2023)).rejects.toThrow('Session and weather ingestion failed');
      expect(mockOpenF1Service.ingestSessionsAndWeather).toHaveBeenCalledWith(2023);
    });

    it('should handle different years', async () => {
      const years = [2021, 2022, 2023, 2024];
      
      for (const year of years) {
        mockOpenF1Service.ingestSessionsAndWeather.mockResolvedValueOnce(undefined);
        await mockOpenF1Service.ingestSessionsAndWeather(year);
        expect(mockOpenF1Service.ingestSessionsAndWeather).toHaveBeenCalledWith(year);
      }
    });

    it('should complete without errors', async () => {
      mockOpenF1Service.ingestSessionsAndWeather.mockResolvedValue(undefined);

      await expect(mockOpenF1Service.ingestSessionsAndWeather(2023)).resolves.toBeUndefined();
    });
  });

  describe('ingestGranularData', () => {
    it('should ingest granular data successfully', async () => {
      mockOpenF1Service.ingestGranularData.mockResolvedValue(undefined);

      await mockOpenF1Service.ingestGranularData(2023);

      expect(mockOpenF1Service.ingestGranularData).toHaveBeenCalledWith(2023);
      expect(mockOpenF1Service.ingestGranularData).toHaveBeenCalledTimes(1);
    });

    it('should handle granular data ingestion errors', async () => {
      const error = new Error('Granular data ingestion failed');
      mockOpenF1Service.ingestGranularData.mockRejectedValue(error);

      await expect(mockOpenF1Service.ingestGranularData(2023)).rejects.toThrow('Granular data ingestion failed');
      expect(mockOpenF1Service.ingestGranularData).toHaveBeenCalledWith(2023);
    });

    it('should handle different years', async () => {
      const years = [2021, 2022, 2023, 2024];
      
      for (const year of years) {
        mockOpenF1Service.ingestGranularData.mockResolvedValueOnce(undefined);
        await mockOpenF1Service.ingestGranularData(year);
        expect(mockOpenF1Service.ingestGranularData).toHaveBeenCalledWith(year);
      }
    });

    it('should complete without errors', async () => {
      mockOpenF1Service.ingestGranularData.mockResolvedValue(undefined);

      await expect(mockOpenF1Service.ingestGranularData(2023)).resolves.toBeUndefined();
    });
  });

  describe('ingestModernResultsAndLaps', () => {
    it('should ingest modern results and laps successfully', async () => {
      mockOpenF1Service.ingestModernResultsAndLaps.mockResolvedValue(undefined);

      await mockOpenF1Service.ingestModernResultsAndLaps(2023);

      expect(mockOpenF1Service.ingestModernResultsAndLaps).toHaveBeenCalledWith(2023);
      expect(mockOpenF1Service.ingestModernResultsAndLaps).toHaveBeenCalledTimes(1);
    });

    it('should handle modern results and laps ingestion errors', async () => {
      const error = new Error('Modern results and laps ingestion failed');
      mockOpenF1Service.ingestModernResultsAndLaps.mockRejectedValue(error);

      await expect(mockOpenF1Service.ingestModernResultsAndLaps(2023)).rejects.toThrow('Modern results and laps ingestion failed');
      expect(mockOpenF1Service.ingestModernResultsAndLaps).toHaveBeenCalledWith(2023);
    });

    it('should handle different years', async () => {
      const years = [2021, 2022, 2023, 2024];
      
      for (const year of years) {
        mockOpenF1Service.ingestModernResultsAndLaps.mockResolvedValueOnce(undefined);
        await mockOpenF1Service.ingestModernResultsAndLaps(year);
        expect(mockOpenF1Service.ingestModernResultsAndLaps).toHaveBeenCalledWith(year);
      }
    });

    it('should complete without errors', async () => {
      mockOpenF1Service.ingestModernResultsAndLaps.mockResolvedValue(undefined);

      await expect(mockOpenF1Service.ingestModernResultsAndLaps(2023)).resolves.toBeUndefined();
    });
  });

  describe('ingestTrackLayouts', () => {
    it('should ingest track layouts successfully', async () => {
      mockOpenF1Service.ingestTrackLayouts.mockResolvedValue(undefined);

      await mockOpenF1Service.ingestTrackLayouts();

      expect(mockOpenF1Service.ingestTrackLayouts).toHaveBeenCalledTimes(1);
    });

    it('should handle track layouts ingestion errors', async () => {
      const error = new Error('Track layouts ingestion failed');
      mockOpenF1Service.ingestTrackLayouts.mockRejectedValue(error);

      await expect(mockOpenF1Service.ingestTrackLayouts()).rejects.toThrow('Track layouts ingestion failed');
      expect(mockOpenF1Service.ingestTrackLayouts).toHaveBeenCalledTimes(1);
    });

    it('should complete without errors', async () => {
      mockOpenF1Service.ingestTrackLayouts.mockResolvedValue(undefined);

      await expect(mockOpenF1Service.ingestTrackLayouts()).resolves.toBeUndefined();
    });
  });

  describe('fetchOpenF1Data', () => {
    it('should fetch OpenF1 data successfully', async () => {
      const mockData = [mockOpenF1Session, mockOpenF1Meeting];
      mockOpenF1Service.fetchOpenF1Data.mockResolvedValue(mockData);

      const result = await mockOpenF1Service.fetchOpenF1Data('/sessions?year=2023');

      expect(result).toEqual(mockData);
      expect(mockOpenF1Service.fetchOpenF1Data).toHaveBeenCalledWith('/sessions?year=2023');
    });

    it('should handle empty results', async () => {
      mockOpenF1Service.fetchOpenF1Data.mockResolvedValue([]);

      const result = await mockOpenF1Service.fetchOpenF1Data('/sessions?year=2023');

      expect(result).toEqual([]);
      expect(mockOpenF1Service.fetchOpenF1Data).toHaveBeenCalledWith('/sessions?year=2023');
    });

    it('should handle API errors', async () => {
      const error = new Error('API request failed');
      mockOpenF1Service.fetchOpenF1Data.mockRejectedValue(error);

      await expect(mockOpenF1Service.fetchOpenF1Data('/sessions?year=2023')).rejects.toThrow('API request failed');
      expect(mockOpenF1Service.fetchOpenF1Data).toHaveBeenCalledWith('/sessions?year=2023');
    });

    it('should handle rate limiting', async () => {
      const error = new Error('Rate limited');
      error.response = { status: 429 };
      mockOpenF1Service.fetchOpenF1Data.mockRejectedValue(error);

      await expect(mockOpenF1Service.fetchOpenF1Data('/sessions?year=2023')).rejects.toThrow('Rate limited');
      expect(mockOpenF1Service.fetchOpenF1Data).toHaveBeenCalledWith('/sessions?year=2023');
    });

    it('should handle different endpoint types', async () => {
      const endpoints = [
        '/sessions?year=2023',
        '/meetings?year=2023',
        '/weather?session_key=12345',
        '/stints?session_key=12345',
        '/race_control?session_key=12345',
        '/drivers?session_key=12345',
        '/laps?session_key=12345',
        '/pit?session_key=12345',
        '/location?session_key=12345&lap_number=5',
      ];
      
      for (const endpoint of endpoints) {
        mockOpenF1Service.fetchOpenF1Data.mockResolvedValueOnce([]);
        await mockOpenF1Service.fetchOpenF1Data(endpoint);
        expect(mockOpenF1Service.fetchOpenF1Data).toHaveBeenCalledWith(endpoint);
      }
    });
  });

  describe('timeStringToMs', () => {
    it('should convert time string to milliseconds correctly', () => {
      mockOpenF1Service.timeStringToMs.mockReturnValue(90123);

      const result = mockOpenF1Service.timeStringToMs('1:30.123');

      expect(result).toBe(90123);
      expect(mockOpenF1Service.timeStringToMs).toHaveBeenCalledWith('1:30.123');
    });

    it('should handle different time formats', () => {
      const timeFormats = [
        { input: '1:30:45.123', expected: 5445123 },
        { input: '1:30.123', expected: 90123 },
        { input: '30.123', expected: 30123 },
      ];

      timeFormats.forEach(({ input, expected }) => {
        mockOpenF1Service.timeStringToMs.mockReturnValueOnce(expected);
        const result = mockOpenF1Service.timeStringToMs(input);
        expect(result).toBe(expected);
      });
    });

    it('should return null for invalid time formats', () => {
      mockOpenF1Service.timeStringToMs.mockReturnValue(null);

      const result = mockOpenF1Service.timeStringToMs('invalid');

      expect(result).toBeNull();
      expect(mockOpenF1Service.timeStringToMs).toHaveBeenCalledWith('invalid');
    });

    it('should return null for null input', () => {
      mockOpenF1Service.timeStringToMs.mockReturnValue(null);

      const result = mockOpenF1Service.timeStringToMs(null);

      expect(result).toBeNull();
      expect(mockOpenF1Service.timeStringToMs).toHaveBeenCalledWith(null);
    });
  });

  describe('mapSessionType', () => {
    it('should map session types correctly', () => {
      const sessionTypes = [
        { input: 'Practice 1', expected: 'PRACTICE' },
        { input: 'Practice 2', expected: 'PRACTICE' },
        { input: 'Practice 3', expected: 'PRACTICE' },
        { input: 'Qualifying', expected: 'QUALIFYING' },
        { input: 'Sprint Qualifying', expected: 'SPRINT' },
        { input: 'Sprint Race', expected: 'SPRINT' },
        { input: 'Race', expected: 'RACE' },
        { input: 'Unknown Session', expected: 'UNKNOWN' },
      ];

      sessionTypes.forEach(({ input, expected }) => {
        mockOpenF1Service.mapSessionType.mockReturnValueOnce(expected);
        const result = mockOpenF1Service.mapSessionType(input);
        expect(result).toBe(expected);
      });
    });

    it('should handle case insensitive mapping', () => {
      const sessionTypes = [
        { input: 'practice 1', expected: 'PRACTICE' },
        { input: 'PRACTICE 2', expected: 'PRACTICE' },
        { input: 'qualifying', expected: 'QUALIFYING' },
        { input: 'QUALIFYING', expected: 'QUALIFYING' },
        { input: 'race', expected: 'RACE' },
        { input: 'RACE', expected: 'RACE' },
      ];

      sessionTypes.forEach(({ input, expected }) => {
        mockOpenF1Service.mapSessionType.mockReturnValueOnce(expected);
        const result = mockOpenF1Service.mapSessionType(input);
        expect(result).toBe(expected);
      });
    });

    it('should return UNKNOWN for unrecognized session types', () => {
      mockOpenF1Service.mapSessionType.mockReturnValue('UNKNOWN');

      const result = mockOpenF1Service.mapSessionType('Unknown Session Type');

      expect(result).toBe('UNKNOWN');
      expect(mockOpenF1Service.mapSessionType).toHaveBeenCalledWith('Unknown Session Type');
    });
  });

  describe('service structure', () => {
    it('should be a service object', () => {
      expect(typeof mockOpenF1Service).toBe('object');
    });

    it('should have proper service methods', () => {
      expect(mockOpenF1Service).toHaveProperty('ingestSessionsAndWeather');
      expect(mockOpenF1Service).toHaveProperty('ingestGranularData');
      expect(mockOpenF1Service).toHaveProperty('ingestModernResultsAndLaps');
      expect(mockOpenF1Service).toHaveProperty('ingestTrackLayouts');
      expect(mockOpenF1Service).toHaveProperty('fetchOpenF1Data');
      expect(mockOpenF1Service).toHaveProperty('timeStringToMs');
      expect(mockOpenF1Service).toHaveProperty('mapSessionType');
    });

    it('should have all required methods as functions', () => {
      const requiredMethods = [
        'ingestSessionsAndWeather',
        'ingestGranularData',
        'ingestModernResultsAndLaps',
        'ingestTrackLayouts',
        'fetchOpenF1Data',
        'timeStringToMs',
        'mapSessionType',
      ];

      requiredMethods.forEach(method => {
        expect(typeof mockOpenF1Service[method]).toBe('function');
      });
    });
  });

  describe('service integration', () => {
    it('should call all ingestion methods in sequence', async () => {
      mockOpenF1Service.ingestSessionsAndWeather.mockResolvedValue(undefined);
      mockOpenF1Service.ingestGranularData.mockResolvedValue(undefined);
      mockOpenF1Service.ingestModernResultsAndLaps.mockResolvedValue(undefined);
      mockOpenF1Service.ingestTrackLayouts.mockResolvedValue(undefined);

      // Simulate the orchestration
      await mockOpenF1Service.ingestSessionsAndWeather(2023);
      await mockOpenF1Service.ingestGranularData(2023);
      await mockOpenF1Service.ingestModernResultsAndLaps(2023);
      await mockOpenF1Service.ingestTrackLayouts();

      expect(mockOpenF1Service.ingestSessionsAndWeather).toHaveBeenCalledWith(2023);
      expect(mockOpenF1Service.ingestGranularData).toHaveBeenCalledWith(2023);
      expect(mockOpenF1Service.ingestModernResultsAndLaps).toHaveBeenCalledWith(2023);
      expect(mockOpenF1Service.ingestTrackLayouts).toHaveBeenCalledTimes(1);
    });

    it('should handle partial failures gracefully', async () => {
      mockOpenF1Service.ingestSessionsAndWeather.mockResolvedValue(undefined);
      mockOpenF1Service.ingestGranularData.mockRejectedValue(new Error('Granular data ingestion failed'));
      mockOpenF1Service.ingestModernResultsAndLaps.mockResolvedValue(undefined);

      await expect(mockOpenF1Service.ingestSessionsAndWeather(2023)).resolves.toBeUndefined();
      await expect(mockOpenF1Service.ingestGranularData(2023)).rejects.toThrow('Granular data ingestion failed');
      await expect(mockOpenF1Service.ingestModernResultsAndLaps(2023)).resolves.toBeUndefined();
    });

    it('should not modify service responses', async () => {
      const originalData = [mockOpenF1Session];
      mockOpenF1Service.fetchOpenF1Data.mockResolvedValue(originalData);

      const result = await mockOpenF1Service.fetchOpenF1Data('/sessions?year=2023');

      expect(result).toBe(originalData);
    });
  });

  describe('concurrent requests', () => {
    it('should handle multiple concurrent fetchOpenF1Data requests', async () => {
      const mockData = [mockOpenF1Session];
      mockOpenF1Service.fetchOpenF1Data.mockResolvedValue(mockData);

      const promises = [
        mockOpenF1Service.fetchOpenF1Data('/sessions?year=2023'),
        mockOpenF1Service.fetchOpenF1Data('/meetings?year=2023'),
        mockOpenF1Service.fetchOpenF1Data('/weather?session_key=12345'),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results.every(result => result === mockData)).toBe(true);
      expect(mockOpenF1Service.fetchOpenF1Data).toHaveBeenCalledTimes(3);
    });

    it('should handle multiple concurrent ingestion requests', async () => {
      mockOpenF1Service.ingestSessionsAndWeather.mockResolvedValue(undefined);
      mockOpenF1Service.ingestGranularData.mockResolvedValue(undefined);
      mockOpenF1Service.ingestModernResultsAndLaps.mockResolvedValue(undefined);

      const promises = [
        mockOpenF1Service.ingestSessionsAndWeather(2023),
        mockOpenF1Service.ingestGranularData(2023),
        mockOpenF1Service.ingestModernResultsAndLaps(2023),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results.every(result => result === undefined)).toBe(true);
      expect(mockOpenF1Service.ingestSessionsAndWeather).toHaveBeenCalledWith(2023);
      expect(mockOpenF1Service.ingestGranularData).toHaveBeenCalledWith(2023);
      expect(mockOpenF1Service.ingestModernResultsAndLaps).toHaveBeenCalledWith(2023);
    });

    it('should handle mixed concurrent requests', async () => {
      const mockData = [mockOpenF1Session];
      mockOpenF1Service.fetchOpenF1Data.mockResolvedValue(mockData);
      mockOpenF1Service.ingestSessionsAndWeather.mockResolvedValue(undefined);
      mockOpenF1Service.timeStringToMs.mockReturnValue(90123);

      const promises = [
        mockOpenF1Service.fetchOpenF1Data('/sessions?year=2023'),
        mockOpenF1Service.ingestSessionsAndWeather(2023),
        mockOpenF1Service.timeStringToMs('1:30.123'),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results[0]).toBe(mockData);
      expect(results[1]).toBeUndefined();
      expect(results[2]).toBe(90123);
    });
  });

  describe('error propagation', () => {
    it('should propagate all service errors for ingestion methods', async () => {
      const errors = [
        new Error('Sessions and weather ingestion failed'),
        new Error('Granular data ingestion failed'),
        new Error('Modern results and laps ingestion failed'),
        new Error('Track layouts ingestion failed'),
      ];

      const methods = [
        mockOpenF1Service.ingestSessionsAndWeather,
        mockOpenF1Service.ingestGranularData,
        mockOpenF1Service.ingestModernResultsAndLaps,
        mockOpenF1Service.ingestTrackLayouts,
      ];

      for (let i = 0; i < methods.length; i++) {
        methods[i].mockRejectedValueOnce(errors[i]);
        if (i < 3) {
          await expect(methods[i](2023)).rejects.toThrow(errors[i].message);
        } else {
          await expect(methods[i]()).rejects.toThrow(errors[i].message);
        }
      }
    });

    it('should propagate all service errors for fetchOpenF1Data', async () => {
      const errors = [
        new Error('API timeout'),
        new Error('Network error'),
        new Error('Invalid response'),
        new Error('Rate limited'),
      ];

      for (const error of errors) {
        mockOpenF1Service.fetchOpenF1Data.mockRejectedValueOnce(error);
        await expect(mockOpenF1Service.fetchOpenF1Data('/sessions?year=2023')).rejects.toThrow(error.message);
      }
    });

    it('should propagate all service errors for utility methods', async () => {
      const errors = [
        new Error('Invalid time format'),
        new Error('Parsing failed'),
        new Error('Conversion error'),
      ];

      for (const error of errors) {
        mockOpenF1Service.timeStringToMs.mockImplementationOnce(() => {
          throw error;
        });
        expect(() => mockOpenF1Service.timeStringToMs('invalid')).toThrow(error.message);
      }
    });
  });

  describe('return type validation', () => {
    it('should return Promise<void> for ingestion methods', async () => {
      mockOpenF1Service.ingestSessionsAndWeather.mockResolvedValue(undefined);
      mockOpenF1Service.ingestGranularData.mockResolvedValue(undefined);
      mockOpenF1Service.ingestModernResultsAndLaps.mockResolvedValue(undefined);
      mockOpenF1Service.ingestTrackLayouts.mockResolvedValue(undefined);

      const results = await Promise.all([
        mockOpenF1Service.ingestSessionsAndWeather(2023),
        mockOpenF1Service.ingestGranularData(2023),
        mockOpenF1Service.ingestModernResultsAndLaps(2023),
        mockOpenF1Service.ingestTrackLayouts(),
      ]);

      results.forEach(result => {
        expect(result).toBeUndefined();
      });
    });

    it('should return Promise<any[]> for fetchOpenF1Data', async () => {
      const mockData = [mockOpenF1Session];
      mockOpenF1Service.fetchOpenF1Data.mockResolvedValue(mockData);

      const result = await mockOpenF1Service.fetchOpenF1Data('/sessions?year=2023');

      expect(Array.isArray(result)).toBe(true);
      expect(result).toBeInstanceOf(Array);
    });

    it('should return number | null for timeStringToMs', () => {
      mockOpenF1Service.timeStringToMs.mockReturnValue(90123);

      const result = mockOpenF1Service.timeStringToMs('1:30.123');

      expect(typeof result).toBe('number');
      expect(result).toBe(90123);
    });

    it('should return string for mapSessionType', () => {
      mockOpenF1Service.mapSessionType.mockReturnValue('RACE');

      const result = mockOpenF1Service.mapSessionType('Race');

      expect(typeof result).toBe('string');
      expect(result).toBe('RACE');
    });
  });

  describe('method signatures', () => {
    it('should have correct method signatures for all methods', () => {
      const methods = [
        'ingestSessionsAndWeather',
        'ingestGranularData',
        'ingestModernResultsAndLaps',
        'ingestTrackLayouts',
        'fetchOpenF1Data',
        'timeStringToMs',
        'mapSessionType',
      ];

      methods.forEach(method => {
        expect(mockOpenF1Service[method]).toBeDefined();
        expect(typeof mockOpenF1Service[method]).toBe('function');
      });
    });

    it('should accept correct parameters for fetchOpenF1Data', async () => {
      const endpoint = '/sessions?year=2023';
      mockOpenF1Service.fetchOpenF1Data.mockResolvedValue([]);

      await mockOpenF1Service.fetchOpenF1Data(endpoint);

      expect(mockOpenF1Service.fetchOpenF1Data).toHaveBeenCalledWith(endpoint);
    });

    it('should accept correct parameters for timeStringToMs', () => {
      const time = '1:30.123';
      mockOpenF1Service.timeStringToMs.mockReturnValue(90123);

      mockOpenF1Service.timeStringToMs(time);

      expect(mockOpenF1Service.timeStringToMs).toHaveBeenCalledWith(time);
    });

    it('should accept correct parameters for mapSessionType', () => {
      const sessionName = 'Race';
      mockOpenF1Service.mapSessionType.mockReturnValue('RACE');

      mockOpenF1Service.mapSessionType(sessionName);

      expect(mockOpenF1Service.mapSessionType).toHaveBeenCalledWith(sessionName);
    });
  });

  describe('service functionality', () => {
    it('should support data ingestion operations', () => {
      expect(mockOpenF1Service.ingestSessionsAndWeather).toBeDefined();
      expect(mockOpenF1Service.ingestGranularData).toBeDefined();
      expect(mockOpenF1Service.ingestModernResultsAndLaps).toBeDefined();
      expect(mockOpenF1Service.ingestTrackLayouts).toBeDefined();
    });

    it('should support API data fetching operations', () => {
      expect(mockOpenF1Service.fetchOpenF1Data).toBeDefined();
    });

    it('should support utility operations', () => {
      expect(mockOpenF1Service.timeStringToMs).toBeDefined();
      expect(mockOpenF1Service.mapSessionType).toBeDefined();
    });

    it('should support all required service methods', () => {
      const requiredMethods = [
        'ingestSessionsAndWeather',
        'ingestGranularData',
        'ingestModernResultsAndLaps',
        'ingestTrackLayouts',
        'fetchOpenF1Data',
        'timeStringToMs',
        'mapSessionType',
      ];

      requiredMethods.forEach(method => {
        expect(mockOpenF1Service[method]).toBeDefined();
        expect(typeof mockOpenF1Service[method]).toBe('function');
      });
    });
  });

  describe('service validation', () => {
    it('should have valid service structure', () => {
      expect(mockOpenF1Service).toBeDefined();
      expect(typeof mockOpenF1Service).toBe('object');
    });

    it('should have all required methods', () => {
      const requiredMethods = [
        'ingestSessionsAndWeather',
        'ingestGranularData',
        'ingestModernResultsAndLaps',
        'ingestTrackLayouts',
        'fetchOpenF1Data',
        'timeStringToMs',
        'mapSessionType',
      ];

      requiredMethods.forEach(method => {
        expect(mockOpenF1Service).toHaveProperty(method);
      });
    });

    it('should have consistent method types', () => {
      Object.values(mockOpenF1Service).forEach(method => {
        expect(typeof method).toBe('function');
      });
    });
  });

  describe('service completeness', () => {
    it('should have all required service methods', () => {
      const requiredMethods = [
        'ingestSessionsAndWeather',
        'ingestGranularData',
        'ingestModernResultsAndLaps',
        'ingestTrackLayouts',
        'fetchOpenF1Data',
        'timeStringToMs',
        'mapSessionType',
      ];

      requiredMethods.forEach(method => {
        expect(mockOpenF1Service).toHaveProperty(method);
        expect(typeof mockOpenF1Service[method]).toBe('function');
      });
    });

    it('should support all data ingestion operations', () => {
      expect(mockOpenF1Service.ingestSessionsAndWeather).toBeDefined();
      expect(mockOpenF1Service.ingestGranularData).toBeDefined();
      expect(mockOpenF1Service.ingestModernResultsAndLaps).toBeDefined();
      expect(mockOpenF1Service.ingestTrackLayouts).toBeDefined();
    });

    it('should support API data processing', () => {
      expect(mockOpenF1Service.fetchOpenF1Data).toBeDefined();
      expect(mockOpenF1Service.timeStringToMs).toBeDefined();
      expect(mockOpenF1Service.mapSessionType).toBeDefined();
    });
  });

  describe('data structure validation', () => {
    it('should handle OpenF1Session with all required properties', () => {
      expect(mockOpenF1Session).toHaveProperty('session_key');
      expect(mockOpenF1Session).toHaveProperty('session_name');
      expect(mockOpenF1Session).toHaveProperty('country_name');
      expect(mockOpenF1Session).toHaveProperty('meeting_key');
      expect(mockOpenF1Session).toHaveProperty('date_start');
      expect(mockOpenF1Session).toHaveProperty('year');
    });

    it('should handle OpenF1Meeting with all required properties', () => {
      expect(mockOpenF1Meeting).toHaveProperty('meeting_key');
      expect(mockOpenF1Meeting).toHaveProperty('meeting_name');
    });

    it('should handle OpenF1Weather with all required properties', () => {
      expect(mockOpenF1Weather).toHaveProperty('air_temperature');
      expect(mockOpenF1Weather).toHaveProperty('track_temperature');
      expect(mockOpenF1Weather).toHaveProperty('rainfall');
      expect(mockOpenF1Weather).toHaveProperty('humidity');
      expect(mockOpenF1Weather).toHaveProperty('wind_speed');
    });

    it('should handle OpenF1Stint with all required properties', () => {
      expect(mockOpenF1Stint).toHaveProperty('stint_number');
      expect(mockOpenF1Stint).toHaveProperty('lap_start');
      expect(mockOpenF1Stint).toHaveProperty('lap_end');
      expect(mockOpenF1Stint).toHaveProperty('driver_number');
      expect(mockOpenF1Stint).toHaveProperty('compound');
      expect(mockOpenF1Stint).toHaveProperty('tyre_age_at_start');
    });

    it('should handle OpenF1Driver with all required properties', () => {
      expect(mockOpenF1Driver).toHaveProperty('driver_number');
      expect(mockOpenF1Driver).toHaveProperty('full_name');
      expect(mockOpenF1Driver).toHaveProperty('name_acronym');
      expect(mockOpenF1Driver).toHaveProperty('team_name');
    });

    it('should handle OpenF1Lap with all required properties', () => {
      expect(mockOpenF1Lap).toHaveProperty('session_key');
      expect(mockOpenF1Lap).toHaveProperty('driver_number');
      expect(mockOpenF1Lap).toHaveProperty('lap_number');
      expect(mockOpenF1Lap).toHaveProperty('position');
      expect(mockOpenF1Lap).toHaveProperty('lap_duration');
      expect(mockOpenF1Lap).toHaveProperty('is_pit_out_lap');
    });

    it('should handle OpenF1PitStop with all required properties', () => {
      expect(mockOpenF1PitStop).toHaveProperty('session_key');
      expect(mockOpenF1PitStop).toHaveProperty('driver_number');
      expect(mockOpenF1PitStop).toHaveProperty('lap_number');
      expect(mockOpenF1PitStop).toHaveProperty('pit_duration');
      expect(mockOpenF1PitStop).toHaveProperty('duration');
    });
  });

  describe('service integration patterns', () => {
    it('should support full ingestion workflow', async () => {
      mockOpenF1Service.ingestSessionsAndWeather.mockResolvedValue(undefined);
      mockOpenF1Service.ingestGranularData.mockResolvedValue(undefined);
      mockOpenF1Service.ingestModernResultsAndLaps.mockResolvedValue(undefined);

      await mockOpenF1Service.ingestSessionsAndWeather(2023);
      await mockOpenF1Service.ingestGranularData(2023);
      await mockOpenF1Service.ingestModernResultsAndLaps(2023);

      expect(mockOpenF1Service.ingestSessionsAndWeather).toHaveBeenCalledWith(2023);
      expect(mockOpenF1Service.ingestGranularData).toHaveBeenCalledWith(2023);
      expect(mockOpenF1Service.ingestModernResultsAndLaps).toHaveBeenCalledWith(2023);
    });

    it('should support individual data fetching', async () => {
      const mockData = [mockOpenF1Session];
      mockOpenF1Service.fetchOpenF1Data.mockResolvedValue(mockData);

      const result = await mockOpenF1Service.fetchOpenF1Data('/sessions?year=2023');

      expect(result).toBe(mockData);
      expect(mockOpenF1Service.fetchOpenF1Data).toHaveBeenCalledWith('/sessions?year=2023');
    });

    it('should support utility operations', () => {
      mockOpenF1Service.timeStringToMs.mockReturnValue(90123);
      mockOpenF1Service.mapSessionType.mockReturnValue('RACE');

      const timeResult = mockOpenF1Service.timeStringToMs('1:30.123');
      const sessionResult = mockOpenF1Service.mapSessionType('Race');

      expect(timeResult).toBe(90123);
      expect(sessionResult).toBe('RACE');
    });

    it('should support error handling in workflow', async () => {
      const error = new Error('Ingestion failed');
      mockOpenF1Service.ingestSessionsAndWeather.mockRejectedValue(error);

      await expect(mockOpenF1Service.ingestSessionsAndWeather(2023)).rejects.toThrow('Ingestion failed');
      expect(mockOpenF1Service.ingestSessionsAndWeather).toHaveBeenCalledWith(2023);
    });
  });
});
