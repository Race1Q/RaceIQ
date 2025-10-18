import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAiNews } from './useAiNews';
import * as api from '../lib/api';

vi.mock('../lib/api', () => ({
  buildApiUrl: vi.fn((path: string) => `http://localhost:3000${path}`),
}));

describe('useAiNews', () => {
  const mockNewsData = {
    summary: 'Max Verstappen wins the championship',
    bullets: [
      'Verstappen secures fourth title',
      'Red Bull dominates the season',
      'Record-breaking performance',
    ],
    citations: [
      {
        title: 'F1 News Article',
        url: 'https://example.com/news1',
        source: 'F1.com',
        publishedAt: '2024-01-01',
      },
    ],
    generatedAt: '2024-01-01T12:00:00Z',
    ttlSeconds: 3600,
    isFallback: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches news data successfully', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockNewsData,
    }) as any;

    const { result } = renderHook(() => useAiNews('f1'));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockNewsData);
    expect(result.current.error).toBeNull();
  });

  it('handles custom topic parameter', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockNewsData,
    }) as any;

    renderHook(() => useAiNews('max-verstappen'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    const callUrl = (global.fetch as any).mock.calls[0][0];
    expect(callUrl).toContain('topic=max-verstappen');
  });

  it('handles fetch errors', async () => {
    const errorMessage = 'Network error';
    global.fetch = vi.fn().mockRejectedValue(new Error(errorMessage)) as any;

    const { result } = renderHook(() => useAiNews('f1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toBe(errorMessage);
    expect(result.current.data).toBeNull();
  });

  it('handles HTTP error responses', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    }) as any;

    const { result } = renderHook(() => useAiNews('f1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toContain('Failed to fetch news');
    expect(result.current.error?.message).toContain('500');
  });

  it('re-fetches when topic changes', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockNewsData,
    }) as any;

    const { rerender } = renderHook(
      ({ topic }) => useAiNews(topic),
      { initialProps: { topic: 'f1' } }
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    rerender({ topic: 'lewis-hamilton' });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    const secondCallUrl = (global.fetch as any).mock.calls[1][0];
    expect(secondCallUrl).toContain('topic=lewis-hamilton');
  });

  it('handles non-Error exceptions', async () => {
    global.fetch = vi.fn().mockRejectedValue('String error') as any;

    const { result } = renderHook(() => useAiNews('f1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toBe('Unknown error occurred');
  });

  it('starts with loading state', () => {
    global.fetch = vi.fn(() => new Promise(() => {})) as any; // Never resolves

    const { result } = renderHook(() => useAiNews('f1'));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });
});

