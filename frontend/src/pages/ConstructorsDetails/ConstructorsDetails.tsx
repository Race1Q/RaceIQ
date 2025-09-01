// src/pages/Constructors/ConstructorDetails.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { Box, Flex, Text, useToast, Container } from '@chakra-ui/react';
import F1LoadingSpinner from '../../components/F1LoadingSpinner/F1LoadingSpinner';
import HeroSection from '../../components/HeroSection/HeroSection';
import { teamColors } from '../../lib/teamColors';

import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@chakra-ui/react';


 interface RaceResultRow {
    id?: number;
    session_id: number;
    driver_id: number;
    constructor_id: number;
    position: number;
    points: number;
    grid: number;
    laps: number;
    time_ms: number | null;
    status: string;
  }

interface Constructor {
  id: number;
  name: string;
  nationality: string;
  url: string;
}

interface ConstructorStats {
    totalRaces: number;
    wins: number;
    podiums: number;
    totalPoints: number;
  }

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const ConstructorDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const numericId = id ? Number(id) : null;

  const { getAccessTokenSilently } = useAuth0();
  const toast = useToast();

  const [constructor, setConstructor] = useState<Constructor | null>(null);
  const [raceResults, setRaceResults] = useState<RaceResultRow[]>([]);
  const [stats, setStats] = useState<ConstructorStats | null>(null);
  const [loading, setLoading] = useState(true);

  const authedFetch = useCallback(
    async (url: string, scope: string) => {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          scope
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
    const fetchData = async () => {
      if (!numericId) return;

      setLoading(true);
      try {
        // Fetch constructor info
        const constructorData: Constructor = await authedFetch(
          `${BACKEND_URL}/api/constructors/${numericId}`,
          'read:constructors'
        );
        setConstructor(constructorData);

        // Fetch constructor stats
        const statsData: ConstructorStats = await authedFetch(
          `${BACKEND_URL}/api/race-results/constructor/${numericId}/stats`,
          'read:race-results'
        );
        setStats(statsData);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unexpected error';
        toast({
          title: 'Failed to fetch constructor details',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [numericId, authedFetch, toast]);

  if (loading) return <F1LoadingSpinner text="Loading Constructor Details..." />;
  if (!constructor) return <Text>Constructor not found.</Text>;

  const teamColor = teamColors[constructor.name] || 'FF1801';
  const gradientBg = `linear-gradient(135deg, #${teamColor} 0%, rgba(0,0,0,0.2) 100%)`;

  // Compute summary stats
  

  return (
    <>
      <HeroSection backgroundImageUrl="">
        <Flex
          direction="column"
          align="center"
          justify="center"
          textAlign="center"
          bgGradient={gradientBg}
          color="white"
          minH="300px"
          p={8}
          borderRadius="lg"
        >
          <Text fontSize={['3xl', '4xl', '5xl']} fontWeight="bold">
            {constructor.name}
          </Text>
          <Text fontSize={['md', 'lg', 'xl']} mt={2}>
            Nationality: {constructor.nationality}
          </Text>
          {constructor.url && (
            <a
              href={constructor.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'white', textDecoration: 'underline', marginTop: '0.5rem' }}
            >
              Official Website
            </a>
          )}
        </Flex>
      </HeroSection>

      {/* Stats Box */}
      <Container maxW="1400px" mt={8}>
        <Box bg="gray.800" p={6} borderRadius="lg" color="white">
          <Text fontSize="2xl" fontWeight="bold" mb={4}>
            Career Stats
          </Text>
          <Flex gap={6} flexWrap="wrap">
            <Box>
              <Text fontWeight="bold">Races:</Text>
              <Text>{stats?.totalRaces}</Text>
            </Box>
            <Box>
              <Text fontWeight="bold">Wins:</Text>
              <Text>{stats?.wins}</Text>
            </Box>
            <Box>
              <Text fontWeight="bold">Podiums:</Text>
              <Text>{stats?.podiums}</Text>
            </Box>
            <Box>
              <Text fontWeight="bold">Points:</Text>
              <Text>{stats?.totalPoints}</Text>
            </Box>
          </Flex>
        </Box>
      </Container>

      <Container maxW="1400px" mt={4}>
  <Link to="/constructors">
    <Button leftIcon={<ArrowLeft />} colorScheme="blue" variant="outline">
      Back to Constructor Standings
    </Button>
  </Link>
</Container>
    </>
  );
};

export default ConstructorDetails;








