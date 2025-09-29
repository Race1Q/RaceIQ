// frontend/src/hooks/useDriversData.test.tsx

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import { renderHook, waitFor } from '@testing-library/react';

import { ChakraProvider } from '@chakra-ui/react';
import { useDriversData } from './useDriversData';
import { fallbackDriverStandings } from '../lib/fallbackData/driverStandings';

// Mock buildApiUrl
vi.mock('../lib/api', () => ({
  buildApiUrl: (path: string) => path,
}));

// Mock team colors
vi.mock('../lib/teamColors', () => ({
  teamColors: {
    'Red Bull Racing': '1E41FF',
    'Mercedes': '00D2BE',
    'Unknown Team': 'AAAAAA',
    Default: 'CCCCCC',
  },
}));

// Mock driver headshots
vi.mock('../lib/driverHeadshots', () => ({
  driverHeadshots: {
    'Max Verstappen': 'verstappen.png',
    default: 'default.png',
  },
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

describe('useDriversData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches and hydrates drivers successfully', async () => {
    const fakeDrivers = [
      {
        driverId: 1,
        driverFullName: 'Max Verstappen',
        driverNumber: 33,
        driverCountryCode: 'NL',
        constructorName: 'Red Bull Racing',
      },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ driverStandings: fakeDrivers }),
    }) as any;

    const { result } = renderHook(() => useDriversData(2024), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.drivers).toHaveLength(1);
    expect(result.current.drivers[0].fullName).toBe('Max Verstappen');
    expect(result.current.drivers[0].teamColor).toBe('#1E41FF');
    expect(result.current.isFallback).toBe(false);
  });

  it('falls back to cached drivers when fetch fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    }) as any;

    const { result } = renderHook(() => useDriversData(2024), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.drivers).toEqual(fallbackDriverStandings);
    expect(result.current.isFallback).toBe(true);
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Could not fetch live data',
        status: 'warning',
      })
    );
  });

  it('handles empty driverStandings response gracefully', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ driverStandings: [] }),
    }) as any;

    const { result } = renderHook(() => useDriversData(2024), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.drivers).toHaveLength(0);
    expect(result.current.isFallback).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('filters out invalid driver entries (missing driverId)', async () => {
    const fakeDrivers = [
      {
        driverFullName: 'Ghost Driver',
        constructorName: 'Unknown Team',
      },
      {
        driverId: 2,
        driverFullName: 'Valid Driver',
        constructorName: 'Mercedes',
      },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ driverStandings: fakeDrivers }),
    }) as any;

    const { result } = renderHook(() => useDriversData(2024), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.drivers).toHaveLength(1);
    expect(result.current.drivers[0].fullName).toBe('Valid Driver');
  });

  it('applies fallback team name when constructorName is missing', async () => {
    const fakeDrivers = [
      {
        driverId: 10,
        driverFullName: 'Anonymous Racer',
      },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ driverStandings: fakeDrivers }),
    }) as any;

    const { result } = renderHook(() => useDriversData(2024), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.drivers[0].teamName).toBe('Unknown Team');
    expect(result.current.drivers[0].teamColor).toBe('#AAAAAA');
  });

  it('uses default headshot if not found in mapping or API', async () => {
    const fakeDrivers = [
      {
        driverId: 20,
        driverFullName: 'New Driver',
        constructorName: 'Mercedes',
      },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ driverStandings: fakeDrivers }),
    }) as any;

    const { result } = renderHook(() => useDriversData(2024), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.drivers[0].headshotUrl).toBe('default.png');
  });

  it('groups drivers by team correctly', async () => {
    const fakeDrivers = [
      { driverId: 1, driverFullName: 'Max Verstappen', constructorName: 'Red Bull Racing' },
      { driverId: 2, driverFullName: 'Sergio Perez', constructorName: 'Red Bull Racing' },
      { driverId: 3, driverFullName: 'Lewis Hamilton', constructorName: 'Mercedes' },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ driverStandings: fakeDrivers }),
    }) as any;

    const { result } = renderHook(() => useDriversData(2024), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.orderedTeamNames).toEqual(['Red Bull Racing', 'Mercedes']);
    expect(result.current.groupedDrivers['Red Bull Racing']).toHaveLength(2);
    expect(result.current.groupedDrivers['Mercedes']).toHaveLength(1);
  });
});

