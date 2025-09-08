import React, { useEffect, useMemo, useState, Suspense } from 'react';
import { Container, Box, VStack, Grid, useTheme, Flex, Text, Button, SimpleGrid, Skeleton, Spinner } from '@chakra-ui/react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../services/f1Api';
import type { RaceDto } from '../../services/f1Api';
import { motion, AnimatePresence } from 'framer-motion';
import HeroSection from '../../components/HeroSection/HeroSection';
import RaceProfileCard from '../../components/RaceProfileCard/RaceProfileCard';

// Data and Types
import { teamColors } from '../../lib/assets';

const RacesPage: React.FC = () => {
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const [races, setRaces] = useState<RaceDto[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [season] = useState<number>(2025);
  const theme = useTheme();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    apiClient
      .getRaces(season)
      .then((data) => {
        if (isMounted) setRaces(data);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [season]);

  if (!isAuthenticated) {
    return (
      <Box bg="bg-primary">
        <HeroSection
          title="Race Analytics"
          subtitle="A deep dive into the strategy, performance, and key moments from every Grand Prix."
          backgroundColor={theme.colors.brand.red}
          disableOverlay
        />
        <Container maxW="1400px" py="xl" px={{ base: 'md', lg: 'lg' }}>
          <Flex direction="column" align="center" justify="center" minH="40vh" gap={4}>
            <Text fontSize="xl" color="text-primary">Please signup / login to view races.</Text>
            <Button bg="brand.red" _hover={{ bg: 'brand.redDark' }} color="white" onClick={() => loginWithRedirect()}>Login</Button>
          </Flex>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg="bg-primary">
      <HeroSection
        title="Races"
        subtitle={`Season ${season}`}
        backgroundColor={theme.colors.brand.red}
        disableOverlay
      />
      <Container maxW="1400px" py="xl" px={{ base: 'md', lg: 'lg' }}>
        {loading ? (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
            {Array.from({ length: 8 }).map((_, idx) => (
              <Box key={idx} p={4} borderRadius="md" bg="bg-elevated" border="1px solid" borderColor="border-subtle">
                <Skeleton height="20px" mb={3} />
                <Skeleton height="16px" mb={2} />
                <Skeleton height="16px" width="60%" />
              </Box>
            ))}
          </SimpleGrid>
        ) : (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
            {(races ?? []).map((race) => (
              <Link key={race.id} to={`/races/${race.id}`}>
                <RaceProfileCard race={race} />
              </Link>
            ))}
          </SimpleGrid>
        )}
      </Container>
    </Box>
  );
};

export default RacesPage;
