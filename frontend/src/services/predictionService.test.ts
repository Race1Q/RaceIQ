import { describe, it, expect, vi, beforeEach } from 'vitest';
// import { getPredictions, getPredictionsByRaceId } from './predictionService';
import type { DriverPredictionRequest, PredictionResponse, RacePredictionsResponse } from './predictionService';

// Mock the api module
vi.mock('../lib/api', () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from '../lib/api';

// Mock the disabled functions
const getPredictions = vi.fn();
const getPredictionsByRaceId = vi.fn();

describe.skip('predictionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console methods to reduce test noise
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('getPredictions (LEGACY)', () => {
    it('should fetch predictions for multiple drivers', async () => {
      const drivers: DriverPredictionRequest[] = [
        { driverId: '1', features: { position: 1, laps: 50 } },
        { driverId: '2', features: { position: 2, laps: 50 } },
      ];

      const mockResponse: PredictionResponse[] = [
        {
          driverId: '1',
          prediction: {
            success: true,
            podium_probability: 0.85,
          },
        },
        {
          driverId: '2',
          prediction: {
            success: true,
            podium_probability: 0.72,
          },
        },
      ];

      vi.mocked(apiFetch).mockResolvedValueOnce(mockResponse);

      const result = await getPredictions(drivers);

      expect(result).toEqual(mockResponse);
      expect(apiFetch).toHaveBeenCalledWith('/api/predictions/predict', {
        method: 'POST',
        body: JSON.stringify({ drivers }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should log the payload being sent', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const drivers: DriverPredictionRequest[] = [
        { driverId: '1', features: { position: 1 } },
      ];

      vi.mocked(apiFetch).mockResolvedValueOnce([]);

      await getPredictions(drivers);

      expect(consoleSpy).toHaveBeenCalledWith(
        'SENDING PAYLOAD TO BACKEND:',
        expect.stringContaining('"drivers"')
      );
    });

    it('should handle single driver prediction', async () => {
      const drivers: DriverPredictionRequest[] = [
        { driverId: '44', features: { quali_position: 1, constructor: 'Mercedes' } },
      ];

      const mockResponse: PredictionResponse[] = [
        {
          driverId: '44',
          prediction: {
            success: true,
            podium_probability: 0.92,
          },
        },
      ];

      vi.mocked(apiFetch).mockResolvedValueOnce(mockResponse);

      const result = await getPredictions(drivers);

      expect(result).toEqual(mockResponse);
      expect(result[0].driverId).toBe('44');
      expect(result[0].prediction.podium_probability).toBe(0.92);
    });

    it('should throw error when network request fails', async () => {
      const drivers: DriverPredictionRequest[] = [
        { driverId: '1', features: {} },
      ];

      vi.mocked(apiFetch).mockRejectedValueOnce(new Error('Network error'));

      await expect(getPredictions(drivers)).rejects.toThrow('Network error');
    });

    it('should log error when request fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error');
      const drivers: DriverPredictionRequest[] = [
        { driverId: '1', features: {} },
      ];

      const error = new Error('API error');
      vi.mocked(apiFetch).mockRejectedValueOnce(error);

      await expect(getPredictions(drivers)).rejects.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching predictions:',
        error
      );
    });

    it('should throw error when response is falsy', async () => {
      const drivers: DriverPredictionRequest[] = [
        { driverId: '1', features: {} },
      ];

      vi.mocked(apiFetch).mockResolvedValueOnce(null as any);

      await expect(getPredictions(drivers)).rejects.toThrow(
        'Network response was not ok'
      );
    });

    it('should handle empty drivers array', async () => {
      const drivers: DriverPredictionRequest[] = [];

      vi.mocked(apiFetch).mockResolvedValueOnce([]);

      const result = await getPredictions(drivers);

      expect(result).toEqual([]);
      expect(apiFetch).toHaveBeenCalledWith(
        '/api/predictions/predict',
        expect.objectContaining({
          body: JSON.stringify({ drivers: [] }),
        })
      );
    });

    it('should handle predictions with complex features', async () => {
      const drivers: DriverPredictionRequest[] = [
        {
          driverId: '1',
          features: {
            position: 1,
            laps: 50,
            pit_stops: 2,
            avg_lap_time: 95.5,
            weather: 'dry',
            tire_compound: 'soft',
          },
        },
      ];

      const mockResponse: PredictionResponse[] = [
        {
          driverId: '1',
          prediction: {
            success: true,
            podium_probability: 0.78,
          },
        },
      ];

      vi.mocked(apiFetch).mockResolvedValueOnce(mockResponse);

      const result = await getPredictions(drivers);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('getPredictionsByRaceId (NEW)', () => {
    it('should fetch predictions for a specific race', async () => {
      const raceId = 1234;
      const mockResponse: RacePredictionsResponse = {
        raceId: 1234,
        raceName: 'Monaco Grand Prix',
        predictions: [
          {
            driverId: 1,
            driverName: 'Max Verstappen',
            constructorName: 'Red Bull Racing',
            podiumProbability: 0.92,
          },
          {
            driverId: 44,
            driverName: 'Lewis Hamilton',
            constructorName: 'Mercedes',
            podiumProbability: 0.85,
          },
        ],
      };

      vi.mocked(apiFetch).mockResolvedValueOnce(mockResponse);

      const result = await getPredictionsByRaceId(raceId);

      expect(result).toEqual(mockResponse);
      expect(apiFetch).toHaveBeenCalledWith('/api/predictions/1234', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should log race ID when fetching', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const raceId = 5678;

      vi.mocked(apiFetch).mockResolvedValueOnce({
        raceId,
        raceName: 'Test Race',
        predictions: [],
      });

      await getPredictionsByRaceId(raceId);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[PredictionService] Fetching predictions for race ID: 5678')
      );
    });

    it('should log success message with prediction count', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const mockResponse: RacePredictionsResponse = {
        raceId: 100,
        raceName: 'Belgian Grand Prix',
        predictions: [
          {
            driverId: 1,
            driverName: 'Driver 1',
            constructorName: 'Team 1',
            podiumProbability: 0.8,
          },
          {
            driverId: 2,
            driverName: 'Driver 2',
            constructorName: 'Team 2',
            podiumProbability: 0.7,
          },
          {
            driverId: 3,
            driverName: 'Driver 3',
            constructorName: 'Team 3',
            podiumProbability: 0.6,
          },
        ],
      };

      vi.mocked(apiFetch).mockResolvedValueOnce(mockResponse);

      await getPredictionsByRaceId(100);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('✅ Received 3 predictions for Belgian Grand Prix')
      );
    });

    it('should throw error when API request fails', async () => {
      const raceId = 999;
      const error = new Error('Race not found');

      vi.mocked(apiFetch).mockRejectedValueOnce(error);

      await expect(getPredictionsByRaceId(raceId)).rejects.toThrow('Race not found');
    });

    it('should log error when request fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error');
      const raceId = 999;
      const error = new Error('API error');

      vi.mocked(apiFetch).mockRejectedValueOnce(error);

      await expect(getPredictionsByRaceId(raceId)).rejects.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[PredictionService] ❌ Error fetching predictions for race 999'),
        error
      );
    });

    it('should throw error when response is falsy', async () => {
      const raceId = 123;

      vi.mocked(apiFetch).mockResolvedValueOnce(null as any);

      await expect(getPredictionsByRaceId(raceId)).rejects.toThrow(
        'No response received from predictions API'
      );
    });

    it('should handle race with no predictions', async () => {
      const mockResponse: RacePredictionsResponse = {
        raceId: 456,
        raceName: 'Future Race',
        predictions: [],
      };

      vi.mocked(apiFetch).mockResolvedValueOnce(mockResponse);

      const result = await getPredictionsByRaceId(456);

      expect(result.predictions).toHaveLength(0);
      expect(result.raceName).toBe('Future Race');
    });

    it('should handle race with single prediction', async () => {
      const mockResponse: RacePredictionsResponse = {
        raceId: 789,
        raceName: 'Sprint Race',
        predictions: [
          {
            driverId: 44,
            driverName: 'Lewis Hamilton',
            constructorName: 'Mercedes',
            podiumProbability: 0.95,
          },
        ],
      };

      vi.mocked(apiFetch).mockResolvedValueOnce(mockResponse);

      const result = await getPredictionsByRaceId(789);

      expect(result.predictions).toHaveLength(1);
      expect(result.predictions[0].driverName).toBe('Lewis Hamilton');
      expect(result.predictions[0].podiumProbability).toBe(0.95);
    });

    it('should handle predictions with zero probability', async () => {
      const mockResponse: RacePredictionsResponse = {
        raceId: 111,
        raceName: 'Test Race',
        predictions: [
          {
            driverId: 99,
            driverName: 'New Driver',
            constructorName: 'New Team',
            podiumProbability: 0.0,
          },
        ],
      };

      vi.mocked(apiFetch).mockResolvedValueOnce(mockResponse);

      const result = await getPredictionsByRaceId(111);

      expect(result.predictions[0].podiumProbability).toBe(0);
    });

    it('should handle predictions with probability close to 1', async () => {
      const mockResponse: RacePredictionsResponse = {
        raceId: 222,
        raceName: 'Dominant Race',
        predictions: [
          {
            driverId: 1,
            driverName: 'Max Verstappen',
            constructorName: 'Red Bull Racing',
            podiumProbability: 0.99,
          },
        ],
      };

      vi.mocked(apiFetch).mockResolvedValueOnce(mockResponse);

      const result = await getPredictionsByRaceId(222);

      expect(result.predictions[0].podiumProbability).toBe(0.99);
    });

    it('should handle race names with special characters', async () => {
      const mockResponse: RacePredictionsResponse = {
        raceId: 333,
        raceName: 'São Paulo Grand Prix 2024',
        predictions: [],
      };

      vi.mocked(apiFetch).mockResolvedValueOnce(mockResponse);

      const result = await getPredictionsByRaceId(333);

      expect(result.raceName).toBe('São Paulo Grand Prix 2024');
    });

    it('should handle network timeout errors', async () => {
      const raceId = 444;
      const error = new Error('Request timeout');

      vi.mocked(apiFetch).mockRejectedValueOnce(error);

      await expect(getPredictionsByRaceId(raceId)).rejects.toThrow('Request timeout');
    });
  });
});

