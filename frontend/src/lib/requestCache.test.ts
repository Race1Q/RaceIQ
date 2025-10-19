import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fetchCached } from './requestCache';

describe('requestCache', () => {
  beforeEach(() => {
    // Clear all caches before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('fetchCached', () => {
    it('should fetch data and cache it in memory', async () => {
      const mockData = { id: 1, name: 'Test' };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      } as Response);

      const result = await fetchCached<typeof mockData>(
        'test-key',
        'https://api.example.com/data'
      );

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/data', {});
    });

    it('should return cached data from memory within TTL', async () => {
      const mockData = { id: 1, name: 'Test' };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      } as Response);

      // First call - fetches
      const result1 = await fetchCached<typeof mockData>(
        'test-key-2',
        'https://api.example.com/data',
        {},
        5000
      );

      // Clear mock call count
      vi.mocked(global.fetch).mockClear();

      // Second call - should use cache (no fetch)
      const result2 = await fetchCached<typeof mockData>(
        'test-key-2',
        'https://api.example.com/data',
        {},
        5000
      );

      expect(result1).toEqual(mockData);
      expect(result2).toEqual(mockData);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should fetch fresh data when TTL expires', async () => {
      const mockData1 = { id: 1, name: 'Test 1' };
      const mockData2 = { id: 2, name: 'Test 2' };
      
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockData1,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockData2,
        } as Response)
        .mockResolvedValue({
          ok: true,
          json: async () => mockData2,
        } as Response);

      // First call
      const result1 = await fetchCached<typeof mockData1>(
        'test-key-3',
        'https://api.example.com/data',
        {},
        -1 // Negative TTL to expire immediately
      );

      // Second call - should fetch fresh
      const result2 = await fetchCached<typeof mockData2>(
        'test-key-3',
        'https://api.example.com/data',
        {},
        -1
      );

      expect(result1).toEqual(mockData1);
      expect(result2).toEqual(mockData2);
      expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/data', {});
    });

    it('should store data in localStorage', async () => {
      const mockData = { id: 1, name: 'Test' };
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      await fetchCached<typeof mockData>(
        'test-key-4',
        'https://api.example.com/data'
      );

      const storedData = localStorage.getItem('rc:test-key-4');
      expect(storedData).toBeTruthy();
      
      const parsed = JSON.parse(storedData!);
      expect(parsed.v).toEqual(mockData);
      expect(parsed.t).toBeTypeOf('number');
    });

    it('should retrieve data from localStorage when memory cache is empty', async () => {
      const mockData = { id: 1, name: 'Test' };
      const cacheEntry = { t: Date.now(), v: mockData };
      
      localStorage.setItem('rc:test-key-5', JSON.stringify(cacheEntry));

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      } as Response);

      const result = await fetchCached<typeof mockData>(
        'test-key-5',
        'https://api.example.com/data',
        {},
        60000 // 60s TTL
      );

      expect(result).toEqual(mockData);
      
      // Wait for background refresh
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    it('should handle fetch errors gracefully', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      await expect(
        fetchCached('test-key-6', 'https://api.example.com/data')
      ).rejects.toThrow('404 Not Found');
    });

    it('should handle network errors', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

      await expect(
        fetchCached('test-key-7', 'https://api.example.com/data')
      ).rejects.toThrow('Network error');
    });

    it('should pass custom RequestInit to fetch', async () => {
      const mockData = { id: 1, name: 'Test' };
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      const customInit: RequestInit = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      };

      await fetchCached<typeof mockData>(
        'test-key-8',
        'https://api.example.com/data',
        customInit
      );

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/data',
        customInit
      );
    });

    it('should handle localStorage quota exceeded errors gracefully', async () => {
      const mockData = { id: 1, name: 'Test' };
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      // Mock localStorage.setItem to throw quota exceeded error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn().mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      // Should still return data even if localStorage fails
      const result = await fetchCached<typeof mockData>(
        'test-key-9',
        'https://api.example.com/data'
      );

      expect(result).toEqual(mockData);
      
      // Restore original
      localStorage.setItem = originalSetItem;
    });

    it('should handle invalid JSON in localStorage gracefully', async () => {
      const mockData = { id: 1, name: 'Test' };
      
      // Put invalid JSON in localStorage
      localStorage.setItem('rc:test-key-10', 'invalid-json{');

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      } as Response);

      // Should fetch fresh data when localStorage parse fails
      const result = await fetchCached<typeof mockData>(
        'test-key-10',
        'https://api.example.com/data'
      );

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/data', {});
    });

    it('should trigger background refresh for stale localStorage data', async () => {
      const mockData = { id: 1, name: 'Test' };
      const cacheEntry = { t: Date.now(), v: mockData };
      
      localStorage.setItem('rc:test-key-11', JSON.stringify(cacheEntry));

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      } as Response);

      const result = await fetchCached<typeof mockData>(
        'test-key-11',
        'https://api.example.com/data',
        {},
        60000
      );

      expect(result).toEqual(mockData);
      
      // Wait for microtask queue to process background refresh
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    it('should use default TTL when not specified', async () => {
      const mockData = { id: 1, name: 'Test' };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      } as Response);

      const result = await fetchCached<typeof mockData>(
        'test-key-12',
        'https://api.example.com/data'
      );

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/data', {});
    });

    it('should handle empty response data', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => null,
      } as Response);

      const result = await fetchCached<null>(
        'test-key-13',
        'https://api.example.com/data'
      );

      expect(result).toBeNull();
    });

    it('should handle array data', async () => {
      const mockData = [1, 2, 3, 4, 5];
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      const result = await fetchCached<typeof mockData>(
        'test-key-14',
        'https://api.example.com/data'
      );

      expect(result).toEqual(mockData);
    });

    it('should handle nested object data', async () => {
      const mockData = {
        user: {
          id: 1,
          name: 'Test',
          settings: {
            theme: 'dark',
            notifications: true,
          },
        },
      };
      
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      const result = await fetchCached<typeof mockData>(
        'test-key-15',
        'https://api.example.com/data'
      );

      expect(result).toEqual(mockData);
    });
  });
});

