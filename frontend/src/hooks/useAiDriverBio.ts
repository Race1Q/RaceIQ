import { useState, useEffect } from 'react';
import { buildApiUrl } from '../lib/api';

export interface AiDriverBioData {
  driverId: number;
  season: number | null;
  title: string;
  teaser: string;
  paragraphs: string[];
  highlights: string[];
  generatedAt: string;
  isFallback?: boolean;
}

export const useAiDriverBio = (driverId: number, season?: number) => {
  const [data, setData] = useState<AiDriverBioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchBio = async () => {
      try {
        setLoading(true);
        setError(null);

        const seasonParam = season ? `?season=${season}` : '';
        const url = buildApiUrl(`/api/ai/driver/${driverId}/bio${seasonParam}`);
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch driver bio: ${response.status} ${response.statusText}`);
        }

        const bioData = await response.json();
        setData(bioData);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error occurred');
        setError(error);
        console.error('Error fetching AI driver bio:', error);
      } finally {
        setLoading(false);
      }
    };

    if (driverId) {
      fetchBio();
    }
  }, [driverId, season]);

  return { data, loading, error };
};

