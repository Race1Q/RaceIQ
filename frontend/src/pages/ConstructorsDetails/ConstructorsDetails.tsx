// frontend/src/pages/Constructors/ConstructorDetails.tsx

import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { Box, Flex, Text, Button, useToast, Image, SimpleGrid, Container, Heading, useColorModeValue, VStack } from '@chakra-ui/react';
import { WarningTwoIcon } from '@chakra-ui/icons';
import { useInView } from 'react-intersection-observer';
import ConstructorsDetailsSkeleton from './ConstructorsDetailsSkeleton';
import { teamColors } from '../../lib/teamColors';
import { teamCarImages } from '../../lib/teamCars';
import { getTeamCarModel } from '../../lib/teamCarModels';
import { COUNTRY_COLORS } from '../../theme/teamTokens';
import TeamLogo from '../../components/TeamLogo/TeamLogo';
import { buildApiUrl } from '../../lib/api';
import StatSection from '../../components/DriverDetails/StatSection';
import type { Stat } from '../../types';
import ConstructorInfoCard from '../../components/ConstructorInfoCard/ConstructorInfoCard';

// Lazy load heavy components for better performance - ONLY when visible
const F1CockpitXR = lazy(() => import('../../experiences/xr/F1CockpitXR'));
const LazyCharts = lazy(() => import('./ConstructorChartsLazy'));


interface Constructor {
  id: number;
  name: string;
  nationality: string;
  url: string;
}

interface SeasonPoints {
  season: number;
  points: number;
  wins: number;
  podiums: number;
  totalRaces: number;
}

interface Season {
  id: number;
  year: number;
}

interface CumulativeProgression {
  round: number;
  raceName: string;
  racePoints: number;
  cumulativePoints: number;
}
interface SeasonPoles {
  year: number;
  poles: number;
}

// Removed bespoke BACKEND_URL logic; all endpoints now built via buildApiUrl.

