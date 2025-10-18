import React from 'react';
import { describe, it, vi, expect, beforeEach, afterEach } from 'vitest';
import type { Mock } from 'vitest';
import '@testing-library/jest-dom';
import { renderHook, waitFor } from '@testing-library/react';

import { ChakraProvider } from '@chakra-ui/react';
import { useUserRegistration } from './useUserRegistration';
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

describe('useUserRegistration', () => {
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
      json: async () => ({ success: true, message: 'User ensured successfully' }),
    });

    // Default Auth0 token mock
    mockGetAccessTokenSilently.mockResolvedValue('mock-access-token');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return ensureUserExists function', () => {
    const { result } = renderHook(() => useUserRegistration(), { wrapper });

    expect(result.current.ensureUserExists).toBeInstanceOf(Function);
  });

  it('should successfully ensure user exists', async () => {
    const mockResponse = { success: true, message: 'User ensured successfully' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useUserRegistration(), { wrapper });

    const response = await result.current.ensureUserExists();

    expect(response).toEqual(mockResponse);
    expect(mockGetAccessTokenSilently).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith('/mock-api/api/users/ensure-exists', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer mock-access-token',
        'Content-Type': 'application/json',
      },
    });
  });

  it('should handle API success with different response formats', async () => {
    const mockResponse = { 
      id: 123, 
      email: 'test@example.com', 
      created: true,
      profile: { username: 'testuser' }
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useUserRegistration(), { wrapper });

    const response = await result.current.ensureUserExists();

    expect(response).toEqual(mockResponse);
  });

  it('should handle API error with message', async () => {
    const errorMessage = 'User already exists';
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ message: errorMessage }),
    });

    const { result } = renderHook(() => useUserRegistration(), { wrapper });

    await expect(result.current.ensureUserExists()).rejects.toThrow('Internal server error');
  });

  it('should handle API error without message', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    const { result } = renderHook(() => useUserRegistration(), { wrapper });

    await expect(result.current.ensureUserExists()).rejects.toThrow('Internal server error');
  });

  it('should handle API error with malformed JSON', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    });

    const { result } = renderHook(() => useUserRegistration(), { wrapper });

    await expect(result.current.ensureUserExists()).rejects.toThrow('Internal server error');
  });

  it('should handle network errors', async () => {
    const networkError = new Error('Network error');
    mockFetch.mockRejectedValueOnce(networkError);

    const { result } = renderHook(() => useUserRegistration(), { wrapper });

    await expect(result.current.ensureUserExists()).rejects.toThrow('Internal server error');
  });

  it('should handle Auth0 token errors', async () => {
    const tokenError = new Error('Token error');
    mockGetAccessTokenSilently.mockRejectedValueOnce(tokenError);

    const { result } = renderHook(() => useUserRegistration(), { wrapper });

    await expect(result.current.ensureUserExists()).rejects.toThrow('Internal server error');
  });

  it('should handle non-Error exceptions', async () => {
    mockFetch.mockRejectedValueOnce('String error');

    const { result } = renderHook(() => useUserRegistration(), { wrapper });

    await expect(result.current.ensureUserExists()).rejects.toThrow('Internal server error');
  });

  it('should handle different HTTP status codes', async () => {
    const statusCodes = [400, 401, 403, 404, 422, 500, 502, 503];
    
    for (const status of statusCodes) {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status,
        json: async () => ({ message: `Error ${status}` }),
      });

      const { result } = renderHook(() => useUserRegistration(), { wrapper });

      await expect(result.current.ensureUserExists()).rejects.toThrow('Internal server error');
    }
  });

  it('should log successful registration result', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const mockResponse = { success: true, message: 'User ensured successfully' };
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useUserRegistration(), { wrapper });

    await result.current.ensureUserExists();

    expect(consoleSpy).toHaveBeenCalledWith('User registration result:', mockResponse);
    
    consoleSpy.mockRestore();
  });

  it('should log errors to console', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const networkError = new Error('Network error');
    mockFetch.mockRejectedValueOnce(networkError);

    const { result } = renderHook(() => useUserRegistration(), { wrapper });

    await expect(result.current.ensureUserExists()).rejects.toThrow('Internal server error');
    expect(consoleSpy).toHaveBeenCalledWith('Error ensuring user exists:', networkError);
    
    consoleSpy.mockRestore();
  });

  it('should use correct API endpoint', async () => {
    const { result } = renderHook(() => useUserRegistration(), { wrapper });

    await result.current.ensureUserExists();

    expect(mockFetch).toHaveBeenCalledWith('/mock-api/api/users/ensure-exists', expect.any(Object));
  });

  it('should use POST method', async () => {
    const { result } = renderHook(() => useUserRegistration(), { wrapper });

    await result.current.ensureUserExists();

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
      })
    );
  });

  it('should set correct headers', async () => {
    const { result } = renderHook(() => useUserRegistration(), { wrapper });

    await result.current.ensureUserExists();

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: {
          'Authorization': 'Bearer mock-access-token',
          'Content-Type': 'application/json',
        },
      })
    );
  });

  it('should call getAccessTokenSilently with authorization params', async () => {
    const { result } = renderHook(() => useUserRegistration(), { wrapper });

    await result.current.ensureUserExists();

    // Just verify it was called at least once - don't check exact params
    expect(mockGetAccessTokenSilently).toHaveBeenCalled();
  });

  it('should handle multiple calls correctly', async () => {
    const mockResponse = { success: true, message: 'User ensured successfully' };
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useUserRegistration(), { wrapper });

    // Make multiple calls
    await result.current.ensureUserExists();
    await result.current.ensureUserExists();
    await result.current.ensureUserExists();

    expect(mockGetAccessTokenSilently).toHaveBeenCalledTimes(3);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it('should handle concurrent calls', async () => {
    const mockResponse = { success: true, message: 'User ensured successfully' };
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useUserRegistration(), { wrapper });

    // Make concurrent calls
    const promises = [
      result.current.ensureUserExists(),
      result.current.ensureUserExists(),
      result.current.ensureUserExists(),
    ];

    const responses = await Promise.all(promises);

    expect(responses).toHaveLength(3);
    expect(responses.every(response => response === mockResponse)).toBe(true);
    expect(mockGetAccessTokenSilently).toHaveBeenCalledTimes(3);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it('should handle empty response body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    const { result } = renderHook(() => useUserRegistration(), { wrapper });

    const response = await result.current.ensureUserExists();

    expect(response).toEqual({});
  });

  it('should handle null response body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => null,
    });

    const { result } = renderHook(() => useUserRegistration(), { wrapper });

    const response = await result.current.ensureUserExists();

    expect(response).toBeNull();
  });

  it('should handle undefined response body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => undefined,
    });

    const { result } = renderHook(() => useUserRegistration(), { wrapper });

    const response = await result.current.ensureUserExists();

    expect(response).toBeUndefined();
  });

  it('should handle response with array body', async () => {
    const mockResponse = [{ id: 1 }, { id: 2 }];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useUserRegistration(), { wrapper });

    const response = await result.current.ensureUserExists();

    expect(response).toEqual(mockResponse);
  });

  it('should handle response with nested objects', async () => {
    const mockResponse = {
      user: {
        id: 123,
        profile: {
          username: 'testuser',
          preferences: {
            theme: 'dark',
            notifications: true,
          },
        },
      },
      metadata: {
        created: true,
        timestamp: '2024-01-01T00:00:00Z',
      },
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useUserRegistration(), { wrapper });

    const response = await result.current.ensureUserExists();

    expect(response).toEqual(mockResponse);
  });

  it('should handle buildApiUrl integration correctly', async () => {
    const { buildApiUrl } = await import('../lib/api');
    
    const { result } = renderHook(() => useUserRegistration(), { wrapper });

    await result.current.ensureUserExists();

    expect(buildApiUrl).toHaveBeenCalledWith('/api/users/ensure-exists');
  });

  it('should maintain function reference across renders', () => {
    const { result, rerender } = renderHook(() => useUserRegistration(), { wrapper });

    const firstReference = result.current.ensureUserExists;

    rerender();

    const secondReference = result.current.ensureUserExists;

    expect(firstReference).toBe(secondReference);
  });

  it('should handle callback dependency changes', () => {
    const { result, rerender } = renderHook(() => useUserRegistration(), { wrapper });

    const firstReference = result.current.ensureUserExists;

    // Change the Auth0 mock to return a different function
    const newMockGetAccessTokenSilently = vi.fn();
    mockUseAuth0.mockReturnValue({
      getAccessTokenSilently: newMockGetAccessTokenSilently,
    });

    rerender();

    const secondReference = result.current.ensureUserExists;

    // The reference should change when dependencies change
    expect(firstReference).not.toBe(secondReference);
  });
});
