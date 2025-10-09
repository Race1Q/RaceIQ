import { useState, useEffect } from 'react';
import { buildApiUrl } from '../lib/api';

export interface AiStandingsAnalysisDto {
  overview: string;
  keyInsights: string[];
  driverAnalysis: {
    leader: string;
    biggestRiser: string;
    biggestFall: string;
    midfieldBattle: string;
  };
  constructorAnalysis: {
    leader: string;
    competition: string;
    surprises: string;
  };
  trends: string[];
  predictions: string[];
  generatedAt: string;
  isFallback: boolean;
}

export const useAiStandingsAnalysis = (season?: number) => {
  const [data, setData] = useState<AiStandingsAnalysisDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAiStandingsAnalysis = async () => {
      setLoading(true);
      setError(null);
      try {
        const seasonQuery = season ? `?season=${season}` : '';
        const response = await fetch(buildApiUrl(`/api/ai/standings/analysis${seasonQuery}`));
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

    fetchAiStandingsAnalysis();
  }, [season]);

  return { data, loading, error };
};
