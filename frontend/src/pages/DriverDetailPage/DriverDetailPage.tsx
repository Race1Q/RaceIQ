 //frontend/src/pages/DriverDetailPage/DriverDetailPage.tsx

import React, { useState, useEffect } from 'react';
import { Container, Flex, Box, Text, VStack, Button, useToast } from '@chakra-ui/react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// Import our standard API hook and components
import { useApi } from '@/hooks/useApi';
import DashboardGrid from '../../components/DashboardGrid/DashboardGrid';
import KeyInfoBar from '../../components/KeyInfoBar/KeyInfoBar';
import F1LoadingSpinner from '../../components/F1LoadingSpinner/F1LoadingSpinner';
import { getCountryFlagUrl } from '../../lib/assets';
import { driverHeadshots } from '../../lib/driverHeadshots';
import { teamCarImages } from '../../lib/teamCars';
import styles from './DriverDetailPage.module.css';

// Interfaces to type the data coming from our API
interface DriverDetailsResponse {
  driverId: number;
  fullName: string;
  firstName: string;
  lastName: string;
  countryCode: string;
  dateOfBirth: string;
  team: { name: string; color: string | null };
  careerStats: { wins: number; podiums: number; fastestLaps: number; totalPoints: number };
  profile: { imageUrl: string | null; funFact: string };
}

interface DriverPerformanceResponse {
  season: string;
  championshipStanding: number | null;
  winsPerSeason: Array<{ season: string; wins: number }>;
  recentRace: { raceName: string; position: number } | null;
}


// --- Fastest Lap summary type ---
type FastestLapSummary = {
  driver_id: number;
  driver_name?: string;
  driver_picture?: string;
  lap_number: number;
  time_ms: number;
};

