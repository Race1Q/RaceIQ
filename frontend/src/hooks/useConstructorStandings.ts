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

export const useConstructorStandings = (
  seasonYear: number,
  options?: { enabled?: boolean }
) => {
  const [standings, setStandings] = useState<ConstructorStandingRow[]>([]);
  const enabled = options?.enabled ?? true;
  const [loading, setLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    if (!enabled) {
      // Public mode: compute standings without auth using public endpoints
      const fetchPublic = async () => {
        setLoading(true);
        setError(null);
        try {
          // 1) Find target season ID by year
          const seasonsRes = await fetch(buildApiUrl('/api/seasons'));
          if (!seasonsRes.ok) throw new Error('Failed to fetch seasons');
          const seasons = await seasonsRes.json();
          const targetSeason = seasons.find((s: any) => s.year === seasonYear);
          if (!targetSeason) {
            setStandings([]);
            return;
          }

          // 2) Get constructors list
          const constructorsRes = await fetch(buildApiUrl('/api/constructors'));
          if (!constructorsRes.ok) throw new Error('Failed to fetch constructors');
          const constructors = await constructorsRes.json();

          // 3) For each constructor, fetch season points (public endpoint)
          const standingsPromises = constructors.map(async (constructor: any) => {
            try {
              const resp = await fetch(buildApiUrl(`/api/race-results/constructor/${constructor.id}/season-points`));
              if (!resp.ok) return null;
              const seasonPoints = await resp.json();
              const current = seasonPoints.find((sp: any) => sp.season === targetSeason.id);
              if (!current) return null;
              return {
                seasonYear,
                constructorId: constructor.id,
                constructorName: constructor.name,
                seasonPoints: current.points || 0,
                seasonWins: current.wins || 0,
                seasonPodiums: current.podiums || 0,
                position: 0,
              } as ConstructorStandingRow;
            } catch {
              return null;
            }
          });

          const standingsData = (await Promise.all(standingsPromises))
            .filter(Boolean) as ConstructorStandingRow[];

          // 4) Sort and assign positions
          standingsData.sort((a, b) => (b.seasonPoints || 0) - (a.seasonPoints || 0));
          const withPositions = standingsData.map((s, idx) => ({ ...s, position: idx + 1 }));
          setStandings(withPositions);
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

      fetchPublic();
      return;
    }

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
  }, [seasonYear, toast, getAccessTokenSilently, enabled]);

  return { standings, loading, error };
};
