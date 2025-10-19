import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useRecentForm } from './useRecentForm';
import type { RecentFormResult } from './useRecentForm';
import * as api from '../lib/api';

// Mock Auth0
const mockGetAccessTokenSilently = vi.fn();
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    getAccessTokenSilently: mockGetAccessTokenSilently,
  }),
}));

// Mock apiFetch
vi.mock('../lib/api', () => ({
  apiFetch: vi.fn(),
}));

describe('useRecentForm', () => {
  const mockRecentFormData: RecentFormResult[] = [
    { position: 1, raceName: 'Monaco Grand Prix', countryCode: 'MC' },
    { position: 3, raceName: 'Spanish Grand Prix', countryCode: 'ES' },
    { position: 2, raceName: 'Canadian Grand Prix', countryCode: 'CA' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAccessTokenSilently.mockResolvedValue('mock-token');
    vi.mocked(api.apiFetch).mockResolvedValue(mockRecentFormData as any);
  });

  it('should return empty data when no driverId provided', async () => {
    const { result } = renderHook(() => useRecentForm());

    expect(result.current.recentForm).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();

    // Should not call API
    expect(api.apiFetch).not.toHaveBeenCalled();
  });

  it('should fetch recent form data when driverId is provided', async () => {
    const { result } = renderHook(() => useRecentForm('1'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.recentForm).toEqual(mockRecentFormData);
    expect(result.current.error).toBeNull();
    expect(api.apiFetch).toHaveBeenCalledWith(
      '/api/drivers/1/recent-form',
      { headers: { Authorization: 'Bearer mock-token' } }
    );
  });

  it('should handle fetch errors', async () => {
    vi.mocked(api.apiFetch).mockRejectedValue(new Error('Driver not found'));

    const { result } = renderHook(() => useRecentForm('999'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Driver not found');
    expect(result.current.recentForm).toEqual([]);
  });

  it('should handle non-Error exceptions', async () => {
    vi.mocked(api.apiFetch).mockRejectedValue('String error');

    const { result } = renderHook(() => useRecentForm('1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to fetch recent form');
  });

  it('should refetch when driverId changes', async () => {
    const { result, rerender } = renderHook(
      ({ driverId }) => useRecentForm(driverId),
      { initialProps: { driverId: '1' } }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(api.apiFetch).toHaveBeenCalledTimes(1);

    // Change driverId
    rerender({ driverId: '2' });

    await waitFor(() => {
      expect(api.apiFetch).toHaveBeenCalledTimes(2);
    });

    expect(api.apiFetch).toHaveBeenLastCalledWith(
      '/api/drivers/2/recent-form',
      { headers: { Authorization: 'Bearer mock-token' } }
    );
  });

  it('should cleanup on unmount', async () => {
    const { unmount } = renderHook(() => useRecentForm('1'));

    // Unmount before fetch completes
    unmount();

    // Should not throw errors
    expect(() => unmount()).not.toThrow();
  });

  it('should reset data when driverId becomes undefined', async () => {
    const { result, rerender } = renderHook(
      ({ driverId }) => useRecentForm(driverId),
      { initialProps: { driverId: '1' as string | undefined } }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.recentForm).toEqual(mockRecentFormData);

    // Remove driverId
    rerender({ driverId: undefined });

    expect(result.current.recentForm).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should get access token before fetching', async () => {
    const { result } = renderHook(() => useRecentForm('1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockGetAccessTokenSilently).toHaveBeenCalled();
    expect(api.apiFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-token',
        }),
      })
    );
  });
});

