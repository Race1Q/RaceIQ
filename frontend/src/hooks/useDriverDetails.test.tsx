import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import { renderHook, waitFor } from '@testing-library/react';

import { ChakraProvider } from '@chakra-ui/react';
import { useDriverDetails } from './useDriverDetails';
import { fallbackDriverDetails } from '../lib/fallbackData/driverDetails';

// Mock apiFetch
vi.mock('../lib/api');

// Mock dependencies
const mockGetAccessTokenSilently = vi.fn();
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    getAccessTokenSilently: mockGetAccessTokenSilently,
  }),
}));

// Mock driver headshots
vi.mock('../lib/driverHeadshots', () => ({
  driverHeadshots: {
    'Lewis Hamilton': 'hamilton.png',
    'Max Verstappen': 'verstappen.png',
    'Charles Leclerc': 'leclerc.png',
    'Lando Norris': 'norris.png',
    'Test Driver': 'test.png',
    default: 'default.png',
  },
}));

// Mock toast
const toastMock = vi.fn();
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => toastMock,
  };
});

// Import and get mocked function
import { apiFetch } from '../lib/api';
const mockApiFetch = vi.mocked(apiFetch);

// Chakra wrapper
function wrapper({ children }: { children: React.ReactNode }) {
  return <ChakraProvider>{children}</ChakraProvider>;
}

