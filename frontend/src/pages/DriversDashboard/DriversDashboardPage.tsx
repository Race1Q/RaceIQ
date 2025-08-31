import React, { useState, useEffect, useCallback } from 'react';
import { Container, Flex, Box } from '@chakra-ui/react';
import { useAuth0 } from '@auth0/auth0-react';

// Import Components and Contexts
import DriverList from '../../components/DriverList/DriverList';
import DashboardGrid from '../../components/DashboardGrid/DashboardGrid';
import HeroSection from '../../components/HeroSection/HeroSection';
import F1LoadingSpinner from '../../components/F1LoadingSpinner/F1LoadingSpinner';
import { useTheme } from '../../context/ThemeContext';
import { teamColors } from '../../lib/teamColors';

const DriversDashboardPage: React.FC = () => {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  const [selectedDriverData, setSelectedDriverData] = useState<any | null>(null);
  const [loading, setLoading] = useState({ list: true, details: true });
  const [error, setError] = useState<string | null>(null);

  const { setThemeColor } = useTheme();
  const { getAccessTokenSilently } = useAuth0();

  const authedFetch = useCallback(async (url: string) => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
    const token = await getAccessTokenSilently({
      authorizationParams: { 
        audience: import.meta.env.VITE_AUTH0_AUDIENCE, 
        scope: "read:drivers" 
      },
    });
    const headers = new Headers();
    headers.set('Authorization', `Bearer ${token}`);
    const response = await fetch(`${apiBaseUrl}${url}`, { headers });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }, [getAccessTokenSilently]);

  // Effect 1: Fetch the list of all drivers ONCE on mount.
  useEffect(() => {
    const fetchDriverList = async () => {
      try {
        setError(null);
        setLoading({ list: true, details: true });
        const driverListData = await authedFetch('/api/drivers/by-standings/2025');
        setDrivers(driverListData);
        // Automatically select the first driver by their NUMERIC ID.
        if (driverListData && driverListData.length > 0) {
          setSelectedDriverId(driverListData[0].id); // Use the numeric ID
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load driver list.');
      } finally {
        setLoading(prev => ({ ...prev, list: false }));
      }
    };
    fetchDriverList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // <-- Empty array ensures this runs only ONCE on mount.

  // Effect 2: Fetch details for the selected driver whenever the ID changes.
  useEffect(() => {
    if (!selectedDriverId) return;

    const fetchDriverDetails = async () => {
      setLoading(prev => ({ ...prev, details: true }));
      setError(null);

      try {
        const [details, performance] = await Promise.all([
          authedFetch(`/api/drivers/${selectedDriverId}/details`),
          authedFetch(`/api/drivers/${selectedDriverId}/performance/2025`)
        ]);

        const flattenedData = {
          id: details.driverId,
          fullName: details.fullName,
          teamName: details.team.name,
          funFact: details.profile.funFact,
          imageUrl: details.profile.imageUrl,
          wins: details.careerStats.wins,
          podiums: details.careerStats.podiums,
          fastestLaps: details.careerStats.fastestLaps,
          points: details.careerStats.totalPoints,
          championshipStanding: performance.championshipStanding,
          winsPerSeason: performance.winsPerSeason,
        };
        setSelectedDriverData(flattenedData);

        const newColor = teamColors[details.team.name] || '#FF1801';
        setThemeColor(newColor);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load driver details.');
      } finally {
        setLoading(prev => ({ ...prev, details: false }));
      }
    };

    fetchDriverDetails();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDriverId]); // <-- Now only depends on the ID, which is correct.

  if (loading.list) {
    return <F1LoadingSpinner text="Loading drivers..." />;
  }

  if (error) {
    return <Container centerContent padding="4rem">Error: {error}</Container>;
  }

  return (
    <>
      <HeroSection
        title="Drivers Dashboard"
        subtitle="Your personalized hub for in-depth driver statistics and performance analytics."
        backgroundImageUrl="https://images.pexels.com/photos/29252132/pexels-photo-29252132.jpeg"
      />
      
      <Container maxWidth="1400px" paddingX={['1rem', '2rem', '3rem']} paddingY="2rem">
        <Flex direction={['column', 'column', 'row']} gap={6}>
          <Box width={['100%', '100%', '300px']} flexShrink={0}>
            <DriverList
              drivers={drivers}
              selectedDriverId={selectedDriverId}
              setSelectedDriverId={setSelectedDriverId}
            />
          </Box>
          <Box flex={1}>
            {loading.details && <F1LoadingSpinner text="Loading dashboard..." />}
            {!loading.details && selectedDriverData && (
              <DashboardGrid driver={selectedDriverData} />
            )}
          </Box>
        </Flex>
      </Container>
    </>
  );
};

export default DriversDashboardPage;
