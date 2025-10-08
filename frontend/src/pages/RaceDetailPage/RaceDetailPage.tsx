// src/pages/RaceDetailPage/RaceDetailPage.tsx
import React, { useEffect, useMemo, useState, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Flex, IconButton, Text, VStack, HStack, Spinner, Container, Alert, AlertIcon,
  Tabs, TabList, TabPanels, Tab, TabPanel, Checkbox, SimpleGrid, Table,
  Thead, Tbody, Tr, Th, Td, Button, Heading,
} from '@chakra-ui/react';
import { useThemeColor } from '../../context/ThemeColorContext';
import ResponsiveTable from '../../components/layout/ResponsiveTable';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, RotateCcw, CornerUpRight, Zap, TrendingUp, TrendingDown } from 'lucide-react';
import type { Race } from '../../types/races';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import CircuitTrack3D from '../RacesPage/components/CircuitTrack3D';
import { teamColors } from '../../lib/teamColors';
import { apiFetch } from '../../lib/api';
import { getCircuitBackground, getDefaultCircuitBackground } from '../../lib/circuitBackgrounds';
import StatCard from '../../components/StatCard/StatCard';
import Podium from '../../components/RaceDetails/Podium';
import FastestLapWidget from '../../components/RaceDetails/FastestLapWidget';
import RaceEventsWidget from '../../components/RaceDetails/RaceEventsWidget';
import RaceDetailSkeleton from './RaceDetailSkeleton';

const MotionBox = motion.create(Box);

// Unified JSON helper backed by apiFetch, automatically prefixes /api.
const getJSON = <T,>(path: string) => apiFetch<T>(`/api${path.startsWith('/') ? path : `/${path}`}`);

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

// ---------- utils ----------
const fmtMs = (ms?: number | null) => {
  if (ms == null) return '-';
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toFixed(3);
  return `${minutes}:${seconds.padStart(6, '0')}`;
};


// Format race summary times with gap behind leader
const fmtRaceSummaryTime = (timeMs?: number | null, status?: string | null) => {
  if (timeMs == null || status == null) return '-';
  
  // If driver didn't finish (DNF, DNS, etc.), show status
  if (status !== 'Finished' && status !== 'Lapped') return status;
  
  // For lapped drivers, show lap count
  if (status === 'Lapped') {
    const totalSeconds = timeMs / 1000;
    const typicalLapTime = 100; // 100 seconds per lap as baseline
    
    if (totalSeconds < typicalLapTime) {
      return '+1 LAP';
    } else {
      const lapsBehind = Math.floor(totalSeconds / typicalLapTime);
      return lapsBehind === 1 ? '+1 LAP' : `+${lapsBehind} LAPS`;
    }
  }
  
  // For finished drivers, show gap behind leader with + prefix
  const totalSeconds = timeMs / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toFixed(3);
  
  // If no minutes, don't show 0: prefix
  if (minutes === 0) {
    return `+${seconds}`;
  } else {
    return `+${minutes}:${seconds.padStart(6, '0')}`;
  }
};

// Helper function to find fastest times in each qualifying session
const getFastestQualiTimes = (qualiResults: QualiResult[]) => {
  const fastestQ1 = Math.min(...qualiResults.map(q => q.q1_time_ms || Infinity).filter(t => t !== Infinity));
  const fastestQ2 = Math.min(...qualiResults.map(q => q.q2_time_ms || Infinity).filter(t => t !== Infinity));
  const fastestQ3 = Math.min(...qualiResults.map(q => q.q3_time_ms || Infinity).filter(t => t !== Infinity));
  
  return {
    q1: fastestQ1 === Infinity ? null : fastestQ1,
    q2: fastestQ2 === Infinity ? null : fastestQ2,
    q3: fastestQ3 === Infinity ? null : fastestQ3,
  };
};
const uniq = <T,>(arr: T[]) => Array.from(new Set(arr));


