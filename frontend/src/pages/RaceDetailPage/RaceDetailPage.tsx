// src/pages/RaceDetailPage/RaceDetailPage.tsx
import React, { useEffect, useMemo, useState, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

                {/* overlay controls placeholders */}
                <HStack wrap="wrap" spacing={3}>
                  <Badge>Flags</Badge>
                  <Badge>Sectors</Badge>
                  <Badge>Overtakes</Badge>
                  <HStack>
                    <Text>Lap:</Text>
                    <Select
                      size="sm"
                      value={lapFilter === 'all' ? 'all' : String(lapFilter)}
                      onChange={(e) => setLapFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    >
                      <option value="all">All</option>
                      {uniq(laps.map(l => l.lap_number)).map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </Select>
                  </HStack>
                </HStack>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box p={4} border="1px solid" borderColor="border-subtle" borderRadius="lg" bg="bg-elevated">
                    <Text fontWeight="bold">Podium</Text>
                    <Divider my={2}/>
                    {summaryLoading ? <Spinner size="sm" /> : summaryError ? <Text color="red.500">{summaryError}</Text> : summary?.podium?.length ? (
                      summary.podium.map((r, i) => (
                        <HStack key={i} justify="space-between">
                          <Text>#{i + 1} {r.driver_code ?? r.driver_name ?? r.driver_id}</Text>
                          <Text>{r.constructor_name ?? r.constructor_id}</Text>
                        </HStack>
                      ))
                    ) : <Text>—</Text>}
                  </Box>

                  <Box p={4} border="1px solid" borderColor="border-subtle" borderRadius="lg" bg="bg-elevated">
                    <Text fontWeight="bold">Fastest Lap</Text>
                    <Divider my={2}/>
                    {summaryLoading ? <Spinner size="sm" /> : summaryError ? <Text color="red.500">{summaryError}</Text> : summary?.fastestLap ? (
                      <VStack align="start" spacing={1}>
                        <Text>Driver: {summary.fastestLap.driver_name ?? summary.fastestLap.driver_id}</Text>
                        {'lap_number' in summary.fastestLap && summary.fastestLap.lap_number !== undefined && (
                          <Text>Lap: {summary.fastestLap.lap_number}</Text>
                        )}
                        {'time_ms' in summary.fastestLap && summary.fastestLap.time_ms != null ? (
                          <Text>Time: {(summary.fastestLap.time_ms / 1000).toFixed(3)}s</Text>
                        ) : (
                          <Text>Time: —</Text>
                        )}
                      </VStack>
                    ) : <Text>—</Text>}
                  </Box>
                </SimpleGrid>

                {/* Events summary: red and yellow flags */}
                <Box p={4} border="1px solid" borderColor="border-subtle" borderRadius="lg" bg="bg-elevated" mt={2}>
                  <Text fontWeight="bold">Events</Text>
                  <Divider my={2}/>
                  {summaryLoading ? <Spinner size="sm" /> : summaryError ? <Text color="red.500">{summaryError}</Text> : summary?.events ? (
                    <VStack align="start" spacing={1}>
                      <Text>Red Flags: {summary.events.redFlags}</Text>
                      <Text>Yellow Flags: {summary.events.yellowFlags}</Text>
                    </VStack>
                  ) : <Text>—</Text>}
                </Box>
              </VStack>
            </TabPanel>

            {/* RACE RESULTS */}
            <TabPanel>
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between" wrap="wrap" gap={3}>
                  <Text fontSize="xl" fontWeight="bold" color="text-primary">Race Results</Text>
                  <HStack>
                    <Checkbox
                      isChecked={driverFilter.length === 0}
                      onChange={(e) => setDriverFilter(e.target.checked ? [] : driversInRace)}
                    >
                      Select all
                    </Checkbox>
                    <CheckboxGroup
                      value={driverFilter.length ? driverFilter : driversInRace}
                      onChange={(v) => setDriverFilter(v as string[])}
                    >
                      <Stack direction="row" wrap="wrap">
                        {driversInRace.map(d => {
                          // Find the first race result for this driver code/id
                          const driverResult = raceResults.find(r => (r.driver_code ?? String(r.driver_id)) === d);
                          const label = driverResult?.driver_name || d;
                          return <Checkbox key={d} value={d}>{label}</Checkbox>;
                        })}
                      </Stack>
                    </CheckboxGroup>
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
                  <HStack>
                    <Select size="sm" value={qualiPhase} onChange={(e) => setQualiPhase(e.target.value as any)}>
                      <option value="all">All</option>
                      <option value="q1">Q1</option>
                      <option value="q2">Q2</option>
                      <option value="q3">Q3</option>
                    </Select>
                    <Checkbox
                      isChecked={driverFilter.length === 0}
                      onChange={(e) => setDriverFilter(e.target.checked ? [] : driversInRace)}
                    >
                      Select all
                    </Checkbox>
                    <CheckboxGroup
                      value={driverFilter.length ? driverFilter : driversInRace}
                      onChange={(v) => setDriverFilter(v as string[])}
                    >
                      <Stack direction="row" wrap="wrap">
                        {driversInRace.map(d => {
                          // Find the first quali result for this driver code/id
                          const qualiResult = qualiResults.find(q => (q.driver_code ?? String(q.driver_id)) === d);
                          const label = qualiResult?.driver_name || d;
                          return <Checkbox key={d} value={d}>{label}</Checkbox>;
                        })}
                      </Stack>
                    </CheckboxGroup>
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

            {/* QUALI → RACE (simple SVG) */}
            <TabPanel>
              <VStack align="stretch" spacing={4}>
                <Text fontSize="xl" fontWeight="bold" color="text-primary">Grid to Finish</Text>
                <Box overflowX="auto" border="1px solid" borderColor="border-subtle" borderRadius="lg" bg="bg-elevated" p={3}>
                  <svg width="900" height={Math.max(200, driversInRace.length * 18)}>
                    <line x1="100" y1="20" x2="100" y2="180" stroke="currentColor" />
                    <line x1="800" y1="20" x2="800" y2="180" stroke="currentColor" />
                    <text x="60" y="15">Grid</text>
                    <text x="820" y="15">Finish</text>
                    {filteredRaceResults.map((r, i) => {
                      const d = r.driver_code ?? r.driver_name ?? String(r.driver_id);
                      const grid = r.grid ?? 99;
                      const finish = r.position ?? 99;
                      const y1 = 20 + Math.min(160, (grid - 1) * (160 / 19));
                      const y2 = 20 + Math.min(160, (finish - 1) * (160 / 19));
                      const color = 'currentColor';
                      return (
                        <g key={i}>
                          <circle cx="100" cy={y1} r="3" fill={color} />
                          <circle cx="800" cy={y2} r="3" fill={color} />
                          <line x1="100" y1={y1} x2="800" y2={y2} stroke={color} />
                          <text x="105" y={y1 - 2} fontSize="10">{d}</text>
                        </g>
                      );
                    })}
                  </svg>
                </Box>
              </VStack>
            </TabPanel>

            {/* ANALYSIS (basic preview table; swap to charts later if you like) */}
            <TabPanel>
              <VStack align="stretch" spacing={4}>
                <Text fontSize="xl" fontWeight="bold" color="text-primary">Analysis</Text>
                <Box border="1px solid" borderColor="border-subtle" borderRadius="lg" bg="bg-elevated" p={4}>
                  <Text fontWeight="bold" mb={2}>Race Positions by Lap (sample)</Text>
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>Driver</Th><Th isNumeric>Lap</Th><Th isNumeric>Pos</Th><Th isNumeric>Lap Time</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {Array.from(new Set(laps.map(l => l.driver_code ?? String(l.driver_id)))).slice(0, 6).flatMap(d =>
                        laps.filter(l => (l.driver_code ?? String(l.driver_id)) === d).slice(0, 6).map((l, i) => (
                          <Tr key={`${d}-${i}`}>
                            <Td>{d}</Td><Td isNumeric>{l.lap_number}</Td><Td isNumeric>{l.position ?? '-'}</Td><Td isNumeric>{fmtMs(l.time_ms)}</Td>
                          </Tr>
                        ))
                      )}
                    </Tbody>
                  </Table>
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

export default RaceDetailPage;
