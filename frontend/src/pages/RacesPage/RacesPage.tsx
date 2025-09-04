import React, { useEffect, useMemo, useState, Suspense } from 'react';
import { Container, Box, VStack, Grid, useTheme, Flex, Text, Button, SimpleGrid, Skeleton, Spinner } from '@chakra-ui/react';
import { useAuth0 } from '@auth0/auth0-react';
import { apiClient, type RaceDto } from '../../services/f1Api';
import { motion, AnimatePresence } from 'framer-motion';
const RaceDetailsModal = React.lazy(() => import('./components/RaceDetailsModal'));

// Import all the refactored child components
import RaceHeader from '../../components/RaceHeader/RaceHeader';
import TrackMap from '../../components/TrackMap/TrackMap';
import WeatherCard from '../../components/WeatherCard/WeatherCard';
import PodiumCard from '../../components/PodiumCard/PodiumCard';
import LapPositionChart from '../../components/LapPositionChart/LapPositionChart';
import HistoricalStatsTable from '../../components/HistoricalStatsTable/HistoricalStatsTable';
import FastestLapCard from '../../components/FastestLapCard/FastestLapCard';
import RaceControlLog from '../../components/RaceControlLog/RaceControlLog';
import FlagsTimeline from '../../components/FlagsTimeline/FlagsTimeline';
import PaceDistributionChart from '../../components/PaceDistributionChart/PaceDistributionChart';
import TireStrategyChart from '../../components/TireStrategyChart/TireStrategyChart';
import RaceStandingsTable from '../../components/RaceStandingsTable/RaceStandingsTable';
import HeroSection from '../../components/HeroSection/HeroSection';

// Data and Types
import { teamColors } from '../../lib/assets';

const RacesPage: React.FC = () => {
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const [races, setRaces] = useState<RaceDto[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [season] = useState<number>(2025);
  const [openRaceId, setOpenRaceId] = useState<number | null>(null);
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
              <Box
                key={race.id}
                p={4}
                borderRadius="md"
                bg="bg-elevated"
                border="1px solid"
                borderColor="border-subtle"
                cursor="pointer"
                onClick={() => setOpenRaceId(race.id)}
                _hover={{ transform: 'translateY(-2px)', transition: 'transform 0.15s ease' }}
              >
                <Text fontWeight="bold" color="text-primary" mb={1}>{race.name}</Text>
                <Text color="text-secondary" fontSize="sm" mb={1}>Round {race.round}</Text>
                <Text color="text-secondary" fontSize="sm">{new Date(race.date).toLocaleDateString()}</Text>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Container>

      <AnimatePresence>
        {openRaceId !== null && (
          <Suspense fallback={<Flex position="fixed" inset={0} align="center" justify="center"><Spinner /></Flex>}>
            <RaceDetailsModal
              key={openRaceId}
              raceId={openRaceId}
              onClose={() => setOpenRaceId(null)}
            />
          </Suspense>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default RacesPage;
