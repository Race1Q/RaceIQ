// src/pages/RaceDetailPage/RaceDetailPage.tsx
import React, { useEffect, useMemo, useState, Suspense } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box, Flex, IconButton, Text, VStack, HStack, Spinner, Container, Alert, AlertIcon,
  Tabs, TabList, TabPanels, Tab, TabPanel, Checkbox, CheckboxGroup, Stack, SimpleGrid, Table,
  Thead, Tbody, Tr, Th, Td, Badge, Divider, Select,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import type { Race } from '../../types/races';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import CircuitTrack3D from '../RacesPage/components/CircuitTrack3D';
import { teamColors } from '../../lib/teamColors';

const MotionBox = motion.create(Box);

// ---------- inline API helpers (force /api base) ----------
const API = '/api';

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status} ${res.statusText}`);
  return res.json();
}

function combine(date?: string | null, time?: string | null) {
  if (!date && !time) return '';
  if (date && !time) return date;
  if (!date && time) return time;
  return `${date}T${time}`;
}

// ---------- minimal backend model shapes ----------
type BackendRace = {
  id: number | string;
  season_id: number | string;
  circuit_id: number | string;
  round: number | string;
  name: string;
  date: string | null;
  time: string | null;
};
type BackendCircuit = { id: number | string; name: string };

async function fetchRaceById(raceId: string | number): Promise<Race> {
  const r = await getJSON<BackendRace>(`/races/${encodeURIComponent(String(raceId))}`);
  return {
    id: Number(r.id),
    name: r.name,
    round: Number(r.round),
    date: combine(r.date, r.time),
    circuit_id: Number(r.circuit_id),
    season_id: Number(r.season_id),
  };
}
async function fetchCircuitName(circuitId: string | number): Promise<string> {
  const c = await getJSON<BackendCircuit>(`/circuits/${encodeURIComponent(String(circuitId))}`);
  return c?.name ?? `Circuit #${circuitId}`;
}

// ---------- detail data types ----------
type RaceResult = {
  session_id?: number;
  driver_id: number | string;
  driver_code?: string;
  driver_name?: string;
  constructor_id?: number | string;
  constructor_name?: string;
  position?: number | null;
  points?: number | null;
  grid?: number | null;
  time_ms?: number | null;
  status?: string | null;
  fastest_lap_rank?: number | null;
  points_for_fastest_lap?: number | null;
};
type QualiResult = {
  session_id?: number;
  driver_id: number | string;
  driver_code?: string;
  driver_name?: string;
  constructor_id?: number | string;
  constructor_name?: string;
  position?: number | null;
  q1_time_ms?: number | null;
  q2_time_ms?: number | null;
  q3_time_ms?: number | null;
};
type PitStop = {
  race_id: number | string;
  driver_id: number | string;
  driver_code?: string;
  stop_number: number;
  lap_number: number;
  total_duration_in_pit_ms?: number | null;
  stationary_duration_ms?: number | null;
};
type Lap = {
  id?: number;
  race_id: number | string;
  driver_id: number | string;
  driver_code?: string;
  lap_number: number;
  position?: number | null;
  time_ms?: number | null;
  sector_1_ms?: number | null;
  sector_2_ms?: number | null;
  sector_3_ms?: number | null;
  is_pit_out_lap?: boolean | null;
};
type RaceEvent = {
  id?: number;
  session_id?: number;
  lap_number?: number;
  type?: string;              // e.g., yellow_flag, overtake
  message?: string | null;
  metadata?: any;             // include x/y for overlays if backend provides
};

// Flexible endpoints for by-race lookups
function candidates(base: string, raceId: string | number) {
  const id = encodeURIComponent(String(raceId));
  return [
    `/${base}?raceId=${id}`,
    `/${base}?race_id=${id}`,
    `/${base}/by-race/${id}`,
    `/${base}/race/${id}`,
  ];
}
async function tryGet<T>(paths: string[]): Promise<T> {
  let last: any;
  for (const p of paths) {
    try { return await getJSON<T>(p); }
    catch (e) { last = e; }
  }
  throw last instanceof Error ? last : new Error('All endpoints failed');
}

const fetchRaceResultsByRaceId = (raceId: string | number) =>
  tryGet<RaceResult[]>(candidates('race-results', raceId));
const fetchQualifyingResultsByRaceId = (raceId: string | number) =>
  getJSON<QualiResult[]>(`/qualifying-results?race_id=${encodeURIComponent(String(raceId))}`);
const fetchPitStopsByRaceId = (raceId: string | number) =>
  tryGet<PitStop[]>(candidates('pit-stops', raceId));
const fetchLapsByRaceId = (raceId: string | number) =>
  tryGet<Lap[]>(candidates('laps', raceId));
const fetchRaceEventsByRaceId = (raceId: string | number) =>
  tryGet<RaceEvent[]>(candidates('race-events', raceId));

// ---------- utils ----------
const fmtMs = (ms?: number | null) => (ms == null ? '-' : `${(ms / 1000).toFixed(3)}s`);
const uniq = <T,>(arr: T[]) => Array.from(new Set(arr));


// ---------- summary type ----------
type RaceSummary = {
  podium: Array<{
    driver_id: number | string;
    driver_code?: string;
    driver_name?: string;
    constructor_id?: number | string;
    constructor_name?: string;
    position: number;
  }>;
  pole: {
    driver_id: number | string;
    driver_code?: string;
    driver_name?: string;
    constructor_id?: number | string;
    constructor_name?: string;
    position: number;
  } | null;
  fastestLap: {
    driver_id: number | string;
    driver_code?: string;
    driver_name?: string;
    constructor_id?: number | string;
    constructor_name?: string;
    lap_number?: number;
    time_ms?: number | null;
  } | null;
  event_count: number;
  events?: {
    redFlags?: number;
    yellowFlags?: number;
  };
};

