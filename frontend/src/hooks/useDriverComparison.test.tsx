import React from 'react';
import { describe, it, vi, expect, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import { renderHook, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { useDriverComparison } from './useDriverComparison';

// Mock buildApiUrl
vi.mock('../lib/api', () => ({
  buildApiUrl: vi.fn((path: string) => `http://localhost:3000${path}`),
  apiFetch: vi.fn(),
}));

// Import mocked modules
import { apiFetch } from '../lib/api';
const mockApiFetch = vi.mocked(apiFetch);

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Chakra wrapper
function wrapper({ children }: { children: React.ReactNode }) {
  return <ChakraProvider>{children}</ChakraProvider>;
}

// Helper to create mock response
function createMockResponse(data: any, ok: boolean = true) {
  return Promise.resolve({
    ok,
    json: async () => data,
    headers: new Headers(),
    status: ok ? 200 : 500,
    statusText: ok ? 'OK' : 'Error',
  } as Response);
}

describe('useDriverComparison', () => {
  const mockDriverStandings = {
    driverStandings: [
      {
        driverId: 1,
        driverFullName: 'Max Verstappen',
        driverFirstName: 'Max',
        driverLastName: 'Verstappen',
        driverCode: 'VER',
        constructorName: 'Red Bull Racing',
        driverProfileImageUrl: 'verstappen.jpg',
        driverCountryCode: 'NED',
        driverNumber: 1,
      },
      {
        driverId: 2,
        driverFullName: 'Lewis Hamilton',
        driverFirstName: 'Lewis',
        driverLastName: 'Hamilton',
        driverCode: 'HAM',
        constructorName: 'Mercedes',
        driverProfileImageUrl: 'hamilton.jpg',
        driverCountryCode: 'GB',
        driverNumber: 44,
      },
    ],
  };

  const mockYears = [2024, 2023, 2022, 2021, 2020];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default fetch mock for driver standings
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/standings/')) {
        return createMockResponse(mockDriverStandings);
      }
      return createMockResponse({ error: 'Not found' }, false);
    });

    // Default apiFetch mock for years
    mockApiFetch.mockImplementation(async (path: string) => {
      if (path.includes('/races/years')) {
        return mockYears;
      }
      throw new Error('Not found');
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with default state', async () => {
    const { result } = renderHook(() => useDriverComparison(), { wrapper });

    // Initially loading
    expect(result.current.loading).toBe(true);

    // Wait for initialization
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 5000 });

    // Check initial state
    expect(result.current.allDrivers).toEqual(expect.any(Array));
    expect(result.current.driver1).toBeNull();
    expect(result.current.driver2).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should load drivers list', async () => {
    const { result } = renderHook(() => useDriverComparison(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.allDrivers.length).toBeGreaterThan(0);
    expect(result.current.allDrivers[0]).toHaveProperty('full_name');
  });

  it('should handle API errors gracefully', async () => {
    mockFetch.mockImplementation(() => createMockResponse({ error: 'Server error' }, false));

    const { result } = renderHook(() => useDriverComparison(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should handle error gracefully
    expect(result.current.error).toBeTruthy();
  });

  it('should expose all expected functions', async () => {
    const { result } = renderHook(() => useDriverComparison(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Check functions exist
    expect(typeof result.current.handleSelectDriver).toBe('function');
    expect(typeof result.current.selectDriver).toBe('function');
    expect(typeof result.current.selectDriverForYears).toBe('function');
    expect(typeof result.current.toggleMetric).toBe('function');
    expect(typeof result.current.clearSelection).toBe('function');
  });

  it('should return all expected state properties', async () => {
    const { result } = renderHook(() => useDriverComparison(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Check all properties exist
    expect(result.current).toHaveProperty('allDrivers');
    expect(result.current).toHaveProperty('driver1');
    expect(result.current).toHaveProperty('driver2');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('years');
    expect(result.current).toHaveProperty('selection1');
    expect(result.current).toHaveProperty('selection2');
    expect(result.current).toHaveProperty('stats1');
    expect(result.current).toHaveProperty('stats2');
    expect(result.current).toHaveProperty('enabledMetrics');
    expect(result.current).toHaveProperty('score');
  });

  it('should initialize with empty driver selections', async () => {
    const { result } = renderHook(() => useDriverComparison(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.driver1).toBeNull();
    expect(result.current.driver2).toBeNull();
    expect(result.current.selection1).toBeNull();
    expect(result.current.selection2).toBeNull();
  });

  it('should load years array', async () => {
    const { result } = renderHook(() => useDriverComparison(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.years).toEqual(expect.any(Array));
    expect(result.current.years.length).toBeGreaterThan(0);
  });

  it('should handle years API failure with fallback', async () => {
    mockApiFetch.mockRejectedValue(new Error('Years API failed'));

    const { result } = renderHook(() => useDriverComparison(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should have fallback years
    expect(result.current.years).toEqual(expect.any(Array));
    expect(result.current.years.length).toBe(15); // Fallback generates 15 years
  });

  it('should initialize enabledMetrics with defaults', async () => {
    const { result } = renderHook(() => useDriverComparison(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.enabledMetrics).toBeTruthy();
    expect(typeof result.current.enabledMetrics).toBe('object');
  });

  it('should not throw on mount', () => {
    expect(() => {
      renderHook(() => useDriverComparison(), { wrapper });
    }).not.toThrow();
  });
});
