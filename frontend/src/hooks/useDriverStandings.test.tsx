import React from 'react';
import { describe, it, vi, expect, beforeEach, afterEach } from 'vitest';
import type { Mock } from 'vitest';
import '@testing-library/jest-dom';
import { renderHook, waitFor } from '@testing-library/react';

import { ChakraProvider } from '@chakra-ui/react';
import { useDriverStandings, type DriverStanding } from './useDriverStandings';

// Mock buildApiUrl
vi.mock('../lib/api', () => ({
  buildApiUrl: (path: string) => path,
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock Auth0
const mockGetAccessTokenSilently = vi.fn();
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    getAccessTokenSilently: mockGetAccessTokenSilently,
  }),
}));

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

describe('useDriverStandings', () => {
  const mockApiResponse = [
    {
      id: 1,
      fullname: 'Max Verstappen',
      number: 1,
      country: 'Netherlands',
      profileimageurl: 'verstappen.jpg',
      constructor: 'Red Bull Racing',
      points: 400,
      wins: 10,
      podiums: 15,
      position: 1,
      seasonyear: 2024,
    },
    {
      id: 2,
      fullname: 'Lewis Hamilton',
      number: 44,
      country: 'United Kingdom',
      profileimageurl: 'hamilton.jpg',
      constructor: 'Mercedes',
      points: 350,
      wins: 8,
      podiums: 12,
      position: 2,
      seasonyear: 2024,
    },
    {
      id: 3,
      fullname: 'Charles Leclerc',
      number: 16,
      country: 'Monaco',
      profileimageurl: 'leclerc.jpg',
      constructor: 'Ferrari',
      points: 300,
      wins: 5,
      podiums: 10,
      position: 3,
      seasonyear: 2024,
    },
  ];

  const expectedMappedData: DriverStanding[] = [
    {
      id: 1,
      fullName: 'Max Verstappen',
      number: 1,
      country: 'Netherlands',
      profileImageUrl: 'verstappen.jpg',
      constructor: 'Red Bull Racing',
      points: 400,
      wins: 10,
      podiums: 15,
      position: 1,
      seasonYear: 2024,
    },
    {
      id: 2,
      fullName: 'Lewis Hamilton',
      number: 44,
      country: 'United Kingdom',
      profileImageUrl: 'hamilton.jpg',
      constructor: 'Mercedes',
      points: 350,
      wins: 8,
      podiums: 12,
      position: 2,
      seasonYear: 2024,
    },
    {
      id: 3,
      fullName: 'Charles Leclerc',
      number: 16,
      country: 'Monaco',
      profileImageUrl: 'leclerc.jpg',
      constructor: 'Ferrari',
      points: 300,
      wins: 5,
      podiums: 10,
      position: 3,
      seasonYear: 2024,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default successful mock implementations
    mockGetAccessTokenSilently.mockResolvedValue('mock-access-token');
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should load driver standings successfully', async () => {
    const { result } = renderHook(() => useDriverStandings(2024), { wrapper });

    expect(result.current.loading).toBe(true);
    expect(result.current.standings).toEqual([]);
    expect(result.current.error).toBeNull();

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.standings).toEqual(expectedMappedData);
    expect(result.current.error).toBeNull();
    expect(mockGetAccessTokenSilently).toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledWith('/api/drivers/standings/2024', {
      headers: { Authorization: 'Bearer mock-access-token' },
    });
  });

  it('should handle different seasons correctly', async () => {
    const { result } = renderHook(() => useDriverStandings(2023), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockFetch).toHaveBeenCalledWith('/api/drivers/standings/2023', {
      headers: { Authorization: 'Bearer mock-access-token' },
    });
    expect(result.current.standings).toEqual(expectedMappedData);
  });

  it('should handle API failure with proper error handling', async () => {
    const networkError = new Error('Network error');
    mockFetch.mockRejectedValueOnce(networkError);

    const { result } = renderHook(() => useDriverStandings(2024), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.standings).toEqual([]);
    expect(result.current.error).toBe('Network error');
    expect(toastMock).toHaveBeenCalledWith({
      title: 'Could not fetch driver standings',
      description: 'Network error',
      status: 'error',
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

    const { result } = renderHook(() => useDriverStandings(2024), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.standings).toEqual([]);
    expect(result.current.error).toBe('API Error: 500 Internal Server Error');
    expect(toastMock).toHaveBeenCalledWith({
      title: 'Could not fetch driver standings',
      description: 'API Error: 500 Internal Server Error',
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  });

  it('should handle 401 unauthorized errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    });

    const { result } = renderHook(() => useDriverStandings(2024), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.standings).toEqual([]);
    expect(result.current.error).toBe('API Error: 401 Unauthorized');
  });

  it('should handle 404 not found errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    const { result } = renderHook(() => useDriverStandings(2024), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.standings).toEqual([]);
    expect(result.current.error).toBe('API Error: 404 Not Found');
  });

  it('should handle authentication token errors', async () => {
    mockGetAccessTokenSilently.mockRejectedValueOnce(new Error('Token error'));

    const { result } = renderHook(() => useDriverStandings(2024), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.standings).toEqual([]);
    expect(result.current.error).toBe('Token error');
  });

  it('should handle malformed JSON responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    });

    const { result } = renderHook(() => useDriverStandings(2024), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.standings).toEqual([]);
    expect(result.current.error).toBe('Invalid JSON');
  });

  it('should handle non-Error exceptions', async () => {
    mockFetch.mockRejectedValueOnce('String error');

    const { result } = renderHook(() => useDriverStandings(2024), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.standings).toEqual([]);
    expect(result.current.error).toBe('Failed to load standings.');
  });

  it('should handle empty API response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    const { result } = renderHook(() => useDriverStandings(2024), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.standings).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should handle API response with missing fields', async () => {
    const incompleteApiResponse = [
      {
        id: 1,
        // Missing fullname, number, country, etc.
        points: 400,
        wins: 10,
        constructor: undefined, // Explicitly set to undefined to test fallback
      },
      {
        id: 2,
        fullname: 'Lewis Hamilton',
        number: 44,
        // Missing other fields
        points: 350,
        constructor: undefined, // Explicitly set to undefined to test fallback
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => incompleteApiResponse,
    });

    const { result } = renderHook(() => useDriverStandings(2024), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    const expectedMappedIncomplete = [
      {
        id: 1,
        fullName: 'Unknown',
        number: null,
        country: 'N/A',
        profileImageUrl: null,
        constructor: 'Unknown',
        points: 400,
        wins: 10,
        podiums: 0,
        position: 0,
        seasonYear: 2024,
      },
      {
        id: 2,
        fullName: 'Lewis Hamilton',
        number: 44,
        country: 'N/A',
        profileImageUrl: null,
        constructor: 'Unknown',
        points: 350,
        wins: 0,
        podiums: 0,
        position: 0,
        seasonYear: 2024,
      },
    ];

    // Check that the mapping handles missing fields correctly
    expect(result.current.standings[0].fullName).toBe('Unknown');
    expect(result.current.standings[0].constructor).toBe('Unknown');
    expect(result.current.standings[0].country).toBe('N/A');
    expect(result.current.standings[0].profileImageUrl).toBeNull();
    expect(result.current.standings[1].fullName).toBe('Lewis Hamilton');
    expect(result.current.standings[1].constructor).toBe('Unknown');
    expect(result.current.standings[1].number).toBe(44);
    expect(result.current.error).toBeNull();
  });

  it('should handle API response with alternative field names', async () => {
    const alternativeFieldResponse = [
      {
        id: 1,
        fullName: 'Max Verstappen', // Using fullName instead of fullname
        number: 1,
        country: 'Netherlands',
        profileimageurl: 'verstappen.jpg', // Keep lowercase to match hook expectation
        constructor: 'Red Bull Racing',
        points: 400,
        wins: 10,
        podiums: 15,
        position: 1,
        seasonyear: 2023, // Different season year
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => alternativeFieldResponse,
    });

    const { result } = renderHook(() => useDriverStandings(2024), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    const expectedAlternative = [
      {
        id: 1,
        fullName: 'Max Verstappen',
        number: 1,
        country: 'Netherlands',
        profileImageUrl: 'verstappen.jpg',
        constructor: 'Red Bull Racing',
        points: 400,
        wins: 10,
        podiums: 15,
        position: 1,
        seasonYear: 2023, // Should use the seasonYear from API, not the hook parameter
      },
    ];

    expect(result.current.standings).toEqual(expectedAlternative);
  });

  it('should handle null and undefined values in API response', async () => {
    const nullValuesResponse = [
      {
        id: 1,
        fullname: 'Max Verstappen',
        number: null,
        country: null,
        profileimageurl: undefined,
        constructor: 'Red Bull Racing',
        points: 400,
        wins: null,
        podiums: undefined,
        position: 1,
        seasonyear: null,
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => nullValuesResponse,
    });

    const { result } = renderHook(() => useDriverStandings(2024), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    const expectedNullHandled = [
      {
        id: 1,
        fullName: 'Max Verstappen',
        number: null,
        country: 'N/A',
        profileImageUrl: null,
        constructor: 'Red Bull Racing',
        points: 400,
        wins: 0,
        podiums: 0,
        position: 1,
        seasonYear: 2024, // Should fall back to hook parameter when API value is null
      },
    ];

    expect(result.current.standings).toEqual(expectedNullHandled);
  });

  it('should maintain loading state during fetch', async () => {
    let resolvePromise: (value: any) => void;
    const fetchPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockFetch.mockReturnValueOnce(fetchPromise);

    const { result } = renderHook(() => useDriverStandings(2024), { wrapper });

    expect(result.current.loading).toBe(true);

    // Resolve the promise after a delay
    setTimeout(() => {
      resolvePromise!({
        ok: true,
        json: async () => mockApiResponse,
      });
    }, 100);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.standings).toEqual(expectedMappedData);
  });

  it('should handle console logging correctly', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const { result } = renderHook(() => useDriverStandings(2024), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(consoleSpy).toHaveBeenCalledWith('Raw Driver Standings from API: ', mockApiResponse);
    expect(consoleSpy).toHaveBeenCalledWith('Processed (Hydrated) Drivers: ', expectedMappedData);

    consoleSpy.mockRestore();
  });

  it('should handle multiple rapid season changes gracefully', async () => {
    const { result, rerender } = renderHook(
      ({ season }) => useDriverStandings(season),
      {
        wrapper,
        initialProps: { season: 2024 },
      }
    );

    // Change season multiple times quickly
    rerender({ season: 2023 });
    rerender({ season: 2022 });
    rerender({ season: 2021 });

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Should have made calls for the latest season
    expect(mockFetch).toHaveBeenCalledWith('/api/drivers/standings/2021', {
      headers: { Authorization: 'Bearer mock-access-token' },
    });
  });

  it('should handle buildApiUrl integration correctly', async () => {
    const { result } = renderHook(() => useDriverStandings(2024), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockFetch).toHaveBeenCalledWith('/api/drivers/standings/2024', {
      headers: { Authorization: 'Bearer mock-access-token' },
    });
    expect(result.current.standings).toEqual(expectedMappedData);
  });

  it('should handle authentication header correctly', async () => {
    const customToken = 'custom-access-token';
    mockGetAccessTokenSilently.mockResolvedValueOnce(customToken);

    const { result } = renderHook(() => useDriverStandings(2024), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockFetch).toHaveBeenCalledWith('/api/drivers/standings/2024', {
      headers: { Authorization: `Bearer ${customToken}` },
    });
  });

  it('should handle toast function dependency correctly', async () => {
    const networkError = new Error('Network error');
    mockFetch.mockRejectedValueOnce(networkError);

    const { result } = renderHook(() => useDriverStandings(2024), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(toastMock).toHaveBeenCalledTimes(1);
    expect(toastMock).toHaveBeenCalledWith({
      title: 'Could not fetch driver standings',
      description: 'Network error',
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  });
});
