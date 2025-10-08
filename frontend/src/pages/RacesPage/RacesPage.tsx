// src/pages/RacesPage/RacesPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Container, Box, Flex, Text, Button, SimpleGrid, Heading, Icon, VStack,
} from '@chakra-ui/react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Select } from 'chakra-react-select';
import PageHeader from '../../components/layout/PageHeader';
import LayoutContainer from '../../components/layout/LayoutContainer';
import RaceProfileCard from '../../components/RaceProfileCard/RaceProfileCard';
import RacesSkeleton from './RacesSkeleton';
import type { Race } from '../../types/races';
import { apiFetch } from '../../lib/api';
import { useThemeColor } from '../../context/ThemeColorContext';

// Local wrapper to keep minimalist callsites
const getJSON = <T,>(path: string) => apiFetch<T>(`/api${path.startsWith('/') ? path : `/${path}`}`);

// Custom styles to match SearchableSelect
const getCustomSelectStyles = (accentColor: string) => ({
  control: (provided: any) => ({
    ...provided,
    bg: 'bg-surface-raised',
    borderColor: 'border-primary',
    '&:hover': {
      borderColor: 'border-primary',
    },
  }),
  menu: (provided: any) => ({
    ...provided,
    bg: 'bg-surface-raised',
    zIndex: 10,
  }),
  option: (provided: any, state: { isSelected: boolean; isFocused: boolean }) => ({
    ...provided,
    bg: state.isFocused ? 'bg-surface' : 'transparent',
    color: state.isSelected ? accentColor : 'text-primary',
    '&:active': {
      bg: 'bg-surface',
    },
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: 'text-muted',
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: 'text-primary',
  }),
});

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
  circuit?: { country_code?: string | null; country?: string | null } | null;
  country_code?: string | null;
  country?: string | null;
};

function mapRace(b: BackendRace): Race {
  return {
    id: Number(b.id),
    name: b.name,
    round: Number(b.round),
    date: combine(b.date, b.time),
    circuit_id: Number(b.circuit_id),
    season_id: Number(b.season_id),
    circuit: b.circuit ?? null,
    countryCode: b.country_code ?? null,
    country: b.country ?? b.circuit?.country ?? null,
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


const ErrorView = ({ message }: { message: string }) => (
  <Flex direction="column" align="center" justify="center" minH="20vh" gap={4} color="red.400">
    <Icon as={AlertTriangle} boxSize={10} />
    <Heading size="md" fontFamily="heading">Could not load races</Heading>
    <Text color="text-secondary">{message}</Text>
  </Flex>
);

const RacesPage: React.FC = () => {
  const { isAuthenticated } = useAuth0();
  const { accentColorWithHash } = useThemeColor();
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const [season, setSeason] = useState<number>(currentYear);
  const [years, setYears] = useState<number[]>([]);
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Partition races into upcoming and past based on today's date (date-only)
  const { upcomingRaces, pastRaces } = useMemo(() => {
    const today = new Date();
    // Normalize to date-only comparison
    today.setHours(0, 0, 0, 0);

    const upcoming: Race[] = [];
    const past: Race[] = [];
    for (const r of races) {
      const d = new Date(r.date);
      d.setHours(0, 0, 0, 0);
      if (d >= today) upcoming.push(r); else past.push(r);
    }

    // Sort: upcoming ascending, past descending
    upcoming.sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
    past.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

    return { upcomingRaces: upcoming, pastRaces: past };
  }, [races]);

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

  // Create season options for the select
  const seasonOptions = years.map(year => ({
    value: year.toString(),
    label: year.toString()
  }));

  const renderContent = () => {
    if (loading) return <RacesSkeleton />;
    if (error) return <ErrorView message={error} />;
    if (races.length === 0) {
      return (
        <Flex justify="center" py={10}>
          <Text color="text-muted">No races found for the {season} season.</Text>
        </Flex>
      );
    }
    return (
      <VStack align="stretch" spacing={10}>
        {upcomingRaces.length > 0 && (
          <Box>
            <Heading size="md" fontFamily="heading" mb={4}>Upcoming races</Heading>
            <SimpleGrid columns={2} spacing={{ base: 3, md: 6 }}>
              {upcomingRaces.map((race) => (
                <Link key={race.id} to={`/races/${race.id}`}>
                  <RaceProfileCard race={race} />
                </Link>
              ))}
            </SimpleGrid>
          </Box>
        )}

        {pastRaces.length > 0 && (
          <Box>
            <Heading size="md" fontFamily="heading" mb={4}>Past Races</Heading>
            <SimpleGrid columns={2} spacing={{ base: 3, md: 6 }}>
              {pastRaces.map((race) => (
                <Link key={race.id} to={`/races/${race.id}`}>
                  <RaceProfileCard race={race} />
                </Link>
              ))}
            </SimpleGrid>
          </Box>
        )}
      </VStack>
    );
  };

  return (
    <Box bg="bg-primary" minH="100vh">
      <PageHeader 
        title="Races" 
        subtitle={`Season ${season} - Track every race of the F1 season`}
      />

      <LayoutContainer>
        <Flex alignItems="flex-end" justifyContent="flex-end" flexDirection={{ base: 'column', md: 'row' }} gap={4}>
          <Box maxW={{ base: 'full', md: '220px' }} w="full">
            <Select
              options={seasonOptions}
              value={seasonOptions.find((o) => o.value === season.toString()) || null}
              onChange={(option) => {
                if (option) {
                  setSeason(Number(option.value));
                }
              }}
              placeholder="Select Season"
              isClearable={false}
              chakraStyles={getCustomSelectStyles(accentColorWithHash)}
              focusBorderColor={accentColorWithHash}
            />
          </Box>
        </Flex>
      </LayoutContainer>

      <Container maxW="1400px" py="xl" px={{ base: 'md', lg: 'lg' }}>
        {renderContent()}
      </Container>
    </Box>
  );
};

export default RacesPage;
