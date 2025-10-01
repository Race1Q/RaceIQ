import React from 'react';
import { describe, it, vi, expect, beforeEach, afterEach } from 'vitest';
import type { Mock } from 'vitest';
import '@testing-library/jest-dom';
import { renderHook, waitFor, act } from '@testing-library/react';

import { ChakraProvider } from '@chakra-ui/react';
import { useUserProfile } from './useUserProfile';
import { useAuth0 } from '@auth0/auth0-react';
import { useProfileUpdate } from '../context/ProfileUpdateContext';

// Mock buildApiUrl
vi.mock('../lib/api', () => ({
  buildApiUrl: vi.fn((path: string) => `/mock-api${path}`),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock Auth0
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: vi.fn(),
}));

// Mock ProfileUpdateContext
vi.mock('../context/ProfileUpdateContext', () => ({
  useProfileUpdate: vi.fn(),
}));

// Chakra wrapper
function wrapper({ children }: { children: React.ReactNode }) {
  return <ChakraProvider>{children}</ChakraProvider>;
}

describe('useUserProfile', () => {
  const mockUseAuth0 = vi.mocked(useAuth0);
  const mockUseProfileUpdate = vi.mocked(useProfileUpdate);
  const mockGetAccessTokenSilently = vi.fn();

  const mockUser = {
    sub: 'auth0|123456789',
    email: 'test@example.com',
    name: 'Test User',
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

  const mockProfileDataNoFavorites = {
    id: 1,
    auth0_sub: 'auth0|123456789',
    username: 'testuser',
    email: 'test@example.com',
    favorite_constructor_id: null,
    favorite_driver_id: null,
    role: 'user',
    created_at: '2024-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default Auth0 mock
    mockUseAuth0.mockReturnValue({
      user: mockUser,
      getAccessTokenSilently: mockGetAccessTokenSilently,
      isLoading: false,
    });

    // Default ProfileUpdateContext mock
    mockUseProfileUpdate.mockReturnValue({
      refreshTrigger: 0,
      triggerRefresh: vi.fn(),
    });

    // Default fetch mock
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/users/profile')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockProfileData,
        });
      }
      if (url.includes('/api/drivers/2')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockDriverData,
        });
      }
      if (url.includes('/api/constructors/1')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockConstructorData,
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });
    });

    // Default Auth0 token mock
    mockGetAccessTokenSilently.mockResolvedValue('mock-access-token');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should load user profile successfully', async () => {
    const { result } = renderHook(() => useUserProfile(), { wrapper });

    expect(result.current.loading).toBe(true);
    expect(result.current.profile).toBeNull();
    expect(result.current.favoriteDriver).toBeNull();
    expect(result.current.favoriteConstructor).toBeNull();
    expect(result.current.error).toBeNull();

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.profile).toEqual(mockProfileData);
    expect(result.current.favoriteDriver).toEqual(mockDriverData);
    expect(result.current.favoriteConstructor).toEqual(mockConstructorData);
    expect(result.current.error).toBeNull();
    expect(result.current.refetch).toBeInstanceOf(Function);
  });

  it('should handle user profile without favorites', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/users/profile')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockProfileDataNoFavorites,
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });
    });

    const { result } = renderHook(() => useUserProfile(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.profile).toEqual(mockProfileDataNoFavorites);
    expect(result.current.favoriteDriver).toBeNull();
    expect(result.current.favoriteConstructor).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should handle Auth0 loading state', () => {
    mockUseAuth0.mockReturnValue({
      user: null,
      getAccessTokenSilently: mockGetAccessTokenSilently,
      isLoading: true,
    });

    const { result } = renderHook(() => useUserProfile(), { wrapper });

    expect(result.current.loading).toBe(false);
    expect(result.current.profile).toBeNull();
    expect(result.current.favoriteDriver).toBeNull();
    expect(result.current.favoriteConstructor).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should handle missing user', () => {
    mockUseAuth0.mockReturnValue({
      user: null,
      getAccessTokenSilently: mockGetAccessTokenSilently,
      isLoading: false,
    });

    const { result } = renderHook(() => useUserProfile(), { wrapper });

    expect(result.current.loading).toBe(false);
    expect(result.current.profile).toBeNull();
    expect(result.current.favoriteDriver).toBeNull();
    expect(result.current.favoriteConstructor).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should handle missing user sub', () => {
    mockUseAuth0.mockReturnValue({
      user: { ...mockUser, sub: undefined },
      getAccessTokenSilently: mockGetAccessTokenSilently,
      isLoading: false,
    });

    const { result } = renderHook(() => useUserProfile(), { wrapper });

    expect(result.current.loading).toBe(false);
    expect(result.current.profile).toBeNull();
    expect(result.current.favoriteDriver).toBeNull();
    expect(result.current.favoriteConstructor).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should handle profile API failure', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/users/profile')) {
        return Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });
    });

    const { result } = renderHook(() => useUserProfile(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.profile).toBeNull();
    expect(result.current.favoriteDriver).toBeNull();
    expect(result.current.favoriteConstructor).toBeNull();
    expect(result.current.error).toBe('API Error: 500 Internal Server Error');
  });

  it('should handle favorite driver fetch failure gracefully', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/users/profile')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockProfileData,
        });
      }
      if (url.includes('/api/drivers/2')) {
        return Promise.resolve({
          ok: false,
          status: 404,
          statusText: 'Not Found',
        });
      }
      if (url.includes('/api/constructors/1')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockConstructorData,
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });
    });

    const { result } = renderHook(() => useUserProfile(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.profile).toEqual(mockProfileData);
    expect(result.current.favoriteDriver).toBeNull();
    expect(result.current.favoriteConstructor).toEqual(mockConstructorData);
    expect(result.current.error).toBeNull();
  });

  it('should handle favorite constructor fetch failure gracefully', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/users/profile')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockProfileData,
        });
      }
      if (url.includes('/api/drivers/2')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockDriverData,
        });
      }
      if (url.includes('/api/constructors/1')) {
        return Promise.resolve({
          ok: false,
          status: 404,
          statusText: 'Not Found',
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });
    });

    const { result } = renderHook(() => useUserProfile(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.profile).toEqual(mockProfileData);
    expect(result.current.favoriteDriver).toEqual(mockDriverData);
    expect(result.current.favoriteConstructor).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should handle network errors', async () => {
    const networkError = new Error('Network error');
    mockFetch.mockRejectedValue(networkError);

    const { result } = renderHook(() => useUserProfile(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.profile).toBeNull();
    expect(result.current.favoriteDriver).toBeNull();
    expect(result.current.favoriteConstructor).toBeNull();
    expect(result.current.error).toBe('Network error');
  });

  it('should handle non-Error exceptions', async () => {
    mockFetch.mockRejectedValue('String error');

    const { result } = renderHook(() => useUserProfile(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.profile).toBeNull();
    expect(result.current.favoriteDriver).toBeNull();
    expect(result.current.favoriteConstructor).toBeNull();
    expect(result.current.error).toBe('Failed to load user profile');
  });

  it('should handle Auth0 token errors', async () => {
    const tokenError = new Error('Token error');
    mockGetAccessTokenSilently.mockRejectedValue(tokenError);

    const { result } = renderHook(() => useUserProfile(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.profile).toBeNull();
    expect(result.current.favoriteDriver).toBeNull();
    expect(result.current.favoriteConstructor).toBeNull();
    expect(result.current.error).toBe('Token error');
  });

  it('should refetch profile data correctly', async () => {
    const { result } = renderHook(() => useUserProfile(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.profile).toEqual(mockProfileData);

    // Trigger refetch
    await result.current.refetch();

    expect(result.current.profile).toEqual(mockProfileData);
    expect(result.current.favoriteDriver).toEqual(mockDriverData);
    expect(result.current.favoriteConstructor).toEqual(mockConstructorData);
  });

  it('should handle refetch when user is not authenticated', async () => {
    mockUseAuth0.mockReturnValue({
      user: null,
      getAccessTokenSilently: mockGetAccessTokenSilently,
      isLoading: false,
    });

    const { result } = renderHook(() => useUserProfile(), { wrapper });

    // Should not throw when refetching without user
    await expect(result.current.refetch()).resolves.toBeUndefined();
  });

  it('should handle refetch with favorite driver error', async () => {
    const { result } = renderHook(() => useUserProfile(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Mock driver fetch to fail on refetch
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/users/profile')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockProfileData,
        });
      }
      if (url.includes('/api/drivers/2')) {
        return Promise.resolve({
          ok: false,
          status: 404,
          statusText: 'Not Found',
        });
      }
      if (url.includes('/api/constructors/1')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockConstructorData,
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });
    });

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.profile).toEqual(mockProfileData);
    expect(result.current.favoriteDriver).toBeNull();
    expect(result.current.favoriteConstructor).toEqual(mockConstructorData);
  });

  it('should handle refetch with favorite constructor error', async () => {
    const { result } = renderHook(() => useUserProfile(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Mock constructor fetch to fail on refetch
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/users/profile')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockProfileData,
        });
      }
      if (url.includes('/api/drivers/2')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockDriverData,
        });
      }
      if (url.includes('/api/constructors/1')) {
        return Promise.resolve({
          ok: false,
          status: 404,
          statusText: 'Not Found',
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });
    });

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.profile).toEqual(mockProfileData);
    expect(result.current.favoriteDriver).toEqual(mockDriverData);
    expect(result.current.favoriteConstructor).toBeNull();
  });

  it('should respond to refresh trigger changes', async () => {
    const { result, rerender } = renderHook(() => useUserProfile(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.profile).toEqual(mockProfileData);

    // Update refresh trigger
    mockUseProfileUpdate.mockReturnValue({
      refreshTrigger: 1,
      triggerRefresh: vi.fn(),
    });

    rerender();

    // Should refetch data due to refresh trigger change
    await waitFor(() => expect(result.current.profile).toEqual(mockProfileData));
  });

  it('should handle Auth0 audience and scope configuration', async () => {
    const { result } = renderHook(() => useUserProfile(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockGetAccessTokenSilently).toHaveBeenCalledWith({
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        scope: "read:drivers read:constructors read:users",
      },
    });
  });

  it('should set proper authorization headers', async () => {
    const { result } = renderHook(() => useUserProfile(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Check that fetch was called with authorization headers
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/mock-api/api/users/profile'),
      expect.objectContaining({
        headers: expect.any(Headers),
      })
    );
    
    // Check that getAccessTokenSilently was called with correct parameters
    expect(mockGetAccessTokenSilently).toHaveBeenCalledWith({
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        scope: "read:drivers read:constructors read:users",
      },
    });
  });

  it('should handle console warnings for favorite data fetch failures', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/users/profile')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockProfileData,
        });
      }
      if (url.includes('/api/drivers/2')) {
        return Promise.resolve({
          ok: false,
          status: 404,
          statusText: 'Not Found',
        });
      }
      if (url.includes('/api/constructors/1')) {
        return Promise.resolve({
          ok: false,
          status: 404,
          statusText: 'Not Found',
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });
    });

    const { result } = renderHook(() => useUserProfile(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(consoleSpy).toHaveBeenCalledWith('Could not fetch favorite driver:', expect.any(Error));
    expect(consoleSpy).toHaveBeenCalledWith('Could not fetch favorite constructor:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('should handle profile with only favorite driver', async () => {
    const profileWithOnlyDriver = {
      ...mockProfileDataNoFavorites,
      favorite_driver_id: 2,
    };

    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/users/profile')) {
        return Promise.resolve({
          ok: true,
          json: async () => profileWithOnlyDriver,
        });
      }
      if (url.includes('/api/drivers/2')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockDriverData,
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });
    });

    const { result } = renderHook(() => useUserProfile(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.profile).toEqual(profileWithOnlyDriver);
    expect(result.current.favoriteDriver).toEqual(mockDriverData);
    expect(result.current.favoriteConstructor).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should handle profile with only favorite constructor', async () => {
    const profileWithOnlyConstructor = {
      ...mockProfileDataNoFavorites,
      favorite_constructor_id: 1,
    };

    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/users/profile')) {
        return Promise.resolve({
          ok: true,
          json: async () => profileWithOnlyConstructor,
        });
      }
      if (url.includes('/api/constructors/1')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockConstructorData,
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });
    });

    const { result } = renderHook(() => useUserProfile(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.profile).toEqual(profileWithOnlyConstructor);
    expect(result.current.favoriteDriver).toBeNull();
    expect(result.current.favoriteConstructor).toEqual(mockConstructorData);
    expect(result.current.error).toBeNull();
  });

  it('should maintain loading state during fetch', async () => {
    let resolvePromise: (value: any) => void;
    const fetchPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockFetch.mockReturnValueOnce(fetchPromise);

    const { result } = renderHook(() => useUserProfile(), { wrapper });

    expect(result.current.loading).toBe(true);

    // Resolve the promise after a delay
    setTimeout(() => {
      resolvePromise!({
        ok: true,
        json: async () => mockProfileData,
      });
    }, 100);

    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it('should handle buildApiUrl integration correctly', async () => {
    const { result } = renderHook(() => useUserProfile(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockFetch).toHaveBeenCalledWith('/mock-api/api/users/profile', expect.any(Object));
    expect(mockFetch).toHaveBeenCalledWith('/mock-api/api/drivers/2', expect.any(Object));
    expect(mockFetch).toHaveBeenCalledWith('/mock-api/api/constructors/1', expect.any(Object));
  });
});
