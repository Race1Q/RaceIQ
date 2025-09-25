// frontend/src/pages/Constructors/ConstructorDetails.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { Box, Flex, Text, Button, useToast, Image } from '@chakra-ui/react';
import F1LoadingSpinner from '../../components/F1LoadingSpinner/F1LoadingSpinner';
import { teamColors } from '../../lib/teamColors';
import { getTeamLogo } from '../../lib/teamAssets';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
  cumulativePoints: number;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const ConstructorDetails: React.FC = () => {
  const { constructorId } = useParams<{ constructorId: string }>();
  const { getAccessTokenSilently } = useAuth0();
  const toast = useToast();
  const navigate = useNavigate();

  const [constructor, setConstructor] = useState<Constructor | null>(null);
  const [pointsPerSeason, setPointsPerSeason] = useState<SeasonPoints[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [cumulativeProgression, setCumulativeProgression] = useState<CumulativeProgression[]>([]);
  const [loading, setLoading] = useState(true);

  const authedFetch = useCallback(
    async (url: string) => {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          scope: 'read:race-results',
        },
      });

      const response = await fetch(url, {
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
          `${BACKEND_URL}api/constructors/${constructorId}`
        );
        setConstructor(constructorData);

        const seasonPointsData: SeasonPoints[] = await authedFetch(
          `${BACKEND_URL}api/race-results/constructor/${constructorId}/season-points`
        );
        setPointsPerSeason(seasonPointsData);

        const seasonsData: Season[] = await authedFetch(`${BACKEND_URL}api/seasons`);
        setSeasons(seasonsData);

        console.log('Season Points Data:', seasonPointsData);
        console.log('Seasons Data:', seasonsData);

        // ✅ Fetch cumulative progression using latest seasonId
        if (seasonsData.length > 0) {
          const latestSeasonId = seasonsData[0].id;

          console.log('latestSeasonId:', latestSeasonId);
          const cumulativeData: CumulativeProgression[] = await authedFetch(
            `${BACKEND_URL}api/race-results/constructor/${constructorId}/season/${latestSeasonId}/progression`
          );
          setCumulativeProgression(cumulativeData);

          console.log('Cumulative Progression Data:', cumulativeData);
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

  // Dynamically get the latest season (last element in array)
  const latestSeason = pointsPerSeason.length > 0
    ? pointsPerSeason[pointsPerSeason.length - 1]
    : null;

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
        {/* Left side: Team logo + Team name + nationality */}
        <Flex direction="row" align="center" gap={4}>
          <Image
            src={getTeamLogo(constructor.name)}
            alt={`${constructor.name} logo`}
            boxSize="80px" // ✅ made logo bigger
            objectFit="contain"
          />
          <Flex direction="column" justify="center">
            <Text fontSize="3xl" fontWeight="bold" color="white">
              {constructor.name}
            </Text>
            <Text fontSize="md" color="gray.300">
              Nationality: {constructor.nationality}
            </Text>
          </Flex>
        </Flex>

        {/* Right side: Back button */}
        <Button onClick={() => navigate('/constructors')} color="white">
          Back to Constructors
        </Button>
      </Flex>

      {/* Stats: Total + Latest Season */}
      <Flex gap={6} wrap="wrap" mb={6}>
        {/* Total Stats */}
        <Box p={4} bg="gray.700" borderRadius="md" minW="150px">
          <Text fontSize="lg" fontWeight="bold">Total Points</Text>
          <Text fontSize="2xl" fontWeight="bold">{totalPoints}</Text>
        </Box>
        <Box p={4} bg="gray.700" borderRadius="md" minW="150px">
          <Text fontSize="lg" fontWeight="bold">Total Wins</Text>
          <Text fontSize="2xl" fontWeight="bold">{totalWins}</Text>
        </Box>
        <Box p={4} bg="gray.700" borderRadius="md" minW="150px">
          <Text fontSize="lg" fontWeight="bold">Total Podiums</Text>
          <Text fontSize="2xl" fontWeight="bold">{totalPodiums}</Text>
        </Box>

        {/* Latest Season Stats */}
        {latestSeason && (
          <>
            <Box p={4} bg="gray.600" borderRadius="md" minW="150px">
              <Text fontSize="lg" fontWeight="bold">{new Date().getFullYear()} Points</Text>
              <Text fontSize="2xl" fontWeight="bold">{latestSeason.points}</Text>
            </Box>
            <Box p={4} bg="gray.600" borderRadius="md" minW="150px">
              <Text fontSize="lg" fontWeight="bold">{new Date().getFullYear()} Wins</Text>
              <Text fontSize="2xl" fontWeight="bold">{latestSeason.wins}</Text>
            </Box>
            <Box p={4} bg="gray.600" borderRadius="md" minW="150px">
              <Text fontSize="lg" fontWeight="bold">{new Date().getFullYear()} Podiums</Text>
              <Text fontSize="2xl" fontWeight="bold">{latestSeason.podiums}</Text>
            </Box>
          </>
        )}
      </Flex>

      {/* Charts */}
      <Box w="100%" h="400px" bg="gray.800" p={4} borderRadius="md">
        <Text fontSize="lg" fontWeight="bold" mb={2}>Points by Season</Text>
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={mappedPointsPerSeason.sort((a, b) => a.season - b.season)}>
            <CartesianGrid strokeDasharray="3 3" stroke="gray" />
            <XAxis dataKey="seasonLabel" stroke="white" />
            <YAxis stroke="white" />
            <Tooltip />
            <Line type="monotone" dataKey="points" stroke={teamColor} strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      <Box w="100%" h="400px" bg="gray.800" p={4} borderRadius="md" mt={6}>
        <Text fontSize="lg" fontWeight="bold" mb={2}>Wins by Season</Text>
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={mappedPointsPerSeason.sort((a, b) => a.season - b.season)}>
            <CartesianGrid strokeDasharray="3 3" stroke="gray" />
            <XAxis dataKey="seasonLabel" stroke="white" />
            <YAxis stroke="white" />
            <Tooltip />
            <Line type="monotone" dataKey="wins" stroke="#F56565" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      <Box w="100%" h="400px" bg="gray.800" p={4} borderRadius="md" mt={6}>
        <Text fontSize="lg" fontWeight="bold" mb={2}>Podiums by Season</Text>
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={mappedPointsPerSeason.sort((a, b) => a.season - b.season)}>
            <CartesianGrid strokeDasharray="3 3" stroke="gray" />
            <XAxis dataKey="seasonLabel" stroke="white" />
            <YAxis stroke="white" />
            <Tooltip />
            <Line type="monotone" dataKey="podiums" stroke="#ECC94B" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      {/* Cumulative Progression Chart */}
      {cumulativeProgression.length > 0 && (
        <Box w="100%" h="400px" bg="gray.800" p={4} borderRadius="md" mt={6}>
          <Text fontSize="lg" fontWeight="bold" mb={2}>Cumulative Points Progression ({new Date().getFullYear()})</Text>
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
    </Box>
  );
};

export default ConstructorDetails;




