const DriverDetailPage: React.FC = () => {
  const { authedFetch } = useApi(); // Use our standard, shared hook
  const { driverId } = useParams<{ driverId: string }>();
  const toast = useToast();

  const [driverData, setDriverData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fastestLap, setFastestLap] = useState<FastestLapSummary | null>(null);
  const [fastestLapLoading, setFastestLapLoading] = useState<boolean>(true);
  const [fastestLapError, setFastestLapError] = useState<string | null>(null);

  useEffect(() => {
    if (!driverId) {
      setError("Driver ID not found in URL.");
      setLoading(false);
      return;
    }

    const fetchDriverData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch both primary and secondary data in parallel
        const [details, performance] = await Promise.all([
          authedFetch<DriverDetailsResponse>(`/api/drivers/${driverId}/details`),
          authedFetch<DriverPerformanceResponse>(`/api/drivers/${driverId}/performance/2025`), // Hardcoded to 2025 for now
        ]);
        // Combine the data from both API calls into a single object for the UI
        const combinedData = {
          id: details.driverId,
          fullName: details.fullName,
          firstName: details.firstName,
          lastName: details.lastName,
          countryCode: details.countryCode,
          dateOfBirth: details.dateOfBirth,
          teamName: details.team?.name || 'N/A',
          teamColor: details.team?.color,
          funFact: details.profile?.funFact,
          imageUrl: driverHeadshots[details.fullName] || details.profile?.imageUrl,
          wins: details.careerStats?.wins,
          podiums: details.careerStats?.podiums,
          fastestLaps: details.careerStats?.fastestLaps,
          points: details.careerStats?.totalPoints,
          championshipStanding: performance?.championshipStanding != null ? `P${performance.championshipStanding}` : 'N/A',
          winsPerSeason: performance?.winsPerSeason || [],
        };
        setDriverData(combinedData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load driver data.';
        setError(errorMessage);
        toast({
          title: 'Error Loading Driver',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    // Fetch fastest lap for this driver (from summary endpoint for all races)
    const fetchFastestLap = async () => {
      setFastestLapLoading(true);
      setFastestLapError(null);
      try {
        // You may want to loop over all races, or if you have a driver-summary endpoint, use that
        // For demo, fetch the fastest lap for the latest race (e.g., 2025)
        // Replace 2025 with the actual raceId or get a list of races for this driver
        const res = await authedFetch<any>(`/api/race-summary?race_id=2025`); // Replace 2025 as needed
        if (res && res.fastestLap && res.fastestLap.driver_id == Number(driverId)) {
          setFastestLap(res.fastestLap);
        } else {
          setFastestLap(null);
        }
      } catch (err) {
        setFastestLapError('Could not fetch fastest lap');
        setFastestLap(null);
      } finally {
        setFastestLapLoading(false);
      }
    };

    fetchDriverData();
    fetchFastestLap();
  }, [driverId, authedFetch, toast]);

  if (loading) {
    return <F1LoadingSpinner text="Loading Driver Details..." />;
  }

  if (error || !driverData) {
    return (
      <Container centerContent>
        <VStack spacing={4} mt={10} color="white">
          <Text fontSize="2xl">{error || 'Driver data could not be loaded.'}</Text>
          <Link to="/drivers">
            <Button leftIcon={<ArrowLeft />} colorScheme="red" variant="outline">
              Back to Drivers
            </Button>
          </Link>
        </VStack>
      </Container>
    );
  }

  // Render the page with the combined, live data
  return (
    <>
      <Box
        position="relative"
        minH="30vh"
        bgImage={`url(${teamCarImages[driverData.teamName] || "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13"})`}
        bgSize="cover"
        bgPosition="center"
        _before={{
          content: '""', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bg: 'blackAlpha.600', zIndex: 1,
        }}
      >
        <Container maxW="1400px" position="relative" zIndex={2} h="30vh" display="flex" alignItems="center">
          <div className={styles.heroContentLayout}>
            <div className={styles.heroTitleBlock}>
              <h1 className={styles.heroTitle}>
                <span className={styles.firstName}>{driverData.firstName}</span>
                <span className={styles.lastName}>{driverData.lastName}</span>
              </h1>
            </div>
            <div className={styles.heroBioBlock}>
              <img
                src={getCountryFlagUrl(driverData.countryCode)}
                alt={`${driverData.countryCode} flag`}
                className={styles.flagImage}
              />
              <div className={styles.bioText}>
                <span>Born: {new Date(driverData.dateOfBirth).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </Container>
      </Box>

      <Container maxWidth="1400px" py={6} mb={4}>
        <Link to="/drivers">
          <Button leftIcon={<ArrowLeft />} variant="outline" className={styles.backButton}>
            Back to Drivers
          </Button>
        </Link>
      </Container>

      <Container maxWidth="1400px">
        <KeyInfoBar driver={{
          ...driverData,
          team: driverData.teamName, // Pass team name for logo resolution
        }} />
      </Container>

      <Container maxWidth="1400px" paddingX={['1rem', '2rem', '3rem']} paddingY="2rem">
        <Flex direction={['column', 'column', 'row']} gap={6}>
          <Box flex={1}>
            <DashboardGrid driver={driverData} />
            <Box mt={8} p={4} border="1px solid #eee" borderRadius="md" bg="gray.900">
              <Text fontSize="xl" fontWeight="bold" color="white" mb={2}>Fastest Lap (Latest Race)</Text>
              {fastestLapLoading ? (
                <Text color="gray.400">Loading fastest lap...</Text>
              ) : fastestLapError ? (
                <Text color="red.400">{fastestLapError}</Text>
              ) : fastestLap ? (
                <VStack align="start" spacing={1} color="white">
                  <Text>Lap: {fastestLap.lap_number}</Text>
                  <Text>Time: {(fastestLap.time_ms / 1000).toFixed(3)}s</Text>
                </VStack>
              ) : (
                <Text color="gray.400">No fastest lap found for this driver in the latest race.</Text>
              )}
            </Box>
          </Box>
        </Flex>
      </Container>
    </>
  );
};

export default DriverDetailPage;
