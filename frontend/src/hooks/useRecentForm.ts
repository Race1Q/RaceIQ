// frontend/src/hooks/useRecentForm.ts
import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { apiFetch } from '../lib/api';

export interface RecentFormResult {
  position: number;
  raceName: string;
  countryCode: string;
}

export const useRecentForm = (driverId?: string) => {
  const { getAccessTokenSilently } = useAuth0();
  const [recentForm, setRecentForm] = useState<RecentFormResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!driverId) {
      setRecentForm([]);
      setLoading(false);
      setError(null);
      return;
    }

    let alive = true;

    const fetchRecentForm = async () => {
      try {
        if (!alive) return;
        setLoading(true);
        setError(null);

        const token = await getAccessTokenSilently();
        const response = await apiFetch<RecentFormResult[]>(`/api/drivers/${driverId}/recent-form`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (alive) {
          setRecentForm(response);
        }
      } catch (err) {
        if (!alive) return;
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch recent form';
        setError(errorMessage);
        console.error('Recent form fetch error:', errorMessage);
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    fetchRecentForm();

    return () => {
      alive = false;
    };
  }, [driverId, getAccessTokenSilently]);

  return { recentForm, loading, error };
};
