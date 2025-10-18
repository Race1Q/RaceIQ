// frontend/src/hooks/useDriversData.ts

import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@chakra-ui/react';
import { buildApiUrl } from '../lib/api';
import { teamColors } from '../lib/teamColors';
import { fallbackDriverStandings } from '../lib/fallbackData/driverStandings';
import type { Driver } from '../types';

type GroupedDrivers = { [teamName: string]: Driver[] };

export const useDriversData = (year: number) => {
  const toast = useToast();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    let alive = true; // Cleanup flag to prevent state updates on unmounted component
    
    const fetchDriverStandings = async () => {
      try {
        if (!alive) return; // Early exit if unmounted
        setLoading(true);
        setError(null);
        
        // Backend expects /standings/:year/:round. Use a high round to include all completed rounds.
        const response = await fetch(buildApiUrl(`/api/standings/${year}/99`));
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();

        if (!alive) return; // Check again after async operation

        const driverStandings = (data as any)?.driverStandings || [];

        // REVISED MAPPING: flattened fields on standing
        const hydratedDrivers = (driverStandings as any[])
          .map((standing: any) => {
            if (!standing || !standing.driverId) return null;
            const teamName = standing.constructorName || 'Unknown Team';
            const fullName = standing.driverFullName || `${standing.driverFirstName || ''} ${standing.driverLastName || ''}`.trim();
            return {
              id: standing.driverId as number,
              fullName,
              driverNumber: standing.driverNumber ?? null,
              countryCode: standing.driverCountryCode ?? null,
              teamName,
              headshotUrl: standing.driverProfileImageUrl || '',
              teamColor: teamColors[teamName] ? `#${teamColors[teamName]}` : `#${teamColors['Default']}`,
            } as Driver;
          })
          .filter(Boolean) as Driver[];

        if (alive) {
          setDrivers(hydratedDrivers);
        }

      } catch (err: unknown) {
        if (!alive) return; // Don't update state if unmounted
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
        console.error('Failed to fetch driver standings, loading fallback data.', errorMessage);
        setError(errorMessage);
        setDrivers(fallbackDriverStandings);
        setIsFallback(true);
        toast({
          title: 'Could not fetch live data',
          description: 'Displaying cached driver standings.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    fetchDriverStandings();
    
    return () => {
      alive = false; // Mark as unmounted to prevent state updates
    };
  }, [year, toast]);

  // Memoize the grouped data so it's only recalculated when drivers change
  const { orderedTeamNames, groupedDrivers } = useMemo(() => {
    const groups = drivers.reduce<GroupedDrivers>((acc, driver) => {
      const team = driver.teamName;
      if (!acc[team]) acc[team] = [];
      acc[team].push(driver);
      return acc;
    }, {} as GroupedDrivers);
    
    // The API already returns drivers sorted by standing, so the team order is derived correctly
    const orderedTeams = [...new Set(drivers.map(d => d.teamName))];
    
    return { orderedTeamNames: orderedTeams, groupedDrivers: groups };
  }, [drivers]);

  return { drivers, loading, error, isFallback, orderedTeamNames, groupedDrivers };
};


