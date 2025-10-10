import { useState, useEffect } from 'react';
import { buildApiUrl } from '../lib/api';

export interface AiDriverFunFactsData {
  driverId: number;
  season: number | null;
  title: string;
  facts: string[];
  generatedAt: string;
  isFallback?: boolean;
}

export const useAiDriverFunFacts = (driverId?: number, season?: number) => {
  const [data, setData] = useState<AiDriverFunFactsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchFunFacts = async () => {
      if (!driverId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const seasonParam = season ? `?season=${season}` : '';
        const url = buildApiUrl(`/api/ai/driver/${driverId}/fun-facts${seasonParam}`);
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch fun facts: ${response.status} ${response.statusText}`);
        }

        const funFactsData = await response.json();
        setData(funFactsData);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error occurred');
        setError(error);
        console.error('Error fetching AI driver fun facts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFunFacts();
  }, [driverId, season]);

  return { data, loading, error };
};
