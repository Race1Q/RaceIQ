import { useState, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { useAuth0 } from '@auth0/auth0-react';
import { apiFetch } from '../lib/api';

export interface SeasonStatsData {
  year: number;
  driver_id: number;
  total_points: number;
  wins: number;
  podiums: number;
  poles: number;
}

export const useDriverSeasonStats = (driverId?: string) => {
  const [seasonStats, setSeasonStats] = useState<SeasonStatsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getAccessTokenSilently } = useAuth0();
  const toast = useToast();

  useEffect(() => {
    if (!driverId) {
      setError("Driver ID not found.");
      setLoading(false);
      return;
    }

    const fetchSeasonStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = await getAccessTokenSilently();
        const data = await apiFetch<SeasonStatsData[]>(`/api/drivers/${driverId}/season-stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Sort by year to ensure proper chronological order
        const sortedData = data.sort((a, b) => a.year - b.year);
        setSeasonStats(sortedData);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load driver season stats.';
        console.error("Driver Season Stats API failed:", errorMessage);
        setError(errorMessage);
        setSeasonStats([]);
        
        toast({
          title: 'Could not fetch season statistics',
          description: 'Season trend data is currently unavailable.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSeasonStats();
  }, [driverId, getAccessTokenSilently, toast]);

  return { seasonStats, loading, error };
};
