import { describe, it, vi, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useDashboardPreferences } from './useDashboardPreferences';

// Mock useToast
const mockToast = vi.fn();
vi.mock('@chakra-ui/react', () => ({
  useToast: () => mockToast,
}));

// Mock Auth0
const mockGetAccessTokenSilently = vi.fn();
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    getAccessTokenSilently: mockGetAccessTokenSilently,
  }),
}));

// Mock buildApiUrl
vi.mock('../lib/api', () => ({
  buildApiUrl: vi.fn((path: string) => path),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Helper to create mock response
function createMockResponse(data: any, ok: boolean = true) {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  
  return Promise.resolve({
    ok,
    status: ok ? 200 : 500,
    statusText: ok ? 'OK' : 'Error',
    headers,
    json: async () => data,
    text: async () => JSON.stringify(data),
  });
}

describe('useDashboardPreferences', () => {
  const mockProfile = {
    id: 1,
    dashboard_visibility: {
      nextRace: true,
      standings: true,
      constructorStandings: false,
      lastPodium: true,
      fastestLap: false,
      favoriteDriver: true,
      favoriteTeam: true,
      headToHead: true,
      f1News: true,
    },
    dashboard_layouts: {
      lg: [
        { i: 'nextRace', x: 0, y: 0, w: 2, h: 2, isResizable: false },
      ],
    },
    widget_settings: {
      headToHead: {
        driver1Id: 1,
        driver2Id: 2,
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAccessTokenSilently.mockResolvedValue('mock-token');
    mockFetch.mockImplementation(() => createMockResponse(mockProfile));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should load dashboard preferences successfully', async () => {
    const { result } = renderHook(() => useDashboardPreferences());

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    }, { timeout: 5000 });

    // Check loaded preferences
    expect(result.current.widgetVisibility).toEqual(mockProfile.dashboard_visibility);
    expect(result.current.layouts).toEqual(mockProfile.dashboard_layouts);
    expect(result.current.widgetSettings).toEqual(mockProfile.widget_settings);
    expect(result.current.hasLoadedFromServer).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should use default preferences when profile fetch fails', async () => {
    mockFetch.mockImplementation(() => createMockResponse({ error: 'Not found' }, false));

    const { result } = renderHook(() => useDashboardPreferences());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should have default preferences
    expect(result.current.widgetVisibility).toBeTruthy();
    expect(result.current.layouts).toBeTruthy();
    expect(result.current.error).toBeTruthy();
    
    // Should show toast warning
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'warning',
      })
    );
  });

  it('should save preferences successfully', async () => {
    const { result } = renderHook(() => useDashboardPreferences());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Mock successful PATCH request
    mockFetch.mockImplementation((url: string, options: any) => {
      if (options?.method === 'PATCH') {
        return createMockResponse({ success: true });
      }
      return createMockResponse(mockProfile);
    });

    // Call save
    await act(async () => {
      await result.current.savePreferences();
    });

    // Check save status
    expect(result.current.saveStatus).toBe('saved');
    expect(result.current.isSaving).toBe(false);
  });

  it('should handle save errors gracefully', async () => {
    const { result } = renderHook(() => useDashboardPreferences());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Mock failed PATCH request
    mockFetch.mockImplementation((url: string, options: any) => {
      if (options?.method === 'PATCH') {
        return createMockResponse({ error: 'Server error' }, false);
      }
      return createMockResponse(mockProfile);
    });

    // Call save
    await act(async () => {
      await result.current.savePreferences();
    });

    // Check error status
    expect(result.current.saveStatus).toBe('error');
    expect(result.current.error).toBeTruthy();
    
    // Should show error toast
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
      })
    );
  });

  it('should allow updating widget visibility', async () => {
    const { result } = renderHook(() => useDashboardPreferences());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const newVisibility = {
      ...result.current.widgetVisibility,
      nextRace: false,
    };

    act(() => {
      result.current.setWidgetVisibility(newVisibility);
    });

    expect(result.current.widgetVisibility.nextRace).toBe(false);
  });

  it('should allow updating layouts', async () => {
    const { result } = renderHook(() => useDashboardPreferences());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const newLayouts = {
      lg: [
        { i: 'nextRace', x: 1, y: 1, w: 2, h: 2, isResizable: false },
      ],
    };

    act(() => {
      result.current.setLayouts(newLayouts);
    });

    expect(result.current.layouts).toEqual(newLayouts);
  });

  it('should allow updating widget settings', async () => {
    const { result } = renderHook(() => useDashboardPreferences());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const newSettings = {
      headToHead: {
        driver1Id: 3,
        driver2Id: 4,
      },
    };

    act(() => {
      result.current.setWidgetSettings(newSettings);
    });

    expect(result.current.widgetSettings).toEqual(newSettings);
  });

  it('should return all expected properties', async () => {
    const { result } = renderHook(() => useDashboardPreferences());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Check all properties exist
    expect(result.current).toHaveProperty('widgetVisibility');
    expect(result.current).toHaveProperty('setWidgetVisibility');
    expect(result.current).toHaveProperty('layouts');
    expect(result.current).toHaveProperty('setLayouts');
    expect(result.current).toHaveProperty('widgetSettings');
    expect(result.current).toHaveProperty('setWidgetSettings');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('isSaving');
    expect(result.current).toHaveProperty('saveStatus');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('hasLoadedFromServer');
    expect(result.current).toHaveProperty('savePreferences');
  });

  it('should handle network errors during load', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useDashboardPreferences());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
  });

  it('should not throw on mount', () => {
    expect(() => {
      renderHook(() => useDashboardPreferences());
    }).not.toThrow();
  });
});
