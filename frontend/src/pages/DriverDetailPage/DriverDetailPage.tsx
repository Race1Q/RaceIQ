// frontend/src/pages/DriverDetailPage/DriverDetailPage.tsx
import React from 'react';
import { Container, Box, Text, Button, Heading, Flex, Grid, HStack, Image } from '@chakra-ui/react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useDriverDetails } from '../../hooks/useDriverDetails';
import KeyInfoBar from '../../components/KeyInfoBar/KeyInfoBar';
import F1LoadingSpinner from '../../components/F1LoadingSpinner/F1LoadingSpinner';
import ReactCountryFlag from 'react-country-flag';
import { countryCodeMap } from '../../lib/countryCodeUtils';
import { teamCarImages } from '../../lib/teamCars';
import { teamColors } from '../../lib/teamColors';
import StatSection from '../../components/DriverDetails/StatSection';
import WinsPerSeasonChart from '../../components/WinsPerSeasonChart/WinsPerSeasonChart';

const DriverDetailPage: React.FC = () => {
  const { driverId } = useParams<{ driverId: string }>();
  const { driverDetails, loading, error } = useDriverDetails(driverId);

  // --- DEBUG STEP 3: Log the data as it's received by the page component ---
  console.log("%c3. Data Received by Page Component:", "color: orange; font-weight: bold;", driverDetails);

  if (loading) return <F1LoadingSpinner text="Loading Driver Details..." />;
  if (error || !driverDetails) return <Text p="lg">Error: {error || 'Driver data could not be loaded.'}</Text>;

  const teamColor = teamColors[driverDetails.teamName] || '#333333';
  const twoLetterCountryCode = countryCodeMap[driverDetails.countryCode?.toUpperCase()] || driverDetails.countryCode;

  return (
    <Box>
      {/* --- NEW LAYERED HERO SECTION --- */}
      <Box
        position="relative"
        minH={{ base: '30vh', md: '50vh' }}
        bgColor={teamColor}
        overflow="hidden"
        _after={{ // Abstract geometric pattern overlay
          content: '""', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1,
          bgImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3cpath d='M-100 100L100 200L100 0L-100 100Z' fill-opacity='0.02' fill='%23fff'/%3e%3c/svg%3e")`,
          backgroundSize: '300px',
        }}
      >
        <Image
          src={teamCarImages[driverDetails.teamName]}
          alt={`${driverDetails.teamName} car`}
          position="absolute"
          top="50%"
          right={{ base: '-50%', md: '0' }}
          transform="translateY(-50%)"
          w={{ base: '100%', md: '70%' }}
          zIndex={2}
          opacity={0.4}
        />
        <Image
          src={driverDetails.imageUrl || ''}
          alt={driverDetails.fullName}
          position="absolute"
          bottom={0}
          right={{ base: '0', md: '5%' }}
          h={{ base: '80%', md: '90%' }}
          zIndex={3}
          objectFit="contain"
          filter="drop-shadow(0 10px 15px rgba(0,0,0,0.4))"
        />
        <Container maxW="1400px" h="100%" position="relative" zIndex={4}>
          <Flex direction="column" justify="center" h="100%" align="flex-start" color="white" textShadow="0 2px 10px rgba(0,0,0,0.5)">
            <Heading as="h1" lineHeight={1}>
              <Text fontFamily="signature" fontSize={{ base: '5xl', md: '8xl' }} fontWeight="normal" mb={{ base: -4, md: -8 }}>
                {driverDetails.firstName}
              </Text>
              <Text fontFamily="heading" fontSize={{ base: '4xl', md: '7xl' }} fontWeight="bold" textTransform="uppercase">
                {driverDetails.lastName}
              </Text>
            </Heading>
            <HStack mt="md" spacing="md" bg="blackAlpha.300" p={2} borderRadius="md" backdropFilter="blur(5px)">
              <ReactCountryFlag countryCode={twoLetterCountryCode.toLowerCase()} svg style={{ width: '32px', height: '24px' }} title={driverDetails.countryCode} />
              <Text>{driverDetails.countryCode}</Text>
              <Text>•</Text>
              <Text>{driverDetails.teamName}</Text>
              <Text>•</Text>
              {/* Ensure driver number is displayed */}
              <Text fontWeight="bold">#{driverDetails.number}</Text>
            </HStack>
          </Flex>
        </Container>
      </Box>

      <KeyInfoBar driver={driverDetails} />

      <Container maxW="1400px" py="xl">
        <Link to="/drivers">
          <Button leftIcon={<ArrowLeft />} variant="outline" mb="lg">Back to Drivers</Button>
        </Link>
        
        {/* --- NEW STATS SECTIONS --- */}
        <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap="xl">
          <StatSection title="2025 Season" stats={driverDetails.currentSeasonStats} />
          <StatSection title="Career" stats={driverDetails.careerStats} />
        </Grid>

        {/* --- NEW GRAPH SECTION --- */}
        <Box mt="xl">
          <Heading size="md" fontFamily="heading" mb="md">Wins Per Season (Last 5 Years)</Heading>
          <Box bg="bg-surface" p="lg" borderRadius="lg" border="1px solid" borderColor="border-primary">
            <WinsPerSeasonChart data={driverDetails.winsPerSeason} teamColor={teamColor} />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default DriverDetailPage;