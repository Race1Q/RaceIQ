import React from 'react';
import { describe, it, vi, expect, beforeEach, afterEach } from 'vitest';
import type { Mock } from 'vitest';
import '@testing-library/jest-dom';
import { renderHook, waitFor, act } from '@testing-library/react';

import { ChakraProvider } from '@chakra-ui/react';
import { useDashboardData } from './useDashboardData';
import type { DashboardData } from '../types';
import { fallbackDashboardData } from '../lib/fallbackData/dashboardData';

// Mock buildApiUrl
vi.mock('../lib/api', () => ({
  buildApiUrl: (path: string) => path,
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock toast
const toastMock = vi.fn();
vi.mock('@chakra-ui/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@chakra-ui/react')>();
  return {
    ...actual,
    useToast: () => toastMock,
  };
});

// Chakra wrapper
function wrapper({ children }: { children: React.ReactNode }) {
  return <ChakraProvider>{children}</ChakraProvider>;
}

describe('useDashboardData', () => {
  const mockDashboardData: DashboardData = {
    nextRace: {
      raceName: 'Monaco Grand Prix',
      circuitName: 'Monaco Circuit',
      raceDate: '2024-05-26T14:00:00.000Z',
    },
    championshipStandings: [
      { position: 1, driverFullName: 'Max Verstappen', constructorName: 'Red Bull Racing', points: 400 },
      { position: 2, driverFullName: 'Lewis Hamilton', constructorName: 'Mercedes', points: 350 },
      { position: 3, driverFullName: 'Charles Leclerc', constructorName: 'Ferrari', points: 300 },
    ],
    lastRacePodium: {
      raceName: 'Spanish Grand Prix',
      podium: [
        { position: 1, driverFullName: 'Max Verstappen', constructorName: 'Red Bull Racing' },
        { position: 2, driverFullName: 'Lewis Hamilton', constructorName: 'Mercedes' },
        { position: 3, driverFullName: 'Charles Leclerc', constructorName: 'Ferrari' },
      ],
    },
    lastRaceFastestLap: {
      driverFullName: 'Max Verstappen',
      lapTime: '1:12.909',
    },
    headToHead: {
      driver1: {
        fullName: 'Max Verstappen',
        headshotUrl: 'verstappen.jpg',
        teamName: 'Red Bull Racing',
        wins: 10,
        podiums: 15,
        points: 400,
      },
      driver2: {
        fullName: 'Lewis Hamilton',
        headshotUrl: 'hamilton.jpg',
        teamName: 'Mercedes',
        wins: 8,
        podiums: 12,
        points: 350,
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default successful mock implementation
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: async () => mockDashboardData,
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should load dashboard data successfully', async () => {
    const { result } = renderHook(() => useDashboardData(), { wrapper });

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isFallback).toBe(false);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual(mockDashboardData);
    expect(result.current.error).toBeNull();
    expect(result.current.isFallback).toBe(false);
    expect(mockFetch).toHaveBeenCalledWith('/api/dashboard');
  });

  it('should handle API failure and load fallback data', async () => {
    const networkError = new Error('Network error');
    mockFetch.mockRejectedValueOnce(networkError);

    const { result } = renderHook(() => useDashboardData(), { wrapper });

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual(fallbackDashboardData);
    expect(result.current.error).toBe('Network error');
    expect(result.current.isFallback).toBe(true);
    expect(toastMock).toHaveBeenCalledWith({
      title: 'Could not fetch live dashboard data',
      description: 'Displaying cached information.',
      status: 'warning',
      duration: 5000,
      isClosable: true,
    });
  });

  it('should handle HTTP error responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    const { result } = renderHook(() => useDashboardData(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual(fallbackDashboardData);
    expect(result.current.error).toBe('API Error: 500 Internal Server Error');
    expect(result.current.isFallback).toBe(true);
    expect(toastMock).toHaveBeenCalledWith({
      title: 'Could not fetch live dashboard data',
      description: 'Displaying cached information.',
      status: 'warning',
      duration: 5000,
      isClosable: true,
    });
  });

  it('should handle non-Error exceptions', async () => {
    mockFetch.mockRejectedValueOnce('String error');

    const { result } = renderHook(() => useDashboardData(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual(fallbackDashboardData);
    expect(result.current.error).toBe('An unexpected error occurred.');
    expect(result.current.isFallback).toBe(true);
    expect(toastMock).toHaveBeenCalledWith({
      title: 'Could not fetch live dashboard data',
      description: 'Displaying cached information.',
      status: 'warning',
      duration: 5000,
      isClosable: true,
    });
  });

  it('should handle 404 errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    const { result } = renderHook(() => useDashboardData(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual(fallbackDashboardData);
    expect(result.current.error).toBe('API Error: 404 Not Found');
    expect(result.current.isFallback).toBe(true);
  });

  it('should handle 401 unauthorized errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    });

    const { result } = renderHook(() => useDashboardData(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual(fallbackDashboardData);
    expect(result.current.error).toBe('API Error: 401 Unauthorized');
    expect(result.current.isFallback).toBe(true);
  });

  it('should handle timeout errors', async () => {
    const timeoutError = new Error('Request timeout');
    mockFetch.mockRejectedValueOnce(timeoutError);

    const { result } = renderHook(() => useDashboardData(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual(fallbackDashboardData);
    expect(result.current.error).toBe('Request timeout');
    expect(result.current.isFallback).toBe(true);
  });

  it('should handle malformed JSON responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    });

    const { result } = renderHook(() => useDashboardData(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual(fallbackDashboardData);
    expect(result.current.error).toBe('Invalid JSON');
    expect(result.current.isFallback).toBe(true);
  });

  it('should handle successful data fetch after initial error state', async () => {
    // This test verifies that the hook properly handles successful data
    // Note: useEffect only runs once on mount, so we can't test retry behavior
    // without unmounting and remounting the component
    const { result } = renderHook(() => useDashboardData(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual(mockDashboardData);
    expect(result.current.error).toBeNull();
    expect(result.current.isFallback).toBe(false);
  });

  it('should handle empty dashboard data', async () => {
    const emptyData: DashboardData = {
      nextRace: {
        raceName: '',
        circuitName: '',
        raceDate: '',
      },
      championshipStandings: [],
      lastRacePodium: {
        raceName: '',
        podium: [],
      },
      lastRaceFastestLap: {
        driverFullName: '',
        lapTime: '',
      },
      headToHead: {
        driver1: {
          fullName: '',
          headshotUrl: '',
          teamName: '',
          wins: 0,
          podiums: 0,
          points: 0,
        },
        driver2: {
          fullName: '',
          headshotUrl: '',
          teamName: '',
          wins: 0,
          podiums: 0,
          points: 0,
        },
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => emptyData,
    });

    const { result } = renderHook(() => useDashboardData(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual(emptyData);
    expect(result.current.error).toBeNull();
    expect(result.current.isFallback).toBe(false);
  });

  it('should handle partial dashboard data', async () => {
    const partialData: Partial<DashboardData> = {
      nextRace: {
        raceName: 'Monaco Grand Prix',
        circuitName: 'Monaco Circuit',
        raceDate: '2024-05-26T14:00:00.000Z',
      },
      championshipStandings: [
        { position: 1, driverFullName: 'Max Verstappen', constructorName: 'Red Bull Racing', points: 400 },
      ],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => partialData,
    });

    const { result } = renderHook(() => useDashboardData(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual(partialData);
    expect(result.current.error).toBeNull();
    expect(result.current.isFallback).toBe(false);
  });

  it('should maintain loading state during fetch', async () => {
    let resolvePromise: (value: any) => void;
    const fetchPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockFetch.mockReturnValueOnce(fetchPromise);

    const { result } = renderHook(() => useDashboardData(), { wrapper });

    expect(result.current.loading).toBe(true);

    // Resolve the promise after a delay
    setTimeout(() => {
      resolvePromise!({
        ok: true,
        json: async () => mockDashboardData,
      });
    }, 100);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual(mockDashboardData);
  });

  it('should handle multiple rapid calls gracefully', async () => {
    const { result, rerender } = renderHook(() => useDashboardData(), { wrapper });

    // Trigger multiple renders quickly
    for (let i = 0; i < 3; i++) {
      rerender();
    }

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual(mockDashboardData);
    expect(result.current.error).toBeNull();
    expect(result.current.isFallback).toBe(false);
  });

  it('should handle buildApiUrl integration correctly', async () => {
    const { result } = renderHook(() => useDashboardData(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockFetch).toHaveBeenCalledWith('/api/dashboard');
    expect(result.current.data).toEqual(mockDashboardData);
  });

  it('should handle console error logging on failure', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const networkError = new Error('Network error');
    
    mockFetch.mockRejectedValueOnce(networkError);

    const { result } = renderHook(() => useDashboardData(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(consoleSpy).toHaveBeenCalledWith(
      "Dashboard API failed, loading fallback data.",
      "Network error"
    );

    consoleSpy.mockRestore();
  });

  it('should handle toast function dependency correctly', async () => {
    const networkError = new Error('Network error');
    mockFetch.mockRejectedValueOnce(networkError);

    const { result } = renderHook(() => useDashboardData(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(toastMock).toHaveBeenCalledTimes(1);
    expect(toastMock).toHaveBeenCalledWith({
      title: 'Could not fetch live dashboard data',
      description: 'Displaying cached information.',
      status: 'warning',
      duration: 5000,
      isClosable: true,
    });
  });
});
