// frontend/src/hooks/useDriverComparison.ts

import { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useToast } from '@chakra-ui/react';
import { buildApiUrl } from '../lib/api';
import { driverHeadshots } from '../lib/driverHeadshots';
import { teamColors } from '../lib/teamColors'; // color hex map per team

// Shared interfaces
export interface DriverListItem {
  id: number;
  full_name: string;
}

export interface DriverDetails {
  id: number;
  fullName: string;
  teamName: string;
  wins: number;
  podiums: number;
  points: number;
  championshipStanding: string;
  imageUrl: string;
  teamColorToken: string;
}

export const useDriverComparison = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const toast = useToast();

  const [allDrivers, setAllDrivers] = useState<DriverListItem[]>([]);
  const [driver1, setDriver1] = useState<DriverDetails | null>(null);
  const [driver2, setDriver2] = useState<DriverDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authedFetch = useCallback(async (path: string) => {
    const token = await getAccessTokenSilently({
      authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
    });
    const response = await fetch(buildApiUrl(path), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
  }, [getAccessTokenSilently]);

  useEffect(() => {
    const fetchDriverList = async () => {
      if (!isAuthenticated) return;
      setLoading(true);
      setError(null);
      try {
        const driversList = await authedFetch('/api/drivers/by-standings/2025');
        setAllDrivers(driversList.map((d: any) => ({ id: d.id, full_name: d.full_name })));
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Could not load drivers list.';
        setError(msg);
        toast({ title: 'Error', description: msg, status: 'error', variant: 'solid' });
      } finally {
        setLoading(false);
      }
    };
    fetchDriverList();
  }, [authedFetch, toast, isAuthenticated]);

  const handleSelectDriver = async (driverNumber: 1 | 2, driverId: string) => {
    const setDriver = driverNumber === 1 ? setDriver1 : setDriver2;
    if (!driverId) {
      setDriver(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [details, performance] = await Promise.all([
        authedFetch(`/api/drivers/${driverId}/details`),
        authedFetch(`/api/drivers/${driverId}/performance/2025`),
      ]);

      const teamName = details.team?.name ?? details.teamName;
      const teamColorToken = teamColors[teamName] ? `#${teamColors[teamName]}` : 'gray.500';

      const hydratedData: DriverDetails = {
        id: details.id ?? Number(driverId),
        fullName: details.fullName,
        teamName,
        wins: details.careerStats?.wins ?? 0,
        podiums: details.careerStats?.podiums ?? 0,
        points: details.careerStats?.totalPoints ?? 0,
        championshipStanding: `P${performance.position ?? 'N/A'}`,
        imageUrl: driverHeadshots[details.fullName] || '',
        teamColorToken,
      };
      setDriver(hydratedData);
    } catch (err) {
      const msg = err instanceof Error ? err.message : `Failed to load data for driver ${driverId}.`;
      setError(msg);
      toast({ title: 'Error', description: msg, status: 'error', variant: 'solid' });
    } finally {
      setLoading(false);
    }
  };

  return { allDrivers, driver1, driver2, loading, error, handleSelectDriver };
};