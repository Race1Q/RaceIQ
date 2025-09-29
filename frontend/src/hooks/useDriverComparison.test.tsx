import React from 'react';
import { describe, it, vi, expect, beforeEach, afterEach } from 'vitest';
import type { Mock } from 'vitest';
import '@testing-library/jest-dom';
import { renderHook, waitFor, act } from '@testing-library/react';

import { ChakraProvider } from '@chakra-ui/react';
import { useDriverComparison } from './useDriverComparison';

// Mock window.__API_BASE__
const mockAPIBase = '/api';
(global as any).__API_BASE__ = mockAPIBase;

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Chakra wrapper
function wrapper({ children }: { children: React.ReactNode }) {
  return <ChakraProvider>{children}</ChakraProvider>;
}

describe('useDriverComparison', () => {
  const mockDriversList = [
    {
      id: 1,
      full_name: 'Lewis Hamilton',
      code: 'HAM',
      given_name: 'Lewis',
      family_name: 'Hamilton',
      current_team_name: 'Mercedes',
      image_url: 'hamilton.jpg',
      team_color: '#00D2BE',
    },
    {
      id: 2,
      full_name: 'Max Verstappen',
      code: 'VER',
      given_name: 'Max',
      family_name: 'Verstappen',
      current_team_name: 'Red Bull Racing',
      image_url: 'verstappen.jpg',
      team_color: '#1E41FF',
    },
    {
      id: 3,
      full_name: 'Charles Leclerc',
      code: 'LEC',
      given_name: 'Charles',
      family_name: 'Leclerc',
      current_team_name: 'Ferrari',
      image_url: 'leclerc.jpg',
      team_color: '#DC0000',
    },
  ];

  const mockYears = [2024, 2023, 2022, 2021, 2020];

  const mockDriverStats = {
    driverId: 1,
    year: 2024,
    career: {
      wins: 103,
      podiums: 182,
      fastestLaps: 58,
      points: 4000,
      dnfs: 25,
      sprintWins: 5,
      sprintPodiums: 8,
    },
    yearStats: {
      wins: 2,
      podiums: 8,
      fastestLaps: 3,
      points: 200,
      dnfs: 1,
      sprintWins: 1,
      sprintPodiums: 2,
      poles: 3,
    },
  };

  const mockCareerStats = {
    driverId: 1,
    year: null,
    career: {
      wins: 103,
      podiums: 182,
      fastestLaps: 58,
      points: 4000,
      dnfs: 25,
      sprintWins: 5,
      sprintPodiums: 8,
    },
    yearStats: null,
  };

  const mockLegacyStats = {
    wins: 103,
    podiums: 182,
    points: 4000,
    championshipStanding: '2nd',
    teamName: 'Mercedes',
    imageUrl: 'hamilton.jpg',
    teamColorToken: '#00D2BE',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations with proper typing
    mockFetch.mockImplementation((url: string) => {
      if (url === '/api/drivers') {
        return Promise.resolve({
          ok: true,
          json: async () => mockDriversList,
        });
      }
      if (url === '/api/races/years') {
        return Promise.resolve({
          ok: true,
          json: async () => mockYears,
        });
      }
      if (url.includes('/stats')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockDriverStats,
        });
      }
      if (url.includes('/career-stats')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockLegacyStats,
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should load initial data successfully', async () => {
    const { result } = renderHook(() => useDriverComparison(), { wrapper });

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.allDrivers).toEqual(mockDriversList);
    expect(result.current.years).toEqual([2024, 2023, 2022, 2021, 2020]); // Should be sorted descending
    expect(result.current.error).toBeNull();
  });

  it('should handle initial data loading failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useDriverComparison(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Network error');
    expect(result.current.allDrivers).toEqual([]);
  });

  it('should handle years API failure and use fallback years', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url === '/api/drivers') {
        return Promise.resolve({
          ok: true,
          json: async () => mockDriversList,
        });
      }
      if (url === '/api/races/years') {
        return Promise.reject(new Error('Failed to fetch years'));
      }
      return Promise.resolve({
        ok: false,
        status: 404,
      });
    });

    const { result } = renderHook(() => useDriverComparison(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.allDrivers).toEqual(mockDriversList);
    expect(result.current.years.length).toBeGreaterThan(0); // Should have fallback years
    expect(result.current.error).toBeNull();
  });

  it('should select driver using legacy handleSelectDriver', async () => {
    const { result } = renderHook(() => useDriverComparison(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      result.current.handleSelectDriver(1, '1');
    });

    await waitFor(() => expect(result.current.driver1).not.toBeNull());

    expect(result.current.driver1).toMatchObject({
      id: '1',
      fullName: 'Lewis Hamilton',
      teamName: 'Mercedes',
      wins: 103,
      podiums: 182,
      points: 4000,
    });
  });

  it('should select driver using new selectDriver with year', async () => {
    const { result } = renderHook(() => useDriverComparison(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      result.current.selectDriver(1, '1', 2024);
    });

    await waitFor(() => {
      expect(result.current.selection1).toEqual({ driverId: '1', year: 2024 });
      expect(result.current.stats1).toEqual(mockDriverStats);
    });
  });

  it('should select driver using new selectDriver with career', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url === '/api/drivers') {
        return Promise.resolve({
          ok: true,
          json: async () => mockDriversList,
        });
      }
      if (url === '/api/races/years') {
        return Promise.resolve({
          ok: true,
          json: async () => mockYears,
        });
      }
      if (url.includes('/stats') && !url.includes('year=')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockCareerStats,
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
      });
    });

    const { result } = renderHook(() => useDriverComparison(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      result.current.selectDriver(2, '2', 'career');
    });

    await waitFor(() => {
      expect(result.current.selection2).toEqual({ driverId: '2', year: 'career' });
      expect(result.current.stats2).toEqual(mockCareerStats);
    });
  });

  it('should handle driver selection failure', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url === '/api/drivers') {
        return Promise.resolve({
          ok: true,
          json: async () => mockDriversList,
        });
      }
      if (url === '/api/races/years') {
        return Promise.resolve({
          ok: true,
          json: async () => mockYears,
        });
      }
      if (url.includes('/stats') || url.includes('/career-stats')) {
        return Promise.reject(new Error('Failed to load driver stats'));
      }
      return Promise.resolve({
        ok: false,
        status: 404,
      });
    });

    const { result } = renderHook(() => useDriverComparison(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      result.current.selectDriver(1, '1', 2024);
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Failed to load driver stats');
    });
  });

  it('should compute composite score correctly', async () => {
    const mockStats1 = {
      driverId: 1,
      year: 2024,
      career: { wins: 10, podiums: 20, fastestLaps: 5, points: 300, dnfs: 2, sprintWins: 1, sprintPodiums: 2 },
      yearStats: { wins: 5, podiums: 10, fastestLaps: 3, points: 200, dnfs: 1, sprintWins: 1, sprintPodiums: 2, poles: 2 },
    };

    const mockStats2 = {
      driverId: 2,
      year: 2024,
      career: { wins: 5, podiums: 15, fastestLaps: 2, points: 250, dnfs: 3, sprintWins: 0, sprintPodiums: 1 },
      yearStats: { wins: 3, podiums: 8, fastestLaps: 1, points: 180, dnfs: 2, sprintWins: 0, sprintPodiums: 1, poles: 1 },
    };

    mockFetch.mockImplementation((url: string) => {
      if (url === '/api/drivers') return Promise.resolve({ ok: true, json: async () => mockDriversList });
      if (url === '/api/races/years') return Promise.resolve({ ok: true, json: async () => mockYears });
      if (url.includes('/drivers/1/stats')) return Promise.resolve({ ok: true, json: async () => mockStats1 });
      if (url.includes('/drivers/2/stats')) return Promise.resolve({ ok: true, json: async () => mockStats2 });
      return Promise.resolve({ ok: false, status: 404 });
    });

    const { result } = renderHook(() => useDriverComparison(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      result.current.selectDriver(1, '1', 2024);
    });

    await act(async () => {
      result.current.selectDriver(2, '2', 2024);
    });

    await waitFor(() => {
      expect(result.current.stats1).toEqual(mockStats1);
      expect(result.current.stats2).toEqual(mockStats2);
    });

    // Score should be computed
    expect(result.current.score.d1).toBeGreaterThan(0);
    expect(result.current.score.d2).toBeGreaterThan(0);
    expect(result.current.score.perMetric).toBeDefined();
  });

  it('should toggle metrics correctly', async () => {
    const { result } = renderHook(() => useDriverComparison(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Initially all metrics should be enabled
    expect(result.current.enabledMetrics.wins).toBe(true);
    expect(result.current.enabledMetrics.podiums).toBe(true);

    await act(async () => {
      result.current.toggleMetric('wins');
    });

    expect(result.current.enabledMetrics.wins).toBe(false);
    expect(result.current.enabledMetrics.podiums).toBe(true);

    await act(async () => {
      result.current.toggleMetric('podiums');
    });

    expect(result.current.enabledMetrics.wins).toBe(false);
    expect(result.current.enabledMetrics.podiums).toBe(false);
  });

  it('should handle driver with minimal data', async () => {
    const minimalDriver = {
      id: 99,
      code: 'MIN',
    };

    const minimalStats = {
      driverId: 99,
      year: 2024,
      career: { wins: 0, podiums: 0, fastestLaps: 0, points: 0, dnfs: 0, sprintWins: 0, sprintPodiums: 0 },
      yearStats: null,
    };

    mockFetch.mockImplementation((url: string) => {
      if (url === '/api/drivers') {
        return Promise.resolve({
          ok: true,
          json: async () => [...mockDriversList, minimalDriver],
        });
      }
      if (url === '/api/races/years') {
        return Promise.resolve({
          ok: true,
          json: async () => mockYears,
        });
      }
      if (url.includes('/drivers/99/stats')) {
        return Promise.resolve({
          ok: true,
          json: async () => minimalStats,
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
      });
    });

    const { result } = renderHook(() => useDriverComparison(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      result.current.selectDriver(1, '99', 2024);
    });

    await waitFor(() => {
      expect(result.current.stats1).toEqual(minimalStats);
    });

    // Should handle minimal driver name construction
    expect(result.current.allDrivers.find(d => d.id === 99)?.code).toBe('MIN');
  });

  it('should handle legacy stats fallback', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url === '/api/drivers') {
        return Promise.resolve({
          ok: true,
          json: async () => mockDriversList,
        });
      }
      if (url === '/api/races/years') {
        return Promise.resolve({
          ok: true,
          json: async () => mockYears,
        });
      }
      if (url.includes('/career-stats')) {
        return Promise.reject(new Error('Career stats failed'));
      }
      if (url.includes('/stats')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockLegacyStats,
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
      });
    });

    const { result } = renderHook(() => useDriverComparison(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      result.current.handleSelectDriver(1, '1');
    });

    await waitFor(() => expect(result.current.driver1).not.toBeNull());

    // Should fall back to basic stats endpoint
    expect(result.current.driver1?.wins).toBe(103);
  });

  it('should not select driver when driverId is empty', async () => {
    const { result } = renderHook(() => useDriverComparison(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    const initialDriver1 = result.current.driver1;
    const initialSelection1 = result.current.selection1;

    await act(async () => {
      result.current.selectDriver(1, '', 2024);
    });

    await act(async () => {
      result.current.handleSelectDriver(2, '');
    });

    expect(result.current.driver1).toBe(initialDriver1);
    expect(result.current.driver2).toBeNull();
    expect(result.current.selection1).toBe(initialSelection1);
  });

  it('should update score when metrics are toggled', async () => {
    const mockStats1 = {
      driverId: 1,
      year: 2024,
      career: { wins: 10, podiums: 20, fastestLaps: 5, points: 300, dnfs: 2, sprintWins: 1, sprintPodiums: 2 },
      yearStats: { wins: 5, podiums: 10, fastestLaps: 3, points: 200, dnfs: 1, sprintWins: 1, sprintPodiums: 2, poles: 2 },
    };

    const mockStats2 = {
      driverId: 2,
      year: 2024,
      career: { wins: 5, podiums: 15, fastestLaps: 2, points: 250, dnfs: 3, sprintWins: 0, sprintPodiums: 1 },
      yearStats: { wins: 3, podiums: 8, fastestLaps: 1, points: 180, dnfs: 2, sprintWins: 0, sprintPodiums: 1, poles: 1 },
    };

    mockFetch.mockImplementation((url: string) => {
      if (url === '/api/drivers') return Promise.resolve({ ok: true, json: async () => mockDriversList });
      if (url === '/api/races/years') return Promise.resolve({ ok: true, json: async () => mockYears });
      if (url.includes('/drivers/1/stats')) return Promise.resolve({ ok: true, json: async () => mockStats1 });
      if (url.includes('/drivers/2/stats')) return Promise.resolve({ ok: true, json: async () => mockStats2 });
      return Promise.resolve({ ok: false, status: 404 });
    });

    const { result } = renderHook(() => useDriverComparison(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      result.current.selectDriver(1, '1', 2024);
      result.current.selectDriver(2, '2', 2024);
    });

    await waitFor(() => {
      expect(result.current.stats1).toBeDefined();
      expect(result.current.stats2).toBeDefined();
    });

    const initialScore = result.current.score;

    await act(async () => {
      result.current.toggleMetric('wins');
    });

    // Score should update when metrics change
    expect(result.current.score).not.toEqual(initialScore);
  });
});