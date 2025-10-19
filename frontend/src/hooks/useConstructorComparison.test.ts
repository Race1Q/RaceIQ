import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useConstructorComparison } from './useConstructorComparison';
import * as api from '../lib/api';
import * as csi from '../lib/csi';

// Mock the API module
vi.mock('../lib/api', () => ({
  apiFetch: vi.fn(),
  buildApiUrl: (path: string) => `http://test.local${path}`,
}));

// Mock the CSI module
vi.mock('../lib/csi', () => ({
  getCSIForConstructor: vi.fn(() => 1.0),
  applyCSIDampener: vi.fn((score, csi, kind, alpha) => score),
}));

describe('useConstructorComparison', () => {
  const mockConstructorsList = [
    { id: 1, name: 'Red Bull Racing', nationality: 'Austrian', is_active: true },
    { id: 2, name: 'Ferrari', nationality: 'Italian', is_active: true },
    { id: 3, name: 'McLaren', nationality: 'British', is_active: true },
    { id: 99, name: 'Old Team', nationality: 'British', is_active: false },
  ];

  const mockYears = [2024, 2023, 2022, 2021, 2020];

  const mockConstructorStats = {
    year: 2024,
    constructor: { name: 'Red Bull Racing' },
    name: 'Red Bull Racing',
    career: {
      wins: 120,
      podiums: 250,
      poles: 95,
      points: 8500,
      dnfs: 45,
      races: 350,
    },
    yearStats: {
      wins: 19,
      podiums: 32,
      poles: 18,
      points: 860,
      dnfs: 2,
      races: 24,
    },
  };

  const mockLegacyStats = [
    { year: 2024, stats: { wins: 19, podiums: 32, points: 860 } },
    { year: 2023, stats: { wins: 21, podiums: 35, points: 900 } },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    vi.mocked(api.apiFetch).mockImplementation(async (path: string) => {
      if (path.includes('/constructors/active')) {
        return mockConstructorsList;
      }
      if (path.includes('/races/years')) {
        return mockYears;
      }
      if (path.includes('/constructors/') && path.includes('/stats/all')) {
        return mockLegacyStats;
      }
      if (path.includes('/constructors/') && path.includes('/stats')) {
        return mockConstructorStats;
      }
      throw new Error('Unknown endpoint');
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with loading state', async () => {
      const { result } = renderHook(() => useConstructorComparison());

      expect(result.current.loading).toBe(true);
      expect(result.current.allConstructors).toEqual([]);
      expect(result.current.years).toEqual([]);
      expect(result.current.constructor1).toBeNull();
      expect(result.current.constructor2).toBeNull();
      expect(result.current.stats1).toBeNull();
      expect(result.current.stats2).toBeNull();
      expect(result.current.error).toBeNull();

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should load constructors and years on mount', async () => {
      const { result } = renderHook(() => useConstructorComparison());

      await waitFor(() => {
        expect(result.current.allConstructors).toEqual(mockConstructorsList);
        expect(result.current.years).toEqual(mockYears);
        expect(result.current.loading).toBe(false);
      });

      expect(api.apiFetch).toHaveBeenCalledWith('/api/constructors/active');
      expect(api.apiFetch).toHaveBeenCalledWith('/api/races/years');
    });

    it('should have correct default enabled metrics', async () => {
      const { result } = renderHook(() => useConstructorComparison());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.enabledMetrics).toEqual({
        wins: true,
        podiums: true,
        poles: true,
        points: true,
        dnfs: false,
        races: true,
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle error when fetching constructors fails', async () => {
      vi.mocked(api.apiFetch).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useConstructorComparison());

      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
        expect(result.current.loading).toBe(false);
      });
    });

    it('should fallback to default years if fetching years fails', async () => {
      vi.mocked(api.apiFetch).mockImplementation(async (path: string) => {
        if (path.includes('/constructors/active')) {
          return mockConstructorsList;
        }
        if (path.includes('/races/years')) {
          throw new Error('Years fetch failed');
        }
        return [];
      });

      const { result } = renderHook(() => useConstructorComparison());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.years.length).toBeGreaterThan(0);
        // Should generate years array as fallback
        const currentYear = new Date().getFullYear();
        expect(result.current.years[0]).toBe(currentYear);
      });
    });
  });

  describe('handleSelectConstructor (Legacy)', () => {
    it('should load legacy constructor stats', async () => {
      const { result } = renderHook(() => useConstructorComparison());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.handleSelectConstructor(1, '1');
      });

      await waitFor(() => {
        expect(result.current.constructor1).not.toBeNull();
        expect(result.current.constructor1?.id).toBe('1');
        expect(result.current.constructor1?.name).toBe('Red Bull Racing');
      });
    });

    it('should load stats for slot 2', async () => {
      const { result } = renderHook(() => useConstructorComparison());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.handleSelectConstructor(2, '2');
      });

      await waitFor(() => {
        expect(result.current.constructor2).not.toBeNull();
        expect(result.current.constructor2?.id).toBe('2');
        expect(result.current.constructor2?.name).toBe('Ferrari');
      });
    });

    it('should handle null stats gracefully when legacy fetch fails', async () => {
      // The fetchConstructorLegacyStats function catches errors and returns null
      // So we test that the hook handles null stats gracefully
      vi.mocked(api.apiFetch).mockImplementation(async (path: string) => {
        if (path.includes('/stats/all')) {
          throw new Error('Stats fetch failed'); // This will be caught and return null
        }
        return path.includes('/active') ? mockConstructorsList : mockYears;
      });

      const { result } = renderHook(() => useConstructorComparison());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.handleSelectConstructor(1, '1');
      });

      // The hook should complete loading even with null stats
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Constructor should still be loaded with default stats
      expect(result.current.constructor1).not.toBeNull();
      expect(result.current.constructor1?.wins).toBe(0);
      expect(result.current.constructor1?.podiums).toBe(0);
    });

    it('should not load if constructorId is empty', async () => {
      const { result } = renderHook(() => useConstructorComparison());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const initialLoading = result.current.loading;
      
      act(() => {
        result.current.handleSelectConstructor(1, '');
      });

      expect(result.current.loading).toBe(initialLoading);
    });
  });

  describe('selectConstructor (New)', () => {
    it('should load constructor stats for a specific year', async () => {
      const { result } = renderHook(() => useConstructorComparison());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.selectConstructor(1, '1', 2024);
      });

      await waitFor(() => {
        expect(result.current.stats1).not.toBeNull();
        expect(result.current.stats1?.constructorId).toBe(1);
        expect(result.current.stats1?.year).toBe(2024);
        expect(result.current.selection1).toEqual({
          constructorId: '1',
          year: 2024,
        });
      });
    });

    it('should load career stats when year is "career"', async () => {
      const { result } = renderHook(() => useConstructorComparison());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.selectConstructor(2, '2', 'career');
      });

      await waitFor(() => {
        expect(result.current.stats2).not.toBeNull();
        expect(result.current.selection2).toEqual({
          constructorId: '2',
          year: 'career',
        });
      });
    });

    it('should handle stats with null yearStats', async () => {
      vi.mocked(api.apiFetch).mockImplementation(async (path: string) => {
        if (path.includes('/stats')) {
          return { ...mockConstructorStats, yearStats: null };
        }
        return path.includes('/active') ? mockConstructorsList : mockYears;
      });

      const { result } = renderHook(() => useConstructorComparison());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.selectConstructor(1, '1', 2024);
      });

      await waitFor(() => {
        expect(result.current.stats1).not.toBeNull();
        expect(result.current.stats1?.yearStats).toBeNull();
      });
    });
  });

  describe('selectConstructorForYears (Multiple Years)', () => {
    it('should aggregate stats for multiple years', async () => {
      const { result } = renderHook(() => useConstructorComparison());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.selectConstructorForYears(1, '1', [2024, 2023]);
      });

      await waitFor(() => {
        expect(result.current.stats1).not.toBeNull();
        expect(result.current.stats1?.year).toBeNull(); // Multiple years
        expect(result.current.stats1?.yearStats).not.toBeNull();
      });
    });

    it('should handle single year array', async () => {
      const { result } = renderHook(() => useConstructorComparison());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.selectConstructorForYears(1, '1', [2024]);
      });

      await waitFor(() => {
        expect(result.current.stats1).not.toBeNull();
      });
    });

    it('should fall back to career when years array is empty', async () => {
      const { result } = renderHook(() => useConstructorComparison());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.selectConstructorForYears(1, '1', []);
      });

      await waitFor(() => {
        expect(result.current.stats1).not.toBeNull();
      });
    });
  });

  describe('toggleMetric', () => {
    it('should toggle metric enabled state', async () => {
      const { result } = renderHook(() => useConstructorComparison());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.enabledMetrics.dnfs).toBe(false);

      act(() => {
        result.current.toggleMetric('dnfs');
      });

      expect(result.current.enabledMetrics.dnfs).toBe(true);

      act(() => {
        result.current.toggleMetric('dnfs');
      });

      expect(result.current.enabledMetrics.dnfs).toBe(false);
    });

    it('should toggle multiple metrics independently', async () => {
      const { result } = renderHook(() => useConstructorComparison());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.toggleMetric('wins');
        result.current.toggleMetric('podiums');
      });

      expect(result.current.enabledMetrics.wins).toBe(false);
      expect(result.current.enabledMetrics.podiums).toBe(false);
      expect(result.current.enabledMetrics.points).toBe(true);
    });
  });

  describe('clearSelection', () => {
    it('should clear slot 1 selection and stats', async () => {
      const { result } = renderHook(() => useConstructorComparison());

      await waitFor(() => expect(result.current.loading).toBe(false));

      // Select a constructor first
      act(() => {
        result.current.selectConstructor(1, '1', 2024);
      });

      await waitFor(() => {
        expect(result.current.stats1).not.toBeNull();
      });

      // Clear selection
      act(() => {
        result.current.clearSelection(1);
      });

      expect(result.current.constructor1).toBeNull();
      expect(result.current.selection1).toBeNull();
      expect(result.current.stats1).toBeNull();
    });

    it('should clear slot 2 selection and stats', async () => {
      const { result } = renderHook(() => useConstructorComparison());

      await waitFor(() => expect(result.current.loading).toBe(false));

      // Select a constructor first
      act(() => {
        result.current.selectConstructor(2, '2', 2023);
      });

      await waitFor(() => {
        expect(result.current.stats2).not.toBeNull();
      });

      // Clear selection
      act(() => {
        result.current.clearSelection(2);
      });

      expect(result.current.constructor2).toBeNull();
      expect(result.current.selection2).toBeNull();
      expect(result.current.stats2).toBeNull();
    });
  });

  describe('Composite Score', () => {
    it('should calculate composite score when both stats are loaded', async () => {
      const { result } = renderHook(() => useConstructorComparison());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.selectConstructor(1, '1', 2024);
        result.current.selectConstructor(2, '2', 2024);
      });

      await waitFor(() => {
        expect(result.current.stats1).not.toBeNull();
        expect(result.current.stats2).not.toBeNull();
      });

      expect(result.current.score.c1).not.toBeNull();
      expect(result.current.score.c2).not.toBeNull();
      expect(typeof result.current.score.c1).toBe('number');
      expect(typeof result.current.score.c2).toBe('number');
    });

    it('should return null scores when stats are missing', async () => {
      const { result } = renderHook(() => useConstructorComparison());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.score.c1).toBeNull();
      expect(result.current.score.c2).toBeNull();
    });

    it('should recalculate score when metrics are toggled', async () => {
      // Create balanced stats where each constructor excels at different things
      const stats1 = {
        year: 2024,
        constructor: { name: 'Red Bull Racing' },
        name: 'Red Bull Racing',
        career: {
          wins: 120,
          podiums: 250,
          poles: 95,
          points: 8500,
          dnfs: 45,
          races: 350,
        },
        yearStats: {
          wins: 18,      // Constructor 1 has more wins
          podiums: 25,   // Constructor 2 has more podiums
          poles: 12,     // Balanced
          points: 750,   // Constructor 2 has more points
          dnfs: 2,       // Constructor 1 has fewer DNFs
          races: 24,
        },
      };

      const stats2 = {
        year: 2024,
        constructor: { name: 'Ferrari' },
        name: 'Ferrari',
        career: {
          wins: 80,
          podiums: 180,
          poles: 70,
          points: 6500,
          dnfs: 55,
          races: 350,
        },
        yearStats: {
          wins: 6,       // Constructor 1 has more wins
          podiums: 32,   // Constructor 2 has MORE podiums
          poles: 12,     // Balanced
          points: 850,   // Constructor 2 has MORE points
          dnfs: 3,       // Constructor 1 has fewer DNFs
          races: 24,
        },
      };

      vi.mocked(api.apiFetch).mockImplementation(async (path: string) => {
        if (path.includes('/constructors/active')) {
          return mockConstructorsList;
        }
        if (path.includes('/races/years')) {
          return mockYears;
        }
        if (path.includes('/api/constructors/1/stats')) {
          return stats1;
        }
        if (path.includes('/api/constructors/2/stats')) {
          return stats2;
        }
        return mockConstructorStats;
      });

      const { result } = renderHook(() => useConstructorComparison());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.selectConstructor(1, '1', 2024);
      });

      await waitFor(() => {
        expect(result.current.stats1).not.toBeNull();
      });

      act(() => {
        result.current.selectConstructor(2, '2', 2024);
      });

      await waitFor(() => {
        expect(result.current.stats2).not.toBeNull();
      });

      // Get initial score with all default metrics enabled (wins=true)
      // Constructor 1 should have advantage due to wins (weight 3.0)
      const initialScore = result.current.score.c1;
      const initialMetricCount = Object.values(result.current.enabledMetrics).filter(v => v).length;
      expect(initialScore).not.toBeNull();

      // Disable wins (weight 3.0) - this removes constructor 1's biggest advantage
      act(() => {
        result.current.toggleMetric('wins');
      });

      const newScore = result.current.score.c1;
      const newMetricCount = Object.values(result.current.enabledMetrics).filter(v => v).length;
      
      // Verify wins is disabled
      expect(result.current.enabledMetrics.wins).toBe(false);
      expect(newMetricCount).toBe(initialMetricCount - 1);
      
      // Score should decrease for constructor 1 when wins is disabled
      // because wins (where they excel) has a high weight of 3.0
      expect(newScore).toBeLessThan(initialScore!);
    });

    it('should include perMetric scores', async () => {
      const { result } = renderHook(() => useConstructorComparison());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.selectConstructor(1, '1', 2024);
        result.current.selectConstructor(2, '2', 2024);
      });

      await waitFor(() => {
        expect(result.current.stats1).not.toBeNull();
        expect(result.current.stats2).not.toBeNull();
      });

      expect(result.current.score.perMetric).toBeDefined();
      expect(result.current.score.perMetric.wins).toBeDefined();
      expect(result.current.score.perMetric.podiums).toBeDefined();
    });
  });

  describe('CSI Integration', () => {
    it('should call CSI functions when calculating scores', async () => {
      const getCSISpy = vi.spyOn(csi, 'getCSIForConstructor');
      const dampenerSpy = vi.spyOn(csi, 'applyCSIDampener');

      const { result } = renderHook(() => useConstructorComparison());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.selectConstructor(1, '1', 2024);
        result.current.selectConstructor(2, '2', 2024);
      });

      await waitFor(() => {
        expect(result.current.stats1).not.toBeNull();
        expect(result.current.stats2).not.toBeNull();
      });

      // CSI functions should be called during score calculation
      await waitFor(() => {
        expect(getCSISpy).toHaveBeenCalled();
        expect(dampenerSpy).toHaveBeenCalled();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle constructor with no stats', async () => {
      vi.mocked(api.apiFetch).mockImplementation(async (path: string) => {
        if (path.includes('/stats')) {
          return {
            year: null,
            constructor: { name: 'Unknown' },
            career: {
              wins: 0,
              podiums: 0,
              poles: 0,
              points: 0,
              dnfs: 0,
              races: 0,
            },
            yearStats: null,
          };
        }
        return path.includes('/active') ? mockConstructorsList : mockYears;
      });

      const { result } = renderHook(() => useConstructorComparison());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.selectConstructor(1, '99', 2024);
      });

      await waitFor(() => {
        expect(result.current.stats1).not.toBeNull();
        expect(result.current.stats1?.career.wins).toBe(0);
      });
    });

    it('should handle malformed stats response', async () => {
      vi.mocked(api.apiFetch).mockImplementation(async (path: string) => {
        if (path.includes('/stats')) {
          return {}; // Empty response
        }
        return path.includes('/active') ? mockConstructorsList : mockYears;
      });

      const { result } = renderHook(() => useConstructorComparison());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.selectConstructor(1, '1', 2024);
      });

      await waitFor(() => {
        expect(result.current.stats1).not.toBeNull();
        // Should have fallback values
        expect(result.current.stats1?.career.wins).toBe(0);
      });
    });

    it('should handle empty constructor list', async () => {
      vi.mocked(api.apiFetch).mockImplementation(async (path: string) => {
        if (path.includes('/active')) {
          return [];
        }
        return mockYears;
      });

      const { result } = renderHook(() => useConstructorComparison());

      await waitFor(() => {
        expect(result.current.allConstructors).toEqual([]);
        expect(result.current.loading).toBe(false);
      });
    });

    it('should handle stats with missing nested properties', async () => {
      vi.mocked(api.apiFetch).mockImplementation(async (path: string) => {
        if (path.includes('/stats/all')) {
          return [
            { year: 2024, stats: {} }, // Missing wins, podiums, points
          ];
        }
        return path.includes('/active') ? mockConstructorsList : mockYears;
      });

      const { result } = renderHook(() => useConstructorComparison());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.handleSelectConstructor(1, '1');
      });

      await waitFor(() => {
        expect(result.current.constructor1).not.toBeNull();
        // Should default to 0
        expect(result.current.constructor1?.wins).toBe(0);
      });
    });
  });

  describe('Cleanup', () => {
    it('should not update state after unmount', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      vi.mocked(api.apiFetch).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockConstructorsList), 100))
      );

      const { unmount } = renderHook(() => useConstructorComparison());

      unmount();

      // Wait for the promise to resolve after unmount
      await new Promise(resolve => setTimeout(resolve, 150));

      // Should not throw errors or warnings
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });
});

