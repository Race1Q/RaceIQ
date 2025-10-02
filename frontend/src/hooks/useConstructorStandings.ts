import { useState, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { useAuth0 } from '@auth0/auth0-react';
import { buildApiUrl } from '../lib/api';

export interface ConstructorStandingRow {
  seasonYear: number;
  constructorId: number;
  constructorName: string;
  seasonPoints: number;
  seasonWins: number;
  seasonPodiums: number;
  position: number;
}

export const useConstructorStandings = (seasonYear: number) => {
  const [standings, setStandings] = useState<ConstructorStandingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
            scope: 'read:race-results read:races',
          },
        });

        // Get all constructors first
        const constructorsResponse = await fetch(buildApiUrl('/api/constructors'), {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!constructorsResponse.ok) {
          throw new Error('Failed to fetch constructors');
        }
        
        const constructors = await constructorsResponse.json();
        
        // Get season data to find season ID
        const seasonsResponse = await fetch(buildApiUrl('/api/seasons'), {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!seasonsResponse.ok) {
          throw new Error('Failed to fetch seasons');
        }
        
        const seasons = await seasonsResponse.json();
        const targetSeason = seasons.find((s: any) => s.year === seasonYear);
        
        if (!targetSeason) {
          throw new Error(`Season ${seasonYear} not found`);
        }

        // Fetch standings data for each constructor
        const standingsPromises = constructors.map(async (constructor: any) => {
          try {
            const response = await fetch(
              buildApiUrl(`/api/race-results/constructor/${constructor.id}/season-points`),
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            
            if (!response.ok) {
              console.warn(`Failed to fetch data for constructor ${constructor.name}`);
              return null;
            }
            
            const seasonPoints = await response.json();
            const currentSeasonData = seasonPoints.find((sp: any) => sp.season === targetSeason.id);
            
            if (!currentSeasonData) {
              return null;
            }
            
            return {
              seasonYear: seasonYear,
              constructorId: constructor.id,
              constructorName: constructor.name,
              seasonPoints: currentSeasonData.points || 0,
              seasonWins: currentSeasonData.wins || 0,
              seasonPodiums: currentSeasonData.podiums || 0,
              position: 0, // Will be calculated after sorting
            };
          } catch (err) {
            console.warn(`Error fetching data for constructor ${constructor.name}:`, err);
            return null;
          }
        });

        const standingsData = (await Promise.all(standingsPromises))
          .filter(Boolean)
          .sort((a, b) => (b?.seasonPoints || 0) - (a?.seasonPoints || 0))
          .map((standing, index) => ({
            ...standing!,
            position: index + 1,
          }));

        setStandings(standingsData);
      } catch (err: any) {
        const message = err?.message || 'Failed to fetch constructor standings.';
        setError(message);
        toast({
          title: 'Constructor standings error',
          description: message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [seasonYear, toast, getAccessTokenSilently]);

  return { standings, loading, error };
};
