import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Heading, HStack, Icon, Spinner, Table, Tbody, Td, Th, Thead, Tr, Text, Avatar, VStack, SimpleGrid, Button, Flex, useToast } from '@chakra-ui/react';
import { RefreshCcw, AlertTriangle } from 'lucide-react';
import { useThemeColor } from '../../context/ThemeColorContext';
import { getTeamColor } from '../../lib/teamColors';
import { computePredictions, type PredictionRow as LibPredictionRow } from '../../lib/predictions';

// Props: provide race context if available to tune season/standings; falls back to current year
export type PredictionsPanelProps = {
  raceId?: number | string | null;
  seasonYear?: number | null; // if provided, use this season for standings
};

// ...

// Re-export type for local usage to avoid duplication
export type PredictionRow = LibPredictionRow;

export default function PredictionsPanel({ seasonYear }: PredictionsPanelProps) {
  const { accentColorWithHash } = useThemeColor();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<PredictionRow[]>([]);

  const effectiveSeason = useMemo(() => seasonYear ?? new Date().getFullYear(), [seasonYear]);

  const calculatePredictions = useCallback(async () => {
    // Delegate to shared library for a single source of truth
    const ranked = await computePredictions(effectiveSeason);
    return ranked as PredictionRow[];
  }, [effectiveSeason]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const preds = await calculatePredictions();
      setPredictions(preds);
    } catch (e: any) {
      setError(e?.message || 'Failed to load predictions');
    } finally {
      setLoading(false);
    }
  }, [calculatePredictions]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleRefresh = async () => {
    await fetchAll();
    toast({ title: 'Predictions refreshed', status: 'success', duration: 1500 });
  };

  const podium = predictions.slice(0, 3);

  if (loading) {
    return (
      <Flex align="center" justify="center" minH="30vh" direction="column" gap={3}>
        <Spinner thickness="3px" speed="0.65s" emptyColor="whiteAlpha.200" color={accentColorWithHash} size="lg" />
        <Text color="text-secondary">Crunching the numbers…</Text>
      </Flex>
    );
  }
  if (error) {
    return (
      <Flex direction="column" align="center" justify="center" minH="20vh" gap={4} color="red.400">
        <Icon as={AlertTriangle} boxSize={10} />
        <Heading size="md" fontFamily="heading">Could not compute predictions</Heading>
        <Text color="text-secondary">{error}</Text>
        <Button leftIcon={<Icon as={RefreshCcw} />} onClick={handleRefresh}>
          Retry
        </Button>
      </Flex>
    );
  }

  return (
    <VStack align="stretch" spacing={6}>
      {/* Podium highlights - gold/silver/bronze */}
      {podium.length > 0 && (
        <Box>
          <Heading size="md" fontFamily="heading" mb={3}>Podium Picks</Heading>
          <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4}>
            {podium.map((p, idx) => {
              const label = idx === 0 ? '1st' : idx === 1 ? '2nd' : '3rd';
              const medalHex = idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : '#CD7F32';
              const cardBg = `${medalHex}1A`;
              const borderCol = medalHex;
              const avatarBg = medalHex;
              const avatarColor = idx === 1 ? 'black' : 'white';
              return (
                <Flex key={String(p.driverId)} direction="column" align="center" bg={cardBg} borderWidth="1px" borderColor={borderCol} rounded="md" p={4} gap={2}>
                  <Avatar size="lg" name={p.driverFullName} src={p.headshotUrl || undefined} bg={avatarBg} color={avatarColor} />
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
                const bgRow = isPodium ? `${teamHex}1A` : undefined;
                const colorRow = isPodium ? teamHex : undefined;
                return (
                  <Tr key={String(p.driverId)} bg={bgRow} _hover={{ bg: 'bg-surface' }}>
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

      <HStack justify="flex-end">
        <Button onClick={handleRefresh} leftIcon={<Icon as={RefreshCcw} />} variant="outline" borderColor={accentColorWithHash} color={accentColorWithHash} _hover={{ bg: accentColorWithHash, color: 'white' }}>
          Refresh Predictions
        </Button>
      </HStack>
    </VStack>
  );
}
