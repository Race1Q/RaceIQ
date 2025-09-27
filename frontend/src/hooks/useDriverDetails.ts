// frontend/src/hooks/useDriverDetails.ts
import { useState, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { useAuth0 } from '@auth0/auth0-react';
import { buildApiUrl } from '../lib/api';
import { driverHeadshots } from '../lib/driverHeadshots';
import { fallbackDriverDetails } from '../lib/fallbackData/driverDetails';
import type { ApiDriverStatsResponse, DriverDetailsData } from '../types';

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

        const response = await fetch(buildApiUrl(`/api/drivers/${driverId}/stats`), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const apiData: ApiDriverStatsResponse = await response.json();
        
        // --- FINAL MAPPER: Transform live API data to the flattened UI shape ---
        const fullName = `${apiData.driver.first_name} ${apiData.driver.last_name}`;
        const mappedData: DriverDetailsData = {
          id: apiData.driver.id,
          fullName: fullName,
          firstName: apiData.driver.first_name,
          lastName: apiData.driver.last_name,
          countryCode: apiData.driver.country_code,
          dateOfBirth: apiData.driver.date_of_birth,
          teamName: apiData.driver.teamName,
          imageUrl: driverHeadshots[fullName] || apiData.driver.profile_image_url,
          number: apiData.driver.driver_number,
          // Flattened top-level stats for KeyInfoBar
          wins: apiData.careerStats.wins,
          podiums: apiData.careerStats.podiums,
          points: apiData.careerStats.points,
          championshipStanding: apiData.currentSeasonStats.standing,
          firstRace: {
            year: String(apiData.careerStats.firstRace.year),
            event: apiData.careerStats.firstRace.event,
          },
          // Structured stats for the new Stat Sections
          currentSeasonStats: [
            { label: "Wins", value: apiData.currentSeasonStats.wins },
            { label: "Podiums", value: apiData.currentSeasonStats.podiums },
            { label: "Fastest Laps", value: apiData.currentSeasonStats.fastestLaps },
          ],
          careerStats: [
            { label: "Wins", value: apiData.careerStats.wins },
            { label: "Podiums", value: apiData.careerStats.podiums },
            { label: "Fastest Laps", value: apiData.careerStats.fastestLaps },
            { label: "Grands Prix Entered", value: apiData.careerStats.grandsPrixEntered },
            { label: "DNFs", value: apiData.careerStats.dnfs },
            { label: "Highest Finish", value: apiData.careerStats.highestRaceFinish },
          ],
          // Chart data
          winsPerSeason: apiData.careerStats.winsPerSeason.map(w => ({...w, season: String(w.season)})),
          // Other data (placeholders for now, can be added to /stats later)
          funFact: fallbackDriverDetails.funFact,
          recentForm: [], 
        };
        // --- END MAPPER ---

        setDriverDetails(mappedData);

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