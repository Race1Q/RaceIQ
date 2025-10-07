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
      {/* --- POLISHED HERO SECTION --- */}
      <Box
        position="relative"
        minH={{ base: '40vh', md: '55vh' }}
        bgColor={teamColor}
        overflow="hidden"
        _before={{
          content: '""',
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(1200px 600px at 85% 30%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 60%)',
          zIndex: 1,
        }}
        _after={{
          content: '""',
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.55) 100%)',
          zIndex: 4,
        }}
      >
        <Image
          src={teamCarImages[driverDetails.teamName]}
          alt={`${driverDetails.teamName} car`}
          position="absolute"
          top="50%"
          left={{ base: '-35%', md: '-10%' }}
          transform="translateY(-50%)"
          w={{ base: '160%', md: '110%' }}
          maxW="none"
          opacity={0.25}
          filter="blur(0.3px)"
          zIndex={2}
          pointerEvents="none"
        />
        <Image
          src={driverDetails.imageUrl || ''}
          alt={driverDetails.fullName}
          position="absolute"
          bottom={0}
          right={{ base: '-5%', md: '6%' }}
          h={{ base: '75%', md: '88%' }}
          maxH="95%"
          objectFit="contain"
          zIndex={5}
          filter="drop-shadow(0 18px 30px rgba(0,0,0,0.45))"
          pointerEvents="none"
        />
        <Container maxW="1600px" h="100%" position="relative" zIndex={6} px={{ base: 4, md: 6 }}>
          <Flex direction="column" justify="flex-end" h="100%" py={{ base: 6, md: 10 }} color="white">
            {/* Breadcrumb / Back row */}
            <Button
              as={Link}
              to="/drivers"
              size="sm"
              variant="outline"
              colorScheme="whiteAlpha"
              leftIcon={<ArrowLeft size={16} />}
              mb={{ base: 4, md: 6 }}
              alignSelf="flex-start"
              borderColor="whiteAlpha.400"
              _hover={{ bg: 'whiteAlpha.200' }}
            >
              Back to Drivers
            </Button>

            {/* Name block */}
            <Heading as="h1" lineHeight={1} mb={{ base: 2, md: 3 }}>
              <Text
                fontFamily="signature"
                fontWeight="normal"
                letterSpacing="-0.02em"
                fontSize={{ base: 'clamp(2.25rem, 6vw, 5rem)', md: 'clamp(3rem, 6vw, 7rem)' }}
                mb={{ base: -2, md: -4 }}
              >
                {driverDetails.firstName}
              </Text>
              <Text
                fontFamily="heading"
                textTransform="uppercase"
                fontWeight="800"
                letterSpacing={{ base: '0.01em', md: '0.02em' }}
                fontSize={{ base: 'clamp(2rem, 7vw, 4rem)', md: 'clamp(3rem, 5vw, 6rem)' }}
              >
                {driverDetails.lastName}
              </Text>
            </Heading>

            {/* Meta row */}
            <HStack
              spacing="md"
              bg="blackAlpha.300"
              p={2}
              borderRadius="md"
              backdropFilter="blur(6px)"
              color="whiteAlpha.900"
              border="1px solid"
              borderColor="whiteAlpha.300"
              alignSelf="flex-start"
            >
              <ReactCountryFlag countryCode={twoLetterCountryCode.toLowerCase()} svg style={{ width: '28px', height: '20px' }} title={driverDetails.countryCode} />
              <Text fontSize="sm">{driverDetails.countryCode}</Text>
              <Text>•</Text>
              <Text fontSize="sm">{driverDetails.teamName}</Text>
              <Text>•</Text>
              <Text fontWeight="bold">#{driverDetails.number}</Text>
            </HStack>
          </Flex>
        </Container>
      </Box>

      <KeyInfoBar driver={driverDetails} />

      <Container maxW="1600px" py="xl" px={{ base: 4, md: 6 }}>
        
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