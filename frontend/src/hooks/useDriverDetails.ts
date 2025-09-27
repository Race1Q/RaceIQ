// frontend/src/hooks/useDriverDetails.ts
import { useState, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { useAuth0 } from '@auth0/auth0-react';
import { buildApiUrl } from '../lib/api';
import { driverHeadshots } from '../lib/driverHeadshots';
import { fallbackDriverDetails } from '../lib/fallbackData/driverDetails';
import type { DriverDetailsData, DriverStatsResponse, RecentFormItem, StandingsResponse } from '../types';

export const useDriverDetails = (driverId?: string) => {
  const [driverDetails, setDriverDetails] = useState<DriverDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const { getAccessTokenSilently } = useAuth0();
  const toast = useToast();

  useEffect(() => {
    if (!driverId) {
      setError("Driver ID not found in URL.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        setIsFallback(false);
        const token = await getAccessTokenSilently();
        const currentYear = new Date().getFullYear();

        const [statsRes, standingsRes, recentFormRes] = await Promise.all([
          fetch(buildApiUrl(`/api/drivers/${driverId}/stats`), { headers: { Authorization: `Bearer ${token}` } }),
          fetch(buildApiUrl(`/api/standings/${currentYear}/latest`), { headers: { Authorization: `Bearer ${token}` } }),
          fetch(buildApiUrl(`/api/drivers/${driverId}/recent-form`), { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (!statsRes.ok) throw new Error(`Failed to fetch driver stats: ${statsRes.statusText}`);
        if (!standingsRes.ok) throw new Error(`Failed to fetch standings: ${standingsRes.statusText}`);
        if (!recentFormRes.ok) throw new Error(`Failed to fetch recent form: ${recentFormRes.statusText}`);

        const statsData: DriverStatsResponse = await statsRes.json();
        const standingsData: StandingsResponse = await standingsRes.json();
        const recentFormData: RecentFormItem[] = await recentFormRes.json();

        const driverStanding = standingsData.driverStandings.find((s) => s.driver.id === Number(driverId));
        const fullName = `${statsData.driver.firstName} ${statsData.driver.lastName}`;

        const combinedData: DriverDetailsData = {
          // Data from REAL APIs
          id: statsData.driver.id,
          fullName: fullName,
          firstName: statsData.driver.firstName,
          lastName: statsData.driver.lastName,
          countryCode: statsData.driver.countryCode,
          dateOfBirth: statsData.driver.dateOfBirth,
          teamName: driverStanding?.constructorName || 'N/A',
          imageUrl: driverHeadshots[fullName] || statsData.driver.profileImageUrl,
          wins: statsData.careerStats.wins,
          podiums: statsData.careerStats.podiums,
          fastestLaps: statsData.careerStats.fastestLaps,
          points: statsData.careerStats.totalPoints,
          championshipStanding: driverStanding ? `P${driverStanding.position}` : 'N/A',
          recentForm: recentFormData,
          // TODO: Replace with real API data when endpoints are available
          winsPerSeason: fallbackDriverDetails.winsPerSeason,
          funFact: fallbackDriverDetails.funFact,
        };

        setDriverDetails(combinedData);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load driver data.';
        console.error("Driver Details API failed, loading fallback data.", errorMessage);
        setError(errorMessage);
        setDriverDetails(fallbackDriverDetails);
        setIsFallback(true);
        toast({
          title: 'Could not fetch live driver data',
          description: 'Displaying cached information.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [driverId, getAccessTokenSilently, toast]);

  return { driverDetails, loading, error, isFallback };
};
