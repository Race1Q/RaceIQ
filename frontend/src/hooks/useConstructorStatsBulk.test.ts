import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useConstructorStatsBulk } from './useConstructorStatsBulk';
import * as api from '../lib/api';

// Mock buildApiUrl
vi.mock('../lib/api', () => ({
  buildApiUrl: vi.fn((path: string) => `https://api.example.com${path}`),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useConstructorStatsBulk', () => {
  const mockBulkStatsResponse = {
    seasonYear: 2024,
    constructors: [
      {
        constructorId: 1,
        constructorName: 'Red Bull Racing',
        nationality: 'Austrian',
        isActive: true,
        stats: {
          points: 500,
          wins: 15,
          podiums: 25,
          position: 1,
        },
      },
      {
        constructorId: 2,
        constructorName: 'Ferrari',
        nationality: 'Italian',
        isActive: true,
        stats: {
          points: 400,
          wins: 10,
          podiums: 20,
          position: 2,
        },
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockBulkStatsResponse,
    });
  });

  it('should fetch bulk constructor stats successfully', async () => {
    const { result } = renderHook(() => useConstructorStatsBulk(2024, false));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockBulkStatsResponse);
    expect(result.current.error).toBeNull();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/constructors/stats/bulk?year=2024')
    );
  });

  it('should include historical constructors when requested', async () => {
    const { result } = renderHook(() => useConstructorStatsBulk(2024, true));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('includeHistorical=true')
    );
  });

  it('should fetch without year parameter when not provided', async () => {
    const { result } = renderHook(() => useConstructorStatsBulk());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const callArg = mockFetch.mock.calls[0][0];
    expect(callArg).toContain('/api/constructors/stats/bulk');
    expect(callArg).not.toContain('year=');
  });

  it('should handle fetch errors', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useConstructorStatsBulk(2024));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toContain('Failed to fetch bulk constructor stats');
    expect(result.current.data).toBeNull();
  });

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useConstructorStatsBulk(2024));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.data).toBeNull();
  });

  it('should refetch when year changes', async () => {
    const { result, rerender } = renderHook(
      ({ year }) => useConstructorStatsBulk(year),
      { initialProps: { year: 2024 } }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Change year
    rerender({ year: 2023 });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    expect(mockFetch).toHaveBeenLastCalledWith(
      expect.stringContaining('year=2023')
    );
  });

  it('should refetch when includeHistorical changes', async () => {
    const { result, rerender } = renderHook(
      ({ includeHistorical }) => useConstructorStatsBulk(2024, includeHistorical),
      { initialProps: { includeHistorical: false } }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Change includeHistorical
    rerender({ includeHistorical: true });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  it('should return empty data on error', async () => {
    mockFetch.mockRejectedValue(new Error('Server error'));

    const { result } = renderHook(() => useConstructorStatsBulk(2024));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Server error');
  });
});

