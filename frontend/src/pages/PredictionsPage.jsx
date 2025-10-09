// src/pages/PredictionsPage.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Icon,
  Spinner,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  Avatar,
  VStack,
  SimpleGrid,
  useToast,
} from '@chakra-ui/react';
import { RefreshCcw, AlertTriangle } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';
import PageHeader from '../components/layout/PageHeader';
import LayoutContainer from '../components/layout/LayoutContainer';
import { apiFetch } from '../lib/api';
import { driverHeadshots } from '../lib/driverHeadshots';
import { driverTeamMapping } from '../lib/driverTeamMapping';
import { getTeamColor } from '../lib/teamColors';
import { useThemeColor } from '../context/ThemeColorContext';

// Helper: F1 points (no FL bonus)
const POINTS_MAP = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
const pointsForPosition = (pos) => {
  if (pos == null) return 0;
  const n = Number(pos);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return n <= 10 ? POINTS_MAP[n - 1] : 0;
};

function parseDateIso(dateStr) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  } catch { return null; }
}

const NotAuthenticatedView = () => {
  const { loginWithRedirect } = useAuth0();
  return (
    <Container maxW="container.sm" py="xl" centerContent>
      <VStack spacing={4} textAlign="center">
        <Heading size="md" fontFamily="heading">Login to View Predictions</Heading>
        <Text color="text-secondary">Sign in to access AI-powered predictions based on recent driver form.</Text>
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

export default function PredictionsPage() {
  const { isAuthenticated } = useAuth0();
  const toast = useToast();
  const { accentColorWithHash } = useThemeColor();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [races, setRaces] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [raceResults, setRaceResults] = useState([]);
  const [predictions, setPredictions] = useState([]);

  // Determine next upcoming race from races list
  const nextRace = useMemo(() => {
    if (!races || races.length === 0) return null;
    const now = new Date();
    const withDates = races
      .map((r) => ({ ...r, _d: parseDateIso(r.date || r.race_date || r.start_time) }))
      .filter((r) => r._d);
    if (!withDates.length) return null;
    const upcoming = withDates.filter((r) => r._d >= now).sort((a, b) => a._d - b._d);
    if (upcoming.length) return upcoming[0];
    // fallback to most recent past race
    return withDates.sort((a, b) => b._d - a._d)[0];
  }, [races]);

  // Core: compute predictions from drivers + their recent form
  const calculatePredictions = useCallback(async (driversData) => {
    // Fetch recent form for each driver (last 5)
    const concurrency = 8;
    const chunks = [];
    for (let i = 0; i < driversData.length; i += concurrency) {
      chunks.push(driversData.slice(i, i + concurrency));
    }

    const recentFormByDriver = new Map();
    for (const chunk of chunks) {
      // Parallel fetch within chunk
      const results = await Promise.allSettled(
        chunk.map((d) => apiFetch(`/api/drivers/${d.id}/recent-form`).catch((e) => { throw { e, id: d.id }; }))
      );
      results.forEach((res, idx) => {
        const drv = chunk[idx];
        if (res.status === 'fulfilled') {
          recentFormByDriver.set(drv.id, Array.isArray(res.value) ? res.value.slice(0, 5) : []);
        } else {
          recentFormByDriver.set(drv.id, []);
        }
      });
    }

    // Fetch current season standings and map for season points and constructor IDs
    const currentSeason = new Date().getFullYear();
    const standings = await apiFetch(`/api/drivers/standings/${currentSeason}`).catch(() => []);
    const seasonPointsByDriver = new Map();
    const constructorIdByDriver = new Map();
    if (Array.isArray(standings)) {
      for (const s of standings) {
        const drv = s.driver || s.Driver || s.driverInfo || {};
        const driverId = drv.id ?? s.driver_id ?? s.id;
        if (driverId != null) {
          const pts = s.points ?? s.totalPoints ?? s.season_points ?? 0;
          seasonPointsByDriver.set(Number(driverId), Number(pts) || 0);
        }
        const cId = s.constructorId ?? s.constructor_id ?? s.team_id ?? s.teamId;
        if (driverId != null && cId != null) constructorIdByDriver.set(Number(driverId), Number(cId));
      }
    }

    // Build unique constructor list and fetch points-per-season
    const uniqueConstructorIds = Array.from(new Set(Array.from(constructorIdByDriver.values())));
    const constructorPointsThisSeason = new Map();
    if (uniqueConstructorIds.length) {
      const consChunks = [];
      for (let i = 0; i < uniqueConstructorIds.length; i += concurrency) consChunks.push(uniqueConstructorIds.slice(i, i + concurrency));
      for (const chunk of consChunks) {
        const results = await Promise.allSettled(
          chunk.map((cid) => apiFetch(`/api/constructors/${cid}/points-per-season`))
        );
        results.forEach((res, idx) => {
          const cid = chunk[idx];
          if (res.status === 'fulfilled' && Array.isArray(res.value)) {
            // Find current season points; fallback to latest available
            let pts = 0;
            let latestYear = -Infinity;
            for (const row of res.value) {
              const year = Number(row.season ?? row.year ?? row.season_id ?? row.seasonId);
              const p = Number(row.points ?? row.totalPoints ?? row.pts ?? 0);
              if (year === currentSeason) { pts = p; latestYear = year; break; }
              if (Number.isFinite(year) && year > latestYear) { latestYear = year; pts = p; }
            }
            constructorPointsThisSeason.set(cid, pts || 0);
          } else {
            constructorPointsThisSeason.set(cid, 0);
          }
        });
      }
    }

    // Normalize helpers
    const sumWeights = 5 + 4 + 3 + 2 + 1; // 15
    const maxPointsPerRace = 25;
    const maxWeightedPoints = sumWeights * maxPointsPerRace; // 375

    // Compute weighted recent form and assemble interim rows
    const interim = driversData.map((d) => {
      const recent = recentFormByDriver.get(d.id) || [];
      const last5 = recent.slice(0, 5);

      // Weighted points (last *5 ... 5th *1)
      let weighted = 0;
      let weightsApplied = 0;
      last5.forEach((r, idx) => {
        const weight = 5 - idx; // idx:0=>5, 1=>4, ...
        const status = (r.status || r.result_status || r.classification || '').toString().toUpperCase();
        const posCandidates = [r.position, r.finish_position, r.finishing_position, r.final_position, r.result, r.pos, r.position_text, r.positionText].filter((v) => v != null);
        let finishPos = null;
        for (const c of posCandidates) { if (typeof c === 'number') { finishPos = c; break; } const m = String(c).match(/\d+/); if (m) { finishPos = Number(m[0]); break; } }
        const posText = String(posCandidates[0] ?? '').toUpperCase();
        const isDnf = /DNF|RET|RETIRED|DSQ|DNS|DNQ|DQ/.test([status, posText].join(' ')) || finishPos === null || finishPos === 0 || finishPos > 50;
        const pointsField = r.points ?? r.pts ?? r.point ?? r.score;
        const pts = isDnf ? 0 : ((typeof pointsField === 'number' && Number.isFinite(pointsField)) ? pointsField : pointsForPosition(finishPos));
        weighted += pts * weight;
        weightsApplied += weight;
      });
      const weightedFormNorm = Math.max(0, Math.min(1, weighted / maxWeightedPoints));

      const seasonPts = seasonPointsByDriver.get(Number(d.id)) || 0;
      const teamId = constructorIdByDriver.get(Number(d.id)) || null;
      const teamPts = teamId != null ? (constructorPointsThisSeason.get(teamId) || 0) : 0;

      return { d, weightedFormNorm, seasonPts, teamId, teamPts };
    });

    // Normalize season points across drivers
    const maxSeasonPts = Math.max(1, ...interim.map((r) => r.seasonPts || 0));
    // Normalize constructor strength across teams
    const maxTeamPts = Math.max(1, ...interim.map((r) => r.teamPts || 0));

    const rows = interim.map(({ d, weightedFormNorm, seasonPts, teamId, teamPts }) => {
      const seasonNorm = (seasonPts || 0) / maxSeasonPts;
      const constructorNorm = (teamPts || 0) / maxTeamPts;

      // CPS = 0.5 * Weighted Recent Form + 0.3 * Normalized Season Standing + 0.2 * Normalized Constructor Strength
      const CPS = 0.5 * weightedFormNorm + 0.3 * seasonNorm + 0.2 * constructorNorm;

      const driverFullName = (
        `${d.first_name ?? d.firstName ?? ''} ${d.last_name ?? d.lastName ?? ''}`.trim() ||
        d.full_name ||
        d.fullName ||
        d.name ||
        'Unknown'
      );
      const teamName = d.team_name || d.teamName || d.constructor_name || d.constructorName || d.team || driverTeamMapping[driverFullName] || '—';

      const imgCandidates = [d.profile_image_url, d.profile_image, d.profileImageUrl, d.headshot_url, d.headshotUrl, d.image_url, d.imageUrl, d.photo_url, d.photoUrl].filter(Boolean);
      const resolvedHeadshot = imgCandidates.length > 0 ? imgCandidates[0] : (driverHeadshots[driverFullName] || null);

      return {
        driverId: d.id,
        driverFullName,
        team: teamName,
        headshotUrl: resolvedHeadshot,
        weightedFormNorm,
        seasonNorm,
        constructorNorm,
        CPS,
      };
    });

    // Win Probability across all drivers
    const sumCPS = rows.reduce((acc, r) => acc + (r.CPS || 0), 0) || 1;
    const withProb = rows.map((r) => ({
      ...r,
      winProbability: r.CPS / sumCPS,
      predictedPoints: Math.round(r.CPS * 25 * 10) / 10,
    }));

    const ranked = withProb
      .sort((a, b) => b.CPS - a.CPS)
      .map((p, idx) => ({ ...p, position: idx + 1, confidence: Math.round(p.winProbability * 100) }));

    return ranked;
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [racesRes, driversRes] = await Promise.all([
        apiFetch('/api/races'),
        apiFetch('/api/drivers'),
      ]);
      setRaces(Array.isArray(racesRes) ? racesRes : []);
      setDrivers(Array.isArray(driversRes) ? driversRes : []);
      setRaceResults([]);

      const preds = await calculatePredictions(Array.isArray(driversRes) ? driversRes : []);
      setPredictions(preds);
    } catch (e) {
      const msg = e?.message || 'Failed to load predictions';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [calculatePredictions]);

  useEffect(() => {
    let alive = true;
    (async () => {
      await fetchAll();
    })();
    return () => { alive = false; };
  }, [fetchAll]);

  const handleRefresh = async () => {
    await fetchAll();
    toast({ title: 'Predictions refreshed', status: 'success', duration: 1500 });
  };

  if (!isAuthenticated) return <NotAuthenticatedView />;

  const renderRaceCard = () => {
    if (!nextRace) return null;
    const raceName = nextRace.name || nextRace.raceName || 'Next Grand Prix';
    const circuit = nextRace.circuit?.name || nextRace.circuitName || nextRace.circuit || '—';
    const dateStr = nextRace.date || nextRace.race_date || nextRace.start_time || '';
    const d = parseDateIso(dateStr);
    const pretty = d ? d.toLocaleString(undefined, { dateStyle: 'medium' }) : dateStr;
    return (
      <Box
        borderWidth="1px"
        borderColor="border-subtle"
        bg="bg-surface-raised"
        rounded="md"
        p={4}
      >
        <Heading size="md" fontFamily="heading" mb={1}>{raceName}</Heading>
        <Text color="text-secondary">{circuit}</Text>
        <Text color="text-muted" fontSize="sm">{pretty}</Text>
      </Box>
    );
  };

  const podium = predictions.slice(0, 3);

  return (
    <Box bg="bg-primary" minH="100vh">
      <PageHeader
        title="RaceIQ Predictions"
        subtitle="AI-Powered Race Predictions for the Next Grand Prix"
      />

      <LayoutContainer>
        <Flex justify="space-between" align={{ base: 'stretch', md: 'center' }} gap={4} direction={{ base: 'column', md: 'row' }}>
          <Box flex="1">{renderRaceCard()}</Box>
          <HStack>
            <Button
              onClick={handleRefresh}
              leftIcon={<Icon as={RefreshCcw} />}
              variant="outline"
              borderColor={accentColorWithHash}
              color={accentColorWithHash}
              _hover={{ bg: accentColorWithHash, color: 'white' }}
            >
              Refresh Predictions
            </Button>
          </HStack>
        </Flex>
      </LayoutContainer>

      <Container maxW="1200px" py="xl" px={{ base: 'md', lg: 'lg' }}>
        {/* Loading / Error */}
        {loading ? (
          <Flex align="center" justify="center" minH="30vh" direction="column" gap={3}>
            <Spinner thickness="3px" speed="0.65s" emptyColor="whiteAlpha.200" color={accentColorWithHash} size="lg" />
            <Text color="text-secondary">Crunching the numbers…</Text>
          </Flex>
        ) : error ? (
          <Flex direction="column" align="center" justify="center" minH="20vh" gap={4} color="red.400">
            <Icon as={AlertTriangle} boxSize={10} />
            <Heading size="md" fontFamily="heading">Could not compute predictions</Heading>
            <Text color="text-secondary">{error}</Text>
          </Flex>
        ) : (
          <VStack align="stretch" spacing={8}>
            {/* Podium highlights */}
            {podium.length > 0 && (
              <Box>
                <Heading size="md" fontFamily="heading" mb={3}>Podium Picks</Heading>
                <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4}>
                  {podium.map((p, idx) => {
                    const label = idx === 0 ? '1st' : idx === 1 ? '2nd' : '3rd';
                    const teamHex = getTeamColor(p.team, { hash: true });
                    const chipBg = `${teamHex}33`; // ~20% opacity
                    const chipColor = '#fff';
                    return (
                      <Flex key={p.driverId} direction="column" align="center" bg="bg-surface-raised" borderWidth="1px" borderColor="border-subtle" rounded="md" p={4} gap={2}>
                        <Avatar size="lg" name={p.driverFullName} src={p.headshotUrl || undefined} bg={chipBg} color={chipColor} />
                        <Text fontWeight="semibold">{label} • {p.driverFullName}</Text>
                        <Text color="text-secondary" fontSize="sm">{p.team}</Text>
                      </Flex>
                    );
                  })}
                </SimpleGrid>
              </Box>
            )}

            {/* Predicted Standings Table */}
            <Box>
              <Heading size="md" fontFamily="heading" mb={3}>Predicted Standings</Heading>
              <Box overflowX="auto" borderWidth="1px" borderColor="border-subtle" rounded="md">
                <Table variant="simple" size="md">
                  <Thead>
                    <Tr>
                      <Th>Position</Th>
                      <Th>Driver</Th>
                      <Th>Team</Th>
                      <Th isNumeric>Predicted Points</Th>
                      <Th isNumeric>Confidence %</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {predictions.map((p) => {
                      const teamHex = getTeamColor(p.team, { hash: true });
                      const isPodium = p.position <= 3;
                      const bgRow = isPodium ? `${teamHex}1A` : undefined; // ~10% opacity
                      const colorRow = isPodium ? teamHex : undefined;
                      return (
                        <Tr key={p.driverId} bg={bgRow} _hover={{ bg: 'bg-surface' }}>
                          <Td color={colorRow} fontWeight={p.position <=3 ? 'semibold' : 'normal'}>{p.position}</Td>
                          <Td>
                            <HStack spacing={3}>
                              <Avatar size="sm" name={p.driverFullName} src={p.headshotUrl || undefined} />
                              <Text>{p.driverFullName}</Text>
                            </HStack>
                          </Td>
                          <Td><Text color="text-secondary">{p.team}</Text></Td>
                          <Td isNumeric>{p.predictedPoints.toFixed(1)}</Td>
                          <Td isNumeric>{Math.round(p.confidence)}%</Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </Box>
            </Box>
          </VStack>
        )}
      </Container>
    </Box>
  );
}
