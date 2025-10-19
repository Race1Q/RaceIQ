import { useState, useEffect } from 'react';
import { getPredictionsByRaceId, type RacePredictionsResponse, type DriverPrediction } from '../services/predictionService';

export interface UsePredictionsReturn {
  /** Loading state - true while fetching data */
  loading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Complete predictions response from API */
  data: RacePredictionsResponse | null;
  /** Array of predictions sorted by probability (descending) */
  predictions: DriverPrediction[];
  /** Top 3 predictions for quick access */
  topThree: DriverPrediction[];
  /** Refetch predictions manually */
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching and managing race predictions
 * 
 * @param raceId - The ID of the race to fetch predictions for (null to skip fetching)
 * @returns Predictions data, loading state, error state, and utility functions
 * 
 * @example
 * ```typescript
 * const { predictions, loading, error, topThree } = usePredictions(1234);
 * 
 * if (loading) return <Spinner />;
 * if (error) return <ErrorMessage>{error}</ErrorMessage>;
 * 
 * return (
 *   <div>
 *     {topThree.map(p => <PredictionCard key={p.driverId} prediction={p} />)}
 *   </div>
 * );
 * ```
 */
export function usePredictions(raceId: number | null): UsePredictionsReturn {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RacePredictionsResponse | null>(null);

  const fetchPredictions = async () => {
    if (raceId === null) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await getPredictionsByRaceId(raceId);
      setData(response);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load predictions';
      setError(errorMessage);
      setData(null);
      console.error('[usePredictions] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, [raceId]);

  const predictions = data?.predictions || [];
  const topThree = predictions.slice(0, 3);

  return {
    loading,
    error,
    data,
    predictions,
    topThree,
    refetch: fetchPredictions,
  };
}
