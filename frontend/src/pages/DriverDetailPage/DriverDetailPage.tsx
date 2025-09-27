// frontend/src/pages/DriverDetailPage/DriverDetailPage.tsx
import React from 'react';
import { Container, Box, Text, VStack, Button, Alert, AlertIcon, AlertTitle } from '@chakra-ui/react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { useDriverDetails } from '../../hooks/useDriverDetails';
import DashboardGrid from '../../components/DashboardGrid/DashboardGrid';
import KeyInfoBar from '../../components/KeyInfoBar/KeyInfoBar';
import F1LoadingSpinner from '../../components/F1LoadingSpinner/F1LoadingSpinner';
import ReactCountryFlag from 'react-country-flag';
import { countryCodeMap } from '../../lib/countryCodeUtils';
import { teamCarImages } from '../../lib/teamCars';
import styles from './DriverDetailPage.module.css';

const FallbackBanner = () => (
  <Container maxW="1400px" pt={4}>
    <Alert status="warning" variant="solid" bg="brand.red" color="white" borderRadius="md">
      <AlertIcon as={AlertTriangle} color="white" />
      <AlertTitle fontFamily="heading" fontSize="md">Live Data Unavailable. Showing cached data.</AlertTitle>
    </Alert>
  </Container>
);

const DriverDetailPage: React.FC = () => {
  const { driverId } = useParams<{ driverId: string }>();
  const { driverDetails, loading, error, isFallback } = useDriverDetails(driverId);

  if (loading) {
    return <F1LoadingSpinner text="Loading Driver Details..." />;
  }

  if (error && !driverDetails) {
    return (
      <Container centerContent>
        <VStack spacing={4} mt={10}>
          <Text fontSize="2xl" color="text-primary">{error}</Text>
          <Link to="/drivers">
            <Button leftIcon={<ArrowLeft />} colorScheme="red" variant="outline">Back to Drivers</Button>
          </Link>
        </VStack>
      </Container>
    );
  }
  
  if (!driverDetails) {
    return <Text p="lg">Driver not found.</Text>;
  }

  return (
    <>
      {isFallback && <FallbackBanner />}
      <Box
        position="relative"
        minH="30vh"
        bgImage={`url(${teamCarImages[driverDetails.teamName] || "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13"})`}
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
                <span className={styles.firstName}>{driverDetails.firstName}</span>
                <span className={styles.lastName}>{driverDetails.lastName}</span>
              </h1>
            </div>
            <div className={styles.heroBioBlock}>
              {(() => {
                const twoLetter = countryCodeMap[driverDetails.countryCode?.toUpperCase()] || driverDetails.countryCode;
                return twoLetter ? (
                  <ReactCountryFlag
                    countryCode={twoLetter.toLowerCase()}
                    svg
                    className={styles.flagImage}
                    title={driverDetails.countryCode}
                  />
                ) : null;
              })()}
              <div className={styles.bioText}>
                <span>Born: {new Date(driverDetails.dateOfBirth).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </Container>
      </Box>

      <Container maxWidth="1400px" py={6} mb={4}>
        <Link to="/drivers">
          <Button leftIcon={<ArrowLeft />} variant="outline" color="text-primary" _hover={{ bg: 'whiteAlpha.200' }}>
            Back to Drivers
          </Button>
        </Link>
      </Container>

      <Container maxWidth="1400px">
        <KeyInfoBar driver={{
          team: driverDetails.teamName,
          points: driverDetails.points,
          wins: driverDetails.wins,
          podiums: driverDetails.podiums,
          championshipStanding: driverDetails.championshipStanding,
          firstRace: { year: "2023", event: "Bahrain GP" }, // TODO: Replace with real data when available
        }} />
      </Container>

      <Container maxWidth="1400px" paddingX={['1rem', '2rem', '3rem']} paddingY="2rem">
          <Box>
            <DashboardGrid driver={driverDetails} />
            <Box mt={8} p={4} border="1px solid" borderColor="border-primary" borderRadius="md" bg="bg-surface">
              <Text fontSize="xl" fontWeight="bold" color="text-primary" mb={2}>Fastest Lap (Latest Race)</Text>
              <Text color="text-muted">Feature coming soon. API endpoint required.</Text>
            </Box>
          </Box>
      </Container>
    </>
  );
};

export default DriverDetailPage;
