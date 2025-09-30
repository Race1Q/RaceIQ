import React from 'react';
import { describe, it, vi, expect, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import { renderHook, waitFor } from '@testing-library/react';

import { ChakraProvider } from '@chakra-ui/react';
import { useHomePageData } from './useHomePageData';
import type { FeaturedDriver } from '../types';
import type { Race } from '../types/races';

// Mock buildApiUrl
vi.mock('../lib/api', () => ({
  buildApiUrl: (path: string) => path,
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Chakra wrapper
function wrapper({ children }: { children: React.ReactNode }) {
  return <ChakraProvider>{children}</ChakraProvider>;
}

describe('useHomePageData', () => {
  const mockRaces: Race[] = [
    {
      id: 1,
      name: 'Bahrain Grand Prix',
      round: 1,
      date: '2024-03-02T15:00:00.000Z',
      circuit_id: 1,
      season_id: 2024,
      countryCode: 'BHR',
      country: 'Bahrain',
      circuit: {
        country_code: 'BHR',
        country: 'Bahrain',
      },
    },
    {
      id: 2,
      name: 'Saudi Arabian Grand Prix',
      round: 2,
      date: '2024-03-09T17:00:00.000Z',
      circuit_id: 2,
      season_id: 2024,
      countryCode: 'SAU',
      country: 'Saudi Arabia',
      circuit: {
        country_code: 'SAU',
        country: 'Saudi Arabia',
      },
    },
    {
      id: 3,
      name: 'Australian Grand Prix',
      round: 3,
      date: '2024-03-24T05:00:00.000Z',
      circuit_id: 3,
      season_id: 2024,
      countryCode: 'AUS',
      country: 'Australia',
      circuit: {
        country_code: 'AUS',
        country: 'Australia',
      },
    },
  ];

  const mockFeaturedDriver: FeaturedDriver = {
    id: 1,
    fullName: 'Max Verstappen',
    driverNumber: 1,
    countryCode: 'NLD',
    teamName: 'Red Bull Racing',
    seasonPoints: 400,
    seasonWins: 15,
    position: 1,
    careerStats: { wins: 60, podiums: 105, poles: 35 },
    recentForm: [{ position: 1, raceName: 'Previous GP', countryCode: 'USA' }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock Date.now() to return a consistent date (2024)
    vi.setSystemTime(new Date('2024-03-15T12:00:00.000Z'));
    
    // Default successful mock implementations for modern year (2024)
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/seasons/2024/races')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: new Headers(),
          json: async () => mockRaces,
          text: async () => JSON.stringify(mockRaces),
        });
      }
      if (url.includes('/api/standings/featured-driver')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: new Headers(),
          json: async () => mockFeaturedDriver,
          text: async () => JSON.stringify(mockFeaturedDriver),
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers(),
        text: async () => 'Not Found',
        json: async () => ({ error: 'Not Found' }),
      });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should load home page data successfully for modern year (2024)', async () => {
    const { result } = renderHook(() => useHomePageData(), { wrapper });

    expect(result.current.loading).toBe(true);
    expect(result.current.featuredDriver).toBeNull();
    expect(result.current.seasonSchedule).toEqual([]);
    expect(result.current.error).toBeNull();

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.featuredDriver).toEqual(mockFeaturedDriver);
    expect(result.current.seasonSchedule).toEqual(mockRaces);
    expect(result.current.error).toBeNull();
  });

  it('should load home page data successfully for historical year (2022)', async () => {
    // Mock Date.now() to return 2022
    vi.setSystemTime(new Date('2022-03-15T12:00:00.000Z'));

    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/seasons/2022/races')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: new Headers(),
          json: async () => mockRaces,
          text: async () => JSON.stringify(mockRaces),
        });
      }
      if (url.includes('/api/standings/featured-driver')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: new Headers(),
          json: async () => mockFeaturedDriver,
          text: async () => JSON.stringify(mockFeaturedDriver),
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers(),
        text: async () => 'Not Found',
        json: async () => ({ error: 'Not Found' }),
      });
    });

    const { result } = renderHook(() => useHomePageData(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.featuredDriver).toEqual(mockFeaturedDriver);
    expect(result.current.seasonSchedule).toEqual(mockRaces);
    expect(result.current.error).toBeNull();
  });

  it('should handle races API failure', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/standings/featured-driver')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: new Headers(),
          json: async () => mockFeaturedDriver,
        });
      }
      if (url.includes('/api/seasons/2024/races')) {
        return Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          headers: new Headers(),
          text: async () => 'Internal Server Error',
          json: async () => ({ error: 'Internal Server Error' }),
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers(),
        text: async () => 'Not Found',
        json: async () => ({ error: 'Not Found' }),
      });
    });

    const { result } = renderHook(() => useHomePageData(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.featuredDriver).toEqual(mockFeaturedDriver); // Should fall back to default featured driver
    expect(result.current.seasonSchedule).toEqual([]);
    expect(result.current.error).toBe('Failed to fetch race schedule');
  });

  it('should handle featured driver API failure', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/standings/featured-driver')) {
        return Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          headers: new Headers(),
          text: async () => 'Internal Server Error',
          json: async () => ({ error: 'Internal Server Error' }),
        });
      }
      if (url.includes('/api/seasons/2024/races')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: new Headers(),
          json: async () => mockRaces,
          text: async () => JSON.stringify(mockRaces),
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers(),
        text: async () => 'Not Found',
        json: async () => ({ error: 'Not Found' }),
      });
    });

    const { result } = renderHook(() => useHomePageData(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.featuredDriver).toEqual(mockFeaturedDriver); // Should use fallback
    expect(result.current.error).toBe('Failed to fetch featured driver');
  });

  it('should handle both API failures', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/seasons/2024/races')) {
        return Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          headers: new Headers(),
          text: async () => 'Internal Server Error',
          json: async () => ({ error: 'Internal Server Error' }),
        });
      }
      if (url.includes('/api/standings/featured-driver')) {
        return Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          headers: new Headers(),
          text: async () => 'Internal Server Error',
          json: async () => ({ error: 'Internal Server Error' }),
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers(),
        text: async () => 'Not Found',
        json: async () => ({ error: 'Not Found' }),
      });
    });

    const { result } = renderHook(() => useHomePageData(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.featuredDriver).toEqual(mockFeaturedDriver); // Should use fallback
    expect(result.current.seasonSchedule).toEqual([]);
    expect(result.current.error).toBe('Failed to fetch featured driver');
  });





  it('should handle network errors', async () => {
    const networkError = new Error('Network error');
    mockFetch.mockRejectedValueOnce(networkError);

    const { result } = renderHook(() => useHomePageData(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.featuredDriver).not.toBeNull(); // Should use fallback
    expect(result.current.error).toBe('Network error');
  });

  it('should handle non-Error exceptions', async () => {
    mockFetch.mockRejectedValueOnce('String error');

    const { result } = renderHook(() => useHomePageData(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.featuredDriver).not.toBeNull(); // Should use fallback
    expect(result.current.error).toBe('An unexpected error occurred.');
  });

  it('should handle empty races response', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/seasons/2024/races')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: new Headers(),
          json: async () => [],
        });
      }
      if (url.includes('/api/standings/featured-driver')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: new Headers(),
          json: async () => mockFeaturedDriver,
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers(),
        text: async () => 'Not Found',
        json: async () => ({ error: 'Not Found' }),
      });
    });

    const { result } = renderHook(() => useHomePageData(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.seasonSchedule).toEqual([]);
    expect(result.current.featuredDriver).toEqual(mockFeaturedDriver);
    expect(result.current.error).toBeNull();
  });

  it('should handle races with null podium data', async () => {
    const racesWithNullPodium: Race[] = [
      ...mockRaces,
      {
        id: 4,
        name: 'Future Race',
        round: 4,
        date: '2024-12-01T15:00:00.000Z',
        circuit_id: 4,
        season_id: 2024,
        countryCode: 'FUT',
        country: 'Future Country',
        circuit: {
          country_code: 'FUT',
          country: 'Future Country',
        },
      },
    ];

    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/seasons/2024/races')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: new Headers(),
          json: async () => racesWithNullPodium,
        });
      }
      if (url.includes('/api/standings/featured-driver')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: new Headers(),
          json: async () => mockFeaturedDriver,
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers(),
        text: async () => 'Not Found',
        json: async () => ({ error: 'Not Found' }),
      });
    });

    const { result } = renderHook(() => useHomePageData(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.seasonSchedule).toEqual(racesWithNullPodium);
    expect(result.current.featuredDriver).toEqual(mockFeaturedDriver);
    expect(result.current.error).toBeNull();
  });

  it('should handle featured driver with missing fields', async () => {
    const incompleteFeaturedDriver = {
      id: 1,
      fullName: 'Max Verstappen',
      teamName: 'Red Bull Racing',
      seasonPoints: 400,
      seasonWins: 15,
      position: 1,
      careerStats: { wins: 60, podiums: 105, poles: 35 },
      recentForm: [{ position: 1, raceName: 'Previous GP', countryCode: 'USA' }],
      // Missing driverNumber and countryCode
    };

    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/seasons/2024/races')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: new Headers(),
          json: async () => mockRaces,
          text: async () => JSON.stringify(mockRaces),
        });
      }
      if (url.includes('/api/standings/featured-driver')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: new Headers(),
          json: async () => incompleteFeaturedDriver,
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers(),
        text: async () => 'Not Found',
        json: async () => ({ error: 'Not Found' }),
      });
    });

    const { result } = renderHook(() => useHomePageData(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.featuredDriver).toEqual(incompleteFeaturedDriver);
    expect(result.current.error).toBeNull();
  });

  it('should maintain loading state during fetch', async () => {
    let resolvePromise: (value: any) => void;
    const fetchPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockFetch.mockReturnValueOnce(fetchPromise);

    const { result } = renderHook(() => useHomePageData(), { wrapper });

    expect(result.current.loading).toBe(true);

    // Resolve the promise after a delay
    setTimeout(() => {
      resolvePromise!({
        ok: true,
        json: async () => mockRaces,
      });
    }, 100);

    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it('should handle console error logging on failure', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const networkError = new Error('Network error');
    
    mockFetch.mockRejectedValueOnce(networkError);

    const { result } = renderHook(() => useHomePageData(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(consoleSpy).toHaveBeenCalledWith('Error fetching home page data:', 'Network error');

    consoleSpy.mockRestore();
  });


  it('should handle buildApiUrl integration correctly', async () => {
    const { result } = renderHook(() => useHomePageData(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockFetch).toHaveBeenCalledWith('/api/seasons/2024/races');
    expect(mockFetch).toHaveBeenCalledWith('/api/standings/featured-driver');
    expect(result.current.featuredDriver).toEqual(mockFeaturedDriver);
  });

  it('should handle different current years correctly', async () => {
    // Test with year 2025
    vi.setSystemTime(new Date('2025-03-15T12:00:00.000Z'));

    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/seasons/2025/races')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: new Headers(),
          json: async () => mockRaces,
          text: async () => JSON.stringify(mockRaces),
        });
      }
      if (url.includes('/api/standings/featured-driver')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: new Headers(),
          json: async () => mockFeaturedDriver,
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers(),
        text: async () => 'Not Found',
        json: async () => ({ error: 'Not Found' }),
      });
    });

    const { result } = renderHook(() => useHomePageData(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockFetch).toHaveBeenCalledWith('/api/seasons/2025/races');
    expect(result.current.featuredDriver).toEqual(mockFeaturedDriver);
  });
});
