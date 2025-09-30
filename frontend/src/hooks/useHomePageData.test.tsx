import React from 'react';
import { describe, it, vi, expect, beforeEach, afterEach } from 'vitest';
import type { Mock } from 'vitest';
import '@testing-library/jest-dom';
import { renderHook, waitFor } from '@testing-library/react';

import { ChakraProvider } from '@chakra-ui/react';
import { useHomePageData, type Race, type FeaturedDriver } from './useHomePageData';
import { supabase } from '../lib/supabase';

// Mock buildApiUrl
vi.mock('../lib/api', () => ({
  buildApiUrl: (path: string) => path,
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: null,
          error: null,
        })),
      })),
    })),
  },
}));

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
      circuit: {
        id: 1,
        name: 'Bahrain International Circuit',
        country_code: 'BHR',
      },
      podium: [
        { position: 1, driverName: 'Max Verstappen', countryCode: 'NED' },
        { position: 2, driverName: 'Sergio Perez', countryCode: 'MEX' },
        { position: 3, driverName: 'Carlos Sainz', countryCode: 'ESP' },
      ],
    },
    {
      id: 2,
      name: 'Saudi Arabian Grand Prix',
      round: 2,
      date: '2024-03-09T17:00:00.000Z',
      circuit: {
        id: 2,
        name: 'Jeddah Corniche Circuit',
        country_code: 'SAU',
      },
      podium: [
        { position: 1, driverName: 'Max Verstappen', countryCode: 'NED' },
        { position: 2, driverName: 'Charles Leclerc', countryCode: 'MON' },
        { position: 3, driverName: 'Oscar Piastri', countryCode: 'AUS' },
      ],
    },
    {
      id: 3,
      name: 'Australian Grand Prix',
      round: 3,
      date: '2024-03-24T05:00:00.000Z',
      circuit: {
        id: 3,
        name: 'Albert Park Circuit',
        country_code: 'AUS',
      },
      podium: null,
    },
  ];

  const mockModernStandings = [
    {
      driverId: 1,
      driverFullName: 'Max Verstappen',
      constructorName: 'Red Bull Racing',
      seasonPoints: 400,
      seasonWins: 10,
      seasonYear: 2024,
    },
    {
      driverId: 2,
      driverFullName: 'Charles Leclerc',
      constructorName: 'Ferrari',
      seasonPoints: 350,
      seasonWins: 5,
      seasonYear: 2024,
    },
  ];

  const mockHistoricalStandings = {
    driverStandings: [
      {
        driver: {
          id: 1,
          first_name: 'Lewis',
          last_name: 'Hamilton',
        },
        team: {
          name: 'Mercedes',
        },
        points: 300,
        wins: 8,
      },
      {
        driver: {
          id: 2,
          first_name: 'Sebastian',
          last_name: 'Vettel',
        },
        team: {
          name: 'Ferrari',
        },
        points: 250,
        wins: 5,
      },
    ],
  };

  const mockDriverStats = {
    careerStats: {
      wins: 61,
      podiums: 110,
      poles: 42,
      totalPoints: 2700,
      fastestLaps: 32,
      racesCompleted: 190,
    },
    driver: {
      driver_number: 1,
      country_code: 'NED',
    },
  };

  const mockRecentForm = [
    { position: 1, raceName: 'Italian Grand Prix', countryCode: 'ITA' },
    { position: 2, raceName: 'Dutch Grand Prix', countryCode: 'NLD' },
    { position: 1, raceName: 'Belgian Grand Prix', countryCode: 'BEL' },
    { position: 3, raceName: 'British Grand Prix', countryCode: 'GBR' },
    { position: 1, raceName: 'Austrian Grand Prix', countryCode: 'AUT' },
  ];

  const expectedFeaturedDriver: FeaturedDriver = {
    id: 1,
    fullName: 'Max Verstappen',
    driverNumber: 1,
    countryCode: 'NED',
    teamName: 'Red Bull Racing',
    seasonPoints: 400,
    seasonWins: 10,
    position: 1,
    careerStats: mockDriverStats.careerStats,
    recentForm: mockRecentForm,
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
          json: async () => mockRaces,
        });
      }
      if (url.includes('/api/drivers/1/stats')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockDriverStats,
        });
      }
      if (url.includes('/api/drivers/1/recent-form')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockRecentForm,
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });
    });

    // Mock Supabase for modern years
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: mockModernStandings,
          error: null,
        }),
      }),
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

    expect(result.current.featuredDriver).toEqual(expectedFeaturedDriver);
    expect(result.current.seasonSchedule).toEqual(mockRaces);
    expect(result.current.error).toBeNull();
    expect(supabase.from).toHaveBeenCalledWith('driver_standings_materialized');
  });

  it('should load home page data successfully for historical year (2022)', async () => {
    // Mock Date.now() to return 2022
    vi.setSystemTime(new Date('2022-03-15T12:00:00.000Z'));

    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/seasons/2022/races')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockRaces,
        });
      }
      if (url.includes('/api/standings/2022/1')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockHistoricalStandings,
        });
      }
      if (url.includes('/api/drivers/1/stats')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockDriverStats,
        });
      }
      if (url.includes('/api/drivers/1/recent-form')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockRecentForm,
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });
    });

    const { result } = renderHook(() => useHomePageData(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    const expectedHistoricalDriver: FeaturedDriver = {
      id: 1,
      fullName: 'Lewis Hamilton',
      driverNumber: 1,
      countryCode: 'NED',
      teamName: 'Mercedes',
      seasonPoints: 300,
      seasonWins: 8,
      position: 1,
      careerStats: mockDriverStats.careerStats,
      recentForm: mockRecentForm,
    };

    expect(result.current.featuredDriver).toEqual(expectedHistoricalDriver);
    expect(result.current.seasonSchedule).toEqual(mockRaces);
    expect(result.current.error).toBeNull();
  });

  it('should handle races API failure', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/seasons/2024/races')) {
        return Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });
    });

    const { result } = renderHook(() => useHomePageData(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.featuredDriver).toEqual({
      id: 1,
      fullName: 'Max Verstappen',
      driverNumber: 1,
      countryCode: 'NED',
      teamName: 'Red Bull Racing',
      seasonPoints: 310,
      seasonWins: 10,
      position: 1,
      careerStats: {
        wins: 61,
        podiums: 110,
        poles: 42,
        totalPoints: 2700,
        fastestLaps: 32,
        racesCompleted: 190,
      },
      recentForm: [
        { position: 1, raceName: 'Italian Grand Prix', countryCode: 'ITA' },
        { position: 2, raceName: 'Dutch Grand Prix', countryCode: 'NLD' },
        { position: 1, raceName: 'Belgian Grand Prix', countryCode: 'BEL' },
        { position: 3, raceName: 'British Grand Prix', countryCode: 'GBR' },
        { position: 1, raceName: 'Austrian Grand Prix', countryCode: 'AUT' },
      ],
    }); // Should fall back to default featured driver
    expect(result.current.seasonSchedule).toEqual([]);
    expect(result.current.error).toBe('Failed to fetch races: Internal Server Error');
  });

  it('should handle Supabase error for modern years', async () => {
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Supabase connection failed' },
        }),
      }),
    });

    const { result } = renderHook(() => useHomePageData(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.featuredDriver).not.toBeNull(); // Should use fallback
    expect(result.current.error).toBe('Supabase Query Error: Supabase connection failed');
  });

  it('should handle historical standings API failure', async () => {
    vi.setSystemTime(new Date('2022-03-15T12:00:00.000Z'));

    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/seasons/2022/races')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockRaces,
        });
      }
      if (url.includes('/api/standings/2022/1')) {
        return Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });
    });

    const { result } = renderHook(() => useHomePageData(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.featuredDriver).not.toBeNull(); // Should use fallback
    expect(result.current.error).toBe('Failed to fetch historical standings');
  });

  it('should handle driver stats API failure', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/seasons/2024/races')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockRaces,
        });
      }
      if (url.includes('/api/drivers/1/stats')) {
        return Promise.resolve({
          ok: false,
          status: 404,
          statusText: 'Not Found',
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });
    });

    const { result } = renderHook(() => useHomePageData(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.featuredDriver).not.toBeNull(); // Should use fallback
    expect(result.current.error).toBe('Failed to fetch driver stats: Not Found');
  });

  it('should handle recent form API failure gracefully', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/seasons/2024/races')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockRaces,
        });
      }
      if (url.includes('/api/drivers/1/stats')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockDriverStats,
        });
      }
      if (url.includes('/api/drivers/1/recent-form')) {
        return Promise.resolve({
          ok: false,
          status: 404,
          statusText: 'Not Found',
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });
    });

    const { result } = renderHook(() => useHomePageData(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.featuredDriver?.recentForm).toEqual([]); // Should be empty array on failure
    expect(result.current.error).toBeNull(); // Should not set error for recent form failure
  });

  it('should handle empty driver standings', async () => {
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }),
    });

    const { result } = renderHook(() => useHomePageData(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.featuredDriver).not.toBeNull(); // Should use fallback
    expect(result.current.error).toBe('No driver standings found');
  });

  it('should handle malformed driver standings data', async () => {
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }),
    });

    const { result } = renderHook(() => useHomePageData(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.featuredDriver).not.toBeNull(); // Should use fallback
    expect(result.current.error).toBe('Driver standings data is missing or not an array');
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
    expect(result.current.error).toBe('Failed to fetch home page data');
  });

  it('should handle empty races response', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/seasons/2024/races')) {
        return Promise.resolve({
          ok: true,
          json: async () => [],
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });
    });

    const { result } = renderHook(() => useHomePageData(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.seasonSchedule).toEqual([]);
    // When races are empty, it should fall back to default driver since no standings can be fetched
    expect(result.current.featuredDriver?.fullName).toBe('Max Verstappen');
    expect(result.current.featuredDriver?.seasonPoints).toBe(310); // Default fallback value
    expect(result.current.error).toBe('Failed to fetch driver stats: Not Found'); // Should have error due to failed stats fetch
  });

  it('should handle races with null podium data', async () => {
    const racesWithNullPodium = [
      ...mockRaces,
      {
        id: 4,
        name: 'Future Race',
        round: 4,
        date: '2024-12-01T15:00:00.000Z',
        circuit: {
          id: 4,
          name: 'Future Circuit',
          country_code: 'FUT',
        },
        podium: null,
      },
    ];

    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/seasons/2024/races')) {
        return Promise.resolve({
          ok: true,
          json: async () => racesWithNullPodium,
        });
      }
      if (url.includes('/api/drivers/1/stats')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockDriverStats,
        });
      }
      if (url.includes('/api/drivers/1/recent-form')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockRecentForm,
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });
    });

    const { result } = renderHook(() => useHomePageData(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.seasonSchedule).toEqual(racesWithNullPodium);
    expect(result.current.featuredDriver).toEqual(expectedFeaturedDriver);
    expect(result.current.error).toBeNull();
  });

  it('should handle driver stats with missing fields', async () => {
    const incompleteDriverStats = {
      careerStats: {
        wins: 61,
        podiums: 110,
        poles: 42,
        totalPoints: 2700,
        fastestLaps: 32,
        racesCompleted: 190,
      },
      driver: {
        // Missing driver_number and country_code
      },
    };

    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/seasons/2024/races')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockRaces,
        });
      }
      if (url.includes('/api/drivers/1/stats')) {
        return Promise.resolve({
          ok: true,
          json: async () => incompleteDriverStats,
        });
      }
      if (url.includes('/api/drivers/1/recent-form')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockRecentForm,
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });
    });

    const { result } = renderHook(() => useHomePageData(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    const expectedDriverWithMissingFields: FeaturedDriver = {
      id: 1,
      fullName: 'Max Verstappen',
      driverNumber: null, // Should be null when missing
      countryCode: null, // Should be null when missing
      teamName: 'Red Bull Racing',
      seasonPoints: 400,
      seasonWins: 10,
      position: 1,
      careerStats: incompleteDriverStats.careerStats,
      recentForm: mockRecentForm,
    };

    expect(result.current.featuredDriver).toEqual(expectedDriverWithMissingFields);
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

    expect(consoleSpy).toHaveBeenCalledWith('Error fetching home page data:', networkError);

    consoleSpy.mockRestore();
  });

  it('should handle console logging for recent form', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/seasons/2024/races')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockRaces,
        });
      }
      if (url.includes('/api/drivers/1/stats')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockDriverStats,
        });
      }
      if (url.includes('/api/drivers/1/recent-form')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockRecentForm,
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });
    });

    const { result } = renderHook(() => useHomePageData(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(consoleSpy).toHaveBeenCalledWith('Data received in hook:', mockRecentForm);

    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('should handle buildApiUrl integration correctly', async () => {
    const { result } = renderHook(() => useHomePageData(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockFetch).toHaveBeenCalledWith('/api/seasons/2024/races');
    expect(mockFetch).toHaveBeenCalledWith('/api/drivers/1/stats');
    expect(mockFetch).toHaveBeenCalledWith('/api/drivers/1/recent-form');
    expect(result.current.featuredDriver).toEqual(expectedFeaturedDriver);
  });

  it('should handle different current years correctly', async () => {
    // Test with year 2025
    vi.setSystemTime(new Date('2025-03-15T12:00:00.000Z'));

    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/seasons/2025/races')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockRaces,
        });
      }
      if (url.includes('/api/drivers/1/stats')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockDriverStats,
        });
      }
      if (url.includes('/api/drivers/1/recent-form')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockRecentForm,
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });
    });

    const { result } = renderHook(() => useHomePageData(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockFetch).toHaveBeenCalledWith('/api/seasons/2025/races');
    expect(supabase.from).toHaveBeenCalledWith('driver_standings_materialized');
    expect(result.current.featuredDriver).toEqual(expectedFeaturedDriver);
  });
});