// ---------- summary type ----------
type RaceSummary = {
  podium: Array<{
    driver_id: number | string;
    driver_code?: string;
    driver_name?: string;
    constructor_id?: number | string;
    constructor_name?: string;
    team_name?: string;
    driver_picture?: string | null;
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
  const { accentColorWithHash, accentColorRgba } = useThemeColor();

  const [race, setRace] = useState<Race | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [circuitName, setCircuitName] = useState<string>('');

  const [raceResults, setRaceResults] = useState<RaceResult[]>([]);
  const [qualiResults, setQualiResults] = useState<QualiResult[]>([]);
  const [pitStops, setPitStops] = useState<PitStop[]>([]);
  const [laps, setLaps] = useState<Lap[]>([]);
  // UX: 3D track affordance state
  const [hasInteracted3D, setHasInteracted3D] = useState(false);
  const [isDragging3D, setIsDragging3D] = useState(false);
  const [show3DHint, setShow3DHint] = useState(false); // appear after swirl
  const [autoRotateSpeed, setAutoRotateSpeed] = useState(0.0);

  // On load: do a quick swirl, then slow down and show hint if no interaction
  useEffect(() => {
  const swirlSpeed = 3.0;  // faster for short "swirl"
    const slowSpeed = 0.08;  // very gentle idle motion
  const swirlDurationMs = 4000;

    let timeoutId: number | undefined;

    if (!hasInteracted3D) {
      setAutoRotateSpeed(swirlSpeed);
      timeoutId = window.setTimeout(() => {
        if (!hasInteracted3D) {
          setAutoRotateSpeed(slowSpeed);
          setShow3DHint(true);
        }
      }, swirlDurationMs);
    }

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [hasInteracted3D]);

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
  // const [lapFilter, setLapFilter] = useState<number | 'all'>('all'); // not currently used in UI
  
  // Position change chart interactivity
  const [hoveredDriver, setHoveredDriver] = useState<string | null>(null);

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
    fetchCircuitName(race.circuit_id)
      .then((name) => { if (alive) setCircuitName(name); });
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
          <RaceDetailSkeleton />
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

  // Circuit styling and data
  const circuitBackground = getCircuitBackground(race.circuit_id) || getDefaultCircuitBackground();

  return (
    <Box bg="bg-primary" color="text-primary" minH="100vh" pb={{ base: 4, md: 6, lg: 8 }} fontFamily="var(--font-display)">
      {/* Top Utility Bar */}
      <Box bg="bg-surface" borderBottom="1px solid" borderColor="border-primary">
        <Container maxW="container.2xl" px={{ base: 4, md: 6 }} py={{ base: 2, md: 3 }}>
          <Button
            onClick={() => navigate('/races')}
            size={{ base: 'sm', md: 'md' }}
            variant="outline"
            borderColor="border-primary"
          >
            Back to Races
          </Button>
        </Container>
      </Box>

      {/* Compact Banner Header */}
      <Box
        position="relative"
        minH={{ base: '180px', md: '220px' }}
        overflow="hidden"
        display="flex"
        alignItems="center"
      >
        {/* Subtle Background with Ghosted Circuit Image */}
        <Box
          position="absolute"
          inset={0}
          bg="linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)"
          _before={{
            content: '""',
            position: 'absolute',
            inset: 0,
            backgroundImage: circuitBackground.image,
            backgroundSize: 'cover',
            backgroundPosition: 'center right',
            backgroundRepeat: 'no-repeat',
            opacity: 0.1,
            zIndex: 1,
          }}
          _after={{
            content: '""',
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to left, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
            zIndex: 2,
          }}
        />

        {/* Content Container */}
        <Container maxW="container.2xl" px={{ base: 4, md: 6 }} position="relative" zIndex={3}>
          <Flex
            direction={{ base: 'column', md: 'row' }}
            align={{ base: 'center', md: 'center' }}
            justify="space-between"
            gap={{ base: 6, md: 8 }}
            minH={{ base: '180px', md: '220px' }}
            py={{ base: 6, md: 8 }}
          >
            {/* Left Side: Event Title */}
            <Flex
              direction="column"
              align={{ base: 'center', md: 'flex-start' }}
              gap={3}
              flex="1"
            >
              <Heading as="h1" lineHeight={1} color="white" textAlign={{ base: 'center', md: 'left' }}>
                <Text
                  fontFamily="heading"
                  textTransform="uppercase"
                  fontWeight="900"
                  letterSpacing={{ base: '0.01em', md: '0.02em' }}
                  fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
                  lineHeight={0.95}
                >
                  {race.name}
                </Text>
              </Heading>
              
              {/* Date/Round Info */}
              <Box
                display="inline-block"
                bg="blackAlpha.300"
                border="1px solid"
                borderColor="whiteAlpha.200"
                borderRadius="full"
                px={4}
                py={2}
                backdropFilter="blur(8px)"
              >
                <Text color="gray.200" fontSize={{ base: 'sm', md: 'md' }} fontWeight="500">
                  Round {race.round} • {new Date(race.date).toLocaleDateString()}
                </Text>
              </Box>
            </Flex>

            {/* Right Side: Stats Grid */}
            <Box flex="1" maxW={{ base: '100%', md: '600px' }}>
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                <StatCard
                  icon={MapPin}
                  value={circuitBackground.keyStats.length}
                  label="Length"
                  color="#3B82F6"
                />
                <StatCard
                  icon={RotateCcw}
                  value={circuitBackground.keyStats.laps}
                  label="Laps"
                  color="#10B981"
                />
                <StatCard
                  icon={CornerUpRight}
                  value={circuitBackground.keyStats.corners}
                  label="Corners"
                  color="#F59E0B"
                />
                <StatCard
                  icon={Zap}
                  value={circuitBackground.keyStats.drsZones}
                  label="DRS Zones"
                  color="#EF4444"
                />
              </SimpleGrid>
            </Box>
          </Flex>
        </Container>
      </Box>

      <Container maxW="container.2xl" px={{ base: 4, md: 6 }} mt={8}>
        {/* Upcoming race notice */}
        {(() => {
          const now = new Date();
          const raceDate = new Date(race.date);
          const isUpcoming = raceDate.getTime() > now.getTime();
          return isUpcoming ? (
            <Alert status="info" variant="left-accent" borderRadius="md" mb={6}>
              <AlertIcon />
              <Text fontFamily="heading" fontWeight="600" mr={2}>Race not started yet.</Text>
              <Text color="text-secondary">
                This event is still to happen. Detailed results, laps, and pit stops will appear once the race concludes.
              </Text>
            </Alert>
          ) : null;
        })()}

        {/* 3D Track Visualization */}
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
          <Box
            h={{ base: '300px', md: '400px' }}
            bg="#0b0b0b"
            position="relative"
            // Make interactivity obvious via cursor and quick hint
            cursor={isDragging3D ? 'grabbing' : 'grab'}
            onPointerDown={() => { setIsDragging3D(true); setHasInteracted3D(true); setShow3DHint(false); }}
            onPointerUp={() => setIsDragging3D(false)}
            onPointerLeave={() => setIsDragging3D(false)}
            onWheel={() => { setHasInteracted3D(true); setShow3DHint(false); }}
          >
            <Suspense fallback={<Flex h="100%" align="center" justify="center"><Spinner /></Flex>}>
              <Canvas camera={{ position: [0, 20, 40], fov: 40 }}>
                <CircuitTrack3D
                  circuitId={race.circuit_id}
                  circuitName={circuitName}
                  onStatusChange={() => {}}
                />
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 10, 5]} intensity={0.8} />
                {/* Auto-rotate until the user interacts to hint interactivity */}
                <OrbitControls
                  enablePan
                  enableZoom
                  enableRotate
                  autoRotate={!hasInteracted3D}
                  autoRotateSpeed={autoRotateSpeed}
                />
                <Environment preset="warehouse" />
              </Canvas>
            </Suspense>

            {/* Subtle interactive hint chip */}
            {show3DHint && (
              <Box
                position="absolute"
                bottom={{ base: 2, md: 3 }}
                left="50%"
                transform="translateX(-50%)"
                bg="blackAlpha.700"
                color="white"
                fontSize={{ base: 'xs', md: 'sm' }}
                px={{ base: 2.5, md: 3.5 }}
                py={{ base: 1.5, md: 2 }}
                borderRadius="full"
                border="1px solid"
                borderColor="whiteAlpha.300"
                boxShadow="0 8px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06) inset"
                pointerEvents="none"
              >
                Drag to rotate • Scroll to zoom • Right-click to pan
              </Box>
            )}
          </Box>
        </MotionBox>

        {/* Tabs - Mobile Responsive */}
        <Tabs colorScheme="red" variant="unstyled" mb={{ base: 4, md: 8 }}>
          <Box overflowX="auto" pb={2}>
            <TabList
              bg="bg-surface"
              border="1px solid"
              borderColor="border-primary"
              borderRadius="full"
              p="6px"
              w="fit-content"
              gap={2}
              minW="max-content"
            >
            <Tab
              px={{ base: 3, md: 6 }}
              h={{ base: "32px", md: "44px" }}
              fontWeight={600}
              fontFamily="heading"
              color="text-secondary"
              fontSize={{ base: "xs", md: "md" }}
              _hover={{ color: "text-primary" }}
              _selected={{
                color: "text-on-accent",
                bg: accentColorWithHash,
                borderRadius: "full",
                boxShadow: `0 6px 24px ${accentColorRgba(0.35)}, 0 0 0 1px ${accentColorRgba(0.35)} inset`,
              }}
              transition="all 0.25s ease"
              whiteSpace="nowrap"
            >
              Summary
            </Tab>
            <Tab
              px={{ base: 3, md: 6 }}
              h={{ base: "32px", md: "44px" }}
              fontWeight={600}
              fontFamily="heading"
              color="text-secondary"
              fontSize={{ base: "xs", md: "md" }}
              _hover={{ color: "text-primary" }}
              _selected={{
                color: "text-on-accent",
                bg: accentColorWithHash,
                borderRadius: "full",
                boxShadow: `0 6px 24px ${accentColorRgba(0.35)}, 0 0 0 1px ${accentColorRgba(0.35)} inset`,
              }}
              transition="all 0.25s ease"
              whiteSpace="nowrap"
            >
              Race
            </Tab>
            <Tab
              px={{ base: 3, md: 6 }}
              h={{ base: "32px", md: "44px" }}
              fontWeight={600}
              fontFamily="heading"
              color="text-secondary"
              fontSize={{ base: "xs", md: "md" }}
              _hover={{ color: "text-primary" }}
              _selected={{
                color: "text-on-accent",
                bg: accentColorWithHash,
                borderRadius: "full",
                boxShadow: `0 6px 24px ${accentColorRgba(0.35)}, 0 0 0 1px ${accentColorRgba(0.35)} inset`,
              }}
              transition="all 0.25s ease"
              whiteSpace="nowrap"
            >
              <Text display={{ base: "none", sm: "inline" }}>Qualifying</Text>
              <Text display={{ base: "inline", sm: "none" }}>Quali</Text>
            </Tab>
            <Tab
              px={{ base: 3, md: 6 }}
              h={{ base: "32px", md: "44px" }}
              fontWeight={600}
              fontFamily="heading"
              color="text-secondary"
              fontSize={{ base: "xs", md: "md" }}
              _hover={{ color: "text-primary" }}
              _selected={{
                color: "text-on-accent",
                bg: accentColorWithHash,
                borderRadius: "full",
                boxShadow: `0 6px 24px ${accentColorRgba(0.35)}, 0 0 0 1px ${accentColorRgba(0.35)} inset`,
              }}
              transition="all 0.25s ease"
              whiteSpace="nowrap"
            >
              <Text display={{ base: "none", sm: "inline" }}>Qualifying → Race</Text>
              <Text display={{ base: "inline", sm: "none" }}>Q→R</Text>
            </Tab>
            {/* <Tab
              px={6}
              h="44px"
              fontWeight={600}
              fontFamily="heading"
              color="text-secondary"
              _hover={{ color: "text-primary" }}
              _selected={{
                color: "text-on-accent",
                bg: accentColorWithHash,
                borderRadius: "full",
                boxShadow: `0 6px 24px ${accentColorRgba(0.35)}, 0 0 0 1px ${accentColorRgba(0.35)} inset`,
              }}
              transition="all 0.25s ease"
            >
              Analysis
            </Tab>
            <Tab
              px={6}
              h="44px"
              fontWeight={600}
              fontFamily="heading"
              color="text-secondary"
              _hover={{ color: "text-primary" }}
              _selected={{
                color: "text-on-accent",
                bg: accentColorWithHash,
                borderRadius: "full",
                boxShadow: `0 6px 24px ${accentColorRgba(0.35)}, 0 0 0 1px ${accentColorRgba(0.35)} inset`,
              }}
              transition="all 0.25s ease"
            >
              Lap Times / Pit Stops
            </Tab> */}
          </TabList>
          </Box>

          <TabPanels>
            {/* SUMMARY */}
            <TabPanel p={{ base: 2, md: 4 }}>
              <VStack align="stretch" spacing={{ base: 3, md: 4 }}>
                <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="bold" color="text-primary">Summary</Text>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 3, md: 4 }}>
                  {/* Full-width Podium */}
                  <Box 
                    p={{ base: 3, md: 4 }} 
                    border="1px solid" 
                    borderColor="border-subtle" 
                    borderRadius="lg" 
                    bg="bg-elevated" 
                    gridColumn={{ md: 'span 2' }}
                  >
                    <Text fontWeight="bold" mb={{ base: 3, md: 4 }} fontSize={{ base: 'md', md: 'lg' }}>Podium</Text>
                    {summaryLoading ? (
                      <Spinner size="md" />
                    ) : summaryError ? (
                      <Text color="red.500">{summaryError}</Text>
                    ) : (
                      <Podium podiumData={summary?.podium || []} />
                    )}
                  </Box>

                  {/* Fastest Lap Widget */}
                  <Box border="1px solid" borderColor="border-subtle" borderRadius="lg" bg="bg-elevated">
                    {summaryLoading ? (
                      <Box p={{ base: 3, md: 4 }}><Spinner size="md" /></Box>
                    ) : summaryError ? (
                      <Box p={{ base: 3, md: 4 }}><Text color="red.500" fontSize={{ base: 'sm', md: 'md' }}>{summaryError}</Text></Box>
                    ) : (
                      <FastestLapWidget data={summary?.fastestLap} />
                    )}
                  </Box>

                  {/* Events Widget */}
                  <Box border="1px solid" borderColor="border-subtle" borderRadius="lg" bg="bg-elevated">
                    {summaryLoading ? (
                      <Box p={{ base: 3, md: 4 }}><Spinner size="md" /></Box>
                    ) : summaryError ? (
                      <Box p={{ base: 3, md: 4 }}><Text color="red.500" fontSize={{ base: 'sm', md: 'md' }}>{summaryError}</Text></Box>
                    ) : (
                      <RaceEventsWidget
                        data={summary?.events
                          ? { redFlags: summary.events.redFlags ?? 0, yellowFlags: summary.events.yellowFlags ?? 0 }
                          : undefined}
                      />
                    )}
                  </Box>
                </SimpleGrid>
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
                      px={3}
                      py={1}
                      borderRadius="md"
                      borderWidth={2}
                      borderColor={driverFilter.length === 0 ? accentColorWithHash : 'border-subtle'}
                      boxShadow={driverFilter.length === 0 ? `0 0 0 2px ${accentColorWithHash}` : undefined}
                      bg={driverFilter.length === 0 ? 'bg-elevated' : 'bg-surface'}
                      fontWeight="bold"
                      color={driverFilter.length === 0 ? accentColorWithHash : 'text-primary'}
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
                          px={3}
                          py={1}
                          borderRadius="md"
                          borderWidth={2}
                          borderColor={selected ? accentColorWithHash : 'border-subtle'}
                          boxShadow={selected ? `0 0 8px 2px ${accentColorWithHash}` : undefined}
                          bg={selected ? 'bg-elevated' : 'bg-surface'}
                          fontWeight="bold"
                          color={selected ? accentColorWithHash : 'text-primary'}
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

                <ResponsiveTable size="sm" variant="simple">
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
                        <Td isNumeric>{fmtRaceSummaryTime(r.time_ms, r.status)}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </ResponsiveTable>
              </VStack>
            </TabPanel>

            {/* QUALIFYING */}
            <TabPanel p={{ base: 2, md: 4 }}>
              <VStack align="stretch" spacing={{ base: 3, md: 4 }}>
                <VStack align="stretch" spacing={4}>
                  <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="bold" color="text-primary">Qualifying</Text>
                  
                  {/* Phase filter */}
                  <Box>
                    <Text fontWeight="bold" mb={2}>Phase:</Text>
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
                            borderColor={selected ? accentColorWithHash : 'border-subtle'}
                            boxShadow={selected ? `0 0 8px 2px ${accentColorWithHash}` : undefined}
                            bg={selected ? 'bg-elevated' : 'bg-surface'}
                            fontWeight="bold"
                            color={selected ? accentColorWithHash : 'text-primary'}
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
                  
                  {/* Driver filter */}
                  <Box>
                    <Text fontWeight="bold" mb={2}>Drivers:</Text>
                    <HStack wrap="wrap" gap={2}>
                      <Box
                        as="button"
                        px={3} py={1}
                        borderRadius="md"
                        borderWidth={2}
                        borderColor={driverFilter.length === 0 ? accentColorWithHash : 'border-subtle'}
                        boxShadow={driverFilter.length === 0 ? `0 0 0 2px ${accentColorWithHash}` : undefined}
                        bg={driverFilter.length === 0 ? 'bg-elevated' : 'bg-surface'}
                        fontWeight="bold"
                        color={driverFilter.length === 0 ? accentColorWithHash : 'text-primary'}
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
                            borderColor={selected ? accentColorWithHash : 'border-subtle'}
                            boxShadow={selected ? `0 0 8px 2px ${accentColorWithHash}` : undefined}
                            bg={selected ? 'bg-elevated' : 'bg-surface'}
                            fontWeight="bold"
                            color={selected ? accentColorWithHash : 'text-primary'}
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
                </VStack>

                <ResponsiveTable size="sm" variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Pos</Th><Th>Driver</Th><Th>Constructor</Th>
                      <Th isNumeric>Q1</Th><Th isNumeric>Q2</Th><Th isNumeric>Q3</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredQuali.map((q, idx) => {
                      const fastestTimes = getFastestQualiTimes(filteredQuali);
                      const isFastestQ1 = q.q1_time_ms === fastestTimes.q1;
                      const isFastestQ2 = q.q2_time_ms === fastestTimes.q2;
                      const isFastestQ3 = q.q3_time_ms === fastestTimes.q3;
                      
                      return (
                        <Tr key={idx}>
                          <Td>{q.position ?? '-'}</Td>
                          <Td>{q.driver_name ?? q.driver_code ?? q.driver_id}</Td>
                          <Td>{q.constructor_name ?? q.constructor_id}</Td>
                          <Td 
                            isNumeric 
                            color={isFastestQ1 ? '#8B5CF6' : undefined}
                            fontWeight={isFastestQ1 ? 'bold' : undefined}
                            bg={isFastestQ1 ? 'rgba(139, 92, 246, 0.1)' : undefined}
                            borderRadius={isFastestQ1 ? 'md' : undefined}
                            px={isFastestQ1 ? 2 : undefined}
                            py={isFastestQ1 ? 1 : undefined}
                          >
                            {fmtMs(q.q1_time_ms)}
                          </Td>
                          <Td 
                            isNumeric 
                            color={isFastestQ2 ? '#8B5CF6' : undefined}
                            fontWeight={isFastestQ2 ? 'bold' : undefined}
                            bg={isFastestQ2 ? 'rgba(139, 92, 246, 0.1)' : undefined}
                            borderRadius={isFastestQ2 ? 'md' : undefined}
                            px={isFastestQ2 ? 2 : undefined}
                            py={isFastestQ2 ? 1 : undefined}
                          >
                            {fmtMs(q.q2_time_ms)}
                          </Td>
                          <Td 
                            isNumeric 
                            color={isFastestQ3 ? '#8B5CF6' : undefined}
                            fontWeight={isFastestQ3 ? 'bold' : undefined}
                            bg={isFastestQ3 ? 'rgba(139, 92, 246, 0.1)' : undefined}
                            borderRadius={isFastestQ3 ? 'md' : undefined}
                            px={isFastestQ3 ? 2 : undefined}
                            py={isFastestQ3 ? 1 : undefined}
                          >
                            {fmtMs(q.q3_time_ms)}
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </ResponsiveTable>
              </VStack>
            </TabPanel>

{/* QUALI → RACE (Enhanced Interactive SVG) */}
<TabPanel p={{ base: 2, md: 4 }}>
  <VStack align="stretch" spacing={{ base: 3, md: 4 }}>
    <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="bold" color="text-primary">Grid to Finish</Text>
    <Text fontSize="sm" color="gray.400" mb={2}>
      Debug: Hovered driver = {hoveredDriver || 'None'}
    </Text>

    {(() => {
      // Calculate position changes and key stories
      const leftOrdered = filteredRaceResults
        .slice()
        .sort((a, b) => (a.grid ?? 99) - (b.grid ?? 99));

      const finishOrder = filteredRaceResults
        .slice()
        .sort((a, b) => (a.position ?? 99) - (b.position ?? 99));

      const finishIndexByDriver: Record<string | number, number> = {};
      finishOrder.forEach((rr, idx) => {
        const key = rr.driver_id ?? rr.driver_code ?? `${idx}`;
        finishIndexByDriver[key] = idx;
      });

      // Calculate position changes and find key stories
      const positionChanges = leftOrdered.map((r, i) => {
        const key = r.driver_id ?? r.driver_code ?? `${i}`;
        const gridPos = r.grid ?? 99;
        const finishPos = r.position ?? 99;
        const change = gridPos - finishPos; // positive = gained positions
        const driverLabel = r.driver_name ?? r.driver_code ?? r.driver_id;
        
        return {
          driver: driverLabel,
          gridPos,
          finishPos,
          change,
          key
        };
      });

      // Find biggest gainer, biggest loser, and hard charger
      const biggestGainer = positionChanges.reduce((max, curr) => 
        curr.change > max.change ? curr : max, positionChanges[0] || { change: 0, driver: '', gridPos: 0, finishPos: 0 });
      
      const biggestLoser = positionChanges.reduce((min, curr) => 
        curr.change < min.change ? curr : min, positionChanges[0] || { change: 0, driver: '', gridPos: 0, finishPos: 0 });
      
      const hardCharger = positionChanges
        .filter(p => p.gridPos >= 10) // Started from 10th or lower
        .reduce((max, curr) => curr.change > max.change ? curr : max, 
          positionChanges.find(p => p.gridPos >= 10) || { change: 0, driver: '', gridPos: 0, finishPos: 0 });

      return (
        <>
          {/* Key Story Stat Cards */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={4}>
            <StatCard
              icon={TrendingUp}
              value={`${biggestGainer.driver} (+${biggestGainer.change})`}
              label="Biggest Gainer"
              color="#10B981"
            />
            <StatCard
              icon={TrendingDown}
              value={`${biggestLoser.driver} (${biggestLoser.change})`}
              label="Biggest Drop"
              color="#EF4444"
            />
            <StatCard
              icon={Zap}
              value={`${hardCharger.driver} (P${hardCharger.gridPos}→P${hardCharger.finishPos})`}
              label="Hard Charger"
              color="#F59E0B"
            />
          </SimpleGrid>

          <Box
            overflow="hidden"
            border="1px solid"
            borderColor="border-subtle"
            borderRadius="lg"
            bg="bg-elevated"
            p={{ base: 1, md: 3 }}
            minH={{ base: '500px', md: '400px' }}
            w="full"
            position="relative"
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
              const bottomPad = 60;

              // Precompute all positions with enhanced data
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
                const gridPos = r.grid ?? 99;
                const finishPos = r.position ?? 99;
                const change = gridPos - finishPos;

                return { 
                  y1, y2, color, driverLabel, key, gridPos, finishPos, change,
                  isHovered: hoveredDriver === key
                };
              });

              const maxY = items.length
                ? Math.max(...items.map(it => Math.max(it.y1, it.y2)))
                : BASE_Y;

              const lastY = maxY;
              const height = lastY + bottomPad;

              return (
                <Box overflowX="auto" w="full" h="full">
                  <svg
                    viewBox={`0 0 ${W + 100} ${height}`}
                    width="100%"
                    height="450px"
                    preserveAspectRatio="xMidYMid meet"
                    style={{ minHeight: '450px', minWidth: '100%' }}
                  >
                    {/* Defs for glow effects */}
                    <defs>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge> 
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>

                    {/* Vertical rails */}
                    <line x1={LEFT_X} y1={TOP} x2={LEFT_X} y2={lastY} stroke="currentColor" strokeWidth={3} />
                    <line x1={RIGHT_X} y1={TOP} x2={RIGHT_X} y2={lastY} stroke="currentColor" strokeWidth={3} />

                    {/* Headers */}
                    <text x={NAME_LEFT_X - 100} y={45} fontSize="32" fontWeight="bold" fill="currentColor">Grid</text>
                    <text x={RIGHT_X + 20} y={45} fontSize="32" fontWeight="bold" fill="currentColor">Finish</text>

                    {/* Driver lines and labels */}
                    {items.map((it, i) => {
                      const isHovered = hoveredDriver === String(it.key);
                      const opacity = hoveredDriver && !isHovered ? 0.15 : 1;
                      const strokeWidth = isHovered ? 12 : 8;
                      const filter = isHovered ? "url(#glow)" : "none";

                      return (
                        <g key={i}>
                          {/* Transparent overlay for better hover detection */}
                          <rect
                            x={LEFT_X - 50}
                            y={Math.min(it.y1, it.y2) - 20}
                            width={RIGHT_X - LEFT_X + 100}
                            height={Math.max(Math.abs(it.y2 - it.y1), 40) + 40}
                            fill="transparent"
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={() => setHoveredDriver(String(it.key))}
                            onMouseLeave={() => setHoveredDriver(null)}
                          />

                          {/* Left name & node */}
                          <text
                            x={NAME_LEFT_X}
                            y={it.y1 + 8}
                            fontSize="22"
                            fontWeight="bold"
                            fill={it.color}
                            textAnchor="end"
                            opacity={opacity}
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={() => setHoveredDriver(String(it.key))}
                            onMouseLeave={() => setHoveredDriver(null)}
                          >
                            {typeof it.driverLabel === 'string' && it.driverLabel.length > 12 ? it.driverLabel.split(' ')[0] : it.driverLabel}
                          </text>
                          <circle 
                            cx={LEFT_X} 
                            cy={it.y1} 
                            r={isHovered ? 16 : 12} 
                            fill={it.color}
                            stroke="white"
                            strokeWidth={isHovered ? 3 : 2}
                            opacity={opacity}
                            filter={filter}
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={() => setHoveredDriver(String(it.key))}
                            onMouseLeave={() => setHoveredDriver(null)}
                          />

                          {/* Right node & name with position change indicator */}
                          <circle 
                            cx={RIGHT_X} 
                            cy={it.y2} 
                            r={isHovered ? 16 : 12} 
                            fill={it.color}
                            stroke="white"
                            strokeWidth={isHovered ? 3 : 2}
                            opacity={opacity}
                            filter={filter}
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={() => setHoveredDriver(String(it.key))}
                            onMouseLeave={() => setHoveredDriver(null)}
                          />
                          
                          {/* Driver name */}
                          <text
                            x={NAME_RIGHT_X}
                            y={it.y2 + 8}
                            fontSize="22"
                            fontWeight="bold"
                            fill={it.color}
                            textAnchor="start"
                            opacity={opacity}
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={() => setHoveredDriver(String(it.key))}
                            onMouseLeave={() => setHoveredDriver(null)}
                          >
                            {typeof it.driverLabel === 'string' && it.driverLabel.length > 12 ? it.driverLabel.split(' ')[0] : it.driverLabel}
                          </text>

                          {/* Position change indicator */}
                          {it.change !== 0 && (
                            <text
                              x={NAME_RIGHT_X + 120}
                              y={it.y2 + 8}
                              fontSize="18"
                              fontWeight="bold"
                              fill={it.change > 0 ? "#10B981" : it.change < 0 ? "#EF4444" : "#6B7280"}
                              textAnchor="start"
                              opacity={opacity}
                              style={{ cursor: 'pointer' }}
                              onMouseEnter={() => setHoveredDriver(String(it.key))}
                              onMouseLeave={() => setHoveredDriver(null)}
                            >
                              {it.change > 0 ? `▲ ${it.change}` : it.change < 0 ? `▼ ${Math.abs(it.change)}` : '▬'}
                            </text>
                          )}

                          {/* Connecting line */}
                          <line 
                            x1={LEFT_X} 
                            y1={it.y1} 
                            x2={RIGHT_X} 
                            y2={it.y2} 
                            stroke={it.color} 
                            strokeWidth={strokeWidth}
                            opacity={opacity}
                            filter={filter}
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={() => setHoveredDriver(String(it.key))}
                            onMouseLeave={() => setHoveredDriver(null)}
                          />
                        </g>
                      );
                    })}
                  </svg>

                  {/* Tooltip */}
                  {hoveredDriver && (() => {
                    const driver = items.find(item => String(item.key) === hoveredDriver);
                    if (!driver) return null;
                    
                    return (
                      <Box
                        position="absolute"
                        top="10px"
                        right="10px"
                        bg="blackAlpha.900"
                        color="white"
                        p={3}
                        borderRadius="md"
                        border="1px solid"
                        borderColor="whiteAlpha.300"
                        backdropFilter="blur(8px)"
                        zIndex={100}
                        boxShadow="0 4px 12px rgba(0,0,0,0.3)"
                        maxW="250px"
                      >
                        <Text fontWeight="bold" fontSize="lg" mb={1}>
                          {driver.driverLabel}
                        </Text>
                        <Text fontSize="sm" color="gray.200">
                          P{driver.gridPos} → P{driver.finishPos} 
                          {driver.change > 0 ? ` (+${driver.change})` : driver.change < 0 ? ` (${driver.change})` : ' (No change)'}
                        </Text>
                      </Box>
                    );
                  })()}
                </Box>
              );
            })()}
          </Box>
        </>
      );
    })()}
  </VStack>
</TabPanel>


                <TabPanel>
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
                    {driverFilter.length ? driverFilter : driversInRace.map((d) => {
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
                    {driverFilter.length ? driverFilter : driversInRace.map((d) => {
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
            </TabPanel>

          
            <TabPanel>
              <VStack align="stretch" spacing={4}>
                <Text fontSize="xl" fontWeight="bold" color="text-primary">Lap Times & Pit Stops</Text>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box p={4} border="1px solid" borderColor="border-subtle" borderRadius="lg" bg="bg-elevated">
                    <HStack justify="space-between" mb={2}>
                      <Text fontWeight="bold">Lap Times</Text>
                      <HStack>
                        keep UI consistent with other tabs
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


const RaceDetailPageLayout: React.FC = () => (
  <Box minH="100vh" display="flex" flexDirection="column" bg="bg-primary" color="text-primary">
    <Box flex="1" overflow="hidden">
      <RaceDetailPage />
    </Box>
  </Box>
);

export default RaceDetailPageLayout;
