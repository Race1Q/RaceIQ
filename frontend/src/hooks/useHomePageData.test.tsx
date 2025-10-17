import React from 'react';
import { describe, it, vi, expect, beforeEach, afterEach } from 'vitest';
import type { Mock } from 'vitest';
import '@testing-library/jest-dom';
import { renderHook, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { useHomePageData } from './useHomePageData';

// Mock toast
const mockToast = vi.fn();
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => mockToast,
  };
});

// Mock fetchCached
vi.mock('../lib/requestCache', () => ({
  fetchCached: vi.fn(),
}));

// Mock buildApiUrl
vi.mock('../lib/api', () => ({
  buildApiUrl: vi.fn((path: string) => path),
}));

// Import the mocked modules to get typed references
import { fetchCached } from '../lib/requestCache';
import { buildApiUrl } from '../lib/api';

const mockFetchCached = vi.mocked(fetchCached);
const mockBuildApiUrl = vi.mocked(buildApiUrl);

// Chakra wrapper
function wrapper({ children }: { children: React.ReactNode }) {
  return <ChakraProvider>{children}</ChakraProvider>;
}

describe('useHomePageData', () => {
  const mockFeaturedDriver = {
    id: 1,
    fullName: 'Max Verstappen',
    driverNumber: 1,
    countryCode: 'NLD',
    teamName: 'Red Bull Racing',
    seasonPoints: 400,
    seasonWins: 15,
    seasonPoles: 8,
    position: 1,
    careerStats: { wins: 60, podiums: 105, poles: 35 },
    recentForm: [{ position: 1, raceName: 'Previous GP', countryCode: 'USA' }],
  };

  const mockRaces = [
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
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set up default mock implementation
    mockFetchCached.mockImplementation(async (key: string, url: string) => {
      if (url.includes('featured-driver')) {
        return mockFeaturedDriver;
      }
      if (url.includes('races')) {
        return mockRaces;
      }
      throw new Error('404 Not Found');
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should load home page data successfully', async () => {
    const { result } = renderHook(() => useHomePageData(), { wrapper });

    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.featuredDriver).toBeNull();

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.featuredDriver).toEqual(mockFeaturedDriver);
    expect(result.current.seasonSchedule).toEqual(mockRaces);
    expect(result.current.error).toBeNull();
    expect(result.current.isFallback).toBe(false);
  });

  it('should handle API failure and use fallback', async () => {
    mockFetchCached.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useHomePageData(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should have fallback driver
    expect(result.current.featuredDriver).not.toBeNull();
    expect(result.current.featuredDriver?.fullName).toBe('Max Verstappen');
    expect(result.current.error).toBe('Network error');
    expect(result.current.isFallback).toBe(true);
    expect(result.current.seasonSchedule).toEqual([]);
    
    // Should show toast
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Could not fetch live home page data',
        status: 'warning',
      })
    );
  });

  it('should handle non-Error exceptions', async () => {
    mockFetchCached.mockRejectedValue('String error');

    const { result } = renderHook(() => useHomePageData(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('An unexpected error occurred.');
    expect(result.current.isFallback).toBe(true);
  });

  it('should handle empty races response gracefully', async () => {
    mockFetchCached.mockImplementation(async (key: string, url: string) => {
      if (url.includes('featured-driver')) {
        return mockFeaturedDriver;
      }
      if (url.includes('races')) {
        return []; // Empty array
      }
      throw new Error('404 Not Found');
    });

    const { result } = renderHook(() => useHomePageData(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.seasonSchedule).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should handle null races response', async () => {
    mockFetchCached.mockImplementation(async (key: string, url: string) => {
      if (url.includes('featured-driver')) {
        return mockFeaturedDriver;
      }
      if (url.includes('races')) {
        return null; // Null response
      }
      throw new Error('404 Not Found');
    });

    const { result } = renderHook(() => useHomePageData(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should convert null to empty array
    expect(result.current.seasonSchedule).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should set loading state correctly', async () => {
    const { result } = renderHook(() => useHomePageData(), { wrapper });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should return all required properties', async () => {
    const { result } = renderHook(() => useHomePageData(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Check all return properties exist
    expect(result.current).toHaveProperty('featuredDriver');
    expect(result.current).toHaveProperty('seasonSchedule');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('isFallback');
  });

  it('should handle featured driver with minimal recentForm', async () => {
    const minimalDriver = {
      ...mockFeaturedDriver,
      recentForm: [],
    };
    
    mockFetchCached.mockImplementation(async (key: string, url: string) => {
      if (url.includes('featured-driver')) {
        return minimalDriver;
      }
      if (url.includes('races')) {
        return mockRaces;
      }
      throw new Error('404 Not Found');
    });

    const { result } = renderHook(() => useHomePageData(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.featuredDriver?.recentForm).toEqual([]);
  });

  it('should use current year in API calls', async () => {
    renderHook(() => useHomePageData(), { wrapper });

    await waitFor(() => {
      expect(mockFetchCached).toHaveBeenCalled();
    });

    const currentYear = new Date().getFullYear();
    expect(mockBuildApiUrl).toHaveBeenCalledWith(`/api/seasons/${currentYear}/races`);
  });

  it('should call fetchCached with correct cache keys', async () => {
    renderHook(() => useHomePageData(), { wrapper });

    await waitFor(() => {
      expect(mockFetchCached).toHaveBeenCalled();
    });

    const currentYear = new Date().getFullYear();
    expect(mockFetchCached).toHaveBeenCalledWith('home:featured', '/api/standings/featured-driver');
    expect(mockFetchCached).toHaveBeenCalledWith(`home:races:${currentYear}`, `/api/seasons/${currentYear}/races`);
  });

  it('should handle timeout errors', async () => {
    mockFetchCached.mockRejectedValue(new Error('Request timeout'));

    const { result } = renderHook(() => useHomePageData(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Request timeout');
    expect(result.current.isFallback).toBe(true);
  });

  it('should not throw errors on mount', () => {
    expect(() => {
      renderHook(() => useHomePageData(), { wrapper });
    }).not.toThrow();
  });

  it('should handle driver with null values gracefully', async () => {
    const driverWithNulls = {
      ...mockFeaturedDriver,
      seasonPoles: null,
      recentForm: null,
    };
    
    mockFetchCached.mockImplementation(async (key: string, url: string) => {
      if (url.includes('featured-driver')) {
        return driverWithNulls;
      }
      if (url.includes('races')) {
        return mockRaces;
      }
      throw new Error('404 Not Found');
    });

    const { result } = renderHook(() => useHomePageData(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.featuredDriver).toEqual(driverWithNulls);
    expect(result.current.error).toBeNull();
  });
});
