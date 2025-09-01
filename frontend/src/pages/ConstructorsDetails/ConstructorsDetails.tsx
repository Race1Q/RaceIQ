// frontend/src/pages/Constructors/ConstructorDetails.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { Box, Flex, Text, VStack, HStack, useToast } from '@chakra-ui/react';
import F1LoadingSpinner from '../../components/F1LoadingSpinner/F1LoadingSpinner';
import { teamColors } from '../../lib/teamColors';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Backend entity interface
interface Constructor {
  id: number;
  name: string;
  nationality: string;
  url: string;
  constructor_id: string; // API string ID
}

interface ConstructorStanding {
  season: number;
  points: number;
  wins: number;
  position: number;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const ConstructorDetails: React.FC = () => {
  const { constructorId } = useParams<{ constructorId: string }>();
  const { getAccessTokenSilently } = useAuth0();
  const toast = useToast();

  const [constructor, setConstructor] = useState<Constructor | null>(null);
  const [standings, setStandings] = useState<ConstructorStanding[]>([]);
  const [loading, setLoading] = useState(true);

  const authedFetch = useCallback(async (url: string) => {
    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        scope: 'read:standings',
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
  }, [getAccessTokenSilently]);

  useEffect(() => {
    const fetchConstructorDetails = async () => {
      setLoading(true);
      try {
        // Fetch constructor info from backend
        const constructorData: Constructor = await authedFetch(
          `${BACKEND_URL}/api/constructors/${constructorId}`
        );

        setConstructor(constructorData);

        // Fetch constructor standings (historical)
        const standingsData: ConstructorStanding[] = await authedFetch(
          `${BACKEND_URL}/api/constructor-standings/history/${constructorData.id}`
        );

        setStandings(standingsData);
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

    if (constructorId) fetchConstructorDetails();
  }, [constructorId, authedFetch, toast]);

  const totalPoints = useMemo(() => standings.reduce((acc, s) => acc + s.points, 0), [standings]);
  const totalWins = useMemo(() => standings.reduce((acc, s) => acc + s.wins, 0), [standings]);

  if (loading) return <F1LoadingSpinner text="Loading Constructor Details..." />;

  if (!constructor) return <Text color="red.500">Constructor not found.</Text>;

  const teamColor = `#${teamColors[constructor.name] || teamColors.Default}`;

  return (
    <Box p={['4', '6', '8']} fontFamily="var(--font-display)">
      <VStack spacing={6} align="stretch">
        <Box>
          <Text fontSize="3xl" fontWeight="bold" color={teamColor}>
            {constructor.name}
          </Text>
          <Text fontSize="md" color="gray.300">
            Nationality: {constructor.nationality}
          </Text>
        </Box>

        <Flex gap={6} wrap="wrap">
          <Box p={4} bg="gray.700" borderRadius="md" minW="150px">
            <Text fontSize="lg" fontWeight="bold">Total Points</Text>
            <Text fontSize="2xl" fontWeight="bold">{totalPoints}</Text>
          </Box>
          <Box p={4} bg="gray.700" borderRadius="md" minW="150px">
            <Text fontSize="lg" fontWeight="bold">Total Wins</Text>
            <Text fontSize="2xl" fontWeight="bold">{totalWins}</Text>
          </Box>
        </Flex>

        <Box w="100%" h="400px" bg="gray.800" p={4} borderRadius="md">
          <Text fontSize="lg" fontWeight="bold" mb={2}>
            Historical Points by Season
          </Text>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={standings.sort((a, b) => a.season - b.season)}>
              <CartesianGrid strokeDasharray="3 3" stroke="gray" />
              <XAxis dataKey="season" stroke="white" />
              <YAxis stroke="white" />
              <Tooltip />
              <Line type="monotone" dataKey="points" stroke={teamColor} strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </VStack>
    </Box>
  );
};

export default ConstructorDetails;

