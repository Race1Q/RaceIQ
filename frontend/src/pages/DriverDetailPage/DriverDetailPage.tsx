// frontend/src/pages/DriverDetailPage/DriverDetailPage.tsx
import React from 'react';
import { Container, Box, Text, Button, Heading, Grid, HStack, Image, VStack } from '@chakra-ui/react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useDriverDetails } from '../../hooks/useDriverDetails';
import KeyInfoBar from '../../components/KeyInfoBar/KeyInfoBar';
import DriverDetailSkeleton from './DriverDetailSkeleton';
import ReactCountryFlag from 'react-country-flag';
import { countryCodeMap } from '../../lib/countryCodeUtils';
import { teamCarImages } from '../../lib/teamCars';
import { teamColors } from '../../lib/teamColors';
import StatSection from '../../components/DriverDetails/StatSection';
import WinsPerSeasonChart from '../../components/WinsPerSeasonChart/WinsPerSeasonChart';
import TeamLogo from '../../components/TeamLogo/TeamLogo';

const DriverDetailPage: React.FC = () => {
  const { driverId } = useParams<{ driverId: string }>();
  const { driverDetails, loading, error } = useDriverDetails(driverId);

  // --- DEBUG STEP 3: Log the data as it's received by the page component ---
  console.log("%c3. Data Received by Page Component:", "color: orange; font-weight: bold;", driverDetails);

  if (loading) return <DriverDetailSkeleton />;
  if (error || !driverDetails) return <Text p="lg">Error: {error || 'Driver data could not be loaded.'}</Text>;

  const teamColor = teamColors[driverDetails.teamName] || '#333333';
  const twoLetterCountryCode = countryCodeMap[driverDetails.countryCode?.toUpperCase()] || driverDetails.countryCode;

  return (
    <Box>
      {/* Top Utility Bar */}
      <Box bg="bg-surface" borderBottom="1px solid" borderColor="border-primary">
        <Container maxW="container.2xl" px={{ base: 4, md: 6 }} py={{ base: 2, md: 3 }}>
          <Button
            as={Link}
            to="/drivers"
            size={{ base: 'sm', md: 'md' }}
            leftIcon={<ArrowLeft size={16} />}
            variant="outline"
            borderColor="border-primary"
          >
            Back to Drivers
          </Button>
        </Container>
      </Box>

      {/* Header Bar (matching Constructors header) */}
      <Box bg="bg-primary" color="text-primary" py={{ base: 6, md: 8 }}>
        <Container maxW="container.2xl" px={{ base: 4, md: 6 }}>
          <Grid
            templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }}
            alignItems="center"
            gap={{ base: 4, md: 6 }}
            mb={4}
            p={{ base: 6, md: 8 }}
            minH={{ base: '180px', md: '240px' }}
            borderRadius="md"
            position="relative"
            bgGradient={`linear-gradient(135deg, #${teamColor.replace('#','')} 0%, rgba(0,0,0,0.6) 100%)`}
            _before={{
              content: '""',
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background:
                'radial-gradient(1200px 600px at 85% 30%, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 60%)',
              zIndex: 0,
            }}
          >
            {/* 1) Team Logo */}
            <Box justifySelf="center">
              <Box boxSize={{ base: '80px', md: '100px' }} display="flex" alignItems="center" justifyContent="center">
                <TeamLogo teamName={driverDetails.teamName} />
              </Box>
            </Box>

            {/* 2) Name + meta pill */}
            <Box justifySelf="center" textAlign={{ base: 'center', md: 'left' }}>
              <Heading as="h1" lineHeight={1} color="white" alignSelf="start">
                <Text
                  fontFamily="signature"
                  fontWeight="normal"
                  letterSpacing="-0.02em"
                  fontSize={{ base: '4xl', md: '6xl', xl: '7xl' }}
                  mb={{ base: -2, md: -4 }}
                >
                  {driverDetails.firstName}
                </Text>
                <Text
                  fontFamily="heading"
                  textTransform="uppercase"
                  fontWeight="900"
                  letterSpacing={{ base: '0.01em', md: '0.02em' }}
                  fontSize={{ base: '5xl', md: '8xl', xl: '9xl' }}
                  lineHeight={0.95}
                >
                  {driverDetails.lastName}
                </Text>
              </Heading>
              <Box
                mt={{ base: 2, md: 3 }}
                display="inline-block"
                bg="blackAlpha.300"
                border="1px solid"
                borderColor="whiteAlpha.300"
                borderRadius="md"
                px={3}
                py={2}
                backdropFilter="blur(6px)"
              >
                <HStack spacing="md">
                  <ReactCountryFlag countryCode={twoLetterCountryCode.toLowerCase()} svg style={{ width: '28px', height: '20px' }} title={driverDetails.countryCode} />
                  <Text color="gray.200" fontSize={{ base: 'sm', md: 'md' }}>{driverDetails.countryCode}</Text>
                  <Text color="gray.300">•</Text>
                  <Text color="gray.200" fontSize={{ base: 'sm', md: 'md' }}>{driverDetails.teamName}</Text>
                  <Text color="gray.300">•</Text>
                  <Text color="white" fontWeight="bold">#{driverDetails.number}</Text>
                </HStack>
              </Box>
            </Box>

            {/* 3) Driver image + car */}
            <Box justifySelf="center" position="relative" w={{ base: '100%', md: '420px' }} minW={{ base: 'auto', md: '420px' }} minH={{ base: '160px', md: '260px' }}>
              {teamCarImages[driverDetails.teamName] && (
                <Image
                  src={teamCarImages[driverDetails.teamName]}
                  alt={`${driverDetails.teamName} car`}
                  position="absolute"
                  bottom="8px"
                  left="50%"
                  transform="translateX(-50%)"
                  w={{ base: '85%', md: '420px' }}
                  maxW="none"
                  opacity={0.4}
                  objectFit="contain"
                  zIndex={1}
                />
              )}
              {driverDetails.imageUrl && (
                <Image
                  src={driverDetails.imageUrl}
                  alt={driverDetails.fullName}
                  position="absolute"
                  bottom={{ base: '-20px', md: '-32px' }}
                  left="50%"
                  transform="translateX(-50%)"
                  h={{ base: '190px', md: '300px' }}
                  zIndex={3}
                  objectFit="contain"
                />
              )}
            </Box>

            {/* 4) Spacer cell for equal spacing */}
            <Box />
          </Grid>
        </Container>
      </Box>

      <KeyInfoBar driver={driverDetails} />

      <Container maxW="container.2xl" py="xl" px={{ base: 4, md: 6 }}>
        
        {/* --- STATS SECTIONS (stacked: season above career) --- */}
        <VStack align="stretch" spacing="xl">
          <StatSection title="2025 Season" stats={driverDetails.currentSeasonStats} />
          <StatSection title="Career" stats={driverDetails.careerStats} />
        </VStack>

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