import React, { useState, useEffect, useCallback } from 'react';
import { Container, Flex, Box, Text, VStack, Button } from '@chakra-ui/react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { ArrowLeft } from 'lucide-react';

// Import Components and Helpers
import DashboardGrid from '../../components/DashboardGrid/DashboardGrid';
import HeroSection from '../../components/HeroSection/HeroSection';
import KeyInfoBar from '../../components/KeyInfoBar/KeyInfoBar';
import F1LoadingSpinner from '../../components/F1LoadingSpinner/F1LoadingSpinner';
import { useTheme } from '../../context/ThemeContext';
import { teamColors } from '../../lib/teamColors';
import { getCountryFlagUrl } from '../../lib/assets';
import { driverHeadshots } from '../../lib/driverHeadshots';
import styles from './DriverDetailPage.module.css';
import { buildApiUrl } from '../../lib/api';

const DriverDetailPage: React.FC = () => {
  // 1. STATE AND HOOKS SETUP
  const { getAccessTokenSilently } = useAuth0();
  const location = useLocation();
  const { setThemeColor } = useTheme();

  // This is the numeric ID passed via <Link state={{...}}> from the main /drivers page
  const numericDriverId = location.state?.driverId;

  const [driverData, setDriverData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 2. AUTHENTICATED FETCH HELPER
  const authedFetch = useCallback(async (url: string) => {
    const token = await getAccessTokenSilently({
      authorizationParams: { 
        audience: import.meta.env.VITE_AUTH0_AUDIENCE, 
        scope: "read:drivers" 
      },
    });
    const headers = new Headers();
    headers.set('Authorization', `Bearer ${token}`);
    
    console.log('Making request to:', url); // Debug log
    
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }, [getAccessTokenSilently]);


  // 3. DATA FETCHING LOGIC
  useEffect(() => {
    if (!numericDriverId) {
      setError("Driver ID not found. Please navigate from the main drivers page.");
      setLoading(false);
      return;
    }

    const fetchDriverData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [driverDetails, driverPerformance] = await Promise.all([
          authedFetch(buildApiUrl(`/api/drivers/${numericDriverId}/details`)),
          authedFetch(buildApiUrl(`/api/drivers/${numericDriverId}/performance/2025`))
        ]);

        const flattenedData = {
          id: driverDetails.driverId,
          fullName: driverDetails.fullName,
          firstName: driverDetails.firstName,
          lastName: driverDetails.lastName,
          countryCode: driverDetails.countryCode,
          dateOfBirth: driverDetails.dateOfBirth,
          teamName: driverDetails.team.name,
          funFact: driverDetails.profile.funFact,
          // Use driverHeadshots as primary source, fallback to API imageUrl
          imageUrl: driverHeadshots[driverDetails.fullName] || driverDetails.profile.imageUrl,
          wins: driverDetails.careerStats.wins,
          podiums: driverDetails.careerStats.podiums,
          fastestLaps: driverDetails.careerStats.fastestLaps,
          points: driverDetails.careerStats.totalPoints,
          firstRace: driverDetails.careerStats.firstRace,
          championshipStanding: `P${driverPerformance.championshipStanding}`,
          winsPerSeason: driverPerformance.winsPerSeason,
        };

        setDriverData(flattenedData);
        setThemeColor(teamColors[flattenedData.teamName] || '#FF1801');
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load driver data.');
      } finally {
        setLoading(false);
      }
    };

    if (numericDriverId) {
      fetchDriverData();
    }

    return () => {
      setThemeColor('#FF1801'); // Reset theme color on unmount
    };
  }, [numericDriverId, authedFetch, setThemeColor]);

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
  return (
    <>

      <HeroSection backgroundImageUrl={driverData.imageUrl || "https://default-hero-image.url/bg.jpeg"}>
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
              {/* Age can be calculated if needed */}
            </div>
          </div>
        </div>
      </HeroSection>

      <Container maxWidth="1400px">
        <KeyInfoBar driver={{
          ...driverData,
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


