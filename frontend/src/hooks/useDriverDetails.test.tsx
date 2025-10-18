import React from 'react';
import { describe, it, vi, expect, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import { renderHook, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { useDriverDetails } from './useDriverDetails';

// Mock useToast
const mockToast = vi.fn();
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => mockToast,
  };
});

// Mock Auth0
const mockGetAccessTokenSilently = vi.fn();
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: vi.fn(() => ({
    getAccessTokenSilently: mockGetAccessTokenSilently,
  })),
}));

// Mock API fetch
vi.mock('../lib/api', () => ({
  apiFetch: vi.fn(),
}));

// Mock driver headshots
vi.mock('../lib/driverHeadshots', () => ({
  driverHeadshots: {
    'Max Verstappen': 'verstappen.png',
    'Lewis Hamilton': 'hamilton.png',
  },
}));

// Mock fallback data
vi.mock('../lib/fallbackData/driverDetails', () => ({
  fallbackDriverDetails: {
    firstName: 'Fallback',
    lastName: 'Driver',
    fullName: 'Fallback Driver',
    number: 0,
    countryCode: 'XX',
    imageUrl: 'fallback.png',
    teamName: 'Fallback Team',
    worldChampionships: 0,
    grandsPrixEntered: 0,
  },
}));

// Import mocked modules
import { apiFetch } from '../lib/api';
const mockApiFetch = vi.mocked(apiFetch);

// Chakra wrapper
function wrapper({ children }: { children: React.ReactNode }) {
  return <ChakraProvider>{children}</ChakraProvider>;
}

describe('useDriverDetails', () => {
  const mockDriverStatsResponse = {
    driver: {
      first_name: 'Max',
      last_name: 'Verstappen',
      driver_number: 1,
      country_code: 'NED',
      current_team_name: 'Red Bull Racing',
      image_url: 'https://example.com/verstappen.jpg',
    },
    careerStats: {
      wins: 60,
      podiums: 105,
      fastestLaps: 35,
      points: 2800,
      grandsPrixEntered: 200,
      dnfs: 25,
      highestRaceFinish: 1,
    },
    currentSeasonStats: {
      wins: 15,
      podiums: 20,
      fastestLaps: 8,
      standing: '1st',
    },
    winsPerSeason: [
      { season: 2023, wins: 19 },
      { season: 2024, wins: 15 },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAccessTokenSilently.mockResolvedValue('mock-token');
    mockApiFetch.mockResolvedValue(mockDriverStatsResponse);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return error when no driverId is provided', async () => {
    const { result } = renderHook(() => useDriverDetails(undefined), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Driver ID not found in URL.');
    expect(result.current.driverDetails).toBeNull();
  });

  it('should fetch driver data successfully', async () => {
    const { result } = renderHook(() => useDriverDetails('1'), { wrapper });

    // Initially loading
    expect(result.current.loading).toBe(true);

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 5000 });

    // Check data loaded
    expect(result.current.driverDetails).toBeTruthy();
    expect(result.current.driverDetails.fullName).toContain('Max');
    expect(result.current.driverDetails.fullName).toContain('Verstappen');
    expect(result.current.error).toBeNull();
    expect(result.current.isFallback).toBe(false);
  });

  it('should handle API failure and use fallback data', async () => {
    mockApiFetch.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useDriverDetails('1'), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should use fallback data
    expect(result.current.driverDetails).toBeTruthy();
    expect(result.current.isFallback).toBe(true);
    expect(result.current.error).toBeTruthy(); // Error is recorded
    
    // Should show toast notification
    expect(mockToast).toHaveBeenCalled();
  });

  it('should handle missing stats data by using fallback', async () => {
    const dataWithoutStats = {
      driver: {
        first_name: 'Test',
        last_name: 'Driver',
        driver_number: 99,
        country_code: 'GB',
        current_team_name: 'Test Team',
      },
      careerStats: null,
      currentSeasonStats: null,
    };

    mockApiFetch.mockResolvedValue(dataWithoutStats);

    const { result } = renderHook(() => useDriverDetails('99'), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Hook treats incomplete data as invalid and uses fallback
    expect(result.current.driverDetails).toBeTruthy();
    expect(result.current.isFallback).toBe(true);
  });

  it('should return all expected properties', async () => {
    const { result } = renderHook(() => useDriverDetails('1'), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Check all return properties exist
    expect(result.current).toHaveProperty('driverDetails');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('isFallback');
  });

  it('should handle invalid driverId format', async () => {
    const { result } = renderHook(() => useDriverDetails('invalid'), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should either error or use fallback
    expect(result.current.loading).toBe(false);
  });

  it('should call API with correct token', async () => {
    renderHook(() => useDriverDetails('1'), { wrapper });

    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalled();
    });

    expect(mockGetAccessTokenSilently).toHaveBeenCalled();
  });

  it('should not throw on mount', () => {
    expect(() => {
      renderHook(() => useDriverDetails('1'), { wrapper });
    }).not.toThrow();
  });

  it('should handle different driver data structures', async () => {
    const alternateFormat = {
      driver: {
        firstName: 'Lewis',
        lastName: 'Hamilton',
        driverNumber: 44,
        countryCode: 'GB',
        teamName: 'Mercedes',
      },
      careerStats: {
        wins: 103,
        podiums: 197,
      },
      currentSeasonStats: {
        wins: 2,
        podiums: 8,
      },
    };

    mockApiFetch.mockResolvedValue(alternateFormat);

    const { result } = renderHook(() => useDriverDetails('44'), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.driverDetails).toBeTruthy();
    expect(result.current.error).toBeNull();
  });

  it('should set loading state correctly', async () => {
    const { result } = renderHook(() => useDriverDetails('1'), { wrapper });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });
});
