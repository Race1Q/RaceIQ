// frontend/src/pages/DriverDetailPage/DriverDetailPage.tsx
import React from 'react';
import { Container, Box, Text, Button, Heading, Grid, HStack, Image, VStack, SimpleGrid } from '@chakra-ui/react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useDriverDetails } from '../../hooks/useDriverDetails';
import { useDriverSeasonStats } from '../../hooks/useDriverSeasonStats';
import { useDriverSeasonProgression } from '../../hooks/useDriverSeasonProgression';
import KeyInfoBar from '../../components/KeyInfoBar/KeyInfoBar';
import DriverDetailSkeleton from './DriverDetailSkeleton';
import ReactCountryFlag from 'react-country-flag';
import { countryCodeMap } from '../../lib/countryCodeUtils';
import { teamCarImages } from '../../lib/teamCars';
import { teamColors } from '../../lib/teamColors';
import StatSection from '../../components/DriverDetails/StatSection';
import {
  PointsBySeasonChart,
  WinsBySeasonChart,
  PodiumsBySeasonChart,
  PolesBySeasonChart,
  CumulativeProgressionChart,
  ChartSkeleton
} from '../../components/DriverCharts';
import TeamLogo from '../../components/TeamLogo/TeamLogo';
import DriverBioCard from '../../components/DriverBioCard/DriverBioCard';

const DriverDetailPage: React.FC = () => {
  const { driverId } = useParams<{ driverId: string }>();
  const { driverDetails, loading, error } = useDriverDetails(driverId);
  const { seasonStats, loading: seasonStatsLoading } = useDriverSeasonStats(driverId);
  const { progressionData, loading: progressionLoading } = useDriverSeasonProgression(driverId);

  // --- DEBUG STEP 3: Log the data as it's received by the page component ---
  console.log("%c3. Data Received by Page Component:", "color: orange; font-weight: bold;", driverDetails);

  if (loading) return <DriverDetailSkeleton />;
  if (error || !driverDetails) return <Text p="lg">Error: {error || 'Driver data could not be loaded.'}</Text>;

  const teamColor = `#${teamColors[driverDetails.teamName] || teamColors.Default}`;
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
      <Box 
        color="text-primary" 
        py={{ base: 6, md: 8 }}
        sx={{
          background: `
            radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0),
            linear-gradient(45deg, #0a0a0a 25%, transparent 25%, transparent 75%, #0a0a0a 75%),
            linear-gradient(-45deg, #0a0a0a 25%, transparent 25%, transparent 75%, #0a0a0a 75%)
          `,
          backgroundSize: '20px 20px, 20px 20px, 20px 20px',
          backgroundColor: '#0a0a0a',
          _light: {
            background: `
              radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 0),
              linear-gradient(45deg, #f8f9fa 25%, transparent 25%, transparent 75%, #f8f9fa 75%),
              linear-gradient(-45deg, #f8f9fa 25%, transparent 25%, transparent 75%, #f8f9fa 75%)
            `,
            backgroundSize: '20px 20px, 20px 20px, 20px 20px',
            backgroundColor: '#f8f9fa',
          }
        }}
      >
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
              <Heading as="h1" lineHeight={1} color="text-on-accent" alignSelf="start">
                <Text
                  fontFamily="signature"
                  fontWeight="normal"
                  letterSpacing="-0.02em"
                  fontSize={{ base: '4xl', md: '6xl', xl: '7xl' }}
                  mb={{ base: -2, md: -4 }}
                >
                  {driverDetails.firstName}
                </Text>
                <Box w="100%">
                  <Text
                    fontFamily="heading"
                    textTransform="uppercase"
                    fontWeight="900"
                    letterSpacing={{ base: '0.01em', md: '0.02em' }}
                    fontSize={{ 
                      base: driverDetails.lastName.length > 12 ? '2xl' : driverDetails.lastName.length > 8 ? '3xl' : '4xl',
                      md: driverDetails.lastName.length > 12 ? '4xl' : driverDetails.lastName.length > 8 ? '5xl' : '6xl', 
                      xl: driverDetails.lastName.length > 12 ? '5xl' : driverDetails.lastName.length > 8 ? '6xl' : '7xl'
                    }}
                    lineHeight={0.95}
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                  >
                    {driverDetails.lastName}
                  </Text>
                </Box>
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
                  <Text color="text-on-accent" fontSize={{ base: 'sm', md: 'md' }}>{driverDetails.countryCode}</Text>
                  <Text color="text-on-accent" opacity={0.7}>•</Text>
                  <Text color="text-on-accent" fontSize={{ base: 'sm', md: 'md' }}>{driverDetails.teamName}</Text>
                  <Text color="text-on-accent" opacity={0.7}>•</Text>
                  <Text color="text-on-accent" fontWeight="bold">#{driverDetails.number}</Text>
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

      <KeyInfoBar driver={driverDetails} teamColor={teamColor} />

      <Container maxW="container.2xl" py="xl" px={{ base: 4, md: 6 }}>
        
        {/* --- STATS SECTIONS (stacked: season above career) --- */}
        <VStack align="stretch" spacing="xl">
          <StatSection title="2025 Season" stats={driverDetails.currentSeasonStats} />
          <StatSection title="Career" stats={driverDetails.careerStats} />
        </VStack>

        {/* --- PERFORMANCE TREND CHARTS (2x2 Grid) --- */}
        <Box mt="xl">
          <Heading size="md" fontFamily="heading" mb="md" color="text-primary">Performance Trends</Heading>
          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6} mb={6}>
            {seasonStatsLoading ? (
              <>
                <ChartSkeleton title="Points by Season" />
                <ChartSkeleton title="Wins by Season" />
                <ChartSkeleton title="Podiums by Season" />
                <ChartSkeleton title="Poles by Season" />
              </>
            ) : (
              <>
                <PointsBySeasonChart data={seasonStats} teamColor={teamColor} />
                <WinsBySeasonChart data={seasonStats} />
                <PodiumsBySeasonChart data={seasonStats} />
                <PolesBySeasonChart data={seasonStats} teamColor={teamColor} />
              </>
            )}
          </SimpleGrid>
        </Box>

        {/* --- CURRENT SEASON PROGRESSION CHART (Full Width) --- */}
        {progressionData.length > 0 && (
          <Box mb={6}>
            {progressionLoading ? (
              <ChartSkeleton title="Cumulative Points Progression" height="400px" />
            ) : (
              <CumulativeProgressionChart 
                data={progressionData} 
                teamColor={teamColor} 
                season={progressionData[0]?.year || new Date().getFullYear()}
              />
            )}
          </Box>
        )}


        {/* --- AI-GENERATED BIO SECTION --- */}
        <Box mt="xl">
          <Heading size="md" fontFamily="heading" mb="md" color="text-primary">Driver Biography</Heading>
          <DriverBioCard driverId={Number(driverId)} season={2025} />
        </Box>
      </Container>
    </Box>
  );
};

export default DriverDetailPage;