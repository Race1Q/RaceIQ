import React from 'react';
import { describe, it, vi, expect, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import { renderHook, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { useUserProfile } from './useUserProfile';

// Mock buildApiUrl
vi.mock('../lib/api', () => ({
  buildApiUrl: vi.fn((path: string) => path),
}));

// Mock Auth0
const mockGetAccessTokenSilently = vi.fn();
const mockLoginWithRedirect = vi.fn();
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: vi.fn(),
}));

// Mock ProfileUpdateContext
const mockTriggerRefresh = vi.fn();
vi.mock('../context/ProfileUpdateContext', () => ({
  useProfileUpdate: vi.fn(),
}));

// Import mocked modules
import { useAuth0 } from '@auth0/auth0-react';
import { useProfileUpdate } from '../context/ProfileUpdateContext';

const mockUseAuth0 = vi.mocked(useAuth0);
const mockUseProfileUpdate = vi.mocked(useProfileUpdate);

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Chakra wrapper
function wrapper({ children }: { children: React.ReactNode }) {
  return <ChakraProvider>{children}</ChakraProvider>;
}

// Helper to create mock responses with proper Headers
function createMockResponse(data: any, ok: boolean = true, status: number = 200, statusText: string = 'OK') {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  
  return Promise.resolve({
    ok,
    status,
    statusText,
    headers,
    json: async () => data,
    text: async () => (typeof data === 'string' ? data : JSON.stringify(data)),
  });
}

