import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getApiBaseUrl, buildApiUrl, apiFetch, apiPost } from './api';

describe('api utilities', () => {
  let originalWindow: any;
  let originalEnv: any;

  beforeEach(() => {
    // Save original values
    originalWindow = global.window;
    originalEnv = { ...import.meta.env };
    
    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original values
    if (originalWindow) {
      global.window = originalWindow;
    }
  });

  describe('getApiBaseUrl', () => {
    it('should prioritize window.__API_BASE__ over env vars', () => {
      (window as any).__API_BASE__ = 'https://runtime.api.com';
      import.meta.env.VITE_API_BASE_URL = 'https://buildtime.api.com';
      import.meta.env.DEV = false;

      const result = getApiBaseUrl();

      expect(result).toBe('https://runtime.api.com');
    });

    it('should use VITE_API_BASE_URL when window.__API_BASE__ is not set', () => {
      delete (window as any).__API_BASE__;
      import.meta.env.VITE_API_BASE_URL = 'https://buildtime.api.com';
      import.meta.env.DEV = false;

      const result = getApiBaseUrl();

      expect(result).toBe('https://buildtime.api.com');
    });

    it('should return empty string in dev mode when no base URL is set', () => {
      delete (window as any).__API_BASE__;
      delete import.meta.env.VITE_API_BASE_URL;
      import.meta.env.DEV = true;

      const result = getApiBaseUrl();

      expect(result).toBe('');
    });

    it('should return empty string in production when no base URL is set and allowRelativeInProd is false', () => {
      delete (window as any).__API_BASE__;
      delete import.meta.env.VITE_API_BASE_URL;
      import.meta.env.DEV = false;

      const result = getApiBaseUrl({ allowRelativeInProd: false });

      expect(result).toBe('');
    });

    it('should allow empty base in production with allowRelativeInProd option', () => {
      delete (window as any).__API_BASE__;
      delete import.meta.env.VITE_API_BASE_URL;
      import.meta.env.DEV = false;

      const result = getApiBaseUrl({ allowRelativeInProd: true });

      expect(result).toBe('');
    });

    it('should handle empty runtime value and fallback to build var', () => {
      (window as any).__API_BASE__ = '';
      import.meta.env.VITE_API_BASE_URL = 'https://buildtime.api.com';
      import.meta.env.DEV = false;

      const result = getApiBaseUrl();

      expect(result).toBe('https://buildtime.api.com');
    });
  });

  describe('buildApiUrl', () => {
    beforeEach(() => {
      delete (window as any).__API_BASE__;
      delete import.meta.env.VITE_API_BASE_URL;
    });

    it('should return absolute URLs unchanged', () => {
      const url = 'https://external.api.com/data';
      
      const result = buildApiUrl(url);

      expect(result).toBe('https://external.api.com/data');
    });

    it('should handle http URLs', () => {
      const url = 'http://localhost:3000/api/data';
      
      const result = buildApiUrl(url);

      expect(result).toBe('http://localhost:3000/api/data');
    });

    it('should prepend base URL to relative endpoints', () => {
      (window as any).__API_BASE__ = 'https://api.example.com';

      const result = buildApiUrl('/users');

      expect(result).toBe('https://api.example.com/users');
    });

    it('should add leading slash to endpoints without one', () => {
      (window as any).__API_BASE__ = 'https://api.example.com';

      const result = buildApiUrl('users');

      expect(result).toBe('https://api.example.com/users');
    });

    it('should remove trailing slash from base URL', () => {
      (window as any).__API_BASE__ = 'https://api.example.com/';

      const result = buildApiUrl('/users');

      expect(result).toBe('https://api.example.com/users');
    });

    it('should avoid duplicate /api segments', () => {
      (window as any).__API_BASE__ = 'https://api.example.com/api';

      const result = buildApiUrl('/api/users');

      expect(result).toBe('https://api.example.com/api/users');
    });

    it('should handle /api endpoint with /api base correctly', () => {
      (window as any).__API_BASE__ = 'https://api.example.com/api';

      const result = buildApiUrl('/api/predictions');

      expect(result).toBe('https://api.example.com/api/predictions');
    });

    it('should handle /API (uppercase) in base and endpoint', () => {
      (window as any).__API_BASE__ = 'https://api.example.com/API';

      const result = buildApiUrl('/API/users');

      expect(result).toBe('https://api.example.com/API/users');
    });

    it('should return relative endpoint when no base URL is set', () => {
      import.meta.env.DEV = true;

      const result = buildApiUrl('/api/users');

      expect(result).toBe('/api/users');
    });

    it('should handle endpoint that starts with /api when base does not', () => {
      (window as any).__API_BASE__ = 'https://api.example.com';

      const result = buildApiUrl('/api/users');

      expect(result).toBe('https://api.example.com/api/users');
    });

    it('should handle empty base URL in dev mode', () => {
      import.meta.env.DEV = true;
      delete (window as any).__API_BASE__;

      const result = buildApiUrl('/users');

      expect(result).toBe('/users');
    });
  });

  describe('apiFetch', () => {
    beforeEach(() => {
      (window as any).__API_BASE__ = 'https://api.test.com';
    });

    it('should make successful GET request', async () => {
      const mockData = { id: 1, name: 'Test' };
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => mockData,
      } as any);

      const result = await apiFetch('/users');

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.test.com/users',
        expect.objectContaining({
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('should include credentials by default', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => ({}),
      } as any);

      await apiFetch('/users');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          credentials: 'include',
        })
      );
    });

    it('should merge custom headers with default Content-Type', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => ({}),
      } as any);

      await apiFetch('/users', {
        headers: {
          'Authorization': 'Bearer token123',
        },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer token123',
          },
        })
      );
    });

    it('should throw error for non-ok responses', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Map(),
        text: async () => 'Resource not found',
      } as any);

      await expect(apiFetch('/users/999')).rejects.toThrow(
        'Request failed 404 Not Found'
      );
    });

    it('should include response body snippet in error message', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Map(),
        text: async () => 'Database connection failed with detailed error message',
      } as any);

      await expect(apiFetch('/users')).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should handle errors when reading response body', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Map(),
        text: async () => {
          throw new Error('Stream error');
        },
      } as any);

      await expect(apiFetch('/users')).rejects.toThrow(
        'Request failed 500 Internal Server Error'
      );
    });

    it('should detect HTML response and provide helpful error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Map([['content-type', 'text/html']]),
        text: async () => '<!DOCTYPE html><html><body>Page</body></html>',
      } as any);

      await expect(apiFetch('/users')).rejects.toThrow(
        'Received HTML instead of JSON'
      );
    });

    it('should detect lowercase html response', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        headers: new Map([['content-type', 'text/html']]),
        text: async () => '<html><body>Page</body></html>',
      } as any);

      await expect(apiFetch('/users')).rejects.toThrow(
        'Received HTML instead of JSON'
      );
    });

    it('should attempt JSON parse for non-JSON content-type if not HTML', async () => {
      const mockData = { id: 1, name: 'Test' };
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        headers: new Map([['content-type', 'text/plain']]),
        text: async () => JSON.stringify(mockData),
      } as any);

      const result = await apiFetch('/users');

      expect(result).toEqual(mockData);
    });

    it('should return text as-is if JSON parse fails', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        headers: new Map([['content-type', 'text/plain']]),
        text: async () => 'Plain text response',
      } as any);

      const result = await apiFetch('/users');

      expect(result).toBe('Plain text response');
    });

    it('should handle missing content-type header', async () => {
      const mockData = { id: 1, name: 'Test' };
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        headers: new Map(),
        text: async () => JSON.stringify(mockData),
      } as any);

      const result = await apiFetch('/users');

      expect(result).toEqual(mockData);
    });

    it('should pass through custom RequestInit options', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => ({}),
      } as any);

      await apiFetch('/users', {
        method: 'POST',
        body: JSON.stringify({ name: 'New User' }),
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'New User' }),
        })
      );
    });
  });

  describe('apiPost', () => {
    beforeEach(() => {
      (window as any).__API_BASE__ = 'https://api.test.com';
    });

    it('should make POST request with JSON body', async () => {
      const requestBody = { name: 'John', email: 'john@example.com' };
      const responseData = { id: 1, ...requestBody };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => responseData,
      } as any);

      const result = await apiPost('/users', requestBody);

      expect(result).toEqual(responseData);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.test.com/users',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestBody),
        })
      );
    });

    it('should merge custom init options', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => ({}),
      } as any);

      await apiPost('/users', { name: 'John' }, {
        headers: {
          'Authorization': 'Bearer token',
        },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer token',
          },
        })
      );
    });

    it('should handle POST errors', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        headers: new Map(),
        text: async () => 'Invalid data',
      } as any);

      await expect(apiPost('/users', { invalid: 'data' })).rejects.toThrow(
        'Request failed 400 Bad Request'
      );
    });

    it('should stringify complex nested objects', async () => {
      const complexBody = {
        user: {
          name: 'John',
          settings: {
            theme: 'dark',
            notifications: true,
          },
        },
        tags: ['admin', 'user'],
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => ({}),
      } as any);

      await apiPost('/users', complexBody);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify(complexBody),
        })
      );
    });
  });
});

