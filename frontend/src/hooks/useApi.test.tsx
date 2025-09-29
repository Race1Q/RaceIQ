import React from 'react';
import { describe, it, vi, expect, beforeEach, afterEach } from 'vitest';
import type { Mock } from 'vitest';
import '@testing-library/jest-dom';
import { renderHook } from '@testing-library/react';

import { ChakraProvider } from '@chakra-ui/react';
import { useApi } from './useApi';
import { useAuth0 } from '@auth0/auth0-react';

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

// Chakra wrapper
function wrapper({ children }: { children: React.ReactNode }) {
  return <ChakraProvider>{children}</ChakraProvider>;
}

describe('useApi', () => {
  const mockUseAuth0 = vi.mocked(useAuth0);
  const mockGetAccessTokenSilently = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default Auth0 mock
    mockUseAuth0.mockReturnValue({
      getAccessTokenSilently: mockGetAccessTokenSilently,
    });

    // Default fetch mock
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: 'test data' }),
      text: async () => '',
    });

    // Default Auth0 token mock
    mockGetAccessTokenSilently.mockResolvedValue('mock-access-token');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return authedFetch function', () => {
    const { result } = renderHook(() => useApi(), { wrapper });

    expect(result.current.authedFetch).toBeInstanceOf(Function);
  });

  it('should successfully make authenticated fetch request', async () => {
    const mockResponse = { success: true, data: 'test data' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
      text: async () => '',
    });

    const { result } = renderHook(() => useApi(), { wrapper });

    const response = await result.current.authedFetch('/test-endpoint');

    expect(response).toEqual(mockResponse);
    expect(mockGetAccessTokenSilently).toHaveBeenCalledWith({
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      },
    });
    expect(mockFetch).toHaveBeenCalledWith('/mock-api/test-endpoint', {
      headers: expect.any(Headers),
    });
  });

  it('should use buildApiUrl to construct the URL', async () => {
    const { result } = renderHook(() => useApi(), { wrapper });

    await result.current.authedFetch('/test-endpoint');

    const { buildApiUrl } = await import('../lib/api');
    expect(buildApiUrl).toHaveBeenCalledWith('/test-endpoint');
  });

  it('should set authorization header correctly', async () => {
    const { result } = renderHook(() => useApi(), { wrapper });

    await result.current.authedFetch('/test-endpoint');

    expect(mockFetch).toHaveBeenCalledWith(
      '/mock-api/test-endpoint',
      expect.objectContaining({
        headers: expect.any(Headers),
      })
    );
    
    // Verify that getAccessTokenSilently was called with correct parameters
    expect(mockGetAccessTokenSilently).toHaveBeenCalledWith({
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      },
    });
  });

  it('should handle custom headers', async () => {
    const customHeaders = {
      'Content-Type': 'application/json',
      'Custom-Header': 'custom-value',
    };

    const { result } = renderHook(() => useApi(), { wrapper });

    await result.current.authedFetch('/test-endpoint', { headers: customHeaders });

    expect(mockFetch).toHaveBeenCalledWith(
      '/mock-api/test-endpoint',
      expect.objectContaining({
        headers: expect.any(Headers),
      })
    );
  });

  it('should handle fetch options', async () => {
    const options = {
      method: 'POST',
      body: JSON.stringify({ test: 'data' }),
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const { result } = renderHook(() => useApi(), { wrapper });

    await result.current.authedFetch('/test-endpoint', options);

    expect(mockFetch).toHaveBeenCalledWith(
      '/mock-api/test-endpoint',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ test: 'data' }),
        headers: expect.any(Headers),
      })
    );
  });

  it('should handle API errors with response text', async () => {
    const errorText = 'User not found';
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      text: async () => errorText,
    });

    const { result } = renderHook(() => useApi(), { wrapper });

    await expect(result.current.authedFetch('/test-endpoint')).rejects.toThrow(
      'API Error: 404 Not Found User not found'
    );
  });

  it('should handle API errors without response text', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: async () => {
        throw new Error('Failed to read response');
      },
    });

    const { result } = renderHook(() => useApi(), { wrapper });

    await expect(result.current.authedFetch('/test-endpoint')).rejects.toThrow(
      'API Error: 500 Internal Server Error '
    );
  });

  it('should handle different HTTP status codes', async () => {
    const statusCodes = [400, 401, 403, 404, 422, 500, 502, 503];
    
    for (const status of statusCodes) {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status,
        statusText: `Error ${status}`,
        text: async () => `Error message ${status}`,
      });

      const { result } = renderHook(() => useApi(), { wrapper });

      await expect(result.current.authedFetch('/test-endpoint')).rejects.toThrow(
        `API Error: ${status} Error ${status} Error message ${status}`
      );
    }
  });

  it('should handle Auth0 token errors', async () => {
    const tokenError = new Error('Token error');
    mockGetAccessTokenSilently.mockRejectedValueOnce(tokenError);

    const { result } = renderHook(() => useApi(), { wrapper });

    await expect(result.current.authedFetch('/test-endpoint')).rejects.toThrow('Token error');
  });

  it('should handle network errors', async () => {
    const networkError = new Error('Network error');
    mockFetch.mockRejectedValueOnce(networkError);

    const { result } = renderHook(() => useApi(), { wrapper });

    await expect(result.current.authedFetch('/test-endpoint')).rejects.toThrow('Network error');
  });

  it('should handle JSON parsing errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new Error('Invalid JSON');
      },
      text: async () => '',
    });

    const { result } = renderHook(() => useApi(), { wrapper });

    await expect(result.current.authedFetch('/test-endpoint')).rejects.toThrow('Invalid JSON');
  });

  it('should support generic types', async () => {
    interface User {
      id: number;
      name: string;
      email: string;
    }

    const mockUser: User = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
      text: async () => '',
    });

    const { result } = renderHook(() => useApi(), { wrapper });

    const user = await result.current.authedFetch<User>('/users/1');

    expect(user).toEqual(mockUser);
    expect(user.id).toBe(1);
    expect(user.name).toBe('Test User');
    expect(user.email).toBe('test@example.com');
  });

  it('should handle array responses', async () => {
    const mockUsers = [
      { id: 1, name: 'User 1' },
      { id: 2, name: 'User 2' },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers,
      text: async () => '',
    });

    const { result } = renderHook(() => useApi(), { wrapper });

    const users = await result.current.authedFetch('/users');

    expect(users).toEqual(mockUsers);
    expect(Array.isArray(users)).toBe(true);
    expect(users).toHaveLength(2);
  });

  it('should handle null responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => null,
      text: async () => '',
    });

    const { result } = renderHook(() => useApi(), { wrapper });

    const response = await result.current.authedFetch('/test-endpoint');

    expect(response).toBeNull();
  });

  it('should handle undefined responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => undefined,
      text: async () => '',
    });

    const { result } = renderHook(() => useApi(), { wrapper });

    const response = await result.current.authedFetch('/test-endpoint');

    expect(response).toBeUndefined();
  });

  it('should handle empty object responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
      text: async () => '',
    });

    const { result } = renderHook(() => useApi(), { wrapper });

    const response = await result.current.authedFetch('/test-endpoint');

    expect(response).toEqual({});
  });

  it('should handle complex nested responses', async () => {
    const complexResponse = {
      data: {
        users: [
          { id: 1, profile: { name: 'User 1', settings: { theme: 'dark' } } },
          { id: 2, profile: { name: 'User 2', settings: { theme: 'light' } } },
        ],
        metadata: {
          total: 2,
          page: 1,
          hasMore: false,
        },
      },
      status: 'success',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => complexResponse,
      text: async () => '',
    });

    const { result } = renderHook(() => useApi(), { wrapper });

    const response = await result.current.authedFetch('/complex-endpoint');

    expect(response).toEqual(complexResponse);
    expect(response.data.users).toHaveLength(2);
    expect(response.data.metadata.total).toBe(2);
  });

  it('should maintain function reference across renders', () => {
    const { result, rerender } = renderHook(() => useApi(), { wrapper });

    const firstReference = result.current.authedFetch;

    rerender();

    const secondReference = result.current.authedFetch;

    expect(firstReference).toBe(secondReference);
  });

  it('should handle callback dependency changes', () => {
    const { result, rerender } = renderHook(() => useApi(), { wrapper });

    const firstReference = result.current.authedFetch;

    // Change the Auth0 mock to return a different function
    const newMockGetAccessTokenSilently = vi.fn();
    mockUseAuth0.mockReturnValue({
      getAccessTokenSilently: newMockGetAccessTokenSilently,
    });

    rerender();

    const secondReference = result.current.authedFetch;

    // The reference should change when dependencies change
    expect(firstReference).not.toBe(secondReference);
  });

  it('should handle multiple concurrent requests', async () => {
    const mockResponse1 = { id: 1, name: 'User 1' };
    const mockResponse2 = { id: 2, name: 'User 2' };
    const mockResponse3 = { id: 3, name: 'User 3' };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse1,
        text: async () => '',
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse2,
        text: async () => '',
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse3,
        text: async () => '',
      });

    const { result } = renderHook(() => useApi(), { wrapper });

    const promises = [
      result.current.authedFetch('/users/1'),
      result.current.authedFetch('/users/2'),
      result.current.authedFetch('/users/3'),
    ];

    const responses = await Promise.all(promises);

    expect(responses).toEqual([mockResponse1, mockResponse2, mockResponse3]);
    expect(mockGetAccessTokenSilently).toHaveBeenCalledTimes(3);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it('should handle Headers object correctly', async () => {
    const customHeaders = new Headers();
    customHeaders.set('Content-Type', 'application/json');
    customHeaders.set('X-Custom', 'value');

    const { result } = renderHook(() => useApi(), { wrapper });

    await result.current.authedFetch('/test-endpoint', { headers: customHeaders });

    expect(mockFetch).toHaveBeenCalledWith(
      '/mock-api/test-endpoint',
      expect.objectContaining({
        headers: expect.any(Headers),
      })
    );
  });

  it('should handle different HTTP methods', async () => {
    const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

    for (const method of methods) {
      const { result } = renderHook(() => useApi(), { wrapper });

      await result.current.authedFetch('/test-endpoint', { method });

      expect(mockFetch).toHaveBeenCalledWith(
        '/mock-api/test-endpoint',
        expect.objectContaining({
          method,
          headers: expect.any(Headers),
        })
      );
    }
  });

  it('should handle request body', async () => {
    const requestBody = { name: 'Test User', email: 'test@example.com' };

    const { result } = renderHook(() => useApi(), { wrapper });

    await result.current.authedFetch('/users', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/mock-api/users',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: expect.any(Headers),
      })
    );
  });

  it('should handle fetch options override', async () => {
    const options = {
      method: 'PUT',
      body: 'test body',
      headers: {
        'Content-Type': 'text/plain',
      },
      cache: 'no-cache' as RequestCache,
      credentials: 'include' as RequestCredentials,
    };

    const { result } = renderHook(() => useApi(), { wrapper });

    await result.current.authedFetch('/test-endpoint', options);

    expect(mockFetch).toHaveBeenCalledWith(
      '/mock-api/test-endpoint',
      expect.objectContaining({
        method: 'PUT',
        body: 'test body',
        cache: 'no-cache',
        credentials: 'include',
        headers: expect.any(Headers),
      })
    );
  });

  it('should handle environment variable for Auth0 audience', async () => {
    const { result } = renderHook(() => useApi(), { wrapper });

    await result.current.authedFetch('/test-endpoint');

    expect(mockGetAccessTokenSilently).toHaveBeenCalledWith({
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      },
    });
  });
});
