// frontend/src/hooks/useDriverStandings.ts
import { useState, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { useAuth0 } from '@auth0/auth0-react';
import { buildApiUrl } from '../lib/api';

export interface DriverStanding {
  id: number;
  fullName: string;
  number: number | null;
  country: string;
  profileImageUrl: string | null;
  constructor: string;
  points: number;
  wins: number;
  podiums: number;
  position: number;
  seasonYear: number;
}

export const useDriverStandings = (season: number) => {
  const [standings, setStandings] = useState<DriverStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getAccessTokenSilently } = useAuth0();
  const toast = useToast();

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = await getAccessTokenSilently();
        const response = await fetch(buildApiUrl(`/api/drivers/standings/${season}`), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const dataFromApi = await response.json();
        console.log('Raw Driver Standings from API: ', dataFromApi);

        // Map API fields to frontend interface
        const mapped: DriverStanding[] = dataFromApi.map((d: any) => ({
          id: d.id,
          fullName: d.fullname || d.fullName || 'Unknown',
          number: d.number ?? null,
          country: d.country ?? 'N/A',
          profileImageUrl: d.profileimageurl ?? null,
          constructor: d.constructor ?? 'Unknown',
          points: d.points ?? 0,
          wins: d.wins ?? 0,
          podiums: d.podiums ?? 0,
          position: d.position ?? 0,
          seasonYear: d.seasonyear ?? season,
        }));

        setStandings(mapped);
        console.log('Processed (Hydrated) Drivers: ', mapped);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load standings.';
        setError(errorMessage);
        toast({
          title: 'Could not fetch driver standings',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStandings();
  }, [season, getAccessTokenSilently, toast]);

  return { standings, loading, error };
};


