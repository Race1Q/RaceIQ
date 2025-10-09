import { useState, useEffect } from 'react';
import { buildApiUrl } from '../lib/api';

export interface NewsCitation {
  title: string;
  url: string;
  source: string;
  publishedAt?: string;
}

export interface AiNewsData {
  summary: string;
  bullets: string[];
  citations: NewsCitation[];
  generatedAt: string;
  ttlSeconds: number;
  isFallback?: boolean;
}

export const useAiNews = (topic: string = 'f1') => {
  const [data, setData] = useState<AiNewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = buildApiUrl(`/api/ai/news?topic=${encodeURIComponent(topic)}`);
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch news: ${response.status} ${response.statusText}`);
        }

        const newsData = await response.json();
        setData(newsData);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error occurred');
        setError(error);
        console.error('Error fetching AI news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [topic]);

  return { data, loading, error };
};

