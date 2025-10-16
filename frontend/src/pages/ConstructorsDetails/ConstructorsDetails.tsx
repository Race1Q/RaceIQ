// frontend/src/pages/Constructors/ConstructorDetails.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { Box, Flex, Text, Button, useToast, Image, SimpleGrid, Container, Heading, useColorModeValue, VStack } from '@chakra-ui/react';
import { WarningTwoIcon } from '@chakra-ui/icons';
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
import F1CockpitXR from '../../experiences/xr/F1CockpitXR';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';


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
        const constructorData: Constructor = await authedFetch(
          `/api/constructors/${constructorId}`
        );
        setConstructor(constructorData);

        const seasonPointsData: SeasonPoints[] = await authedFetch(
          `/api/race-results/constructor/${constructorId}/season-points`
        );
        setPointsPerSeason(seasonPointsData);

        const seasonsData: Season[] = await authedFetch(`/api/seasons`);
        setSeasons(seasonsData);

        if (seasonsData.length > 0) {
          const latestSeasonObj = seasonsData.reduce(
            (prev, curr) => (curr.year > prev.year ? curr : prev),
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

        // Poles
        const polesData = await authedFetch(
          `/api/races/constructor/${constructorId}/poles`
        );
        setTotalPoles(polesData.poles);
        //console.log('Total Poles:', polesData.poles);

        const polesBySeasonData: SeasonPoles[] = await authedFetch(
          `/api/races/constructor/${constructorId}/poles-by-season`
        );
        setPolesBySeason(polesBySeasonData);
        //console.log('Poles by Season:', polesBySeasonData);

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
    <Box bg={pageBgColor} color={pageTextColor} minH="100vh" pb={{ base: 4, md: 6, lg: 8 }} fontFamily="var(--font-display)">
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
          <Flex
        justify="space-between"
        align="center"
        mb={4}
        p={{ base: 6, md: 8 }}
        minH={{ base: '180px', md: '240px' }}
        borderRadius="md"
        position="relative"
        overflow="hidden"
        bgGradient={headerGradient}
        direction={{ base: 'column', md: 'row' }}
        gap={{ base: 4, md: 0 }}
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
        {/* Left: Team Logo + Info */}
        <Flex direction={{ base: 'column', sm: 'row' }} align="center" gap={4} zIndex={1}>
          <Box boxSize={{ base: '80px', md: '100px' }} display="flex" alignItems="center" justifyContent="center">
            <TeamLogo teamName={constructor.name} />
          </Box>
          <Flex direction="column" justify="center" align={{ base: 'center', sm: 'flex-start' }}>
            <Heading as="h1" lineHeight={1} color="white" textAlign={{ base: 'center', sm: 'left' }}>
              <Text
                fontFamily="heading"
                textTransform="uppercase"
                fontWeight="900"
                letterSpacing={{ base: '0.01em', md: '0.02em' }}
                fontSize={{ base: '4xl', md: '7xl', xl: '8xl' }}
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

        {/* Middle: Team Car Image */}
        {(teamCarImages[constructor.name] || isHistorical) && (
          <Image
            src={isHistorical ? '/assets/F1Car.png' : teamCarImages[constructor.name]}
            alt={`${constructor.name} car`}
            maxH={{ base: '140px', md: '220px' }}
            maxW={{ base: '280px', md: '440px' }}
            w="auto"
            h="auto"
            objectFit="contain"
            flexShrink={0}
          />
        )}

        {/* Right: Placeholder to maintain spacing */}
        <Box display={{ base: 'none', md: 'block' }} />
      </Flex>
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

      {/* Graphs Grid - 2 per row on desktop, 1 per row on mobile */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6} mb={6}>
        {/* Points by Season */}
        <Box w="100%" h="300px" bg={chartBgColor} p={4} borderRadius="md" border="1px solid" borderColor="border-primary">
          <Text fontSize="lg" fontWeight="bold" mb={2} color={chartTextColor}>Points by Season</Text>
          {hasPoints ? (
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={sortedPoints}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor}/>
                <XAxis dataKey="seasonLabel" stroke={axisColor}/>
                <YAxis stroke={axisColor}/>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    border: `1px solid ${tooltipBorder}`,
                    borderRadius: '8px',
                    color: tooltipTextColor
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="points" 
                  stroke={lineColor}
                  strokeWidth={3}
                  connectNulls={true}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  dot={{ fill: lineColor, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: lineColor, strokeWidth: 2 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <NoData message="No points recorded" />
          )}
        </Box>

        {/* Wins by Season */}
        <Box w="100%" h="300px" bg={chartBgColor} p={4} borderRadius="md" border="1px solid" borderColor="border-primary">
          <Text fontSize="lg" fontWeight="bold" mb={2} color={chartTextColor}>Wins by Season</Text>
          {hasWins ? (
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={sortedPoints}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor}/>
                <XAxis dataKey="seasonLabel" stroke={axisColor}/>
                <YAxis stroke={axisColor}/>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    border: `1px solid ${tooltipBorder}`,
                    borderRadius: '8px',
                    color: tooltipTextColor
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="wins" 
                  stroke="#F56565" 
                  strokeWidth={3}
                  connectNulls
                  dot={{ fill: '#F56565', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#F56565', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <NoData message="No wins recorded" />
          )}
        </Box>

        {/* Podiums by Season */}
        <Box w="100%" h="300px" bg={chartBgColor} p={4} borderRadius="md" border="1px solid" borderColor="border-primary">
          <Text fontSize="lg" fontWeight="bold" mb={2} color={chartTextColor}>Podiums by Season</Text>
          {hasPodiumsData ? (
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={sortedPoints}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor}/>
                <XAxis dataKey="seasonLabel" stroke={axisColor}/>
                <YAxis stroke={axisColor}/>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    border: `1px solid ${tooltipBorder}`,
                    borderRadius: '8px',
                    color: tooltipTextColor
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="podiums" 
                  stroke="#ECC94B" 
                  strokeWidth={3}
                  connectNulls
                  dot={{ fill: '#ECC94B', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#ECC94B', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <NoData message="No podiums recorded" />
          )}
        </Box>

        {/* Poles by Season */}
        <Box w="100%" h="300px" bg={chartBgColor} p={4} borderRadius="md" border="1px solid" borderColor="border-primary">
          <Text fontSize="lg" fontWeight="bold" mb={2} color={chartTextColor}>Poles by Season</Text>
          {hasPoles ? (
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={mappedPolesPerSeason}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor}/>
                <XAxis dataKey="seasonYear" stroke={axisColor}/>
                <YAxis stroke={axisColor}/>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    border: `1px solid ${tooltipBorder}`,
                    borderRadius: '8px',
                    color: tooltipTextColor
                  }}
                />
              <Bar dataKey="poleCount" fill={lineColor} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <NoData message="No pole positions recorded" />
          )}
        </Box>
      </SimpleGrid>

      {/* Cumulative Progression - Full Width */}
      {cumulativeProgression.length > 0 && (
        <Box w="100%" h="400px" bg={chartBgColor} p={4} borderRadius="md" border="1px solid" borderColor="border-primary" mb={6}>
          <Text fontSize="lg" fontWeight="bold" mb={2} color={chartTextColor}>Cumulative Points Progression ({seasons.find(s => s.id === latestSeason?.season)?.year || 'Latest'})</Text>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={cumulativeProgression}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="round" stroke={axisColor} />
              <YAxis stroke={axisColor} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: tooltipBg,
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: '8px',
                  color: tooltipTextColor
                }}
              />
              <Line 
                type="monotone" 
                dataKey="cumulativePoints" 
                stroke={lineColor} 
                strokeWidth={3}
                dot={{ fill: lineColor, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: lineColor, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}

      {/* Best Race */}
      {topRace && (
        <Box p={4} bg={bestRaceBg} borderRadius="md" minW="200px" border="1px solid" borderColor="border-primary">
          <Text fontSize="lg" fontWeight="bold" textAlign="left" color={chartTextColor}>
            {constructor.name} {seasons.find(s => s.id === latestSeason?.season)?.year || 'Latest'} BEST RACE:
          </Text>
          <Text fontSize="lg" fontWeight="bold" textAlign="left" color={chartTextColor}>
            Round {topRace.round}: {topRace.raceName}
          </Text>
          <Text fontSize="xl" mt={2} textAlign="left" color={chartTextColor}>Points: {topRace.points}</Text>
        </Box>
      )}

      {/* AI Team Analysis - moved below all stats and graphs */}
      <Box mb={6}>
        <ConstructorInfoCard constructorId={constructor.id} season={latestSeasonYear} />
      </Box>

      {/* 3D Cockpit Viewer - Available for all teams */}
      {["Red Bull", "Mercedes", "Ferrari", "McLaren", "Aston Martin", "Alpine F1 Team", "Williams", "RB F1 Team", "Sauber", "Haas F1 Team"].includes(constructor.name) && (
        <Box mb={{ base: 4, md: 6 }}>
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
            bg={useColorModeValue('gray.100', 'gray.900')} 
            borderRadius="md" 
            overflow="hidden"
            border="1px solid"
            borderColor={borderColor}
            boxShadow={useColorModeValue('0 4px 20px rgba(0,0,0,0.1)', '0 4px 20px rgba(0,0,0,0.5)')}
          >
            <F1CockpitXR modelUrl={getTeamCarModel(constructor.name)} teamName={constructor.name} />
          </Box>
        </Box>
      )}
      </Container>
    </Box>
  );
};

export default ConstructorDetails;































