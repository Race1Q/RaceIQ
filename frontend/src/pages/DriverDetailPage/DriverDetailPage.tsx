// frontend/src/pages/DriverDetailPage/DriverDetailPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { Container, Flex, Box, Text, VStack, Button } from '@chakra-ui/react';
import { useParams, Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { ArrowLeft } from 'lucide-react';

// Import Components and Helpers
import DashboardGrid from '../../components/DashboardGrid/DashboardGrid';
import KeyInfoBar from '../../components/KeyInfoBar/KeyInfoBar';
import F1LoadingSpinner from '../../components/F1LoadingSpinner/F1LoadingSpinner';
import { getCountryFlagUrl } from '../../lib/assets';
import { driverHeadshots } from '../../lib/driverHeadshots';
import { teamCarImages } from '../../lib/teamCars';
import styles from './DriverDetailPage.module.css';
import { buildApiUrl } from '../../lib/api';

// Using shared buildApiUrl to construct API URLs

const DriverDetailPage: React.FC = () => {
  // 1. STATE AND HOOKS SETUP
  const { getAccessTokenSilently } = useAuth0();
  const { driverId } = useParams<{ driverId: string }>(); // Use URL parameter

  const [driverData, setDriverData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 2. AUTHENTICATED FETCH HELPER
  const authedFetch = useCallback(async (path: string) => {
    const url = buildApiUrl(path);
    
    const token = await getAccessTokenSilently({
      authorizationParams: { 
        audience: import.meta.env.VITE_AUTH0_AUDIENCE, 
        scope: "read:drivers" 
      },
    });
    const headers = new Headers();
    headers.set('Authorization', `Bearer ${token}`);
    
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }, [getAccessTokenSilently]);


  // 3. DATA FETCHING LOGIC
  useEffect(() => {
    // We now use driverId from the URL
    if (!driverId) {
      setError("Driver ID not found in URL.");
      setLoading(false);
      return;
    }

    const fetchDriverData = async () => {
      try {
        setLoading(true);
        setError(null);

        // NOTE: This assumes your /drivers/:driverId route uses a numeric ID.
        // If it uses a slug like 'oscar_piastri', you'll need a backend endpoint
        // to convert the slug to an ID first. For now, we assume it's numeric.
        const numericDriverId = parseInt(driverId, 10);
        if (isNaN(numericDriverId)) {
          throw new Error("Invalid Driver ID in URL.");
        }

        // Fetch details first
        const driverDetails = await authedFetch(`/api/drivers/${numericDriverId}/details`);

        // Then attempt performance for current season; handle 404/400 gracefully
        let driverPerformance: any | null = null;
        try {
          const seasonToFetch = 2024; // Use a season with available data
          driverPerformance = await authedFetch(`/api/drivers/${numericDriverId}/performance/${seasonToFetch}`);
        } catch (perfErr) {
          console.warn('Could not fetch performance data for this season.', perfErr);
          driverPerformance = null;
        }

        const fullName = `${driverDetails.first_name} ${driverDetails.last_name}`;

        const flattenedData = {
          id: driverDetails.driver_id,
          fullName: fullName,
          firstName: driverDetails.first_name,
          lastName: driverDetails.last_name,
          countryCode: driverDetails.country_name, // Fixed: use country_name from DTO
          dateOfBirth: driverDetails.date_of_birth,
          teamName: driverDetails.current_constructor, // FIX for "Unknown Team"
          funFact: "A fun fact about this driver.", // Fixed: use fallback since fun_fact doesn't exist in DTO
          imageUrl: driverHeadshots[fullName] || 'default_image_url.png', // Use the constructed fullName for a reliable lookup
          wins: driverDetails.total_wins,
          podiums: driverDetails.total_podiums,
          fastestLaps: 0, // Fixed: use default since total_fastest_laps doesn't exist in DTO
          points: driverDetails.total_points,
          firstRace: "Unknown", // Fixed: use default since first_race_year doesn't exist in DTO
          championshipStanding: driverPerformance ? `P${driverPerformance.position}` : 'N/A', // FIX for "N/A" Standing
          winsPerSeason: driverPerformance?.wins ?? [],
        };

        setDriverData(flattenedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load driver data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDriverData();
  }, [driverId, authedFetch]);

  // 4. RENDER LOADING AND ERROR STATES
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

  // 5. RENDER THE PAGE WITH LIVE DATA
  // Debug: Log team name and available images
  console.log('Driver team name:', driverData.teamName);
  console.log('Available team car images:', Object.keys(teamCarImages));
  console.log('Selected image URL:', teamCarImages[driverData.teamName] || teamCarImages["Mercedes"]);

  return (
    <>
      {/* Custom Hero Section for Driver Details - Smaller Header */}
      <Box
        position="relative"
        minH="30vh"
        bgImage={`url(${teamCarImages[driverData.teamName] || teamCarImages["Mercedes"] || "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1920&h=1080&fit=crop&crop=center"})`}
        bgSize="cover"
        bgPosition="center"
        bgRepeat="no-repeat"
        display="flex"
        alignItems="center"
        justifyContent="center"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bg: 'blackAlpha.600',
          zIndex: 1,
        }}
      >
        <Container maxW="1400px" position="relative" zIndex={2}>
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

      {/* Back to Drivers Button */}
      <Container maxWidth="1400px" py={6} mb={4}>
        <Link to="/drivers">
          <Button 
            leftIcon={<ArrowLeft />} 
            colorScheme="red" 
            variant="outline"
            bg="white"
            color="brand.red"
            borderColor="brand.red"
            _hover={{ bg: "brand.red", color: "white" }}
          >
            Back to Drivers
          </Button>
        </Link>
      </Container>

      <Container maxWidth="1400px">
        <KeyInfoBar driver={{
          ...driverData,
          // Ensure the expected `team` field is present for logo resolution
          team: driverData.teamName,
          fullName: driverData.fullName,
          imageUrl: driverData.imageUrl
        }} />
      </Container>

      <Container maxWidth="1400px" paddingX={['1rem', '2rem', '3rem']} paddingY="2rem">
        <Flex direction={['column', 'column', 'row']} gap={6}>
          <Box flex={1}>
            <DashboardGrid driver={driverData} />
          </Box>
        </Flex>
      </Container>
    </>
  );
};

export default DriverDetailPage;
