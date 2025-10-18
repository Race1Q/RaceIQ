// frontend/src/hooks/useDriverDetails.ts
import { useState, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { useAuth0 } from '@auth0/auth0-react';
import { fallbackDriverDetails } from '../lib/fallbackData/driverDetails';
import { apiFetch } from '../lib/api';

// Define types for the new driver details model
export type DriverDetailsModel = {
  firstName: string;
  lastName: string;
  fullName: string;
  number: number | null;
  countryCode: string;
  imageUrl: string;
  teamName: string;
  worldChampionships: number;
  grandsPrixEntered: number;
  currentSeasonStats?: { wins: number; podiums: number; fastestLaps: number; standing: string };
  careerStats?: { wins: number; podiums: number; fastestLaps: number; points: number; grandsPrixEntered: number; dnfs: number; highestRaceFinish: number };
  winsPerSeason?: Array<{ season: number; wins: number }>;
};

// Type guards
const isDriverStatsResponse = (data: any): boolean => {
  return data && typeof data === 'object' && 
         data.driver && typeof data.driver === 'object' &&
         data.careerStats && typeof data.careerStats === 'object' &&
         data.currentSeasonStats && typeof data.currentSeasonStats === 'object';
};

const isDriverEntity = (data: any): boolean => {
  return data && typeof data === 'object' && 
         (data.first_name || data.firstName) && 
         (data.last_name || data.lastName);
};

// Safe field access helper
const safeGet = (obj: any, ...keys: string[]) => {
  for (const key of keys) {
    if (obj && obj[key] !== undefined && obj[key] !== null) {
      return obj[key];
    }
  }
  return '';
};

const safeGetNumber = (obj: any, ...keys: string[]) => {
  for (const key of keys) {
    if (obj && typeof obj[key] === 'number') {
      return obj[key];
    }
  }
  return null;
};

export const useDriverDetails = (driverId?: string) => {
  const [driverDetails, setDriverDetails] = useState<any | null>(null);
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

        let apiData: any = null;
        let driverEntity: any = null;
        let hasStats = false;

        // First, try to fetch driver career stats (the correct endpoint for driver details)
        try {
          const statsData = await apiFetch<any>(`/api/drivers/${driverId}/career-stats`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (isDriverStatsResponse(statsData)) {
            apiData = statsData;
            driverEntity = statsData.driver;
            hasStats = true;
          }
        } catch {
          // fall through to basic endpoint
        }

        // Get poles data from season stats (same approach as the charts)
        let polesData: any = null;
        if (hasStats && (!apiData.careerStats?.poles && !apiData.currentSeasonStats?.poles)) {
          try {
            const seasonStatsResponse = await apiFetch<any>(`/api/drivers/${driverId}/season-stats`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (seasonStatsResponse && Array.isArray(seasonStatsResponse)) {
              const currentYear = new Date().getFullYear();
              const currentSeasonData = seasonStatsResponse.find((s: any) => s.year === currentYear);
              const totalCareerPoles = seasonStatsResponse.reduce((sum: number, s: any) => sum + (s.poles || 0), 0);
              
              polesData = {
                careerPoles: totalCareerPoles,
                seasonPoles: currentSeasonData?.poles || 0,
              };
            }
          } catch {
            // fall through
          }
        }

        // If stats didn't work or doesn't have driver details, fetch basic driver info
        if (!driverEntity) {
          const entity = await apiFetch<any>(`/api/drivers/${driverId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!isDriverEntity(entity)) {
            throw new Error('Invalid driver data structure received');
          }
          driverEntity = entity;
        }

        // --- ROBUST MAPPER: Transform API data to the flattened UI shape ---
        const firstName = safeGet(driverEntity, 'given_name', 'first_name', 'firstName') || '';
        const lastName = safeGet(driverEntity, 'family_name', 'last_name', 'lastName') || '';
        const fullName = driverEntity.full_name || `${firstName} ${lastName}`.trim() || `Driver ${driverId}`;
        
        const mappedData = {
          id: driverEntity.id || parseInt(driverId, 10),
          fullName: fullName,
          firstName: firstName,
          lastName: lastName,
          countryCode: safeGet(driverEntity, 'country_code', 'countryCode') || '',
          dateOfBirth: safeGet(driverEntity, 'date_of_birth', 'dateOfBirth') || '',
          teamName: safeGet(driverEntity, 'teamName', 'current_team_name') || 'N/A',
          imageUrl: safeGet(driverEntity, 'image_url', 'profile_image_url', 'imageUrl') || '',
          number: safeGetNumber(driverEntity, 'driver_number', 'number') || null,
          
          // Stats data (use from stats API if available, otherwise defaults)
          wins: hasStats ? (apiData.careerStats?.wins || 0) : 0,
          podiums: hasStats ? (apiData.careerStats?.podiums || 0) : 0,
          points: hasStats ? (apiData.careerStats?.points || 0) : 0,
          championshipStanding: hasStats ? (apiData.currentSeasonStats?.standing || 'N/A') : 'N/A',
          worldChampionships: hasStats ? (apiData.careerStats?.worldChampionships || 0) : 0,
          grandsPrixEntered: hasStats ? (apiData.careerStats?.grandsPrixEntered || 0) : 0,
          
          firstRace: hasStats ? {
            year: String(apiData.careerStats?.firstRace?.year || ''),
            event: apiData.careerStats?.firstRace?.event || 'N/A',
          } : { year: '', event: 'N/A' },

          // Structured stats for the stat sections
          currentSeasonStats: hasStats ? [
            { label: "Wins", value: apiData.currentSeasonStats?.wins || 0 },
            { label: "Podiums", value: apiData.currentSeasonStats?.podiums || 0 },
            { label: "Fastest Laps", value: apiData.currentSeasonStats?.fastestLaps || 0 },
            { label: "Poles", value: apiData.currentSeasonStats?.poles || polesData?.seasonPoles || 0 },
          ] : [
            { label: "Wins", value: 0 },
            { label: "Podiums", value: 0 },
            { label: "Fastest Laps", value: 0 },
            { label: "Poles", value: 0 },
          ],

          careerStats: hasStats ? [
            { label: "Wins", value: apiData.careerStats?.wins || 0 },
            { label: "Podiums", value: apiData.careerStats?.podiums || 0 },
            { label: "Fastest Laps", value: apiData.careerStats?.fastestLaps || 0 },
            { label: "Poles", value: apiData.careerStats?.poles || polesData?.careerPoles || 0 },
            { label: "Grands Prix Entered", value: apiData.careerStats?.grandsPrixEntered || 0 },
            { label: "DNFs", value: apiData.careerStats?.dnfs || 0 },
            { label: "Highest Finish", value: apiData.careerStats?.highestRaceFinish || 0 },
          ] : [
            { label: "Wins", value: 0 },
            { label: "Podiums", value: 0 },
            { label: "Fastest Laps", value: 0 },
            { label: "Poles", value: 0 },
            { label: "Grands Prix Entered", value: 0 },
            { label: "DNFs", value: 0 },
            { label: "Highest Finish", value: 0 },
          ],

          // Chart data
          winsPerSeason: hasStats ? 
            (apiData.careerStats?.winsPerSeason || []).map((w: any) => ({
              ...w, 
              season: String(w.season)
            })) : [],

          // Other data (use fallback values)
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