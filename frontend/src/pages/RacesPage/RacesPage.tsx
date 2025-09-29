// src/pages/RacesPage/RacesPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Container, Box, Flex, Text, Button, SimpleGrid, Skeleton, Heading, Icon, VStack, HStack, Select,
} from '@chakra-ui/react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import HeroSection from '../../components/HeroSection/HeroSection';
import RaceProfileCard from '../../components/RaceProfileCard/RaceProfileCard';
import type { Race } from '../../types/races';
import { apiFetch } from '../../lib/api';

// Local wrapper to keep minimalist callsites
const getJSON = <T,>(path: string) => apiFetch<T>(`/api${path.startsWith('/') ? path : `/${path}`}`);

function combine(date?: string | null, time?: string | null) {
  if (!date && !time) return '';
  if (date && !time) return date;
  if (!date && time) return time;
  return `${date}T${time}`;
}

type BackendRace = {
  id: number | string;
  season_id: number | string;
  circuit_id: number | string;
  round: number | string;
  name: string;
  date: string | null;
  time: string | null;
};

function mapRace(b: BackendRace): Race {
  return {
    id: Number(b.id),
    name: b.name,
    round: Number(b.round),
    date: combine(b.date, b.time),
    circuit_id: Number(b.circuit_id),
    season_id: Number(b.season_id),
  };
}

async function fetchAvailableYears(): Promise<number[]> {
  try {
  const seasons = await getJSON<Array<{ year: number }>>(`/seasons`);
    const ys = seasons.map(s => s.year).filter(Number.isFinite);
    if (ys.length) return ys.sort((a, b) => b - a);
  } catch {}
  try {
  const ys = await getJSON<number[]>(`/races/years`);
    if (Array.isArray(ys) && ys.length) return ys.sort((a, b) => b - a);
  } catch {}
  const now = new Date().getFullYear();
  return Array.from({ length: 15 }, (_, i) => now - i);
}

async function fetchRacesByYear(year: number): Promise<Race[]> {
  // Try year first (backend expects year), then season, then season_id
  const candidates = [
    `/races?year=${year}`,
    `/races?season=${year}`,
    `/races?season_id=${year}`,
  ];
  let last: any;
  for (const p of candidates) {
    try {
  const data = await getJSON<BackendRace[]>(p);
      return data
        .slice()
        .sort((a, b) => (Date.parse(combine(b.date, b.time)) || 0) - (Date.parse(combine(a.date, a.time)) || 0))
        .map(mapRace);
    } catch (e) {
      last = e; // try next
    }
  }
  throw last instanceof Error ? last : new Error('Failed to fetch races');
}
// ---------------------------------------------------------------------------

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

const RacesPage: React.FC = () => {
  const { isAuthenticated } = useAuth0();
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const [season, setSeason] = useState<number>(currentYear);
  const [years, setYears] = useState<number[]>([]);
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchAvailableYears().then((ys) => { if (alive) setYears(ys); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    fetchRacesByYear(season)
      .then((data) => { if (alive) setRaces(data); })
      .catch((e) => { if (alive) setError(e.message || 'Failed to fetch races'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [season]);

  if (!isAuthenticated) return <NotAuthenticatedView />;

  const renderContent = () => {
    if (loading) return <LoadingView />;
    if (error) return <ErrorView message={error} />;
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
        {/* Season filter */}
        <HStack mb={6} justify="flex-end">
          <HStack>
            <Text color="text-secondary">Season:</Text>
            <Select size="sm" w="fit-content" value={season} onChange={(e) => setSeason(Number(e.target.value))}>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </Select>
          </HStack>
        </HStack>

        {renderContent()}
      </Container>
    </Box>
  );
};

export default RacesPage;
