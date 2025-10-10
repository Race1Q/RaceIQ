import { useState, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { useAuth0 } from '@auth0/auth0-react';
import { apiFetch } from '../lib/api';

export interface ProgressionData {
  year: number;
  round: number;
  race_name: string;
  driver_id: number;
  points: number;
  cumulative_points: number;
}

export const useDriverSeasonProgression = (driverId?: string) => {
  const [progressionData, setProgressionData] = useState<ProgressionData[]>([]);
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

    const fetchProgressionData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = await getAccessTokenSilently();
        const data = await apiFetch<ProgressionData[]>(`/api/drivers/${driverId}/current-season-progression`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Sort by round to ensure proper race order
        const sortedData = data.sort((a, b) => a.round - b.round);
        setProgressionData(sortedData);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load driver season progression.';
        console.error("Driver Season Progression API failed:", errorMessage);
        setError(errorMessage);
        setProgressionData([]);
        
        toast({
          title: 'Could not fetch season progression',
          description: 'Current season progression data is currently unavailable.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProgressionData();
  }, [driverId, getAccessTokenSilently, toast]);

  return { progressionData, loading, error };
};