const fetchRaceSummary = async (raceId: string | number): Promise<RaceSummary> => {
  const id = encodeURIComponent(String(raceId));
  // Try both race_id and raceId for compatibility
  try {
    return await getJSON<RaceSummary>(`/race-summary?race_id=${id}`);
  } catch {
    return getJSON<RaceSummary>(`/race-summary?raceId=${id}`);
  }
};

// ---------- main ----------
const RaceDetailPage: React.FC = () => {
  const { raceId } = useParams<{ raceId: string }>();
  const navigate = useNavigate();

  const [race, setRace] = useState<Race | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [circuitName, setCircuitName] = useState<string>('');
  const [circuitLoading, setCircuitLoading] = useState<boolean>(false);

  const [raceResults, setRaceResults] = useState<RaceResult[]>([]);
  const [qualiResults, setQualiResults] = useState<QualiResult[]>([]);
  const [pitStops, setPitStops] = useState<PitStop[]>([]);
  const [laps, setLaps] = useState<Lap[]>([]);
  const [events, setEvents] = useState<RaceEvent[]>([]);

  // summary state
  const [summary, setSummary] = useState<RaceSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState<boolean>(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // filters/state
  const driversInRace = useMemo(
    () => uniq([
      ...raceResults.map(r => r.driver_code ?? String(r.driver_id)),
      ...qualiResults.map(q => q.driver_code ?? String(q.driver_id)),
    ]),
    [raceResults, qualiResults]
  );
  const [driverFilter, setDriverFilter] = useState<string[]>([]);
  const [qualiPhase, setQualiPhase] = useState<'all' | 'q1' | 'q2' | 'q3'>('all');
  const [lapFilter, setLapFilter] = useState<number | 'all'>('all');

  // base race
  useEffect(() => {
    if (!raceId || isNaN(Number(raceId))) { navigate('/races'); return; }
    let alive = true;
    setLoading(true);
    setError(null);
    fetchRaceById(raceId)
      .then((data) => { if (alive) setRace(data); })
      .catch((e) => { if (alive) setError(e.message || 'Failed to fetch race'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [raceId, navigate]);

  // circuit
  useEffect(() => {
    if (!race) return;
    let alive = true;
    setCircuitLoading(true);
    fetchCircuitName(race.circuit_id)
      .then((name) => { if (alive) setCircuitName(name); })
      .finally(() => { if (alive) setCircuitLoading(false); });
    return () => { alive = false; };
  }, [race]);

  // detail data
  useEffect(() => {
    if (!raceId || isNaN(Number(raceId))) return;
    let alive = true;
    fetchRaceResultsByRaceId(raceId).then(d => { if (alive) setRaceResults(d); });
    fetchQualifyingResultsByRaceId(raceId).then(d => { if (alive) setQualiResults(d); });
    fetchPitStopsByRaceId(raceId).then(d => { if (alive) setPitStops(d); });
    fetchLapsByRaceId(raceId).then(d => { if (alive) setLaps(d); });
    fetchRaceEventsByRaceId(raceId).then(d => { if (alive) setEvents(d); });
    // Fetch summary
    setSummaryLoading(true);
    setSummaryError(null);
    fetchRaceSummary(raceId)
      .then((data) => { if (alive) setSummary(data); })
      .catch((e) => { if (alive) setSummaryError(e.message || 'Failed to fetch summary'); })
      .finally(() => { if (alive) setSummaryLoading(false); });
    return () => { alive = false; };
  }, [raceId]);

  // derived
  const allDrivers = useMemo(() => uniq([
    ...raceResults.map(r => r.driver_code ?? String(r.driver_id)),
    ...qualiResults.map(q => q.driver_code ?? String(q.driver_id)),
  ]), [raceResults, qualiResults]);

  const showDrivers = driverFilter.length ? driverFilter : allDrivers;

  const filteredRaceResults = useMemo(() =>
    raceResults
      .filter(r => showDrivers.includes(r.driver_code ?? String(r.driver_id)))
      .sort((a, b) => (a.position ?? 99) - (b.position ?? 99)),
    [raceResults, showDrivers]
  );

  React.useEffect(() => {
    // Debug: log qualiResults to help diagnose display issues
    // eslint-disable-next-line no-console
    console.log('qualiResults', qualiResults);
  }, [qualiResults]);

  const filteredQuali = useMemo(() =>
    qualiResults
      .filter(q => showDrivers.includes(q.driver_code ?? String(q.driver_id)))
      .filter(q => {
        if (qualiPhase === 'all') return true;
        if (qualiPhase === 'q1') return q.q1_time_ms != null;
        if (qualiPhase === 'q2') return q.q2_time_ms != null;
        return q.q3_time_ms != null;
      })
      .sort((a, b) => (a.position ?? 99) - (b.position ?? 99)),
    [qualiResults, showDrivers, qualiPhase]
  );

  const lapsByDriver = useMemo(() => {
    const m = new Map<string, Lap[]>();
    for (const l of laps) {
      const key = l.driver_code ?? String(l.driver_id);
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(l);
    }
    for (const arr of m.values()) arr.sort((a, b) => a.lap_number - b.lap_number);
    return m;
  }, [laps]);

  if (loading) {
    return (
      <Box bg="bg-primary" minH="100vh">
        <Container maxW="1400px" py="xl" px={{ base: 'md', lg: 'lg' }}>
          <Flex align="center" justify="center" minH="50vh">
            <Spinner size="xl" />
          </Flex>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box bg="bg-primary" minH="100vh">
        <Container maxW="1400px" py="xl" px={{ base: 'md', lg: 'lg' }}>
          <Alert status="error"><AlertIcon />{error}</Alert>
        </Container>
      </Box>
    );
  }

  if (!race) {
    return (
      <Box bg="bg-primary" minH="100vh">
        <Container maxW="1400px" py="xl" px={{ base: 'md', lg: 'lg' }}>
          <Flex direction="column" align="center" justify="center" minH="50vh" gap={4}>
            <Text fontSize="xl" color="text-primary">Race not found</Text>
            <IconButton aria-label="Go back" icon={<ArrowLeft size={18} />} onClick={() => navigate('/races')} />
          </Flex>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg="bg-primary" minH="100vh">
      <Container maxW="1400px" py="xl" px={{ base: 'md', lg: 'lg' }}>
        {/* Header (unchanged look) */}
        <Flex align="center" gap={4} mb={8}>
          <IconButton
            aria-label="Go back"
            icon={<ArrowLeft size={18} />}
            onClick={() => navigate('/races')}
            variant="ghost"
          />
          <VStack align="flex-start" spacing={1}>
            <Text fontSize="2xl" fontWeight="bold" color="text-primary">{race.name}</Text>
            <Text fontSize="md" color="text-secondary">
              Round {race.round} • {new Date(race.date).toLocaleDateString()}
            </Text>
          </VStack>
        </Flex>

        {/* 3D Track Visualization (unchanged block) */}
        <MotionBox
          bg="bg-elevated"
          borderRadius="lg"
          border="1px solid"
          borderColor="border-subtle"
          mb={8}
          overflow="hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box h={{ base: '300px', md: '400px' }} bg="#0b0b0b" position="relative">
            <Suspense fallback={<Flex h="100%" align="center" justify="center"><Spinner /></Flex>}>
              <Canvas camera={{ position: [0, 20, 40], fov: 40 }}>
                <CircuitTrack3D
                  circuitId={race.circuit_id}
                  circuitName={circuitName}
                  onStatusChange={() => {}}
                />
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 10, 5]} intensity={0.8} />
                <OrbitControls enablePan enableZoom enableRotate />
                <Environment preset="warehouse" />
              </Canvas>
            </Suspense>
          </Box>
        </MotionBox>

        {/* Tabs */}
        <Tabs colorScheme="red" variant="enclosed">
          <TabList>
            <Tab>Summary</Tab>
            <Tab>Race</Tab>
            <Tab>Qualifying</Tab>
            <Tab>Quali → Race</Tab>
            <Tab>Analysis</Tab>
            <Tab>Lap Times / Pit Stops</Tab>
          </TabList>

          <TabPanels>
            {/* SUMMARY */}
            <TabPanel>
              <VStack align="stretch" spacing={4}>
                <Text fontSize="xl" fontWeight="bold" color="text-primary">Summary</Text>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {/* Podium Visual (with actual podium steps) */}
                  <Box p={4} border="1px solid" borderColor="border-subtle" borderRadius="lg" bg="bg-elevated">
                    <Text fontWeight="bold" mb={2}>Podium</Text>
                    <Divider my={2} />

                    {summaryLoading ? (
                      <Spinner size="sm" />
                    ) : summaryError ? (
                      <Text color="red.500">{summaryError}</Text>
                    ) : summary?.podium?.length ? (
                      <Box position="relative" minH="280px">
                        {/* Podium base shadow */}
                        <Box
                          position="absolute"
                          bottom="18px"
                          left="50%"
                          transform="translateX(-50%)"
                          w="90%"
                          h="10px"
                          borderRadius="full"
                          bg="blackAlpha.500"
                          filter="blur(6px)"
                          opacity={0.3}
                        />

                        {/* Podium steps */}
                        <Flex align="flex-end" justify="center" gap={6} pt={6} pb={6}>
                          {/* 2nd place (left, medium height) */}
                          <Box textAlign="center" w="30%">
                            {/* avatar sits on top via translateY */}
                            <Box mb={-6} transform="translateY(-34px)">
                              <Box
                                mx="auto"
                                w="70px"
                                h="70px"
                                borderRadius="full"
                                bg="gray.200"
                                overflow="hidden"
                                border="2px solid"
                                borderColor="brand.red"
                              >
                                <img
                                  src={`https://raceiq.app/images/drivers/${summary.podium[1]?.driver_id ?? 'placeholder'}.jpg`}
                                  alt={summary.podium[1]?.driver_name ?? 'Driver'}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  onError={(e) => (e.currentTarget.src = '/default-driver.png')}
                                />
                              </Box>
                            </Box>

                            {/* step block */}
                            <Box
                              mx="auto"
                              w="100%"
                              h="120px"
                              bg="gray.700"
                              borderRadius="md"
                              border="1px solid"
                              borderColor="gray.600"
                              position="relative"
                            >
                              {/* face label */}
                              <Box
                                position="absolute"
                                top={2}
                                left="50%"
                                transform="translateX(-50%)"
                                px={3}
                                py={1}
                                bg="gray.300"
                                borderRadius="md"
                                fontWeight="bold"
                                fontSize="sm"
                                color="gray.800"
                                minW="32px"
                              >
                                2
                              </Box>
                              {/* name on riser */}
                              <Text
                                position="absolute"
                                bottom={3}
                                left="50%"
                                transform="translateX(-50%)"
                                fontWeight="bold"
                                fontSize="md"
                                color="text-primary"
                                noOfLines={1}
                                maxW="90%"
                              >
                                {summary.podium[1]?.driver_name ?? summary.podium[1]?.driver_code ?? summary.podium[1]?.driver_id}
                              </Text>
                            </Box>
                          </Box>

                          {/* 1st place (center, tallest) */}
                          <Box textAlign="center" w="30%">
                            <Box mb={-8} transform="translateY(-46px)">
                              <Box
                                mx="auto"
                                w="84px"
                                h="84px"
                                borderRadius="full"
                                bg="yellow.200"
                                overflow="hidden"
                                border="3px solid"
                                borderColor="brand.red"
                              >
                                <img
                                  src={`https://raceiq.app/images/drivers/${summary.podium[0]?.driver_id ?? 'placeholder'}.jpg`}
                                  alt={summary.podium[0]?.driver_name ?? 'Driver'}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  onError={(e) => (e.currentTarget.src = '/default-driver.png')}
                                />
                              </Box>
                            </Box>

                            <Box
                              mx="auto"
                              w="100%"
                              h="160px"
                              bg="yellow.400"
                              borderRadius="md"
                              border="1px solid"
                              borderColor="yellow.500"
                              position="relative"
                            >
                              <Box
                                position="absolute"
                                top={2}
                                left="50%"
                                transform="translateX(-50%)"
                                px={3}
                                py={1}
                                bg="yellow.300"
                                borderRadius="md"
                                fontWeight="bold"
                                fontSize="sm"
                                color="gray.900"
                                minW="32px"
                              >
                                1
                              </Box>
                              <Text
                                position="absolute"
                                bottom={3}
                                left="50%"
                                transform="translateX(-50%)"
                                fontWeight="bold"
                                fontSize="lg"
                                color="brand.red"
                                noOfLines={1}
                                maxW="90%"
                              >
                                {summary.podium[0]?.driver_name ?? summary.podium[0]?.driver_code ?? summary.podium[0]?.driver_id}
                              </Text>
                            </Box>
                          </Box>

                          {/* 3rd place (right, shortest) */}
                          <Box textAlign="center" w="30%">
                            <Box mb={-4} transform="translateY(-24px)">
                              <Box
                                mx="auto"
                                w="70px"
                                h="70px"
                                borderRadius="full"
                                bg="orange.200"
                                overflow="hidden"
                                border="2px solid"
                                borderColor="brand.red"
                              >
                                <img
                                  src={`https://raceiq.app/images/drivers/${summary.podium[2]?.driver_id ?? 'placeholder'}.jpg`}
                                  alt={summary.podium[2]?.driver_name ?? 'Driver'}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  onError={(e) => (e.currentTarget.src = '/default-driver.png')}
                                />
                              </Box>
                            </Box>

                            <Box
                              mx="auto"
                              w="100%"
                              h="100px"
                              bg="orange.400"
                              borderRadius="md"
                              border="1px solid"
                              borderColor="orange.500"
                              position="relative"
                            >
                              <Box
                                position="absolute"
                                top={2}
                                left="50%"
                                transform="translateX(-50%)"
                                px={3}
                                py={1}
                                bg="orange.300"
                                borderRadius="md"
                                fontWeight="bold"
                                fontSize="sm"
                                color="gray.900"
                                minW="32px"
                              >
                                3
                              </Box>
                              <Text
                                position="absolute"
                                bottom={3}
                                left="50%"
                                transform="translateX(-50%)"
                                fontWeight="bold"
                                fontSize="md"
                                color="text-primary"
                                noOfLines={1}
                                maxW="90%"
                              >
                                {summary.podium[2]?.driver_name ?? summary.podium[2]?.driver_code ?? summary.podium[2]?.driver_id}
                              </Text>
                            </Box>
                          </Box>
                        </Flex>
                      </Box>
                    ) : (
                      <Text>—</Text>
                    )}
                  </Box>



                  {/* Fastest Lap Chakra Card */}
                  <Box p={4} border="1px solid" borderColor="border-subtle" borderRadius="lg" bg="bg-elevated" boxShadow="md">
                    <Text fontWeight="bold" mb={2} color="brand.red">Fastest Lap</Text>
                    <Divider my={2}/>
                    {summaryLoading ? <Spinner size="sm" /> : summaryError ? <Text color="red.500">{summaryError}</Text> : summary?.fastestLap ? (
                      <VStack align="start" spacing={2}>
                        <HStack>
                          <Text fontWeight="bold" color="text-primary">Driver:</Text>
                          <Text color="text-secondary">{summary.fastestLap.driver_name ?? summary.fastestLap.driver_id}</Text>
                        </HStack>
                        {'lap_number' in summary.fastestLap && summary.fastestLap.lap_number !== undefined && (
                          <HStack>
                            <Text fontWeight="bold" color="text-primary">Lap:</Text>
                            <Text color="text-secondary">{summary.fastestLap.lap_number}</Text>
                          </HStack>
                        )}
                        {'time_ms' in summary.fastestLap && summary.fastestLap.time_ms != null ? (
                          <HStack>
                            <Text fontWeight="bold" color="text-primary">Time:</Text>
                            <Text color="text-secondary">{(summary.fastestLap.time_ms / 1000).toFixed(3)}s</Text>
                          </HStack>
                        ) : (
                          <HStack>
                            <Text fontWeight="bold" color="text-primary">Time:</Text>
                            <Text color="text-secondary">—</Text>
                          </HStack>
                        )}
                      </VStack>
                    ) : <Text>—</Text>}
                  </Box>
                </SimpleGrid>

                {/* Events summary: Chakra UI card style */}
                <Box p={4} border="1px solid" borderColor="border-subtle" borderRadius="lg" bg="bg-elevated" mt={2} boxShadow="md">
                  <Text fontWeight="bold" mb={2} color="brand.red">Events</Text>
                  <Divider my={2}/>
                  {summaryLoading ? <Spinner size="sm" /> : summaryError ? <Text color="red.500">{summaryError}</Text> : summary?.events ? (
                    <HStack spacing={8}>
                      <VStack align="center" spacing={1}>
                        <Text fontWeight="bold" color="red.500">Red Flags</Text>
                        <Box fontSize="2xl" fontWeight="bold" color="red.500">{summary.events.redFlags}</Box>
                      </VStack>
                      <VStack align="center" spacing={1}>
                        <Text fontWeight="bold" color="yellow.500">Yellow Flags</Text>
                        <Box fontSize="2xl" fontWeight="bold" color="yellow.500">{summary.events.yellowFlags}</Box>
                      </VStack>
                    </HStack>
                  ) : <Text>—</Text>}
                </Box>
              </VStack>
            </TabPanel>

            {/* RACE RESULTS */}
            <TabPanel>
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between" wrap="wrap" gap={3}>
                  <Text fontSize="xl" fontWeight="bold" color="text-primary">Race Results</Text>
                  <HStack wrap="wrap" gap={2}>
                    <Box
                      as="button"
                      px={3} py={1}
                      borderRadius="md"
                      borderWidth={2}
                      borderColor={driverFilter.length === 0 ? 'brand.red' : 'border-subtle'}
                      boxShadow={driverFilter.length === 0 ? '0 0 0 2px #F56565' : undefined}
                      bg={driverFilter.length === 0 ? 'bg-elevated' : 'bg-surface'}
                      fontWeight="bold"
                      color={driverFilter.length === 0 ? 'brand.red' : 'text-primary'}
                      onClick={() => setDriverFilter([])}
                      transition="all 0.2s"
                    >
                      All Drivers
                    </Box>
                    {driversInRace.map(d => {
                      const driverResult = raceResults.find(r => (r.driver_code ?? String(r.driver_id)) === d);
                      const label = driverResult?.driver_name || '';
                      if (!label) return null;
                      const selected = driverFilter.includes(d);
                      return (
                        <Box
                          as="button"
                          key={d}
                          px={3} py={1}
                          borderRadius="md"
                          borderWidth={2}
                          borderColor={selected ? 'brand.red' : 'border-subtle'}
                          boxShadow={selected ? '0 0 8px 2px #F56565' : undefined}
                          bg={selected ? 'bg-elevated' : 'bg-surface'}
                          fontWeight="bold"
                          color={selected ? 'brand.red' : 'text-primary'}
                          cursor="pointer"
                          m={1}
                          transition="all 0.2s"
                          onClick={() => {
                            setDriverFilter(selected ? driverFilter.filter(x => x !== d) : [...driverFilter, d]);
                          }}
                        >
                          {label}
                        </Box>
                      );
                    })}
                  </HStack>
                </HStack>

                <Table size="sm" variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Pos</Th><Th>Driver</Th><Th>Constructor</Th><Th>Grid</Th><Th>Status</Th><Th isNumeric>Time</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredRaceResults.map((r, idx) => (
                      <Tr key={idx}>
                        <Td>{r.position ?? '-'}</Td>
                        <Td>{r.driver_name ?? r.driver_code ?? r.driver_id}</Td>
                        <Td>{r.constructor_name ?? r.constructor_id}</Td>
                        <Td>{r.grid ?? '-'}</Td>
                        <Td>{r.status ?? '-'}</Td>
                        <Td isNumeric>{fmtMs(r.time_ms)}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </VStack>
            </TabPanel>

            {/* QUALIFYING */}
            <TabPanel>
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between" wrap="wrap" gap={3}>
                  <Text fontSize="xl" fontWeight="bold" color="text-primary">Qualifying</Text>
                  <HStack wrap="wrap" gap={2}>
                    {/* Phase filter above driver filter, blue color for distinction */}
                    <Box mb={2}>
                      <Text fontWeight="bold" mb={1}>Phase:</Text>
                      <HStack wrap="wrap" gap={2}>
                        {['all', 'q1', 'q2', 'q3'].map(phase => {
                          const label = phase === 'all' ? 'All' : phase.toUpperCase();
                          const selected = qualiPhase === phase;
                          return (
                            <Box
                              as="button"
                              key={phase}
                              px={3} py={1}
                              borderRadius="md"
                              borderWidth={2}
                              borderColor={selected ? 'blue.400' : 'border-subtle'}
                              boxShadow={selected ? '0 0 8px 2px #4299E1' : undefined}
                              bg={selected ? 'bg-elevated' : 'bg-surface'}
                              fontWeight="bold"
                              color={selected ? 'blue.400' : 'text-primary'}
                              cursor="pointer"
                              m={1}
                              transition="all 0.2s"
                              onClick={() => setQualiPhase(phase as typeof qualiPhase)}
                            >
                              {label}
                            </Box>
                          );
                        })}
                      </HStack>
                    </Box>
                    {/* Driver filter below phase filter, separated by VStack */}
                    <Box mb={2}>
                      <Text fontWeight="bold" mb={1}>Drivers:</Text>
                      <HStack wrap="wrap" gap={2}>
                        <Box
                          as="button"
                          px={3} py={1}
                          borderRadius="md"
                          borderWidth={2}
                          borderColor={driverFilter.length === 0 ? 'brand.red' : 'border-subtle'}
                          boxShadow={driverFilter.length === 0 ? '0 0 0 2px #F56565' : undefined}
                          bg={driverFilter.length === 0 ? 'bg-elevated' : 'bg-surface'}
                          fontWeight="bold"
                          color={driverFilter.length === 0 ? 'brand.red' : 'text-primary'}
                          onClick={() => setDriverFilter([])}
                          transition="all 0.2s"
                        >
                          All Drivers
                        </Box>
                        {driversInRace.map(d => {
                          const qualiResult = qualiResults.find(q => (q.driver_code ?? String(q.driver_id)) === d);
                          const label = qualiResult?.driver_name || '';
                          if (!label) return null;
                          const selected = driverFilter.includes(d);
                          return (
                            <Box
                              as="button"
                              key={d}
                              px={3} py={1}
                              borderRadius="md"
                              borderWidth={2}
                              borderColor={selected ? 'brand.red' : 'border-subtle'}
                              boxShadow={selected ? '0 0 8px 2px #F56565' : undefined}
                              bg={selected ? 'bg-elevated' : 'bg-surface'}
                              fontWeight="bold"
                              color={selected ? 'brand.red' : 'text-primary'}
                              cursor="pointer"
                              m={1}
                              transition="all 0.2s"
                              onClick={() => {
                                setDriverFilter(selected ? driverFilter.filter(x => x !== d) : [...driverFilter, d]);
                              }}
                            >
                              {label}
                            </Box>
                          );
                        })}
                      </HStack>
                    </Box>
                  </HStack>
                </HStack>

                <Table size="sm" variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Pos</Th><Th>Driver</Th><Th>Constructor</Th>
                      <Th isNumeric>Q1</Th><Th isNumeric>Q2</Th><Th isNumeric>Q3</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredQuali.map((q, idx) => (
                      <Tr key={idx}>
                        <Td>{q.position ?? '-'}</Td>
                        <Td>{q.driver_name ?? q.driver_code ?? q.driver_id}</Td>
                        <Td>{q.constructor_name ?? q.constructor_id}</Td>
                        <Td isNumeric>{fmtMs(q.q1_time_ms)}</Td>
                        <Td isNumeric>{fmtMs(q.q2_time_ms)}</Td>
                        <Td isNumeric>{fmtMs(q.q3_time_ms)}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </VStack>
            </TabPanel>

{/* QUALI → RACE (improved SVG) */}
<TabPanel>
  <VStack align="stretch" spacing={4}>
    <Text fontSize="xl" fontWeight="bold" color="text-primary">Grid to Finish</Text>

    <Box
      overflow="hidden"
      border="1px solid"
      borderColor="border-subtle"
      borderRadius="lg"
      bg="bg-elevated"
      p={3}
    >
      {(() => {
        const rowHeight = 32;
        const W = 1600;
        const LEFT_X = 300;
        const RIGHT_X = 1300;
        const NAME_LEFT_X = LEFT_X - 20;
        const NAME_RIGHT_X = RIGHT_X + 40;
        const TOP = 60;
        const BASE_Y = 80;
        const bottomPad = 60; // breathing room below the lowest element

        // Sort once by grid to define left column order
        const leftOrdered = filteredRaceResults
          .slice()
          .sort((a, b) => (a.grid ?? 99) - (b.grid ?? 99));

        // Build a quick lookup by driver_id for finish order index
        // (fallback to grid order index when position is missing/duplicated)
        const finishOrder = filteredRaceResults
          .slice()
          .sort((a, b) => (a.position ?? 99) - (b.position ?? 99));

        const finishIndexByDriver: Record<string | number, number> = {};
        finishOrder.forEach((rr, idx) => {
          const key = rr.driver_id ?? rr.driver_code ?? `${idx}`;
          finishIndexByDriver[key] = idx;
        });

        // Precompute all positions and track the true max Y across both sides
        const items = leftOrdered.map((r, i) => {
          const key = r.driver_id ?? r.driver_code ?? `${i}`;
          const y1 = BASE_Y + i * rowHeight;
          const idx2 = finishIndexByDriver[key] ?? i;
          const y2 = BASE_Y + idx2 * rowHeight;

          const constructor = r.constructor_name ?? r.constructor_id;
          const constructorKey = typeof constructor === "string" ? constructor : String(constructor ?? "Default");
          let color = teamColors[constructorKey] || teamColors["Default"];
          if (!color && typeof constructorKey === "string") {
            const k = Object.keys(teamColors).find(t => constructorKey.toLowerCase().includes(t.toLowerCase()));
            color = k ? teamColors[k] : teamColors["Default"];
          }
          color = `#${color}`;

          const driverLabel = r.driver_name ?? r.driver_code ?? r.driver_id;

          return { y1, y2, color, driverLabel };
        });

        const maxY = items.length
          ? Math.max(...items.map(it => Math.max(it.y1, it.y2)))
          : BASE_Y; // safe default if list is empty

        const lastY = maxY; // where vertical lines should end
        const height = lastY + bottomPad;

        return (
          <svg
            viewBox={`0 0 ${W + 100} ${height}`}
            width="100%"
            height={height}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Vertical rails end exactly at lastY */}
            <line x1={LEFT_X}  y1={TOP} x2={LEFT_X}  y2={lastY} stroke="currentColor" strokeWidth={3} />
            <line x1={RIGHT_X} y1={TOP} x2={RIGHT_X} y2={lastY} stroke="currentColor" strokeWidth={3} />

            <text x={NAME_LEFT_X - 100} y={45} fontSize="26" fontWeight="bold">Grid</text>
            <text x={RIGHT_X + 20} y={45} fontSize="26" fontWeight="bold">Finish</text>

            {items.map((it, i) => (
              <g key={i}>
                {/* Left name & node */}
                <text
                  x={NAME_LEFT_X}
                  y={it.y1 + 8}
                  fontSize={18}
                  fontWeight="bold"
                  fill={it.color}
                  textAnchor="end"
                >
                  {it.driverLabel}
                </text>
                <circle cx={LEFT_X} cy={it.y1} r={10} fill={it.color} />

                {/* Right node & name */}
                <circle cx={RIGHT_X} cy={it.y2} r={10} fill={it.color} />
                <text
                  x={NAME_RIGHT_X}
                  y={it.y2 + 8}
                  fontSize={18}
                  fontWeight="bold"
                  fill={it.color}
                  textAnchor="start"
                >
                  {it.driverLabel}
                </text>

                {/* Connecting line */}
                <line x1={LEFT_X} y1={it.y1} x2={RIGHT_X} y2={it.y2} stroke={it.color} strokeWidth={6} />
              </g>
            ))}
          </svg>
        );
      })()}
    </Box>
  </VStack>
</TabPanel>




            {/* ANALYSIS TAB: Race Position & Lap Time Graphs with Driver Filters */}
            <TabPanel>
              <VStack align="stretch" spacing={4}>
                <Text fontSize="xl" fontWeight="bold" color="text-primary">Analysis</Text>
                {/* Driver filter for graphs */}
                <Box mb={2}>
                  <Text fontWeight="bold">Select Drivers:</Text>
                  <HStack wrap="wrap" gap={2}>
                    <Box
                      as="button"
                      px={3} py={1}
                      borderRadius="md"
                      borderWidth={2}
                      borderColor={driverFilter.length === 0 ? 'brand.red' : 'border-subtle'}
                      boxShadow={driverFilter.length === 0 ? '0 0 0 2px #F56565' : undefined}
                      bg={driverFilter.length === 0 ? 'bg-elevated' : 'bg-surface'}
                      fontWeight="bold"
                      color={driverFilter.length === 0 ? 'brand.red' : 'text-primary'}
                      onClick={() => setDriverFilter([])}
                      transition="all 0.2s"
                    >
                      All Drivers
                    </Box>
                    {driversInRace.map(d => {
                      const label =
                        raceResults.find(r => (r.driver_code ?? String(r.driver_id)) === d)?.driver_name ||
                        qualiResults.find(q => (q.driver_code ?? String(q.driver_id)) === d)?.driver_name ||
                        d;
                      const selected = driverFilter.includes(d);
                      return (
                        <Box
                          as="button"
                          key={d}
                          px={3} py={1}
                          borderRadius="md"
                          borderWidth={2}
                          borderColor={selected ? 'brand.red' : 'border-subtle'}
                          boxShadow={selected ? '0 0 8px 2px #F56565' : undefined}
                          bg={selected ? 'bg-elevated' : 'bg-surface'}
                          fontWeight="bold"
                          color={selected ? 'brand.red' : 'text-primary'}
                          cursor="pointer"
                          m={1}
                          transition="all 0.2s"
                          onClick={() => {
                            setDriverFilter(selected ? driverFilter.filter(x => x !== d) : [...driverFilter, d]);
                          }}
                        >
                          {label}
                        </Box>
                      );
                    })}
                  </HStack>
                </Box>
                {/* Race Position Graph */}
                <Box border="1px solid" borderColor="border-subtle" borderRadius="lg" bg="bg-elevated" p={4} mb={4}>
                  <Text fontWeight="bold" mb={2}>Race Positions by Lap</Text>
                  {/* Simple SVG line graph: lap vs position for selected drivers */}
                  <svg width={1200} height={400}>
                    {/* Axes */}
                    <line x1={60} y1={40} x2={60} y2={360} stroke="#888" />
                    <line x1={60} y1={360} x2={1150} y2={360} stroke="#888" />
                    {/* Axis labels */}
                    <text x={20} y={30} fontSize={16}>Pos</text>
                    <text x={1150} y={390} fontSize={16}>Lap</text>
                    {/* Driver lines */}
                    {driverFilter.length ? driverFilter : driversInRace.map((d, idx) => {
                      const driverLaps = laps.filter(l => (l.driver_code ?? String(l.driver_id)) === d);
                      if (!driverLaps.length) return null;
                      // Find constructor name or id for this driver from raceResults or qualiResults
                      const driverKey = driverLaps[0]?.driver_code ?? String(driverLaps[0]?.driver_id);
                      const driverResult = raceResults.find(r => (r.driver_code ?? String(r.driver_id)) === driverKey)
                        || qualiResults.find(q => (q.driver_code ?? String(q.driver_id)) === driverKey);
                      const constructor =
                        driverResult?.constructor_name ?? driverResult?.constructor_id ?? "Default";
                      const constructorKey = typeof constructor === "string" ? constructor : String(constructor ?? "Default");
                      const color = teamColors[constructorKey] || teamColors["Default"];
                      // Map laps to SVG points
                      const points = driverLaps.map(l => {
                        const x = 60 + ((l.lap_number - 1) * ((1150 - 60) / Math.max(1, laps.length - 1)));
                        const y = 360 - ((l.position ?? 20) - 1) * ((320) / 19);
                        return `${x},${y}`;
                      }).join(' ');
                      return (
                        <polyline
                          key={d}
                          points={points}
                          fill="none"
                          stroke={`#${color}`}
                          strokeWidth={3}
                        />
                      );
                    })}
                    {/* Driver labels at last lap */}
                    {driverFilter.length ? driverFilter : driversInRace.map((d, idx) => {
                      const driverLaps = laps.filter(l => (l.driver_code ?? String(l.driver_id)) === d);
                      if (!driverLaps.length) return null;
                      const lastLap = driverLaps[driverLaps.length - 1];
                      const x = 60 + ((lastLap.lap_number - 1) * ((1150 - 60) / Math.max(1, laps.length - 1)));
                      const y = 360 - ((lastLap.position ?? 20) - 1) * ((320) / 19);
                      return (
                        <text key={d} x={x + 5} y={y} fontSize={14} fill="#222">{d}</text>
                      );
                    })}
                  </svg>
                </Box>
                {/* Lap Time Analysis Graph */}
                <Box border="1px solid" borderColor="border-subtle" borderRadius="lg" bg="bg-elevated" p={4}>
                  <Text fontWeight="bold" mb={2}>Lap Time Comparison</Text>
                  {/* Simple SVG line graph: lap vs lap time for selected drivers */}
                  <svg width={1200} height={400}>
                    {/* Axes */}
                    <line x1={60} y1={40} x2={60} y2={360} stroke="#888" />
                    <line x1={60} y1={360} x2={1150} y2={360} stroke="#888" />
                    {/* Axis labels */}
                    <text x={20} y={30} fontSize={16}>Lap Time (s)</text>
                    <text x={1150} y={390} fontSize={16}>Lap</text>
                    {/* Driver lines */}
                    {driverFilter.length ? driverFilter : driversInRace.map((d, idx) => {
                      const driverLaps = laps.filter(l => (l.driver_code ?? String(l.driver_id)) === d);
                      if (!driverLaps.length) return null;
                      // Find constructor name or id for this driver from raceResults or qualiResults
                      const driverKey = driverLaps[0]?.driver_code ?? String(driverLaps[0]?.driver_id);
                      const driverResult = raceResults.find(r => (r.driver_code ?? String(r.driver_id)) === driverKey)
                        || qualiResults.find(q => (q.driver_code ?? String(q.driver_id)) === driverKey);
                      const constructor =
                        driverResult?.constructor_name ?? driverResult?.constructor_id ?? "Default";
                      const constructorKey = typeof constructor === "string" ? constructor : String(constructor ?? "Default");
                      const color = teamColors[constructorKey] || teamColors["Default"];
                      // Find min/max lap time for scaling
                      const minLap = Math.min(...driverLaps.map(l => l.lap_number));
                      const maxLap = Math.max(...driverLaps.map(l => l.lap_number));
                      const minTime = Math.min(...driverLaps.map(l => l.time_ms ?? 0));
                      const maxTime = Math.max(...driverLaps.map(l => l.time_ms ?? 0));
                      // Map laps to SVG points
                      const points = driverLaps.map(l => {
                        const x = 60 + ((l.lap_number - minLap) * ((1150 - 60) / Math.max(1, maxLap - minLap)));
                        const y = 360 - ((l.time_ms ?? minTime) - minTime) * (320 / Math.max(1, maxTime - minTime));
                        return `${x},${y}`;
                      }).join(' ');
                      return (
                        <polyline
                          key={d}
                          points={points}
                          fill="none"
                          stroke={`#${color}`}
                          strokeWidth={3}
                        />
                      );
                    })}
                    {/* Driver labels at last lap */}
                    {driverFilter.length ? driverFilter : driversInRace.map((d, idx) => {
                      const driverLaps = laps.filter(l => (l.driver_code ?? String(l.driver_id)) === d);
                      if (!driverLaps.length) return null;
                      const lastLap = driverLaps[driverLaps.length - 1];
                      const x = 60 + ((lastLap.lap_number - 1) * ((1150 - 60) / Math.max(1, laps.length - 1)));
                      const y = 360 - ((lastLap.time_ms ?? 0) - Math.min(...driverLaps.map(l => l.time_ms ?? 0))) * (320 / Math.max(1, Math.max(...driverLaps.map(l => l.time_ms ?? 0)) - Math.min(...driverLaps.map(l => l.time_ms ?? 0))));
                      return (
                        <text key={d} x={x + 5} y={y} fontSize={14} fill="#222">{d}</text>
                      );
                    })}
                  </svg>
                </Box>
              </VStack>
            </TabPanel>

            {/* LAP TIMES / PIT STOPS */}
            <TabPanel>
              <VStack align="stretch" spacing={4}>
                <Text fontSize="xl" fontWeight="bold" color="text-primary">Lap Times & Pit Stops</Text>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {/* Lap Times sample */}
                  <Box p={4} border="1px solid" borderColor="border-subtle" borderRadius="lg" bg="bg-elevated">
                    <HStack justify="space-between" mb={2}>
                      <Text fontWeight="bold">Lap Times</Text>
                      <HStack>
                        {/* keep UI consistent with other tabs */}
                        <Checkbox
                          isChecked={driverFilter.length === 0}
                          onChange={(e) => setDriverFilter(e.target.checked ? [] : driversInRace)}
                        >
                          Select all
                        </Checkbox>
                      </HStack>
                    </HStack>
                    <Table size="sm" variant="simple">
                      <Thead>
                        <Tr><Th>Driver</Th><Th isNumeric>Lap</Th><Th isNumeric>Time</Th></Tr>
                      </Thead>
                      <Tbody>
                        {Array.from(lapsByDriver.keys()).slice(0, 6).flatMap((d) =>
                          (lapsByDriver.get(d) ?? []).slice(0, 6).map((l, i) => (
                            <Tr key={`${d}-lap-${i}`}>
                              <Td>{d}</Td><Td isNumeric>{l.lap_number}</Td><Td isNumeric>{fmtMs(l.time_ms)}</Td>
                            </Tr>
                          ))
                        )}
                      </Tbody>
                    </Table>
                  </Box>

                  {/* Pit Stops */}
                  <Box p={4} border="1px solid" borderColor="border-subtle" borderRadius="lg" bg="bg-elevated">
                    <Text fontWeight="bold" mb={2}>Pit Stops</Text>
                    <Table size="sm" variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Driver</Th><Th isNumeric>Lap</Th><Th isNumeric>Stop #</Th>
                          <Th isNumeric>Total</Th><Th isNumeric>Stationary</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {pitStops
                          .filter(p => (driverFilter.length ? driverFilter : driversInRace).includes(p.driver_code ?? String(p.driver_id)))
                          .sort((a, b) => a.lap_number - b.lap_number)
                          .slice(0, 30)
                          .map((p, i) => (
                            <Tr key={i}>
                              <Td>{p.driver_code ?? p.driver_id}</Td>
                              <Td isNumeric>{p.lap_number}</Td>
                              <Td isNumeric>{p.stop_number}</Td>
                              <Td isNumeric>{fmtMs(p.total_duration_in_pit_ms)}</Td>
                              <Td isNumeric>{fmtMs(p.stationary_duration_ms)}</Td>
                            </Tr>
                          ))}
                      </Tbody>
                    </Table>
                  </Box>
                </SimpleGrid>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </Box>
  );
};

// Footer for RaceDetailPage
const Footer = () => (
  <Box
    as="footer"
    bg="bg-surface-raised"
    borderTop="2px solid"
    borderColor="brand.red"
    py="xl"
    w="100%"
    position="fixed"
    left={0}
    bottom={0}
    zIndex={100}
  >
    <Container maxW="1200px">
      <Flex justify="space-between" align="center" wrap="wrap" gap="md">
        <HStack spacing="lg">
          <Link to="/api-docs"><Text color="text-secondary" _hover={{ color: 'brand.red' }}>API Docs</Text></Link>
          <Link to="/privacy"><Text color="text-secondary" _hover={{ color: 'brand.red' }}>Privacy Policy</Text></Link>
          <Link to="/contact"><Text color="text-secondary" _hover={{ color: 'brand.red' }}>Contact</Text></Link>
        </HStack>
        <Text color="text-muted" fontSize="sm">
          ©{new Date().getFullYear()} RaceIQ. All rights reserved.
        </Text>
      </Flex>
    </Container>
  </Box>
);

const RaceDetailPageLayout: React.FC = () => (
  <Box minH="100vh" display="flex" flexDirection="column" bg="bg-primary" color="text-primary">
    <Box flex="1">
      <RaceDetailPage />
    </Box>
    <Footer />
  </Box>
);

export default RaceDetailPageLayout;
