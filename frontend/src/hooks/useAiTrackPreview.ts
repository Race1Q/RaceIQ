import { useState, useEffect } from 'react';
import { buildApiUrl } from '../lib/api';

export interface AiTrackPreviewData {
  trackSlug: string;
  eventId?: number;
  intro: string;
  strategyNotes: string[];
  weatherAngle?: string;
  historyBlurb?: string;
  generatedAt: string;
  isFallback?: boolean;
}

export const useAiTrackPreview = (slug: string, eventId?: number) => {
  const [data, setData] = useState<AiTrackPreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        setLoading(true);
        setError(null);

        const eventParam = eventId ? `?eventId=${eventId}` : '';
        const url = buildApiUrl(`/api/ai/track/${encodeURIComponent(slug)}/preview${eventParam}`);
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch track preview: ${response.status} ${response.statusText}`);
        }

        const previewData = await response.json();
        setData(previewData);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error occurred');
        setError(error);
        console.error('Error fetching AI track preview:', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPreview();
    }
  }, [slug, eventId]);

  return { data, loading, error };
};

