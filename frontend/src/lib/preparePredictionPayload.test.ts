import { describe, it, expect, vi, beforeEach } from 'vitest';
// import { preparePredictionPayload } from './preparePredictionPayload';
import type { Driver } from '../types';
import * as api from './api';

// Mock apiFetch
vi.mock('./api', () => ({
  apiFetch: vi.fn(),
}));

// Mock the disabled function
const preparePredictionPayload = vi.fn();

describe.skip('preparePredictionPayload', () => {
  const mockDrivers: Driver[] = [
    {
      id: 1,
      code: 'VER',
      full_name: 'Max Verstappen',
      family_name: 'Verstappen',
      given_name: 'Max',
      current_team_name: 'Red Bull Racing',
      image_url: 'https://example.com/ver.png',
      team_color: 'E10600',
    } as Driver,
    {
      id: 44,
      code: 'HAM',
      full_name: 'Lewis Hamilton',
      family_name: 'Hamilton',
      given_name: 'Lewis',
      current_team_name: 'Mercedes',
      image_url: 'https://example.com/ham.png',
      team_color: '00D2BE',
    } as Driver,
  ];

  const mockQualifyingResults = [
    { driverId: 1, position: 1 },
    { driverId: 44, position: 3 },
  ];

  const mockStandings = [
    { driver: { id: 1 }, points: 350, position: 1 },
    { driver: { id: 44 }, points: 280, position: 2 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.apiFetch).mockImplementation(async (path: string) => {
      if (path.includes('/qualifying-results')) {
        return mockQualifyingResults as any;
      }
      if (path.includes('/standings/drivers')) {
        return mockStandings as any;
      }
      return [] as any;
    });
  });

  it('should prepare prediction payload with driver features', async () => {
    const result = await preparePredictionPayload(mockDrivers, 2024);

    expect(result).toHaveLength(2);
    expect(result[0]).toHaveProperty('driverId', '1');
    expect(result[0]).toHaveProperty('features');
    expect(result[0].features).toHaveProperty('grid_position', 1);
    expect(result[0].features).toHaveProperty('driver_standings_position_before_race', 1);
    expect(result[0].features).toHaveProperty('driver_points_before_race', 350);
  });

  it('should use fallback values for missing data', async () => {
    const driversWithoutData: Driver[] = [
      {
        id: 999,
        code: 'NEW',
        full_name: 'New Driver',
        family_name: 'Driver',
        given_name: 'New',
        current_team_name: 'New Team',
        image_url: '',
        team_color: '',
      } as Driver,
    ];

    const result = await preparePredictionPayload(driversWithoutData, 2024);

    expect(result).toHaveLength(1);
    expect(result[0].features.grid_position).toBe(20); // Fallback
    expect(result[0].features.driver_standings_position_before_race).toBe(20); // Fallback
    expect(result[0].features.driver_points_before_race).toBe(0); // Fallback
  });

  it('should fetch data for correct season', async () => {
    await preparePredictionPayload(mockDrivers, 2023);

    expect(api.apiFetch).toHaveBeenCalledWith(
      expect.stringContaining('season=2023')
    );
  });

  it('should handle empty drivers array', async () => {
    const result = await preparePredictionPayload([], 2024);

    expect(result).toEqual([]);
  });

  it('should ensure all feature values are numbers', async () => {
    const result = await preparePredictionPayload(mockDrivers, 2024);

    result.forEach((driverPayload) => {
      Object.values(driverPayload.features).forEach((value) => {
        expect(typeof value).toBe('number');
        expect(isNaN(value)).toBe(false);
      });
    });
  });

  it('should replace NaN values with 0', async () => {
    // Mock data that would cause NaN
    vi.mocked(api.apiFetch).mockImplementation(async (path: string) => {
      if (path.includes('/qualifying-results')) {
        return [] as any; // No qualifying data
      }
      if (path.includes('/standings/drivers')) {
        return [] as any; // No standings data
      }
      return [] as any;
    });

    const result = await preparePredictionPayload(mockDrivers, 2024);

    // Missing qualifying position falls back to 20
    expect(result[0].features.grid_position).toBe(20);
    // Missing standings falls back to position 20 and 0 points
    expect(result[0].features.driver_standings_position_before_race).toBe(20);
    expect(result[0].features.driver_points_before_race).toBe(0);
  });

  it('should convert driver id to string', async () => {
    const result = await preparePredictionPayload(mockDrivers, 2024);

    expect(typeof result[0].driverId).toBe('string');
    expect(result[0].driverId).toBe('1');
    expect(typeof result[1].driverId).toBe('string');
    expect(result[1].driverId).toBe('44');
  });

  it('should include all required features', async () => {
    const result = await preparePredictionPayload(mockDrivers, 2024);

    const requiredFeatures = [
      'grid_position',
      'driver_standings_position_before_race',
      'driver_points_before_race',
      'constructor_standings_position_before_race',
      'driver_age',
      'avg_points_last_5_races',
      'avg_finish_pos_at_circuit',
    ];

    requiredFeatures.forEach((feature) => {
      expect(result[0].features).toHaveProperty(feature);
      expect(typeof result[0].features[feature]).toBe('number');
    });
  });
});

