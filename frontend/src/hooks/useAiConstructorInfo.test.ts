import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAiConstructorInfo } from './useAiConstructorInfo';
import * as api from '../lib/api';

vi.mock('../lib/api', () => ({
  buildApiUrl: vi.fn((path: string) => `http://localhost:3000${path}`),
}));

describe('useAiConstructorInfo', () => {
  const mockConstructorInfo = {
    overview: 'Red Bull Racing is a dominant force in F1',
    history: 'Founded in 2005, Red Bull has won multiple championships',
    strengths: ['Aerodynamics', 'Adrian Newey', 'Driver lineup'],
    challenges: ['Cost cap', 'Regulation changes'],
    notableAchievements: ['6 Constructors Championships', 'Multiple driver titles'],
    currentSeason: {
      performance: 'Dominating the 2024 season',
      highlights: ['Record-breaking start', 'Max Verstappen on fire'],
      outlook: 'Championship favorites',
    },
    generatedAt: '2024-01-01T12:00:00Z',
    isFallback: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches constructor info successfully', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockConstructorInfo,
    }) as any;

    const { result } = renderHook(() => useAiConstructorInfo(1));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockConstructorInfo);
    expect(result.current.error).toBeNull();
  });

  it('does not fetch when constructorId is 0', async () => {
    global.fetch = vi.fn() as any;

    const { result } = renderHook(() => useAiConstructorInfo(0));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(global.fetch).not.toHaveBeenCalled();
    expect(result.current.data).toBeNull();
  });

  it('fetches with season parameter', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockConstructorInfo,
    }) as any;

    renderHook(() => useAiConstructorInfo(1, 2024));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    const callUrl = (global.fetch as any).mock.calls[0][0];
    expect(callUrl).toContain('/api/ai/constructor/1/info?season=2024');
  });

  it('fetches without season parameter', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockConstructorInfo,
    }) as any;

    renderHook(() => useAiConstructorInfo(1));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    const callUrl = (global.fetch as any).mock.calls[0][0];
    expect(callUrl).toContain('/api/ai/constructor/1/info');
    expect(callUrl).not.toContain('season=');
  });

  it('handles HTTP errors', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    }) as any;

    const { result } = renderHook(() => useAiConstructorInfo(1));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.data).toBeNull();
  });

  it('handles network errors', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error')) as any;

    const { result } = renderHook(() => useAiConstructorInfo(1));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error?.message).toBe('Network error');
  });

  it('re-fetches when constructorId changes', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockConstructorInfo,
    }) as any;

    const { rerender } = renderHook(
      ({ constructorId }) => useAiConstructorInfo(constructorId),
      { initialProps: { constructorId: 1 } }
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    rerender({ constructorId: 2 });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  it('re-fetches when season changes', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockConstructorInfo,
    }) as any;

    const { rerender } = renderHook(
      ({ constructorId, season }) => useAiConstructorInfo(constructorId, season),
      { initialProps: { constructorId: 1, season: 2024 } }
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    rerender({ constructorId: 1, season: 2023 });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
});

