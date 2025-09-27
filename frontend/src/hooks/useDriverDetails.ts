// frontend/src/hooks/useDriverDetails.ts
import { useState, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { useAuth0 } from '@auth0/auth0-react';
import { buildApiUrl } from '../lib/api';
import { driverHeadshots } from '../lib/driverHeadshots';
import { fallbackDriverDetails } from '../lib/fallbackData/driverDetails';
import type { DriverDetailsData, DriverStatsResponse, RecentFormItem } from '../types';

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

        // SIMPLIFIED: Only two API calls are now needed
        const [statsRes, recentFormRes] = await Promise.allSettled([
          fetch(buildApiUrl(`/api/drivers/${driverId}/stats`), { headers: { Authorization: `Bearer ${token}` } }),
          fetch(buildApiUrl(`/api/drivers/${driverId}/recent-form`), { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (statsRes.status === 'rejected' || (statsRes.status === 'fulfilled' && !statsRes.value.ok)) {
          throw new Error('Failed to fetch critical driver stats.');
        }
        
        const statsData: DriverStatsResponse = await statsRes.value.json();
        const recentFormData: RecentFormItem[] = recentFormRes.status === 'fulfilled' && recentFormRes.value.ok ? await recentFormRes.value.json() : [];

        // Defensive checks to ensure data exists
        if (!statsData || !statsData.driver) {
          throw new Error('Invalid driver stats response - missing driver data');
        }

        if (!statsData.careerStats) {
          throw new Error('Invalid driver stats response - missing career stats');
        }

        const { driver, careerStats } = statsData;
        const fullName = `${driver.first_name || ''} ${driver.last_name || ''}`.trim();

        const combinedData: DriverDetailsData = {
          id: driver.id,
          fullName: fullName || 'Unknown Driver',
          firstName: driver.first_name || '',
          lastName: driver.last_name || '',
          countryCode: driver.country_code || '',
          dateOfBirth: driver.date_of_birth || '',
          teamName: (driver as any).teamName || 'N/A', // Get team from the enriched driver object
          imageUrl: driverHeadshots[fullName] || driver.profile_image_url,
          wins: careerStats.wins || 0,
          podiums: careerStats.podiums || 0,
          fastestLaps: careerStats.fastestLaps || 0,
          points: careerStats.totalPoints || 0,
          recentForm: recentFormData,
          // These can be fetched separately or added to the /stats response later
          championshipStanding: 'N/A',
          winsPerSeason: fallbackDriverDetails.winsPerSeason,
          funFact: fallbackDriverDetails.funFact,
          // Add the firstRace property, with a fallback
          firstRace: careerStats.firstRace || { year: 'N/A', event: 'N/A' },
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