// src/pages/RacesPage/RacesPage.tsx
import React, { useEffect, useState } from 'react';
import { Container, Box, Flex, Text, Button, SimpleGrid, Skeleton, Heading, Icon, VStack } from '@chakra-ui/react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import HeroSection from '../../components/HeroSection/HeroSection';
import RaceProfileCard from '../../components/RaceProfileCard/RaceProfileCard';
import type { Race } from '../../types/races';

// --- 1. Data fetching logic is moved into a custom hook ---
const useRaces = (season: number) => {
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const fetchRaces = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/races?season=${season}`, { signal });
        if (!res.ok) {
          throw new Error(`Failed to fetch races: ${res.statusText}`);
        }
        const data: Race[] = await res.json();
        setRaces(data);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRaces();

    // Cleanup function to abort the fetch on unmount
    return () => {
      controller.abort();
    };
  }, [season]);

  return { races, loading, error };
};


// --- 2. State-specific components for cleaner rendering ---
const NotAuthenticatedView = () => {
  const { loginWithRedirect } = useAuth0();
  return (
    <Container maxW="container.lg" py="xl" centerContent>
      <VStack spacing={4} textAlign="center">
        <Heading size="md" fontFamily="heading">Login to View Races</Heading>
        <Text color="text-secondary">Please sign in to access the race schedule and results for the season.</Text>
        <Button 
          bg="brand.red" 
          _hover={{ bg: 'brand.redDark' }} 
          color="white" 
          onClick={() => loginWithRedirect()}
          fontFamily="heading"
        >
          Login / Sign Up
        </Button>
      </VStack>
    </Container>
  );
};

const LoadingView = () => (
  <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
    {Array.from({ length: 12 }).map((_, idx) => (
      <Box key={idx} p={4} borderRadius="lg" bg="bg-surface" borderWidth="1px" borderColor="border-primary">
        <Skeleton height="150px" borderRadius="md" mb={4} />
        <Skeleton height="20px" mb={3} />
        <Skeleton height="16px" width="70%" />
      </Box>
    ))}
  </SimpleGrid>
);

const ErrorView = ({ message }: { message: string }) => (
  <Flex direction="column" align="center" justify="center" minH="20vh" gap={4} color="red.400">
    <Icon as={AlertTriangle} boxSize={10} />
    <Heading size="md" fontFamily="heading">Could not load races</Heading>
    <Text color="text-secondary">{message}</Text>
  </Flex>
);


// --- 3. The main page component is now much simpler ---
const RacesPage: React.FC = () => {
  const { isAuthenticated } = useAuth0();
  const [season] = useState<number>(2025);
  const { races, loading, error } = useRaces(season);

  if (!isAuthenticated) {
    return <NotAuthenticatedView />;
  }

  const renderContent = () => {
    if (loading) return <LoadingView />;
    if (error) return <ErrorView message={error.message} />;
    if (races.length === 0) {
      return (
        <Flex justify="center" py={10}>
          <Text color="text-muted">No races found for the {season} season.</Text>
        </Flex>
      );
    }
    return (
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
        {races.map((race) => (
          <Link key={race.id} to={`/races/${race.id}`}>
            <RaceProfileCard race={race} />
          </Link>
        ))}
      </SimpleGrid>
    );
  };

  return (
    <Box bg="bg-primary">
      <HeroSection title="Races" subtitle={`Season ${season}`} />
      <Container maxW="1400px" py="xl" px={{ base: 'md', lg: 'lg' }}>
        {renderContent()}
      </Container>
    </Box>
  );
};

export default RacesPage;