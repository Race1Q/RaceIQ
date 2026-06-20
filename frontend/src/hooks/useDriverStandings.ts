// frontend/src/hooks/useDriverStandings.ts
import { useState, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { useAuth0 } from '@auth0/auth0-react';
import { buildApiUrl } from '../lib/api';
import { resolveFetchedSeasonYear } from '../lib/seasonYear';

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
    let alive = true; // Cleanup flag to prevent state updates on unmounted component
    
    const fetchStandings = async () => {
      try {
        if (!alive) return; // Early exit if unmounted
        setLoading(true);
        setError(null);

        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          },
        });
        
        if (!alive) return; // Check after async operation

        let seasonYears: number[] = [];
        try {
          const seasonsRes = await fetch(buildApiUrl('/api/seasons'), {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (seasonsRes.ok) {
            const seasonsJson = await seasonsRes.json();
            if (Array.isArray(seasonsJson)) {
              seasonYears = seasonsJson
                .map((s: { year?: number }) => s.year)
                .filter((y: unknown): y is number => typeof y === 'number' && Number.isFinite(y));
            }
          }
        } catch {
          // ignore; resolveFetchedSeasonYear handles empty list
        }

        const effectiveSeason = resolveFetchedSeasonYear(season, seasonYears);

        const response = await fetch(buildApiUrl(`/api/drivers/standings/${effectiveSeason}`), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const dataFromApi = await response.json();

        if (!alive) return; // Check after async operation

        console.log('Raw Driver Standings from API: ', dataFromApi);

        // The materialized standings endpoint above does not expose driver images,
        // so enrich from the round-based standings endpoint (same source the Drivers
        // page uses), which returns driverProfileImageUrl. Keyed by driver id.
        let imageById = new Map<number, string>();
        try {
          const imgRes = await fetch(buildApiUrl(`/api/standings/${effectiveSeason}/99`), {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (imgRes.ok) {
            const imgJson = await imgRes.json();
            const list = Array.isArray(imgJson?.driverStandings) ? imgJson.driverStandings : [];
            imageById = new Map(
              list
                .filter((r: any) => r?.driverId != null && r?.driverProfileImageUrl)
                .map((r: any) => [Number(r.driverId), String(r.driverProfileImageUrl)]),
            );
          }
        } catch {
          // Non-fatal: fall back to the name-based headshot map in getDriverHeadshot.
        }

        if (!alive) return;

        // Map API fields to frontend interface
        const mapped: DriverStanding[] = dataFromApi.map((d: any) => ({
          id: d.id,
          fullName: d.fullname || d.fullName || 'Unknown',
          number: d.number ?? null,
          country: d.country ?? 'N/A',
          profileImageUrl: imageById.get(Number(d.id)) ?? d.profileimageurl ?? null,
          constructor: d.constructor ?? 'Unknown',
          points: d.points ?? 0,
          wins: d.wins ?? 0,
          podiums: d.podiums ?? 0,
          position: d.position ?? 0,
          seasonYear: d.seasonyear ?? effectiveSeason,
        }));

        if (alive) {
          setStandings(mapped);
          console.log('Processed (Hydrated) Drivers: ', mapped);
        }

      } catch (err) {
        if (!alive) return; // Don't update state if unmounted
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
        if (alive) {
          setLoading(false);
        }
      }
    };

    fetchStandings();
    
    return () => {
      alive = false; // Mark as unmounted to prevent state updates
    };
  }, [season, getAccessTokenSilently, toast]);

  return { standings, loading, error };
};


