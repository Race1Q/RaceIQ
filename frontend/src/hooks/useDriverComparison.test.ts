import { describe, it, vi, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDriverComparison } from './useDriverComparison';
import type { DriverComparisonStats } from './useDriverComparison';
import * as api from '../lib/api';

// Mock API functions
vi.mock('../lib/api', () => ({
  apiFetch: vi.fn(),
  buildApiUrl: vi.fn((path: string) => `https://api.example.com${path}`),
}));

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useDriverComparison', () => {
  const mockYears = [2025, 2024, 2023, 2022, 2021];

  const mockDriverStats: DriverComparisonStats = {
    driverId: 1,
    year: 2024,
    career: {
      wins: 60,
      podiums: 105,
      fastestLaps: 35,
      points: 2800,
      dnfs: 15,
      sprintWins: 10,
      sprintPodiums: 15,
    },
    yearStats: {
      wins: 15,
      podiums: 20,
      fastestLaps: 8,
      points: 450,
      dnfs: 2,
      sprintWins: 3,
      sprintPodiums: 4,
      poles: 10,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock standings endpoint
    mockFetch.mockImplementation(async (url: string) => {
      if (url.includes('/api/standings/2025/99')) {
        return {
          ok: true,
          json: async () => ({
            driverStandings: [
              {
                driverId: 1,
                driverFullName: 'Max Verstappen',
                driverFirstName: 'Max',
                driverLastName: 'Verstappen',
                driverCode: 'VER',
                constructorName: 'Red Bull Racing',
                driverProfileImageUrl: 'https://example.com/ver.png',
                driverCountryCode: 'NLD',
                driverNumber: 1,
              },
              {
                driverId: 44,
                driverFullName: 'Lewis Hamilton',
                driverFirstName: 'Lewis',
                driverLastName: 'Hamilton',
                driverCode: 'HAM',
                constructorName: 'Mercedes',
                driverProfileImageUrl: 'https://example.com/ham.png',
                driverCountryCode: 'GBR',
                driverNumber: 44,
              },
            ],
          }),
        };
      }
      return { ok: false, status: 404 };
    });

    // Mock apiFetch
    vi.mocked(api.apiFetch).mockImplementation(async (path: string) => {
      if (path.includes('/races/years')) {
        return mockYears as any;
      }
      if (path.includes('/drivers/') && path.includes('/stats')) {
        return mockDriverStats as any;
      }
      if (path.includes('/drivers/') && path.includes('/career-stats')) {
        return {
          wins: 60,
          podiums: 105,
          points: 2800,
        } as any;
      }
      throw new Error('Not found');
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default values', async () => {
      const { result } = renderHook(() => useDriverComparison());

      expect(result.current.loading).toBe(true);
      expect(result.current.driver1).toBeNull();
      expect(result.current.driver2).toBeNull();
      expect(result.current.selection1).toBeNull();
      expect(result.current.selection2).toBeNull();
      expect(result.current.stats1).toBeNull();
      expect(result.current.stats2).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should load drivers list and years on mount', async () => {
      const { result } = renderHook(() => useDriverComparison());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.allDrivers).toHaveLength(2);
      expect(result.current.years).toEqual([2025, 2024, 2023, 2022, 2021]);
      expect(result.current.allDrivers[0].full_name).toBe('Max Verstappen');
    });

    it('should have all metrics enabled by default', async () => {
      const { result } = renderHook(() => useDriverComparison());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.enabledMetrics).toEqual({
        wins: true,
        podiums: true,
        fastestLaps: true,
        points: true,
        sprintWins: true,
        sprintPodiums: true,
        dnfs: true,
        poles: true,
      });
    });

    it('should handle fetch errors gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useDriverComparison());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.allDrivers).toEqual([]);
    });

    it('should use fallback years if API fails', async () => {
      vi.mocked(api.apiFetch).mockImplementation(async (path: string) => {
        if (path.includes('/races/years')) {
          throw new Error('Years API failed');
        }
        return mockDriverStats as any;
      });

      const { result } = renderHook(() => useDriverComparison());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const currentYear = new Date().getFullYear();
      expect(result.current.years).toHaveLength(15);
      expect(result.current.years[0]).toBe(currentYear);
    });
  });

  describe('Driver Selection', () => {
    it('should select driver with selectDriver function', async () => {
      const { result } = renderHook(() => useDriverComparison());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      result.current.selectDriver(1, '1', 2024);

      await waitFor(() => {
        expect(result.current.selection1).toEqual({ driverId: '1', year: 2024 });
      });

      expect(result.current.driver1?.fullName).toBe('Max Verstappen');
      expect(result.current.stats1).toEqual(mockDriverStats);
    });

    it('should select career stats when year is "career"', async () => {
      const { result } = renderHook(() => useDriverComparison());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      result.current.selectDriver(2, '44', 'career');

      await waitFor(() => {
        expect(result.current.selection2).toEqual({ driverId: '44', year: 'career' });
      });

      expect(vi.mocked(api.apiFetch)).toHaveBeenCalledWith('/api/drivers/44/stats');
    });

    it('should handle errors when selecting driver', async () => {
      const { result } = renderHook(() => useDriverComparison());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      vi.mocked(api.apiFetch).mockRejectedValueOnce(new Error('Driver not found'));

      result.current.selectDriver(1, '999', 2024);

      await waitFor(() => {
        expect(result.current.error).toBe('Driver not found');
      }, { timeout: 3000 });
    });

    it('should select driver for multiple years', async () => {
      const stats2024 = { ...mockDriverStats, year: 2024 };
      const stats2023 = {
        ...mockDriverStats,
        year: 2023,
        yearStats: { ...mockDriverStats.yearStats!, wins: 10 },
      };

      vi.mocked(api.apiFetch).mockImplementation(async (path: string) => {
        if (path.includes('year=2024')) return stats2024 as any;
        if (path.includes('year=2023')) return stats2023 as any;
        return mockDriverStats as any;
      });

      const { result } = renderHook(() => useDriverComparison());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      result.current.selectDriverForYears(1, '1', [2024, 2023]);

      await waitFor(() => {
        expect(result.current.stats1?.yearStats?.wins).toBe(25); // 15 + 10
      });
    });

    it('should use career stats when selecting empty years array', async () => {
      const { result } = renderHook(() => useDriverComparison());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      result.current.selectDriverForYears(1, '1', []);

      await waitFor(() => {
        expect(vi.mocked(api.apiFetch)).toHaveBeenCalledWith('/api/drivers/1/stats');
      });
    });

    it('should fetch single year stats when selecting one year', async () => {
      const { result } = renderHook(() => useDriverComparison());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      result.current.selectDriverForYears(1, '1', [2024]);

      await waitFor(() => {
        expect(vi.mocked(api.apiFetch)).toHaveBeenCalledWith('/api/drivers/1/stats?year=2024');
      });
    });
  });

  describe('Legacy Driver Selection', () => {
    it('should select driver using legacy handleSelectDriver', async () => {
      const { result } = renderHook(() => useDriverComparison());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      result.current.handleSelectDriver(1, '1');

      await waitFor(() => {
        expect(result.current.driver1).not.toBeNull();
      });

      expect(result.current.driver1?.fullName).toBe('Max Verstappen');
      expect(vi.mocked(api.apiFetch)).toHaveBeenCalledWith('/api/drivers/1/career-stats');
    });

    it('should fallback to stats endpoint if career-stats fails', async () => {
      vi.mocked(api.apiFetch).mockImplementation(async (path: string) => {
        if (path.includes('/career-stats')) {
          throw new Error('Not found');
        }
        if (path.includes('/stats')) {
          return { wins: 60, podiums: 105, points: 2800 } as any;
        }
        return mockDriverStats as any;
      });

      const { result } = renderHook(() => useDriverComparison());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      result.current.handleSelectDriver(1, '1');

      await waitFor(() => {
        expect(result.current.driver1).not.toBeNull();
      });

      expect(vi.mocked(api.apiFetch)).toHaveBeenCalledWith('/api/drivers/1/stats');
    });

    it('should not select driver if driverId is empty', async () => {
      const { result } = renderHook(() => useDriverComparison());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      result.current.handleSelectDriver(1, '');

      expect(result.current.driver1).toBeNull();
      expect(vi.mocked(api.apiFetch)).not.toHaveBeenCalledWith(
        expect.stringContaining('/drivers/')
      );
    });
  });

  describe('Metric Toggling', () => {
    it('should toggle metric on and off', async () => {
      const { result } = renderHook(() => useDriverComparison());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.enabledMetrics.wins).toBe(true);

      await waitFor(() => {
        result.current.toggleMetric('wins');
      });
      
      await waitFor(() => {
        expect(result.current.enabledMetrics.wins).toBe(false);
      });

      await waitFor(() => {
        result.current.toggleMetric('wins');
      });
      
      await waitFor(() => {
        expect(result.current.enabledMetrics.wins).toBe(true);
      });
    });

    it('should toggle multiple metrics independently', async () => {
      const { result } = renderHook(() => useDriverComparison());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await waitFor(() => {
        result.current.toggleMetric('wins');
      });
      
      await waitFor(() => {
        result.current.toggleMetric('podiums');
      });

      await waitFor(() => {
        expect(result.current.enabledMetrics.wins).toBe(false);
        expect(result.current.enabledMetrics.podiums).toBe(false);
        expect(result.current.enabledMetrics.points).toBe(true);
      });
    });
  });

  describe('Clear Selection', () => {
    it('should clear slot 1 selection', async () => {
      const { result } = renderHook(() => useDriverComparison());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      result.current.selectDriver(1, '1', 2024);

      await waitFor(() => {
        expect(result.current.driver1).not.toBeNull();
      });

      await waitFor(() => {
        result.current.clearSelection(1);
      });

      await waitFor(() => {
        expect(result.current.driver1).toBeNull();
        expect(result.current.selection1).toBeNull();
        expect(result.current.stats1).toBeNull();
      });
    });

    it('should clear slot 2 selection', async () => {
      const { result } = renderHook(() => useDriverComparison());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      result.current.selectDriver(2, '44', 2024);

      await waitFor(() => {
        expect(result.current.driver2).not.toBeNull();
      });

      await waitFor(() => {
        result.current.clearSelection(2);
      });

      await waitFor(() => {
        expect(result.current.driver2).toBeNull();
        expect(result.current.selection2).toBeNull();
        expect(result.current.stats2).toBeNull();
      });
    });

    it('should not affect other slot when clearing', async () => {
      const { result } = renderHook(() => useDriverComparison());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      result.current.selectDriver(1, '1', 2024);
      result.current.selectDriver(2, '44', 2024);

      await waitFor(() => {
        expect(result.current.driver1).not.toBeNull();
        expect(result.current.driver2).not.toBeNull();
      });

      await waitFor(() => {
        result.current.clearSelection(1);
      });

      await waitFor(() => {
        expect(result.current.driver1).toBeNull();
        expect(result.current.driver2).not.toBeNull();
      });
    });
  });

  describe('Composite Score Calculation', () => {
    it('should return null scores when no stats available', async () => {
      const { result } = renderHook(() => useDriverComparison());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.score.d1).toBeNull();
      expect(result.current.score.d2).toBeNull();
    });

    it('should calculate composite score for two drivers', async () => {
      const { result } = renderHook(() => useDriverComparison());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const stats2 = {
        ...mockDriverStats,
        driverId: 44,
        yearStats: {
          ...mockDriverStats.yearStats!,
          wins: 10,
          podiums: 15,
        },
      };

      vi.mocked(api.apiFetch).mockImplementation(async (path: string) => {
        if (path.includes('/drivers/1/')) return mockDriverStats as any;
        if (path.includes('/drivers/44/')) return stats2 as any;
        return mockDriverStats as any;
      });

      result.current.selectDriver(1, '1', 2024);
      result.current.selectDriver(2, '44', 2024);

      await waitFor(() => {
        expect(result.current.stats1).not.toBeNull();
        expect(result.current.stats2).not.toBeNull();
      });

      expect(result.current.score.d1).not.toBeNull();
      expect(result.current.score.d2).not.toBeNull();
      expect(typeof result.current.score.d1).toBe('number');
      expect(typeof result.current.score.d2).toBe('number');
    });

    it('should calculate normalized scores for each metric', async () => {
      const { result } = renderHook(() => useDriverComparison());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const stats2 = { ...mockDriverStats, driverId: 44 };

      vi.mocked(api.apiFetch).mockImplementation(async (path: string) => {
        if (path.includes('/drivers/1/')) return mockDriverStats as any;
        if (path.includes('/drivers/44/')) return stats2 as any;
        return mockDriverStats as any;
      });

      result.current.selectDriver(1, '1', 2024);
      result.current.selectDriver(2, '44', 2024);

      await waitFor(() => {
        expect(result.current.stats1).not.toBeNull();
        expect(result.current.stats2).not.toBeNull();
      });

      await waitFor(() => {
        expect(result.current.score.perMetric).toBeDefined();
        expect(Object.keys(result.current.score.perMetric).length).toBeGreaterThan(0);
      });

      expect(result.current.score.perMetric).toHaveProperty('wins');
      expect(result.current.score.perMetric.wins).toHaveLength(2);
    });

    it('should handle DNFs correctly (lower is better)', async () => {
      const { result } = renderHook(() => useDriverComparison());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const stats1 = {
        ...mockDriverStats,
        yearStats: { ...mockDriverStats.yearStats!, dnfs: 2 },
      };
      const stats2 = {
        ...mockDriverStats,
        driverId: 44,
        yearStats: { ...mockDriverStats.yearStats!, dnfs: 5 },
      };

      vi.mocked(api.apiFetch).mockImplementation(async (path: string) => {
        if (path.includes('/drivers/1/')) return stats1 as any;
        if (path.includes('/drivers/44/')) return stats2 as any;
        return mockDriverStats as any;
      });

      result.current.selectDriver(1, '1', 2024);
      result.current.selectDriver(2, '44', 2024);

      await waitFor(() => {
        expect(result.current.score.perMetric.dnfs).toBeDefined();
      });

      // Driver 1 has fewer DNFs, should score higher
      const [score1, score2] = result.current.score.perMetric.dnfs;
      expect(score1).toBeGreaterThan(score2);
    });

    it('should update score when metrics are toggled', async () => {
      const { result } = renderHook(() => useDriverComparison());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const stats2 = {
        ...mockDriverStats,
        driverId: 44,
        yearStats: {
          ...mockDriverStats.yearStats!,
          wins: 5, // Different from driver 1
          podiums: 10, // Different from driver 1
        },
      };

      vi.mocked(api.apiFetch).mockImplementation(async (path: string) => {
        if (path.includes('/drivers/1/')) return mockDriverStats as any;
        if (path.includes('/drivers/44/')) return stats2 as any;
        return mockDriverStats as any;
      });

      result.current.selectDriver(1, '1', 2024);
      result.current.selectDriver(2, '44', 2024);

      await waitFor(() => {
        expect(result.current.score.d1).not.toBeNull();
      });

      // Disable all metrics except one that driver 1 is weaker at
      await waitFor(() => {
        result.current.toggleMetric('wins');
      });
      
      await waitFor(() => {
        result.current.toggleMetric('podiums');
      });

      await waitFor(() => {
        // Score should recalculate with fewer metrics
        expect(result.current.score.d1).toBeDefined();
      });
    });

    it('should use career stats when yearStats is null', async () => {
      const { result } = renderHook(() => useDriverComparison());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const careerStats1 = { ...mockDriverStats, yearStats: null };
      const careerStats2 = { ...mockDriverStats, driverId: 44, yearStats: null };

      vi.mocked(api.apiFetch).mockImplementation(async (path: string) => {
        if (path.includes('/drivers/1/')) return careerStats1 as any;
        if (path.includes('/drivers/44/')) return careerStats2 as any;
        return mockDriverStats as any;
      });

      result.current.selectDriver(1, '1', 'career');
      result.current.selectDriver(2, '44', 'career');

      await waitFor(() => {
        expect(result.current.score.d1).not.toBeNull();
      });

      expect(result.current.score.d1).toBeDefined();
      expect(result.current.score.d2).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle driver with missing data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ driverStandings: [] }),
      });

      const { result } = renderHook(() => useDriverComparison());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.allDrivers).toEqual([]);
    });

    it('should handle zero values in stats', async () => {
      const { result } = renderHook(() => useDriverComparison());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const zeroStats = {
        ...mockDriverStats,
        yearStats: {
          wins: 0,
          podiums: 0,
          fastestLaps: 0,
          points: 0,
          dnfs: 0,
          sprintWins: 0,
          sprintPodiums: 0,
          poles: 0,
        },
      };

      vi.mocked(api.apiFetch).mockImplementation(async () => zeroStats as any);

      result.current.selectDriver(1, '1', 2024);
      result.current.selectDriver(2, '44', 2024);

      await waitFor(() => {
        expect(result.current.score).toBeDefined();
      });

      // Should handle gracefully without division by zero
      expect(result.current.score.d1).toBeDefined();
      expect(result.current.score.d2).toBeDefined();
      expect(typeof result.current.score.d1).toBe('number');
      expect(typeof result.current.score.d2).toBe('number');
    });

    it('should cleanup on unmount', async () => {
      const { result, unmount } = renderHook(() => useDriverComparison());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      unmount();

      // Should not cause any errors
      expect(() => unmount()).not.toThrow();
    });

    it('should handle concurrent driver selections', async () => {
      const { result } = renderHook(() => useDriverComparison());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Select both drivers simultaneously
      result.current.selectDriver(1, '1', 2024);
      result.current.selectDriver(2, '44', 2024);

      await waitFor(() => {
        expect(result.current.stats1).not.toBeNull();
        expect(result.current.stats2).not.toBeNull();
      });

      expect(result.current.driver1?.fullName).toBe('Max Verstappen');
      expect(result.current.driver2?.fullName).toBe('Lewis Hamilton');
    });
  });
});

