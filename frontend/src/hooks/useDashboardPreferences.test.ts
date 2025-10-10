// frontend/src/hooks/useDashboardPreferences.test.ts

import { renderHook, act, waitFor } from '@testing-library/react';
import { useDashboardPreferences } from './useDashboardPreferences';

// Mock the API functions
jest.mock('../lib/api', () => ({
  buildApiUrl: jest.fn((path: string) => `http://localhost:3000${path}`),
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(() => 'mock-token'),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock fetch
global.fetch = jest.fn();

describe('useDashboardPreferences', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should load default preferences when profile fetch fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useDashboardPreferences());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.hasLoadedFromServer).toBe(false);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.widgetVisibility).toEqual({
      nextRace: true,
      standings: true,
      constructorStandings: true,
      lastPodium: true,
      fastestLap: true,
      favoriteDriver: true,
      favoriteTeam: true,
      headToHead: true,
      f1News: true,
    });
  });

  it('should load saved preferences from profile', async () => {
    const mockProfile = {
      dashboard_visibility: {
        nextRace: true,
        standings: false,
        constructorStandings: true,
        lastPodium: false,
        fastestLap: true,
        favoriteDriver: false,
        favoriteTeam: true,
        headToHead: false,
        f1News: true,
      },
      dashboard_layouts: {
        lg: [
          { i: 'nextRace', x: 0, y: 0, w: 2, h: 2, isResizable: false },
          { i: 'constructorStandings', x: 2, y: 0, w: 1, h: 2, isResizable: false },
        ]
      }
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProfile,
    });

    const { result } = renderHook(() => useDashboardPreferences());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.hasLoadedFromServer).toBe(true);
    });

    expect(result.current.widgetVisibility).toEqual(mockProfile.dashboard_visibility);
    expect(result.current.layouts).toEqual(mockProfile.dashboard_layouts);
  });

  it('should save preferences with debouncing', async () => {
    const { result } = renderHook(() => useDashboardPreferences());

    // Mock successful profile fetch
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Change visibility
    act(() => {
      result.current.setWidgetVisibility({
        ...result.current.widgetVisibility,
        nextRace: false,
      });
    });

    // Should not save immediately
    expect(global.fetch).toHaveBeenCalledTimes(1); // Only the initial load

    // Fast-forward time by 2 seconds
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Should now save
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    const saveCall = (global.fetch as jest.Mock).mock.calls[1];
    expect(saveCall[0]).toBe('http://localhost:3000/api/profile');
    expect(saveCall[1].method).toBe('PATCH');
  });
});
