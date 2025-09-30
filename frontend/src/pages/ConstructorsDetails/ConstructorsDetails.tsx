// frontend/src/pages/Constructors/ConstructorDetails.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { Box, Flex, Text, Button, useToast, Image, SimpleGrid } from '@chakra-ui/react';
import F1LoadingSpinner from '../../components/F1LoadingSpinner/F1LoadingSpinner';
import { teamColors } from '../../lib/teamColors';
import { teamCarImages } from '../../lib/teamCars';
import TeamLogo from '../../components/TeamLogo/TeamLogo';
import { buildApiUrl } from '../../lib/api';
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
  const navigate = useNavigate();

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

  if (loading) return <F1LoadingSpinner text="Loading Constructor Details..." />;
  if (!constructor) return <Text color="red.500">Constructor not found.</Text>;

  const teamColor = `#${teamColors[constructor.name] || teamColors.Default}`;

  return (
    <Box p={['4', '6', '8']} fontFamily="var(--font-display)">
      {/* Header Bar */}
      <Flex
        justify="space-between"
        align="center"
        mb={4}
        p={4}
        borderRadius="md"
        bgGradient={`linear-gradient(135deg, ${teamColor} 0%, rgba(0,0,0,0.6) 100%)`}
      >
        {/* Left: Team Logo + Info */}
        <Flex direction="row" align="center" gap={4}>
          <Box boxSize="100px" display="flex" alignItems="center" justifyContent="center">
            <TeamLogo teamName={constructor.name} />
          </Box>
          <Flex direction="column" justify="center">
            <Text fontSize="3xl" fontWeight="bold" color="white">
              {constructor.name}
            </Text>
            <Text fontSize="md" color="gray.300">
              Nationality: {constructor.nationality}
            </Text>
          </Flex>
        </Flex>

        {/* Middle: Team Car Image */}
        {teamCarImages[constructor.name] && (
          <Image
            src={teamCarImages[constructor.name]}
            alt={`${constructor.name} car`}
            maxH="150px"
            objectFit="contain"
          />
        )}

        {/* Right: Back Button */}
        <Button onClick={() => navigate('/constructors')} color="white">
          Back to Constructors
        </Button>
      </Flex>

      {/* Stats Cards */}
      <Flex gap={4} wrap="wrap" mb={6}>
        <Box flex={1} minW="120px" p={4} bg="gray.700" borderRadius="md">
          <Text fontSize="lg" fontWeight="bold">Total Points</Text>
          <Text fontSize="2xl" fontWeight="bold">{totalPoints}</Text>
        </Box>
        <Box flex={1} minW="120px" p={4} bg="gray.700" borderRadius="md">
          <Text fontSize="lg" fontWeight="bold">Total Wins</Text>
          <Text fontSize="2xl" fontWeight="bold">{totalWins}</Text>
        </Box>
        <Box flex={1} minW="120px" p={4} bg="gray.700" borderRadius="md">
          <Text fontSize="lg" fontWeight="bold">Total Podiums</Text>
          <Text fontSize="2xl" fontWeight="bold">{totalPodiums}</Text>
        </Box>
        <Box flex={1} minW="120px" p={4} bg="gray.700" borderRadius="md">
          <Text fontSize="lg" fontWeight="bold">Total Poles</Text>
          <Text fontSize="2xl" fontWeight="bold">{totalPoles}</Text>
        </Box>
      </Flex>

      {/* Latest Season Stats */}
      {latestSeason && (
        <Flex gap={4} wrap="wrap" mb={6}>
          <Box flex={1} minW="120px" p={4} bg="gray.600" borderRadius="md">
            <Text fontSize="lg" fontWeight="bold">{seasons.find(s => s.id === latestSeason.season)?.year || 'Latest'} Points</Text>
            <Text fontSize="2xl" fontWeight="bold">{latestSeason.points}</Text>
          </Box>
          <Box flex={1} minW="120px" p={4} bg="gray.600" borderRadius="md">
            <Text fontSize="lg" fontWeight="bold">{seasons.find(s => s.id === latestSeason.season)?.year || 'Latest'} Wins</Text>
            <Text fontSize="2xl" fontWeight="bold">{latestSeason.wins}</Text>
          </Box>
          <Box flex={1} minW="120px" p={4} bg="gray.600" borderRadius="md">
            <Text fontSize="lg" fontWeight="bold">{seasons.find(s => s.id === latestSeason.season)?.year || 'Latest'} Podiums</Text>
            <Text fontSize="2xl" fontWeight="bold">{latestSeason.podiums}</Text>
          </Box>
          <Box flex={1} minW="120px" p={4} bg="gray.600" borderRadius="md">
            <Text fontSize="lg" fontWeight="bold">{seasons.find(s => s.id === latestSeason.season)?.year || 'Latest'} Poles</Text>
            <Text fontSize="2xl" fontWeight="bold">{latestSeasonPoles}</Text>
          </Box>
        </Flex>
      )}

      {/* Graphs Grid - 2 per row on desktop, 1 per row on mobile */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6} mb={6}>
        {/* Points by Season */}
        <Box w="100%" h="300px" bg="gray.800" p={4} borderRadius="md">
          <Text fontSize="lg" fontWeight="bold" mb={2}>Points by Season</Text>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={mappedPointsPerSeason.sort((a,b)=>Number(a.seasonLabel)-Number(b.seasonLabel))}>
              <CartesianGrid strokeDasharray="3 3" stroke="gray"/>
              <XAxis dataKey="seasonLabel" stroke="white"/>
              <YAxis stroke="white"/>
              <Tooltip/>
              <Line type="monotone" dataKey="points" stroke={teamColor} strokeWidth={3}/>
            </LineChart>
          </ResponsiveContainer>
        </Box>

        {/* Wins by Season */}
        <Box w="100%" h="300px" bg="gray.800" p={4} borderRadius="md">
          <Text fontSize="lg" fontWeight="bold" mb={2}>Wins by Season</Text>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={mappedPointsPerSeason.sort((a,b)=>Number(a.seasonLabel)-Number(b.seasonLabel))}>
              <CartesianGrid strokeDasharray="3 3" stroke="gray"/>
              <XAxis dataKey="seasonLabel" stroke="white"/>
              <YAxis stroke="white"/>
              <Tooltip/>
              <Line type="monotone" dataKey="wins" stroke="#F56565" strokeWidth={3}/>
            </LineChart>
          </ResponsiveContainer>
        </Box>

        {/* Podiums by Season */}
        <Box w="100%" h="300px" bg="gray.800" p={4} borderRadius="md">
          <Text fontSize="lg" fontWeight="bold" mb={2}>Podiums by Season</Text>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={mappedPointsPerSeason.sort((a,b)=>Number(a.seasonLabel)-Number(b.seasonLabel))}>
              <CartesianGrid strokeDasharray="3 3" stroke="gray"/>
              <XAxis dataKey="seasonLabel" stroke="white"/>
              <YAxis stroke="white"/>
              <Tooltip/>
              <Line type="monotone" dataKey="podiums" stroke="#ECC94B" strokeWidth={3}/>
            </LineChart>
          </ResponsiveContainer>
        </Box>

        {/* Poles by Season */}
        <Box w="100%" h="300px" bg="gray.800" p={4} borderRadius="md">
          <Text fontSize="lg" fontWeight="bold" mb={2}>Poles by Season</Text>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={mappedPolesPerSeason}>
              <CartesianGrid strokeDasharray="3 3" stroke="gray"/>
              <XAxis dataKey="seasonYear" stroke="white"/>
              <YAxis stroke="white"/>
              <Tooltip/>
              <Bar dataKey="poleCount" fill={teamColor} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </SimpleGrid>

      {/* Cumulative Progression - Full Width */}
      {cumulativeProgression.length > 0 && (
        <Box w="100%" h="400px" bg="gray.800" p={4} borderRadius="md" mb={6}>
          <Text fontSize="lg" fontWeight="bold" mb={2}>Cumulative Points Progression ({seasons.find(s => s.id === latestSeason?.season)?.year || 'Latest'})</Text>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={cumulativeProgression}>
              <CartesianGrid strokeDasharray="3 3" stroke="gray" />
              <XAxis dataKey="round" stroke="white" />
              <YAxis stroke="white" />
              <Tooltip />
              <Line type="monotone" dataKey="cumulativePoints" stroke={teamColor} strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}

      {/* Best Race */}
      {topRace && (
        <Box p={4} bg="gray.700" borderRadius="md" minW="200px">
          <Text fontSize="lg" fontWeight="bold" textAlign="left">
            {constructor.name} {seasons.find(s => s.id === latestSeason?.season)?.year || 'Latest'} BEST RACE:
          </Text>
          <Text fontSize="lg" fontWeight="bold" textAlign="left">
            Round {topRace.round}: {topRace.raceName}
          </Text>
          <Text fontSize="xl" mt={2} textAlign="left">Points: {topRace.points}</Text>
        </Box>
      )}
    </Box>
  );
};

export default ConstructorDetails;