const ConstructorDetails: React.FC = () => {
  const { constructorId } = useParams<{ constructorId: string }>();
  const { getAccessTokenSilently } = useAuth0();
  const toast = useToast();

  const [constructor, setConstructor] = useState<Constructor | null>(null);
  const [pointsPerSeason, setPointsPerSeason] = useState<SeasonPoints[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [cumulativeProgression, setCumulativeProgression] = useState<CumulativeProgression[]>([]);
  const [totalPoles, setTotalPoles] = useState<number>(0);
  const [polesBySeason, setPolesBySeason] = useState<SeasonPoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [topRace, setTopRace] = useState<{ round: number; raceName: string; points: number } | null>(null);

  // Intersection Observer to only load charts when visible
  const { ref: chartsRef, inView: chartsInView } = useInView({
    triggerOnce: true,
    rootMargin: '200px', // Start loading 200px before visible
  });

  // Intersection Observer for 3D model
  const { ref: modelRef, inView: modelInView } = useInView({
    triggerOnce: true,
    rootMargin: '300px', // Start loading 300px before visible
  });


  const authedFetch = useCallback(
    async (path: string) => {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          scope: 'read:race-results read:races',
        },
      });

      const response = await fetch(buildApiUrl(path), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `Failed to fetch data: ${response.status} ${response.statusText} - ${errorBody}`
        );
      }

      return response.json();
    },
    [getAccessTokenSilently]
  );

  useEffect(() => {
    const fetchConstructorDetails = async () => {
      if (!constructorId) return;
      setLoading(true);
      try {
        // ⚡ OPTIMIZATION: Run all independent API calls in PARALLEL
        const [constructorData, seasonPointsData, seasonsData, polesData, polesBySeasonData] = await Promise.all([
          authedFetch(`/api/constructors/${constructorId}`),
          authedFetch(`/api/race-results/constructor/${constructorId}/season-points`),
          authedFetch(`/api/seasons`),
          authedFetch(`/api/races/constructor/${constructorId}/poles`),
          authedFetch(`/api/races/constructor/${constructorId}/poles-by-season`),
        ]);

        // Set all state at once
        setConstructor(constructorData);
        setPointsPerSeason(seasonPointsData);
        setSeasons(seasonsData);
        setTotalPoles(polesData.poles);
        setPolesBySeason(polesBySeasonData);

        // Fetch cumulative progression (depends on seasons data)
        if (seasonsData.length > 0) {
          const latestSeasonObj = seasonsData.reduce(
            (prev: Season, curr: Season) => (curr.year > prev.year ? curr : prev),
            seasonsData[0]
          );
          const latestSeasonId = latestSeasonObj.id;

          const cumulativeData: CumulativeProgression[] = await authedFetch(
            `/api/race-results/constructor/${constructorId}/season/${latestSeasonId}/progression`
          );
          setCumulativeProgression(cumulativeData);
          
          if (cumulativeData.length > 0) {
            const bestRace = cumulativeData.reduce((prev, curr) =>
              curr.racePoints > prev.racePoints ? curr : prev
            );
            setTopRace({ round: bestRace.round, raceName: bestRace.raceName, points: bestRace.racePoints });
          }
        }

      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
        toast({
          title: 'Failed to load constructor data',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConstructorDetails();
  }, [constructorId, authedFetch, toast]);

  const mappedPointsPerSeason = useMemo(() => {
    if (!pointsPerSeason || !Array.isArray(pointsPerSeason)) return [];
    return pointsPerSeason.map((s) => {
      const seasonObj = seasons.find((season) => season.id === s.season);
      return {
        ...s,
        seasonLabel: seasonObj ? seasonObj.year.toString() : `Season ${s.season}`,
      };
    });
  }, [pointsPerSeason, seasons]);

   // Map poles per season for chart
   const mappedPolesPerSeason = useMemo(() => {
    return polesBySeason
      .map((s) => ({
        seasonYear: s.year,
        poleCount: Number(s.poles),
      }))
      .sort((a, b) => a.seasonYear - b.seasonYear);
  }, [polesBySeason]);

  const latestSeason = useMemo(() => {
    if (!pointsPerSeason || pointsPerSeason.length === 0) return null;
    let latest = pointsPerSeason[0];
    pointsPerSeason.forEach((s) => {
      const seasonObj = seasons.find((season) => season.id === s.season);
      const latestObj = seasons.find((season) => season.id === latest.season);
      if (seasonObj && latestObj && seasonObj.year > latestObj.year) {
        latest = s;
      }
    });
    return latest;
  }, [pointsPerSeason, seasons]);

  // Latest season poles (fixed mapping by year)
  const latestSeasonPoles = useMemo(() => {
    if (!latestSeason) return 0;
    const latestYear = seasons.find(s => s.id === latestSeason.season)?.year;
    if (!latestYear) return 0;
    const entry = mappedPolesPerSeason.find(p => p.seasonYear === latestYear);
    return entry ? entry.poleCount : 0;
  }, [latestSeason, mappedPolesPerSeason, seasons]);

  // Normalize numeric fields and sort by season label for charting consistency
  const sortedPoints = useMemo(() => {
    const normalized = mappedPointsPerSeason.map(p => ({
      ...p,
      points: Number((p as any).points ?? 0),
      wins: Number((p as any).wins ?? 0),
      podiums: Number((p as any).podiums ?? 0),
    }));
    
    // Sort by season year (not label) to ensure proper chronological order
    const sorted = normalized.sort((a, b) => {
      const seasonA = seasons.find(s => s.id === a.season)?.year || 0;
      const seasonB = seasons.find(s => s.id === b.season)?.year || 0;
      return seasonA - seasonB;
    });
    
    // Debug log to help diagnose chart issues
    console.log('Chart data for Points by Season:', sorted.map(s => ({
      seasonLabel: s.seasonLabel,
      points: s.points,
      season: s.season
    })));
    
    return sorted;
  }, [mappedPointsPerSeason, seasons]);

  // Dataset availability flags
  const hasPoints = sortedPoints.length > 0 && sortedPoints.some(p => Number(p.points) >= 0);
  const hasWins = sortedPoints.some(p => Number(p.wins || 0) > 0);
  const hasPodiumsData = sortedPoints.some(p => Number(p.podiums || 0) > 0);
  const hasPoles = mappedPolesPerSeason.length > 0 && mappedPolesPerSeason.some(p => Number(p.poleCount || 0) > 0);

  // Reusable fallback for charts with no data
  const NoData = ({ message = 'No data available' }: { message?: string }) => (
    <Flex w="100%" h="90%" align="center" justify="center">
      <VStack spacing={2} opacity={0.7}>
        <WarningTwoIcon boxSize={6} />
        <Text fontSize="sm">{message}</Text>
      </VStack>
    </Flex>
  );

  const totalPoints = useMemo(
    () => pointsPerSeason.reduce((acc, s) => acc + (s.points || 0), 0),
    [pointsPerSeason]
  );
  const totalWins = useMemo(
    () => pointsPerSeason.reduce((acc, s) => acc + (s.wins || 0), 0),
    [pointsPerSeason]
  );
  const totalPodiums = useMemo(
    () => pointsPerSeason.reduce((acc, s) => acc + (s.podiums || 0), 0),
    [pointsPerSeason]
  );

  // Map totals to DriverDetails-style Stat cards (hooks must be before early returns)
  const totalStats: Stat[] = useMemo(
    () => [
      { label: 'Total Points', value: totalPoints },
      { label: 'Total Wins', value: totalWins },
      { label: 'Total Podiums', value: totalPodiums },
      { label: 'Total Poles', value: totalPoles },
    ],
    [totalPoints, totalWins, totalPodiums, totalPoles]
  );

  const latestSeasonYear = useMemo(() => {
    if (!latestSeason) return undefined;
    return seasons.find((s) => s.id === latestSeason.season)?.year;
  }, [latestSeason, seasons]);

  const latestStats: Stat[] = useMemo(() => {
    if (!latestSeason || !latestSeasonYear) return [];
    return [
      { label: `${latestSeasonYear} Points`, value: latestSeason.points },
      { label: `${latestSeasonYear} Wins`, value: latestSeason.wins },
      { label: `${latestSeasonYear} Podiums`, value: latestSeason.podiums },
      { label: `${latestSeasonYear} Poles`, value: latestSeasonPoles },
    ];
  }, [latestSeason, latestSeasonYear, latestSeasonPoles]);

  // Theme-aware colors for charts and page elements
  const chartBgColor = useColorModeValue('white', 'gray.800');
  const chartTextColor = useColorModeValue('gray.800', 'white');
  const gridColor = useColorModeValue('#E2E8F0', '#4A5568');
  const axisColor = useColorModeValue('gray.800', 'white');
  const tooltipBg = useColorModeValue('white', 'gray.800');
  const tooltipBorder = useColorModeValue('#E2E8F0', '#4A5568');
  const tooltipTextColor = useColorModeValue('gray.800', 'white');
  const bestRaceBg = useColorModeValue('gray.50', 'gray.700');
  
  // Page-level theme colors
  const pageBgColor = useColorModeValue('#F0F2F5', '#0a0a0a');
  const pageTextColor = useColorModeValue('#1A202C', '#ffffff');
  const surfaceBgColor = useColorModeValue('#FFFFFF', '#0f0f0f');
  const borderColor = useColorModeValue('#E2E8F0', '#333333');
  
  // Cockpit viewer colors (must be before early returns)
  const cockpitBgColor = useColorModeValue('gray.100', 'gray.900');
  const cockpitShadow = useColorModeValue('0 4px 20px rgba(0,0,0,0.1)', '0 4px 20px rgba(0,0,0,0.5)');

  if (loading) return <ConstructorsDetailsSkeleton />;
  if (!constructor) return <Text color="red.500">Constructor not found.</Text>;

  // Check if this is a historical team
  const isHistorical = !teamCarImages[constructor.name];
  
  // Use country colors for historical teams, team colors for active teams
  // Normalize team line color to always include leading '#'
  const lineColor = isHistorical
    ? `#${COUNTRY_COLORS[constructor.nationality]?.hex || COUNTRY_COLORS['default'].hex}`
    : `#${teamColors[constructor.name] || teamColors.Default}`;

  // Use country gradient for historical teams, team color for active teams
  const headerGradient = isHistorical 
    ? COUNTRY_COLORS[constructor.nationality]?.gradient || COUNTRY_COLORS['default'].gradient
    : `linear-gradient(135deg, ${lineColor} 0%, rgba(0,0,0,0.6) 100%)`;

  return (
    <Box 
      color={pageTextColor} 
      minH="100vh" 
      pb={{ base: 4, md: 6, lg: 8 }} 
      fontFamily="var(--font-display)"
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
      {/* Top Utility Bar */}
      <Box bg={surfaceBgColor} borderBottom="1px solid" borderColor={borderColor}>
        <Container maxW="container.2xl" px={{ base: 4, md: 6 }} py={{ base: 2, md: 3 }}>
          <Button
            onClick={() => window.history.back()}
            size={{ base: 'sm', md: 'md' }}
            variant="outline"
            borderColor={borderColor}
          >
            Back to Constructors
          </Button>
        </Container>
      </Box>

      {/* Header Bar */}
      <Box bg={pageBgColor} color={pageTextColor} py={{ base: 6, md: 8 }}>
        <Container maxW="container.2xl" px={{ base: 4, md: 6 }}>
          <Box
            mb={4}
            p={{ base: 6, md: 8 }}
            minH={{ base: '180px', md: '240px' }}
            borderRadius="md"
            position="relative"
            bgGradient={`linear-gradient(135deg, ${teamColor} 0%, rgba(0,0,0,0.6) 100%)`}
            overflow="hidden"
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
            {/* Responsive Grid Layout */}
            <Box
              display="grid"
              gridTemplateColumns={{ 
                base: "1fr", 
                lg: "auto 1fr auto", 
                xl: "auto 1fr auto auto" 
              }}
              gridTemplateRows={{ base: "auto auto auto", lg: "1fr" }}
              gap={{ base: 4, lg: 6 }}
              alignItems="center"
              minH="full"
              position="relative"
              zIndex={1}
            >
              {/* Left: Team Logo + Info */}
              <Flex 
                direction={{ base: 'column', md: 'row' }} 
                align="center" 
                gap={4}
                gridColumn={{ base: "1", lg: "1" }}
                gridRow={{ base: "1", lg: "1" }}
                justifySelf={{ base: "center", lg: "start" }}
              >
                <Box boxSize={{ base: '70px', md: '90px' }} display="flex" alignItems="center" justifyContent="center">
                  <TeamLogo teamName={constructor.name} />
                </Box>
                <Flex direction="column" justify="center" align={{ base: 'center', md: 'flex-start' }}>
                  <Heading as="h1" lineHeight={1} color="white" textAlign={{ base: 'center', md: 'left' }}>
                    <Text
                      fontFamily="heading"
                      textTransform="uppercase"
                      fontWeight="900"
                      letterSpacing={{ base: '0.01em', md: '0.02em' }}
                      fontSize={{ base: '3xl', md: '5xl', xl: '6xl' }}
                      lineHeight={0.95}
                    >
                      {constructor.name}
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
                    <Text color="gray.200" fontSize={{ base: 'sm', md: 'md' }}>
                      Nationality: {constructor.nationality}
                    </Text>
                  </Box>
                </Flex>
              </Flex>

              {/* Car Image Container - Properly constrained */}
              {teamCarImages[constructor.name] && (
                <Box
                  gridColumn={{ base: "1", lg: "2", xl: "3" }}
                  gridRow={{ base: "2", lg: "1" }}
                  display="flex"
                  alignItems="center"
                  justifyContent={{ base: "center", lg: "center", xl: "flex-end" }}
                  maxW={{ base: "100%", lg: "400px", xl: "550px" }}
                  overflow="hidden"
                  position="relative"
                >
                  <Image
                    src={teamCarImages[constructor.name]}
                    alt={`${constructor.name} car`}
                    maxH={{ base: '140px', md: '200px', lg: '240px', xl: '280px' }}
                    maxW="100%"
                    w="auto"
                    h="auto"
                    objectFit="contain"
                    flexShrink={0}
                    transform={{ base: "none", lg: "translateX(10px)", xl: "translateX(20px)" }}
                    filter="drop-shadow(0 4px 8px rgba(0,0,0,0.3))"
                  />
                </Box>
              )}

              {/* Right Spacer - Only on extra large screens */}
              <Box 
                display={{ base: "none", xl: "block" }}
                gridColumn="4"
                gridRow="1"
                w="60px"
              />
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxW="container.2xl" px={{ base: 4, md: 6 }}>
        {/* Latest Season Stats - styled like Driver Details (placed first) */}
      {latestStats.length > 0 && (
        <Box mb={6}>
          <StatSection title={`${latestSeasonYear} Season`} stats={latestStats} />
        </Box>
      )}

      {/* Career Totals - styled like Driver Details */}
      <Box mb={6}>
        <StatSection title="Career Totals" stats={totalStats} />
      </Box>

      {/* Lazy-loaded Charts Section - Only loads when in view */}
      <Box ref={chartsRef} minH="600px">
        {chartsInView ? (
          <Suspense fallback={
            <Box textAlign="center" py={8}>
              <Spinner size="lg" color={teamColor} />
              <Text mt={4} color="text-muted">Loading charts...</Text>
            </Box>
          }>
            <LazyCharts
              mappedPointsPerSeason={mappedPointsPerSeason}
              mappedPolesPerSeason={mappedPolesPerSeason}
              cumulativeProgression={cumulativeProgression}
              teamColor={teamColor}
              chartBgColor={chartBgColor}
              chartTextColor={chartTextColor}
              gridColor={gridColor}
              axisColor={axisColor}
              tooltipBg={tooltipBg}
              tooltipBorder={tooltipBorder}
              tooltipTextColor={tooltipTextColor}
              seasons={seasons}
              latestSeason={latestSeason}
              topRace={topRace}
              bestRaceBg={bestRaceBg}
            />
          </Suspense>
        ) : (
          <Box textAlign="center" py={16}>
            <Text color="text-muted">Scroll down to view performance charts</Text>
          </Box>
        )}
      </Box>

      {/* AI Team Analysis */}
      <Box mb={6}>
        <ConstructorInfoCard constructorId={constructor.id} season={latestSeasonYear} />
      </Box>

      {/* 3D Cockpit Viewer - Available for all teams (Truly lazy loaded with Intersection Observer) */}
      {["Red Bull", "Mercedes", "Ferrari", "McLaren", "Aston Martin", "Alpine F1 Team", "Williams", "RB F1 Team", "Sauber", "Haas F1 Team"].includes(constructor.name) && (
        <Box mb={{ base: 4, md: 6 }} ref={modelRef}>
          <Flex justify="space-between" align="center" mb={{ base: 3, md: 4 }} flexWrap="wrap" gap={2}>
            <Heading 
              as="h2" 
              size={{ base: "md", md: "lg" }} 
              fontFamily="heading" 
              textTransform="uppercase"
            >
              Explore the {constructor.name} Cockpit
            </Heading>
            <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500">
              Interactive 3D Model
            </Text>
          </Flex>
          <Box 
            bg={cockpitBgColor}
            borderRadius="md" 
            overflow="hidden"
            border="1px solid"
            borderColor={borderColor}
            boxShadow={cockpitShadow}
            minH="400px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {modelInView ? (
              <Suspense fallback={
                <Box textAlign="center" py={16}>
                  <Spinner size="xl" color={teamColor} thickness="4px" />
                  <Text mt={6} color="text-muted" fontSize="lg">Loading 3D Model...</Text>
                  <Text mt={2} color="text-muted" fontSize="sm">This may take a moment</Text>
                </Box>
              }>
                <F1CockpitXR modelUrl={getTeamCarModel(constructor.name)} teamName={constructor.name} />
              </Suspense>
            ) : (
              <Box textAlign="center" py={16}>
                <Text color="text-muted" fontSize="lg">Scroll to load 3D model</Text>
              </Box>
            )}
          </Box>
        </Box>
      )}
      </Container>
    </Box>
  );
};

export default ConstructorDetails;































