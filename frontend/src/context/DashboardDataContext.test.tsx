import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { DashboardSharedDataProvider, useDashboardSharedData } from './DashboardDataContext';

// Mock hooks
vi.mock('../hooks/useDashboardData', () => ({
  useDashboardData: vi.fn(() => ({
    data: null,
    loading: false,
    error: null,
  })),
}));

vi.mock('../hooks/useSeasons', () => ({
  useSeasons: vi.fn(() => ({
    seasons: [{ id: 1, year: 2025 }],
    loading: false,
    error: null,
  })),
}));

const mockDriverStandings = [
  {
    id: 1,
    fullName: 'Max Verstappen',
    teamName: 'Red Bull',
    headshotUrl: 'max.jpg',
  },
  {
    id: 2,
    fullName: 'Charles Leclerc',
    teamName: 'Ferrari',
    headshotUrl: 'charles.jpg',
  },
];

describe('DashboardDataContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides default context values', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DashboardSharedDataProvider>{children}</DashboardSharedDataProvider>
    );

    const { result } = renderHook(() => useDashboardSharedData(), { wrapper });
    
    expect(result.current).toBeDefined();
    expect(result.current.driverStandings).toBeDefined();
    expect(result.current.seasons).toBeDefined();
  });

  it('provides driver standings', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DashboardSharedDataProvider>{children}</DashboardSharedDataProvider>
    );

    const { result } = renderHook(() => useDashboardSharedData(), { wrapper });
    
    expect(Array.isArray(result.current.driverStandings)).toBe(true);
  });

  it('provides seasons data', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DashboardSharedDataProvider>{children}</DashboardSharedDataProvider>
    );

    const { result } = renderHook(() => useDashboardSharedData(), { wrapper });
    
    expect(Array.isArray(result.current.seasons)).toBe(true);
  });

  it('throws error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      renderHook(() => useDashboardSharedData());
    }).toThrow();
    
    consoleErrorSpy.mockRestore();
  });
});