describe('useUserProfile', () => {
  const mockUser = {
    sub: 'auth0|123456789',
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockDriverData = {
    id: 2,
    full_name: 'Max Verstappen',
    driver_number: 1,
    country_code: 'NED',
    team_name: 'Red Bull Racing',
  };

  const mockConstructorData = {
    id: 1,
    name: 'Red Bull Racing',
  };

  const mockProfileData = {
    id: 1,
    auth0_sub: 'auth0|123456789',
    username: 'testuser',
    email: 'test@example.com',
    favorite_constructor_id: 1,
    favorite_driver_id: 2,
    role: 'user',
    created_at: '2024-01-01T00:00:00.000Z',
    favoriteDriver: mockDriverData,
    favoriteConstructor: mockConstructorData,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default Auth0 mock - authenticated user
    mockUseAuth0.mockReturnValue({
      user: mockUser,
      getAccessTokenSilently: mockGetAccessTokenSilently,
      loginWithRedirect: mockLoginWithRedirect,
      isLoading: false,
      isAuthenticated: true,
    } as any);

    // Default ProfileUpdateContext mock
    mockUseProfileUpdate.mockReturnValue({
      refreshTrigger: 0,
      triggerRefresh: mockTriggerRefresh,
    } as any);

    // Default fetch mock - successful responses (profile includes relations)
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/profile')) {
        return createMockResponse(mockProfileData);
      }
      return createMockResponse({ error: 'Not found' }, false, 404, 'Not Found');
    });

    // Default token mock
    mockGetAccessTokenSilently.mockResolvedValue('mock-access-token');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should load user profile successfully with favorites', async () => {
    const { result } = renderHook(() => useUserProfile(), { wrapper });

    // Initially loading
    expect(result.current.loading).toBe(true);

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 5000 });

    // Check profile loaded
    expect(result.current.profile).toEqual(mockProfileData);
    expect(result.current.favoriteDriver).toEqual(mockDriverData);
    expect(result.current.favoriteConstructor).toEqual(mockConstructorData);
    expect(result.current.error).toBeNull();
  });

  it('should handle unauthenticated user', async () => {
    mockUseAuth0.mockReturnValue({
      user: null,
      getAccessTokenSilently: mockGetAccessTokenSilently,
      loginWithRedirect: mockLoginWithRedirect,
      isLoading: false,
      isAuthenticated: false,
    } as any);

    const { result } = renderHook(() => useUserProfile(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.profile).toBeNull();
    expect(result.current.favoriteDriver).toBeNull();
    expect(result.current.favoriteConstructor).toBeNull();
  });

  it('should handle profile without favorites', async () => {
    const profileNoFavorites = {
      ...mockProfileData,
      favorite_constructor_id: null,
      favorite_driver_id: null,
      favoriteDriver: null,
      favoriteConstructor: null,
    };

    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/profile')) {
        return createMockResponse(profileNoFavorites);
      }
      return createMockResponse({ error: 'Not found' }, false, 404, 'Not Found');
    });

    const { result } = renderHook(() => useUserProfile(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.profile).toEqual(profileNoFavorites);
    expect(result.current.favoriteDriver).toBeNull();
    expect(result.current.favoriteConstructor).toBeNull();
  });

  it('should handle API errors gracefully', async () => {
    mockFetch.mockImplementation(() => 
      createMockResponse({ error: 'Server error' }, false, 500, 'Internal Server Error')
    );

    const { result } = renderHook(() => useUserProfile(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.profile).toBeNull();
  });

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useUserProfile(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
  });

  it('should handle token fetch errors', async () => {
    mockGetAccessTokenSilently.mockRejectedValue(new Error('Token error'));

    const { result } = renderHook(() => useUserProfile(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
  });

  it('should refetch when refreshTrigger changes', async () => {
    const { result, rerender } = renderHook(() => useUserProfile(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Initial fetch - only 1 call since relations are included in profile response
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Change refresh trigger
    mockUseProfileUpdate.mockReturnValue({
      refreshTrigger: 1,
      triggerRefresh: mockTriggerRefresh,
    } as any);

    rerender();

    // Should trigger refetch
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2); // 1 more call
    });
  });

  it('should handle Auth0 loading state', async () => {
    mockUseAuth0.mockReturnValue({
      user: mockUser,
      getAccessTokenSilently: mockGetAccessTokenSilently,
      loginWithRedirect: mockLoginWithRedirect,
      isLoading: true,
      isAuthenticated: false,
    } as any);

    const { result } = renderHook(() => useUserProfile(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should not fetch while Auth0 is loading
    expect(result.current.profile).toBeNull();
  });

  it('should handle missing user sub', async () => {
    mockUseAuth0.mockReturnValue({
      user: { email: 'test@example.com' }, // No 'sub'
      getAccessTokenSilently: mockGetAccessTokenSilently,
      loginWithRedirect: mockLoginWithRedirect,
      isLoading: false,
      isAuthenticated: true,
    } as any);

    const { result } = renderHook(() => useUserProfile(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.profile).toBeNull();
  });

  it('should expose refetch function', async () => {
    const { result } = renderHook(() => useUserProfile(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.refetch).toBeDefined();
    expect(typeof result.current.refetch).toBe('function');
  });

  it('should handle profile with null favorite driver', async () => {
    const profileWithNullDriver = {
      ...mockProfileData,
      favorite_driver_id: 2,
      favoriteDriver: null, // Driver relation is null
    };

    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/profile')) {
        return createMockResponse(profileWithNullDriver);
      }
      return createMockResponse({ error: 'Not found' }, false, 404, 'Not Found');
    });

    const { result } = renderHook(() => useUserProfile(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Profile should load
    expect(result.current.profile).toEqual(profileWithNullDriver);
    // Favorite driver should be null
    expect(result.current.favoriteDriver).toBeNull();
    // Constructor should still be present
    expect(result.current.favoriteConstructor).toEqual(mockConstructorData);
  });

  it('should handle profile with null favorite constructor', async () => {
    const profileWithNullConstructor = {
      ...mockProfileData,
      favorite_constructor_id: 1,
      favoriteConstructor: null, // Constructor relation is null
    };

    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/profile')) {
        return createMockResponse(profileWithNullConstructor);
      }
      return createMockResponse({ error: 'Not found' }, false, 404, 'Not Found');
    });

    const { result } = renderHook(() => useUserProfile(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Profile should load
    expect(result.current.profile).toEqual(profileWithNullConstructor);
    // Driver should still be present
    expect(result.current.favoriteDriver).toEqual(mockDriverData);
    // Favorite constructor should be null
    expect(result.current.favoriteConstructor).toBeNull();
  });

  it('should return all expected properties', async () => {
    const { result } = renderHook(() => useUserProfile(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Check all return properties exist
    expect(result.current).toHaveProperty('profile');
    expect(result.current).toHaveProperty('favoriteDriver');
    expect(result.current).toHaveProperty('favoriteConstructor');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('refetch');
  });

  it('should not throw on mount', () => {
    expect(() => {
      renderHook(() => useUserProfile(), { wrapper });
    }).not.toThrow();
  });
});
