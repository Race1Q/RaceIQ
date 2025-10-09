import { useState, useEffect } from 'react';
import { buildApiUrl } from '../lib/api';

export interface AiConstructorInfoDto {
  overview: string;
  history: string;
  strengths: string[];
  challenges: string[];
  notableAchievements: string[];
  currentSeason: {
    performance: string;
    highlights: string[];
    outlook: string;
  };
  generatedAt: string;
  isFallback: boolean;
}

export const useAiConstructorInfo = (constructorId: number, season?: number) => {
  const [data, setData] = useState<AiConstructorInfoDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!constructorId) {
      setLoading(false);
      return;
    }

    const fetchAiConstructorInfo = async () => {
      setLoading(true);
      setError(null);
      try {
        const seasonQuery = season ? `?season=${season}` : '';
        const response = await fetch(buildApiUrl(`/api/ai/constructor/${constructorId}/info${seasonQuery}`));
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const json = await response.json();
        setData(json);
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchAiConstructorInfo();
  }, [constructorId, season]);

  return { data, loading, error };
};
