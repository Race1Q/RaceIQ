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
    const fetchDriverStandings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Backend expects /standings/:year/:round. Use a high round to include all completed rounds.
        const response = await fetch(buildApiUrl(`/api/standings/${year}/99`));
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();

        // NEW DEBUGGING: Raw payload and first standing shape
        console.log("Raw API Response from /api/standings:", data);
        const driverStandings = (data as any)?.driverStandings || [];
        if (driverStandings.length > 0) {
          console.log("Inspecting FIRST raw standing object:", driverStandings[0]);
        }

        // REVISED MAPPING: flattened fields on standing
        const hydratedDrivers = (driverStandings as any[])
          .map((standing: any) => {
            if (!standing || !standing.driverId) return null;
            const teamName = standing.constructorName || 'Unknown Team';
            const fullName = standing.driverFullName || `${standing.driverFirstName || ''} ${standing.driverLastName || ''}`.trim();
            const headshotUrl = standing.driverProfileImageUrl || '';
            
            // DEBUG: Track image URL resolution for drivers page
            console.log(`🔍 Drivers Page Image Debug for ${fullName}:`, {
              driverId: standing.driverId,
              fullName,
              standing: {
                driverProfileImageUrl: standing.driverProfileImageUrl
              },
              resolvedHeadshotUrl: headshotUrl,
              hasHeadshotUrl: !!headshotUrl
            });
            
            return {
              id: standing.driverId as number,
              fullName,
              driverNumber: standing.driverNumber ?? null,
              countryCode: standing.driverCountryCode ?? null,
              teamName,
              headshotUrl,
              teamColor: teamColors[teamName] ? `#${teamColors[teamName]}` : `#${teamColors['Default']}`,
            } as Driver;
          })
          .filter(Boolean) as Driver[];

        console.log("Processed (Hydrated) Drivers:", hydratedDrivers);
        
        setDrivers(hydratedDrivers);

      } catch (err: unknown) {
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
        setLoading(false);
      }
    };

    fetchDriverStandings();
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


