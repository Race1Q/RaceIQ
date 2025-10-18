import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAiStandingsAnalysis } from './useAiStandingsAnalysis';
import * as api from '../lib/api';

vi.mock('../lib/api', () => ({
  buildApiUrl: vi.fn((path: string) => `http://localhost:3000${path}`),
}));

describe('useAiStandingsAnalysis', () => {
  const mockAnalysisData = {
    overview: 'Max Verstappen leads the championship',
    keyInsights: [
      'Red Bull dominates',
      'Mercedes struggles',
      'Ferrari inconsistent',
    ],
    driverAnalysis: {
      leader: 'Max Verstappen extends his lead',
      biggestRiser: 'Lando Norris climbs to P4',
      biggestFall: 'Fernando Alonso drops to P8',
      midfieldBattle: 'Close fight between Alpine and Williams',
    },
    constructorAnalysis: {
      leader: 'Red Bull Racing maintains dominance',
      competition: 'Mercedes and Ferrari battle for P2',
      surprises: 'Aston Martin strong start fades',
    },
    trends: [
      'Red Bull reliability advantage',
      'Mercedes upgrades paying off',
    ],
    predictions: [
      'Verstappen likely to win championship',
      'Constructor battle intensifies',
    ],
    generatedAt: '2024-01-01T12:00:00Z',
    isFallback: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches standings analysis successfully without season', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockAnalysisData,
    }) as any;

    const { result } = renderHook(() => useAiStandingsAnalysis());

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockAnalysisData);
    expect(result.current.error).toBeNull();
  });

  it('fetches standings analysis with specific season', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockAnalysisData,
    }) as any;

    renderHook(() => useAiStandingsAnalysis(2024));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    const callUrl = (global.fetch as any).mock.calls[0][0];
    expect(callUrl).toContain('season=2024');
  });

  it('handles HTTP errors', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    }) as any;

    const { result } = renderHook(() => useAiStandingsAnalysis());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toContain('HTTP error! status: 500');
    expect(result.current.data).toBeNull();
  });

  it('handles network errors', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network failed')) as any;

    const { result } = renderHook(() => useAiStandingsAnalysis());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toBe('Network failed');
  });

  it('re-fetches when season changes', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockAnalysisData,
    }) as any;

    const { rerender } = renderHook(
      ({ season }) => useAiStandingsAnalysis(season),
      { initialProps: { season: 2024 } }
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    const firstCall = (global.fetch as any).mock.calls[0][0];
    expect(firstCall).toContain('season=2024');

    rerender({ season: 2023 });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    const secondCall = (global.fetch as any).mock.calls[1][0];
    expect(secondCall).toContain('season=2023');
  });

  it('returns all expected data properties', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockAnalysisData,
    }) as any;

    const { result } = renderHook(() => useAiStandingsAnalysis());

    await waitFor(() => {
      expect(result.current.data).not.toBeNull();
    });

    expect(result.current.data?.overview).toBe(mockAnalysisData.overview);
    expect(result.current.data?.keyInsights).toHaveLength(3);
    expect(result.current.data?.driverAnalysis).toBeDefined();
    expect(result.current.data?.constructorAnalysis).toBeDefined();
    expect(result.current.data?.trends).toHaveLength(2);
    expect(result.current.data?.predictions).toHaveLength(2);
  });

  it('handles fallback analysis', async () => {
    const fallbackData = { ...mockAnalysisData, isFallback: true };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => fallbackData,
    }) as any;

    const { result } = renderHook(() => useAiStandingsAnalysis());

    await waitFor(() => {
      expect(result.current.data?.isFallback).toBe(true);
    });
  });
});