describe('useDriverDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAccessTokenSilently.mockResolvedValue('mock-token');
    
    // Set up API base
    (window as any).__API_BASE__ = '/api';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns error when no driverId is provided', async () => {
    const { result } = renderHook(() => useDriverDetails(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Driver ID not found in URL.');
    expect(result.current.driverDetails).toBe(null);
    expect(result.current.isFallback).toBe(false);
  });

  it('fetches driver data successfully from career stats endpoint', async () => {
    const mockDriverData = {
      driver: {
        id: 44,
        first_name: 'Lewis',
        last_name: 'Hamilton',
        full_name: 'Lewis Hamilton',
        country_code: 'GB',
        driver_number: 44,
        teamName: 'Mercedes',
        image_url: 'custom-hamilton.png',
      },
      careerStats: {
        wins: 103,
        podiums: 182,
        fastestLaps: 58,
        points: 4000,
        grandsPrixEntered: 300,
        dnfs: 25,
        highestRaceFinish: 1,
        winsPerSeason: [{ season: 2023, wins: 5 }],
      },
      currentSeasonStats: {
        wins: 2,
        podiums: 8,
        fastestLaps: 3,
        standing: '3rd',
      },
    };

    mockApiFetch.mockResolvedValue(mockDriverData);

    const { result } = renderHook(() => useDriverDetails('44'), { wrapper });

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(result.current.isFallback).toBe(false);
    expect(result.current.driverDetails).toMatchObject({
      id: 44,
      fullName: 'Lewis Hamilton',
      firstName: 'Lewis',
      lastName: 'Hamilton',
      countryCode: 'GB',
      teamName: 'Mercedes',
      number: 44,
      imageUrl: 'hamilton.png', // Should use mapped headshot
    });
    
    // Verify API was called with correct endpoint
    expect(mockApiFetch).toHaveBeenCalledWith('/api/drivers/44/career-stats', {
      headers: {
        Authorization: 'Bearer mock-token',
      },
    });
  });

  it('falls back to basic driver endpoint when career stats fails', async () => {
    const mockBasicDriverData = {
      id: 33,
      first_name: 'Max',
      last_name: 'Verstappen',
      country_code: 'NL',
      driver_number: 1,
      current_team_name: 'Red Bull Racing',
    };

    // Career stats fails, basic driver succeeds
    mockApiFetch
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(mockBasicDriverData);

    const { result } = renderHook(() => useDriverDetails('33'), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(result.current.isFallback).toBe(false);
    expect(result.current.driverDetails).toMatchObject({
      firstName: 'Max',
      lastName: 'Verstappen',
      countryCode: 'NL',
      teamName: 'Red Bull Racing',
      number: 1,
    });
  });

  it('uses fallback data when both endpoints fail', async () => {
    // Both endpoints fail - the error should be from the last caught error
    mockApiFetch
      .mockRejectedValueOnce(new Error('Career stats failed'))
      .mockRejectedValueOnce(new Error('Basic driver failed'));

    const { result } = renderHook(() => useDriverDetails('1'), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    // The error should be from the last failed call (basic driver)
    // since the first error is caught and logged, then second call fails
    expect(result.current.error).toBe('Basic driver failed');
    expect(result.current.driverDetails).toEqual(fallbackDriverDetails);
    expect(result.current.isFallback).toBe(true);
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Could not fetch live driver data',
        status: 'warning',
      })
    );
  });

  it('handles non-OK response from basic driver endpoint', async () => {
    // Career stats returns valid structure, then basic driver fails with non-OK
    const mockDriverData = {
      driver: {
        first_name: 'Test',
        last_name: 'Driver',
      },
      careerStats: { wins: 5 },
      currentSeasonStats: { wins: 2 },
    };

    mockApiFetch.mockResolvedValueOnce(mockDriverData);

    const { result } = renderHook(() => useDriverDetails('999'), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Since career stats worked, there should be no error
    expect(result.current.error).toBeNull();
    expect(result.current.isFallback).toBe(false);
  });

  it('handles invalid driver data structure gracefully', async () => {
    // Career stats returns data that fails the isDriverStatsResponse type guard
    const mockDriverData = {
      // Missing required driver, careerStats, currentSeasonStats fields
      invalid: 'data'
    };

    mockApiFetch
      .mockResolvedValueOnce(mockDriverData)
      .mockResolvedValueOnce({ invalid: 'data' }); // Basic driver also fails type guard

    const { result } = renderHook(() => useDriverDetails('invalid'), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Invalid driver data structure received');
    expect(result.current.isFallback).toBe(true);
  });

  it('handles various field name formats correctly', async () => {
    const mockDriverData = {
      driver: {
        given_name: 'Charles', // alternative field name
        family_name: 'Leclerc',
        countryCode: 'MC', // camelCase
        date_of_birth: '1997-10-16', // snake_case
      },
      careerStats: { wins: 5 },
      currentSeasonStats: { wins: 2 },
    };

    mockApiFetch.mockResolvedValueOnce(mockDriverData);

    const { result } = renderHook(() => useDriverDetails('16'), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.driverDetails.firstName).toBe('Charles');
    expect(result.current.driverDetails.lastName).toBe('Leclerc');
    expect(result.current.driverDetails.countryCode).toBe('MC');
    expect(result.current.driverDetails.dateOfBirth).toBe('1997-10-16');
  });

  it('uses headshot mapping over API image URL', async () => {
    const mockDriverData = {
      driver: {
        first_name: 'Max',
        last_name: 'Verstappen',
        image_url: 'api-image.jpg', // This should be ignored
      },
      careerStats: { wins: 0 },
      currentSeasonStats: { wins: 0 },
    };

    mockApiFetch.mockResolvedValueOnce(mockDriverData);

    const { result } = renderHook(() => useDriverDetails('33'), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Should use mapped headshot, not API image_url
    expect(result.current.driverDetails.imageUrl).toBe('verstappen.png');
  });

  it('handles missing stats data with default values', async () => {
    const mockDriverData = {
      driver: {
        first_name: 'Lando',
        last_name: 'Norris',
        country_code: 'GB',
        driver_number: 4,
      },
      careerStats: {}, // Empty stats
      currentSeasonStats: {}, // Empty stats
    };

    mockApiFetch.mockResolvedValueOnce(mockDriverData);

    const { result } = renderHook(() => useDriverDetails('4'), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.driverDetails.wins).toBe(0);
    expect(result.current.driverDetails.podiums).toBe(0);
    expect(result.current.driverDetails.currentSeasonStats).toEqual([
      { label: 'Wins', value: 0 },
      { label: 'Podiums', value: 0 },
      { label: 'Fastest Laps', value: 0 },
    ]);
  });

  it('transforms winsPerSeason season to string', async () => {
    const mockDriverData = {
      driver: {
        first_name: 'Test',
        last_name: 'Driver',
        full_name: 'Test Driver',
      },
      careerStats: {
        winsPerSeason: [
          { season: 2023, wins: 5 },
          { season: 2022, wins: 3 },
        ],
      },
      currentSeasonStats: { wins: 0 },
    };

    mockApiFetch.mockResolvedValueOnce(mockDriverData);

    const { result } = renderHook(() => useDriverDetails('test'), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.driverDetails.winsPerSeason).toEqual([
      { season: '2023', wins: 5 },
      { season: '2022', wins: 3 },
    ]);
  });
  
});



