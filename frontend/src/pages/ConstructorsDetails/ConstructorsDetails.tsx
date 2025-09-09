// src/pages/Constructors/ConstructorDetails.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import {
  Box,
  Flex,
  Text,
  useToast,
  Container,
  Button,
  SimpleGrid,
} from '@chakra-ui/react';
import F1LoadingSpinner from '../../components/F1LoadingSpinner/F1LoadingSpinner';
import HeroSection from '../../components/HeroSection/HeroSection';
import { teamColors } from '../../lib/teamColors';
import { ArrowLeft } from 'lucide-react';
import styles from './ConstructorDetails.module.css';

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
    const [stats, setStats] = useState<ConstructorStats | null>(null);
    const [loading, setLoading] = useState(true);
  
    const authedFetch = useCallback(
      async (url: string, scope: string) => {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
            scope,
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
          const constructorData: Constructor = await authedFetch(
            `${BACKEND_URL}/api/constructors/${numericId}`,
            'read:constructors'
          );
          setConstructor(constructorData);
  
          const statsData: ConstructorStats = await authedFetch(
            `${BACKEND_URL}/api/race-results/constructor/${numericId}/stats`,
            'read:race-results'
          );
          setStats(statsData);
        } catch (err: unknown) {
          const errorMessage =
            err instanceof Error ? err.message : 'Unexpected error';
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
    const gradientBg = `linear-gradient(135deg, #${teamColor} 0%, rgba(0,0,0,0.6) 100%)`;
  
    return (
      <>
        {/* Full-width Hero Banner */}
<Box
  w="100%" // full horizontal width
  h="300px" // adjust height to match your banner style
  bgGradient={gradientBg}
  display="flex"
  flexDirection="column"
  alignItems="center"
  justifyContent="center"
  textAlign="center"
  color="white"
  px={6}
  shadow="xl"
>
  <Text fontSize={['4xl', '5xl', '6xl']} fontWeight="bold">
    {constructor.name}
  </Text>
  <Text fontSize={['lg', 'xl', '2xl']} mt={3}>
    Nationality: {constructor.nationality}
  </Text>
  {constructor.url && (
    <a
      href={constructor.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        color: 'white',
        textDecoration: 'underline',
        marginTop: '1rem',
        fontSize: '1.1rem',
      }}
    >
      Official Website
    </a>
  )}
</Box>
  
        {/* Stats Section */}
        <Container maxW="1400px" mt={-12} mb={10}>
          <Flex gap={6} justify="center" flexWrap="wrap">
            <Box
              flex="1"
              minW="200px"
              bg="gray.800"
              p={6}
              borderRadius="lg"
              textAlign="center"
              color="white"
            >
              <Text fontWeight="bold" fontSize="xl">
                Races
              </Text>
              <Text fontSize="2xl">{stats?.totalRaces}</Text>
            </Box>
  
            <Box
              flex="1"
              minW="200px"
              bg="gray.800"
              p={6}
              borderRadius="lg"
              textAlign="center"
              color="white"
            >
              <Text fontWeight="bold" fontSize="xl">
                Wins
              </Text>
              <Text fontSize="2xl">{stats?.wins}</Text>
            </Box>
  
            <Box
              flex="1"
              minW="200px"
              bg="gray.800"
              p={6}
              borderRadius="lg"
              textAlign="center"
              color="white"
            >
              <Text fontWeight="bold" fontSize="xl">
                Podiums
              </Text>
              <Text fontSize="2xl">{stats?.podiums}</Text>
            </Box>
  
            <Box
              flex="1"
              minW="200px"
              bg="gray.800"
              p={6}
              borderRadius="lg"
              textAlign="center"
              color="white"
            >
              <Text fontWeight="bold" fontSize="xl">
                Points
              </Text>
              <Text fontSize="2xl">{stats?.totalPoints}</Text>
            </Box>
          </Flex>
        </Container>
  
        {/* Back Button */}
        <Container maxW="1400px" mb={8}>
          <Link to="/standings/constructors">
            <Button
              leftIcon={<ArrowLeft />}
              colorScheme="blue"
              variant="outline"
            >
              Back to Constructor Standings
            </Button>
          </Link>
        </Container>
      </>
    );
  };
  
  export default ConstructorDetails;