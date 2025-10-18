import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDriverComparison } from './useDriverComparison';
import * as api from '../lib/api';

// Mock the API module
vi.mock('../lib/api', () => ({
  apiFetch: vi.fn(),
  buildApiUrl: vi.fn((path: string) => `http://localhost:3000${path}`),
}));

describe('useDriverComparison', () => {
  const mockDriversList = [
    {
      id: 1,
      full_name: 'Max Verstappen',
      given_name: 'Max',
      family_name: 'Verstappen',
      code: 'VER',
      current_team_name: 'Red Bull Racing',
      image_url: 'max.jpg',
      team_color: '#1E41FF',
      driver_number: 1,
    },
    {
      id: 2,
      full_name: 'Lewis Hamilton',
      given_name: 'Lewis',
      family_name: 'Hamilton',
      code: 'HAM',
      current_team_name: 'Mercedes',
      image_url: 'lewis.jpg',
      team_color: '#00D2BE',
      driver_number: 44,
    },
  ];

  const mockYears = [2025, 2024, 2023, 2022, 2021];

  const mockDriverStats = {
    driverId: 1,
    year: null,
    career: {
      wins: 50,
      podiums: 100,
      fastestLaps: 30,
      points: 2500,
      dnfs: 10,
      sprintWins: 5,
      sprintPodiums: 10,
    },
    yearStats: null,
  };

  const mockYearStats = {
    driverId: 1,
    year: 2024,
    career: {
      wins: 50,
      podiums: 100,
      fastestLaps: 30,
      points: 2500,
      dnfs: 10,
      sprintWins: 5,
      sprintPodiums: 10,
    },
    yearStats: {
      wins: 19,
      podiums: 21,
      fastestLaps: 8,
      points: 575,
      dnfs: 1,
      sprintWins: 3,
      sprintPodiums: 4,
      poles: 10,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    global.fetch = vi.fn((url: string) => {
      if (url.includes('/api/standings/2025/99')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ driverStandings: mockDriversList.map(d => ({
            driverId: d.id,
            driverFullName: d.full_name,
            driverFirstName: d.given_name,
            driverLastName: d.family_name,
            driverCode: d.code,
            constructorName: d.current_team_name,
            driverProfileImageUrl: d.image_url,
            driverCountryCode: 'GB',
            driverNumber: d.driver_number,
          })) }),
        } as Response);
      }
      return Promise.reject(new Error('Not found'));
    }) as any;

    vi.mocked(api.apiFetch).mockImplementation((url: string) => {
      if (url.includes('/races/years')) {
        return Promise.resolve(mockYears);
      }
      if (url.includes('/drivers/1/stats')) {
        return Promise.resolve(mockDriverStats);
      }
      if (url.includes('/drivers/2/stats')) {
        return Promise.resolve({ ...mockDriverStats, driverId: 2 });
      }
      if (url.includes('/drivers/1/career-stats')) {
        return Promise.resolve(mockDriverStats);
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with empty state and loads data', async () => {
    const { result } = renderHook(() => useDriverComparison());

    expect(result.current.loading).toBe(true);
    expect(result.current.allDrivers).toEqual([]);
    expect(result.current.driver1).toBeNull();
    expect(result.current.driver2).toBeNull();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.allDrivers).toHaveLength(2);
    expect(result.current.years).toEqual(mockYears);
    expect(result.current.error).toBeNull();
  });

  it('loads drivers list successfully', async () => {
    const { result } = renderHook(() => useDriverComparison());

    await waitFor(() => {
      expect(result.current.allDrivers).toHaveLength(2);
    });

    expect(result.current.allDrivers[0].full_name).toBe('Max Verstappen');
    expect(result.current.allDrivers[1].full_name).toBe('Lewis Hamilton');
  });

  it('loads years list successfully', async () => {
    const { result } = renderHook(() => useDriverComparison());

    await waitFor(() => {
      expect(result.current.years).toHaveLength(5);
    });

    expect(result.current.years).toEqual([2025, 2024, 2023, 2022, 2021]);
  });

  it('handles legacy handleSelectDriver for driver 1', async () => {
    const { result } = renderHook(() => useDriverComparison());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    result.current.handleSelectDriver(1, '1');

    await waitFor(() => {
      expect(result.current.driver1).not.toBeNull();
    });

    expect(result.current.driver1?.fullName).toBe('Max Verstappen');
    expect(result.current.driver1?.teamName).toBe('Red Bull Racing');
  });

  it('handles legacy handleSelectDriver for driver 2', async () => {
    const { result } = renderHook(() => useDriverComparison());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    result.current.handleSelectDriver(2, '2');

    await waitFor(() => {
      expect(result.current.driver2).not.toBeNull();
    });

    expect(result.current.driver2?.fullName).toBe('Lewis Hamilton');
    expect(result.current.driver2?.teamName).toBe('Mercedes');
  });

  it('handles selectDriver with career stats', async () => {
    const { result } = renderHook(() => useDriverComparison());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    result.current.selectDriver(1, '1', 'career');

    await waitFor(() => {
      expect(result.current.stats1).not.toBeNull();
    });

    expect(result.current.stats1?.career.wins).toBe(50);
    expect(result.current.selection1?.driverId).toBe('1');
    expect(result.current.selection1?.year).toBe('career');
  });

  it('handles selectDriver with specific year', async () => {
    vi.mocked(api.apiFetch).mockImplementation((url: string) => {
      if (url.includes('/races/years')) {
        return Promise.resolve(mockYears);
      }
      if (url.includes('/drivers/1/stats?year=2024')) {
        return Promise.resolve(mockYearStats);
      }
      return Promise.reject(new Error('Not found'));
    });

    const { result } = renderHook(() => useDriverComparison());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    result.current.selectDriver(1, '1', 2024);

    await waitFor(() => {
      expect(result.current.stats1?.yearStats).not.toBeNull();
    });

    expect(result.current.stats1?.yearStats?.wins).toBe(19);
    expect(result.current.stats1?.yearStats?.poles).toBe(10);
  });

  it('handles selectDriverForYears with single year', async () => {
    vi.mocked(api.apiFetch).mockImplementation((url: string) => {
      if (url.includes('/races/years')) {
        return Promise.resolve(mockYears);
      }
      if (url.includes('/drivers/1/stats?year=2024')) {
        return Promise.resolve(mockYearStats);
      }
      return Promise.reject(new Error('Not found'));
    });

    const { result } = renderHook(() => useDriverComparison());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    result.current.selectDriverForYears(1, '1', [2024]);

    await waitFor(() => {
      expect(result.current.stats1?.yearStats).not.toBeNull();
    });

    expect(result.current.stats1?.yearStats?.wins).toBe(19);
  });

  it('handles selectDriverForYears with multiple years and aggregates stats', async () => {
    const mockYear2024Stats = { ...mockYearStats, year: 2024 };
    const mockYear2023Stats = {
      ...mockYearStats,
      year: 2023,
      yearStats: {
        wins: 10,
        podiums: 15,
        fastestLaps: 5,
        points: 400,
        dnfs: 2,
        sprintWins: 2,
        sprintPodiums: 3,
        poles: 8,
      },
    };

    vi.mocked(api.apiFetch).mockImplementation((url: string) => {
      if (url.includes('/races/years')) {
        return Promise.resolve(mockYears);
      }
      if (url.includes('/drivers/1/stats?year=2024')) {
        return Promise.resolve(mockYear2024Stats);
      }
      if (url.includes('/drivers/1/stats?year=2023')) {
        return Promise.resolve(mockYear2023Stats);
      }
      return Promise.reject(new Error('Not found'));
    });

    const { result } = renderHook(() => useDriverComparison());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    result.current.selectDriverForYears(1, '1', [2024, 2023]);

    await waitFor(() => {
      expect(result.current.stats1?.yearStats).not.toBeNull();
    });

    // Should aggregate: 2024 (19 wins) + 2023 (10 wins) = 29 wins
    expect(result.current.stats1?.yearStats?.wins).toBe(29);
    expect(result.current.stats1?.yearStats?.podiums).toBe(36); // 21 + 15
    expect(result.current.stats1?.yearStats?.points).toBe(975); // 575 + 400
  });

  it('toggles metrics on/off', async () => {
    const { result } = renderHook(() => useDriverComparison());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.enabledMetrics.wins).toBe(true);

    result.current.toggleMetric('wins');
    
    await waitFor(() => {
      expect(result.current.enabledMetrics.wins).toBe(false);
    });

    result.current.toggleMetric('wins');
    
    await waitFor(() => {
      expect(result.current.enabledMetrics.wins).toBe(true);
    });
  });

  it('clears selection for slot 1', async () => {
    const { result } = renderHook(() => useDriverComparison());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    result.current.selectDriver(1, '1', 'career');

    await waitFor(() => {
      expect(result.current.stats1).not.toBeNull();
    });

    result.current.clearSelection(1);

    await waitFor(() => {
      expect(result.current.selection1).toBeNull();
      expect(result.current.stats1).toBeNull();
    });
  });

  it('clears selection for slot 2', async () => {
    const { result } = renderHook(() => useDriverComparison());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    result.current.selectDriver(2, '2', 'career');

    await waitFor(() => {
      expect(result.current.stats2).not.toBeNull();
    });

    result.current.clearSelection(2);

    await waitFor(() => {
      expect(result.current.selection2).toBeNull();
      expect(result.current.stats2).toBeNull();
    });
  });

  it('computes composite score when both drivers have stats', async () => {
    const { result } = renderHook(() => useDriverComparison());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    result.current.selectDriver(1, '1', 'career');
    result.current.selectDriver(2, '2', 'career');

    await waitFor(() => {
      expect(result.current.stats1).not.toBeNull();
      expect(result.current.stats2).not.toBeNull();
    });

    expect(result.current.score.d1).not.toBeNull();
    expect(result.current.score.d2).not.toBeNull();
    expect(typeof result.current.score.d1).toBe('number');
    expect(typeof result.current.score.d2).toBe('number');
  });

  it('handles error when fetching drivers list fails', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error'))) as any;

    const { result } = renderHook(() => useDriverComparison());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.allDrivers).toEqual([]);
  });

  it('handles error when fetching driver stats fails', async () => {
    vi.mocked(api.apiFetch).mockImplementation((url: string) => {
      if (url.includes('/races/years')) {
        return Promise.resolve(mockYears);
      }
      if (url.includes('/drivers/1/stats')) {
        return Promise.reject(new Error('Stats not found'));
      }
      return Promise.reject(new Error('Not found'));
    });

    const { result } = renderHook(() => useDriverComparison());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    result.current.selectDriver(1, '1', 'career');

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    // Error message is the original error or 'Failed to load driver stats'
    expect(result.current.error).toBeTruthy();
  });

  it('fallbacks to generated years when API fails', async () => {
    vi.mocked(api.apiFetch).mockImplementation((url: string) => {
      if (url.includes('/races/years')) {
        return Promise.reject(new Error('Failed'));
      }
      return Promise.reject(new Error('Not found'));
    });

    const { result } = renderHook(() => useDriverComparison());

    await waitFor(() => {
      expect(result.current.years.length).toBeGreaterThan(0);
    });

    const currentYear = new Date().getFullYear();
    expect(result.current.years[0]).toBe(currentYear);
    expect(result.current.years).toHaveLength(15);
  });

  it('handles empty driverId gracefully in selectDriver', async () => {
    const { result } = renderHook(() => useDriverComparison());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    result.current.selectDriver(1, '', 'career');

    // Should not attempt to fetch
    expect(result.current.stats1).toBeNull();
    expect(result.current.selection1).toBeNull();
  });

  it('handles empty driverId gracefully in handleSelectDriver', async () => {
    const { result } = renderHook(() => useDriverComparison());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    result.current.handleSelectDriver(1, '');

    // Should not attempt to fetch
    expect(result.current.driver1).toBeNull();
  });

  it('updates enabled metrics correctly', async () => {
    const { result } = renderHook(() => useDriverComparison());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // All should be enabled by default
    expect(result.current.enabledMetrics.wins).toBe(true);
    expect(result.current.enabledMetrics.podiums).toBe(true);
    expect(result.current.enabledMetrics.points).toBe(true);

    // Toggle wins off
    result.current.toggleMetric('wins');
    
    await waitFor(() => {
      expect(result.current.enabledMetrics.wins).toBe(false);
    });
    expect(result.current.enabledMetrics.podiums).toBe(true);

    // Toggle podiums off
    result.current.toggleMetric('podiums');
    
    await waitFor(() => {
      expect(result.current.enabledMetrics.podiums).toBe(false);
    });
  });

  it('computes score with only enabled metrics', async () => {
    const { result } = renderHook(() => useDriverComparison());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    result.current.selectDriver(1, '1', 'career');
    result.current.selectDriver(2, '2', 'career');

    await waitFor(() => {
      expect(result.current.stats1).not.toBeNull();
      expect(result.current.stats2).not.toBeNull();
    });

    const initialScore = result.current.score;
    expect(initialScore.d1).not.toBeNull();

    // Disable all metrics except wins
    result.current.toggleMetric('podiums');
    result.current.toggleMetric('fastestLaps');
    result.current.toggleMetric('points');
    result.current.toggleMetric('sprintWins');
    result.current.toggleMetric('sprintPodiums');
    result.current.toggleMetric('dnfs');

    await waitFor(() => {
      const newScore = result.current.score;
      expect(newScore.d1).not.toBeNull();
      // Score object should be recomputed (even if values are same when stats are equal)
      expect(Object.keys(newScore.perMetric).length).toBeLessThan(Object.keys(initialScore.perMetric).length);
    });
  });

  it('returns null score when no drivers selected', async () => {
    const { result } = renderHook(() => useDriverComparison());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.score.d1).toBeNull();
    expect(result.current.score.d2).toBeNull();
  });

  it('handles selectDriverForYears with empty years array (falls back to career)', async () => {
    const { result } = renderHook(() => useDriverComparison());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    result.current.selectDriverForYears(1, '1', []);

    await waitFor(() => {
      expect(result.current.stats1).not.toBeNull();
    });

    expect(result.current.stats1?.year).toBeNull();
    expect(result.current.stats1?.career).toBeDefined();
  });

  it('maps driver details correctly when base data is missing', async () => {
    vi.mocked(api.apiFetch).mockImplementation((url: string) => {
      if (url.includes('/races/years')) {
        return Promise.resolve(mockYears);
      }
      if (url.includes('/drivers/999/career-stats')) {
        return Promise.resolve({
          wins: 10,
          teamName: 'Unknown Team',
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    const { result } = renderHook(() => useDriverComparison());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    result.current.handleSelectDriver(1, '999');

    await waitFor(() => {
      expect(result.current.driver1).not.toBeNull();
    });

    expect(result.current.driver1?.fullName).toBe('999');
    expect(result.current.driver1?.teamName).toBe('Unknown Team');
  });
});

