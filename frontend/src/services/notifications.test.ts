import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendRaceUpdate, SendRaceUpdatePayload } from './notifications';

// Mock the api module
vi.mock('../lib/api', () => ({
  buildApiUrl: vi.fn((path: string) => `https://api.test.com${path}`),
}));

describe('notifications service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console methods to avoid cluttering test output
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('sendRaceUpdate', () => {
    it('should send race update successfully with access token', async () => {
      const mockResponse = {
        message: 'Race update sent successfully',
        status: 200,
        data: { sent: true },
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => mockResponse,
      } as Response);

      const payload: SendRaceUpdatePayload = {
        raceDetails: 'Monaco Grand Prix 2024',
      };

      const result = await sendRaceUpdate(payload, 'test-access-token');

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.test.com/api/notifications/send-race-update',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-access-token',
          },
          body: JSON.stringify(payload),
        }
      );
    });

    it('should send race update successfully without access token', async () => {
      const mockResponse = {
        message: 'Race update sent successfully',
        status: 200,
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => mockResponse,
      } as Response);

      const payload: SendRaceUpdatePayload = {
        raceDetails: 'Monaco Grand Prix 2024',
      };

      const result = await sendRaceUpdate(payload);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.test.com/api/notifications/send-race-update',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );
    });

    it('should handle error response with message', async () => {
      const errorResponse = {
        message: 'Failed to send notification',
        status: 500,
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: new Headers(),
        json: async () => errorResponse,
      } as Response);

      const payload: SendRaceUpdatePayload = {
        raceDetails: 'Monaco Grand Prix 2024',
      };

      await expect(sendRaceUpdate(payload, 'test-token')).rejects.toThrow(
        'Failed to send notification'
      );
    });

    it('should handle error response without message', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: new Headers(),
        json: async () => ({}),
      } as Response);

      const payload: SendRaceUpdatePayload = {
        raceDetails: 'Monaco Grand Prix 2024',
      };

      await expect(sendRaceUpdate(payload, 'test-token')).rejects.toThrow(
        'Failed to send race update'
      );
    });

    it('should handle invalid JSON response gracefully', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: new Headers(),
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as Response);

      const payload: SendRaceUpdatePayload = {
        raceDetails: 'Monaco Grand Prix 2024',
      };

      await expect(sendRaceUpdate(payload, 'test-token')).rejects.toThrow(
        'Failed to send race update'
      );
    });

    it('should log request details', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({ message: 'Success', status: 200 }),
      } as Response);

      const payload: SendRaceUpdatePayload = {
        raceDetails: 'Monaco Grand Prix 2024',
      };

      await sendRaceUpdate(payload, 'test-token');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Sending race update to:',
        'https://api.test.com/api/notifications/send-race-update'
      );
      expect(consoleSpy).toHaveBeenCalledWith('With token:', 'Present');
      expect(consoleSpy).toHaveBeenCalledWith('Response status:', 200);
    });

    it('should log when token is missing', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({ message: 'Success', status: 200 }),
      } as Response);

      const payload: SendRaceUpdatePayload = {
        raceDetails: 'Monaco Grand Prix 2024',
      };

      await sendRaceUpdate(payload);

      expect(consoleSpy).toHaveBeenCalledWith('With token:', 'Missing');
    });

    it('should log error response body', async () => {
      const consoleSpy = vi.spyOn(console, 'error');
      const errorData = { message: 'Server error', code: 'ERR_500' };
      
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: new Headers(),
        json: async () => errorData,
      } as Response);

      const payload: SendRaceUpdatePayload = {
        raceDetails: 'Monaco Grand Prix 2024',
      };

      await expect(sendRaceUpdate(payload)).rejects.toThrow();
      
      expect(consoleSpy).toHaveBeenCalledWith('Error response body:', errorData);
    });

    it('should handle network errors', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

      const payload: SendRaceUpdatePayload = {
        raceDetails: 'Monaco Grand Prix 2024',
      };

      await expect(sendRaceUpdate(payload, 'test-token')).rejects.toThrow(
        'Network error'
      );
    });

    it('should handle 401 unauthorized error', async () => {
      const errorResponse = {
        message: 'Unauthorized',
        status: 401,
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Headers(),
        json: async () => errorResponse,
      } as Response);

      const payload: SendRaceUpdatePayload = {
        raceDetails: 'Monaco Grand Prix 2024',
      };

      await expect(sendRaceUpdate(payload, 'invalid-token')).rejects.toThrow(
        'Unauthorized'
      );
    });

    it('should handle 404 not found error', async () => {
      const errorResponse = {
        message: 'Endpoint not found',
        status: 404,
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Headers(),
        json: async () => errorResponse,
      } as Response);

      const payload: SendRaceUpdatePayload = {
        raceDetails: 'Monaco Grand Prix 2024',
      };

      await expect(sendRaceUpdate(payload)).rejects.toThrow(
        'Endpoint not found'
      );
    });

    it('should send payload with special characters', async () => {
      const mockResponse = {
        message: 'Success',
        status: 200,
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => mockResponse,
      } as Response);

      const payload: SendRaceUpdatePayload = {
        raceDetails: 'São Paulo Grand Prix 2024 🏁',
      };

      const result = await sendRaceUpdate(payload, 'test-token');

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify(payload),
        })
      );
    });
  });
});

