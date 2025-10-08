// frontend/src/pages/CompareDriversPage/components/ComparisonTable.tsx
import { Box, Heading, Thead, Tbody, Tr, Th, Td, HStack, Text, VStack, Grid, Button, Collapse, IconButton, Tooltip, Divider, Progress, useDisclosure } from '@chakra-ui/react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';
import ResponsiveTable from '../../../components/layout/ResponsiveTable';
import type { DriverDetails, DriverComparisonStats, EnabledMetrics, DriverSelection, MetricKey, CompositeScore } from '../../../hooks/useDriverComparison';

interface Props {
  driver1: DriverDetails;
  driver2: DriverDetails;
  // NEW: Optional enhanced comparison data
  stats1?: DriverComparisonStats | null;
  stats2?: DriverComparisonStats | null;
  enabledMetrics?: EnabledMetrics;
  selection1?: DriverSelection | null;
  selection2?: DriverSelection | null;
  score?: CompositeScore;
  // NEW: Handlers for filter interactions
  onYearChange?: (driverIndex: 1 | 2, year: number | 'career') => void;
  onMetricToggle?: (metric: MetricKey) => void;
  availableYears?: number[];
}

const legacyStats: { key: keyof DriverDetails; label: string }[] = [
  { key: 'teamName', label: 'Team' },
  { key: 'championshipStanding', label: 'Championship Standing' },
  { key: 'wins', label: 'Career Wins' },
  { key: 'podiums', label: 'Career Podiums' },
  { key: 'points', label: 'Career Points' },
];

// Metric labels for UI (matching the main page)
const metricLabels: Record<MetricKey, string> = {
  wins: 'Wins',
  podiums: 'Podiums', 
  fastestLaps: 'Fastest Laps',
  points: 'Points',
  sprintWins: 'Sprint Wins',
  sprintPodiums: 'Sprint Podiums',
  dnfs: 'DNFs',
  poles: 'Pole Positions',
};

export const ComparisonTable: React.FC<Props> = ({ 
  driver1, 
  driver2, 
  stats1, 
  stats2, 
  enabledMetrics, 
  selection1, 
  selection2,
  score,
  onYearChange,
  onMetricToggle,
  availableYears = [2024, 2023, 2022, 2021, 2020]
}) => {
  // Enhanced comparison mode if we have new stats
  if (stats1 && stats2 && enabledMetrics) {
    const useYearStats = stats1.yearStats !== null && stats2.yearStats !== null;
    const s1 = useYearStats ? stats1.yearStats! : stats1.career;
    const s2 = useYearStats ? stats2.yearStats! : stats2.career;
    
    // Create metric rows based on enabled metrics
    const metricRows: { key: string; label: string; value1: number | string; value2: number | string }[] = [];
    
    // Add team info
    metricRows.push({ key: 'team', label: 'Team', value1: driver1.teamName, value2: driver2.teamName });
    
    if (enabledMetrics.wins) {
      metricRows.push({ key: 'wins', label: 'Wins', value1: s1.wins, value2: s2.wins });
    }
    if (enabledMetrics.podiums) {
      metricRows.push({ key: 'podiums', label: 'Podiums', value1: s1.podiums, value2: s2.podiums });
    }
    if (enabledMetrics.fastestLaps) {
      metricRows.push({ key: 'fastestLaps', label: 'Fastest Laps', value1: s1.fastestLaps, value2: s2.fastestLaps });
    }
    if (enabledMetrics.points) {
      metricRows.push({ key: 'points', label: 'Points', value1: Math.round(s1.points), value2: Math.round(s2.points) });
    }
    if (enabledMetrics.sprintWins) {
      metricRows.push({ key: 'sprintWins', label: 'Sprint Wins', value1: s1.sprintWins, value2: s2.sprintWins });
    }
    if (enabledMetrics.sprintPodiums) {
      metricRows.push({ key: 'sprintPodiums', label: 'Sprint Podiums', value1: s1.sprintPodiums, value2: s2.sprintPodiums });
    }
    if (enabledMetrics.dnfs) {
      metricRows.push({ key: 'dnfs', label: 'DNFs', value1: s1.dnfs, value2: s2.dnfs });
    }
    if (enabledMetrics.poles && useYearStats && 'poles' in s1 && 'poles' in s2) {
      metricRows.push({ key: 'poles', label: 'Pole Positions', value1: (s1 as any).poles, value2: (s2 as any).poles });
    }
    
    const title1 = selection1 ? 
      `${driver1.fullName} ${selection1.year === 'career' ? '(Career)' : `(${selection1.year})`}` : 
      driver1.fullName;
    const title2 = selection2 ? 
      `${driver2.fullName} ${selection2.year === 'career' ? '(Career)' : `(${selection2.year})`}` : 
      driver2.fullName;
    
    return (
      <VStack spacing="lg" align="stretch">
        {/* Comparison Filters - Style like Drivers page tabs */}
        <Box bg="bg-surface" p="lg" borderRadius="md">
          <Heading size="md" mb="md" fontFamily="heading">Compare by Year</Heading>
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="lg">
            {/* Driver 1 Year Filter */}
            <VStack align="stretch" spacing="sm">
              <Text fontSize="sm" fontWeight="medium" color="text-secondary">Driver 1:</Text>
              <HStack spacing="2" wrap="wrap" overflowX="auto" pb={2}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onYearChange?.(1, 'career')}
                  isActive={selection1?.year === 'career'}
                  fontFamily="heading"
                  fontWeight="bold"
                  color="text-muted"
                  px="4"
                  py="sm"
                  borderRadius={0}
                  borderBottom="3px solid"
                  borderColor={selection1?.year === 'career' ? 'brand.red' : 'transparent'}
                  _hover={{ color: 'text-primary' }}
                  _active={{ 
                    color: 'brand.red', 
                    borderColor: 'brand.red' 
                  }}
                >
                  Career
                </Button>
                {availableYears.map(year => (
                  <Button
                    key={year}
                    variant="ghost"
                    size="sm"
                    onClick={() => onYearChange?.(1, year)}
                    isActive={selection1?.year === year}
                    fontFamily="heading"
                    fontWeight="bold"
                    color="text-muted"
                    px="4"
                    py="sm"
                    borderRadius={0}
                    borderBottom="3px solid"
                    borderColor={selection1?.year === year ? 'brand.red' : 'transparent'}
                    _hover={{ color: 'text-primary' }}
                    _active={{ 
                      color: 'brand.red', 
                      borderColor: 'brand.red' 
                    }}
                  >
                    {year}
                  </Button>
                ))}
              </HStack>
            </VStack>
            
            {/* Driver 2 Year Filter */}
            <VStack align="stretch" spacing="sm">
              <Text fontSize="sm" fontWeight="medium" color="text-secondary">Driver 2:</Text>
              <HStack spacing="2" wrap="wrap" overflowX="auto" pb={2}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onYearChange?.(2, 'career')}
                  isActive={selection2?.year === 'career'}
                  fontFamily="heading"
                  fontWeight="bold"
                  color="text-muted"
                  px="4"
                  py="sm"
                  borderRadius={0}
                  borderBottom="3px solid"
                  borderColor={selection2?.year === 'career' ? 'brand.red' : 'transparent'}
                  _hover={{ color: 'text-primary' }}
                  _active={{ 
                    color: 'brand.red', 
                    borderColor: 'brand.red' 
                  }}
                >
                  Career
                </Button>
                {availableYears.map(year => (
                  <Button
                    key={year}
                    variant="ghost"
                    size="sm"
                    onClick={() => onYearChange?.(2, year)}
                    isActive={selection2?.year === year}
                    fontFamily="heading"
                    fontWeight="bold"
                    color="text-muted"
                    px="4"
                    py="sm"
                    borderRadius={0}
                    borderBottom="3px solid"
                    borderColor={selection2?.year === year ? 'brand.red' : 'transparent'}
                    _hover={{ color: 'text-primary' }}
                    _active={{ 
                      color: 'brand.red', 
                      borderColor: 'brand.red' 
                    }}
                  >
                    {year}
                  </Button>
                ))}
              </HStack>
            </VStack>
          </Grid>
        </Box>
        
        {/* Stats Filter - Style like Race Details driver filter */}
        {onMetricToggle && (
          <Box bg="bg-surface" p="lg" borderRadius="md">
            <Text fontWeight="bold" mb={3} color="text-primary">Statistics to Compare:</Text>
            <HStack wrap="wrap" gap={2}>
              {Object.entries(metricLabels).map(([key, label]) => {
                // Hide poles unless both drivers have year stats
                if (key === 'poles' && (!stats1?.yearStats || !stats2?.yearStats)) {
                  return null;
                }
                
                const isSelected = enabledMetrics[key as MetricKey];
                return (
                  <Box
                    as="button"
                    key={key}
                    px={3} 
                    py={1}
                    borderRadius="md"
                    borderWidth={2}
                    borderColor={isSelected ? 'brand.red' : 'border-subtle'}
                    boxShadow={isSelected ? '0 0 8px 2px #F56565' : undefined}
                    bg={isSelected ? 'bg-elevated' : 'bg-surface'}
                    fontWeight="bold"
                    color={isSelected ? 'brand.red' : 'text-primary'}
                    cursor="pointer"
                    m={1}
                    transition="all 0.2s"
                    onClick={() => onMetricToggle(key as MetricKey)}
                    _hover={{
                      borderColor: 'brand.red',
                      color: 'brand.red',
                      transform: 'translateY(-1px)'
                    }}
                  >
                    {label}
                  </Box>
                );
              })}
            </HStack>
          </Box>
        )}
        
        {/* Composite Score Display - Below Statistics to Compare */}
        {score && score.d1 !== null && score.d2 !== null && (
          <CompositeScoreBreakdown
            score={score}
            selection1={selection1}
            selection2={selection2}
            stats1={stats1}
            stats2={stats2}
            enabledMetrics={enabledMetrics}
          />
        )}
        
        {/* Comparison Table */}
        <Box bg="bg-surface" p="lg" borderRadius="md">
          <Heading size="xl" textAlign="center" mb="lg" fontFamily="heading">Head-to-Head Comparison</Heading>
          <ResponsiveTable>
              <Thead>
                <Tr>
                  <Th>Statistic</Th>
                  <Th>{title1}</Th>
                  <Th>{title2}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {metricRows.map(({ key, label, value1, value2 }) => {
                  // Highlight better values
                  const isNumeric = typeof value1 === 'number' && typeof value2 === 'number';
                  const isDnf = key === 'dnfs';
                  let better1 = false, better2 = false;
                  
                  if (isNumeric) {
                    if (isDnf) {
                      // For DNFs, lower is better
                      better1 = value1 < value2;
                      better2 = value2 < value1;
                    } else {
                      // For other stats, higher is better
                      better1 = value1 > value2;
                      better2 = value2 > value1;
                    }
                  }
                  
                  return (
                    <Tr key={key}>
                      <Td fontWeight="bold">{label}</Td>
                      <Td 
                        fontWeight={better1 ? 'bold' : 'normal'}
                        color={better1 ? 'brand.red' : 'text-primary'}
                      >
                        {value1}
                      </Td>
                      <Td 
                        fontWeight={better2 ? 'bold' : 'normal'}
                        color={better2 ? 'brand.red' : 'text-primary'}
                      >
                        {value2}
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
          </ResponsiveTable>
        </Box>
      </VStack>
    );
  }
  
  // Fallback to legacy comparison table
  return (
    <Box bg="bg-surface" p="lg" borderRadius="md">
      <Heading size="xl" textAlign="center" mb="lg" fontFamily="heading">Head-to-Head Comparison</Heading>
      <ResponsiveTable>
          <Thead>
            <Tr>
              <Th>Statistic</Th>
              <Th>{driver1.fullName}</Th>
              <Th>{driver2.fullName}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {legacyStats.map(({ key, label }) => (
              <Tr key={key}>
                <Td fontWeight="bold">{label}</Td>
                <Td>{driver1[key]}</Td>
                <Td>{driver2[key]}</Td>
              </Tr>
            ))}
          </Tbody>
      </ResponsiveTable>
    </Box>
  );
};

// --- Composite Score Breakdown Component ---
interface BreakdownProps {
  score: CompositeScore;
  selection1?: DriverSelection | null;
  selection2?: DriverSelection | null;
  stats1?: DriverComparisonStats | null;
  stats2?: DriverComparisonStats | null;
  enabledMetrics?: EnabledMetrics;
}

const CompositeScoreBreakdown: React.FC<BreakdownProps> = ({ score, selection1, selection2, stats1, stats2, enabledMetrics }) => {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: false });

  if (!stats1 || !stats2 || !enabledMetrics) return null;

  const useYearStats = stats1.yearStats !== null && stats2.yearStats !== null;
  const s1 = useYearStats ? stats1.yearStats! : stats1.career;
  const s2 = useYearStats ? stats2.yearStats! : stats2.career;

  // Build list of enabled metrics present in perMetric map keeping UI order
  const order: MetricKey[] = ['wins','podiums','fastestLaps','points','sprintWins','sprintPodiums','dnfs','poles'];
  const rows = order
    .filter(m => enabledMetrics[m])
    .filter(m => m !== 'poles' || (useYearStats && 'poles' in s1 && 'poles' in s2))
    .map(m => {
      const normalized = score.perMetric[m];
      const raw1 = (s1 as any)[m] ?? 0;
      const raw2 = (s2 as any)[m] ?? 0;
      return { metric: m, normalized, raw1, raw2 };
    });

  const labelMap: Record<MetricKey,string> = {
    wins: 'Wins',
    podiums: 'Podiums',
    fastestLaps: 'Fastest Laps',
    points: 'Points',
    sprintWins: 'Sprint Wins',
    sprintPodiums: 'Sprint Podiums',
    dnfs: 'DNFs (lower better)',
    poles: 'Pole Positions'
  };

  return (
    <Box bg="bg-surface" p="lg" borderRadius="md" position="relative">
      <HStack justify="space-between" align="flex-start" mb={4}>
        <Box>
          <Heading size="lg" fontFamily="heading" display="flex" alignItems="center" gap={2}>
            Composite Score
            <Tooltip label="Average of normalized metrics (DNFs inverted).">
              <span><Info size={18} /></span>
            </Tooltip>
          </Heading>
          <Text fontSize="xs" color="text-secondary" mt={1}>
            Each enabled metric is normalized between 0 and 1 per driver (best = 1, DNFs reversed), then averaged and scaled to 100.
          </Text>
        </Box>
        <IconButton
          aria-label={isOpen ? 'Hide score breakdown' : 'Show score breakdown'}
          icon={isOpen ? <ChevronUp /> : <ChevronDown />}
          variant="outline"
          size="sm"
          onClick={onToggle}
        />
      </HStack>
      <HStack justify="center" spacing="xl" mb={isOpen ? 6 : 2}>
        <Box textAlign="center">
          <Text fontSize="sm" color="text-secondary">
            {selection1 ? `Driver 1 ${selection1.year === 'career' ? '(Career)' : `(${selection1.year})`}` : 'Driver 1'}
          </Text>
          <Text fontSize="4xl" fontWeight="bold" color="brand.red">{score.d1}/100</Text>
        </Box>
        <Text fontSize="2xl" color="text-secondary">VS</Text>
        <Box textAlign="center">
          <Text fontSize="sm" color="text-secondary">
            {selection2 ? `Driver 2 ${selection2.year === 'career' ? '(Career)' : `(${selection2.year})`}` : 'Driver 2'}
          </Text>
          <Text fontSize="4xl" fontWeight="bold" color="brand.red">{score.d2}/100</Text>
        </Box>
      </HStack>
      <Collapse in={isOpen} animateOpacity>
        <VStack align="stretch" spacing={4}>
          {rows.map(r => {
            const [n1, n2] = r.normalized || [0,0];
            // Compute contribution percentage of each metric to final 100 (equal weight)
            const contribution = rows.length ? 100 / rows.length : 0; // each metric equal slice
            return (
              <Box key={r.metric}>
                <HStack justify="space-between" mb={1}>
                  <Text fontWeight="medium" fontSize="sm">{labelMap[r.metric]}</Text>
                  <Text fontSize="xs" color="text-secondary">Contributes ~{contribution.toFixed(1)} pts max</Text>
                </HStack>
                <HStack align="flex-end" gap={4}>
                  <Box flex={1}>
                    <Tooltip label={`Raw: ${r.raw1} | Normalized: ${n1.toFixed(2)}`}>
                      <Progress value={n1 * 100} size="sm" borderRadius="md" colorScheme="red" />
                    </Tooltip>
                  </Box>
                  <Text fontSize="xs" w="42px" textAlign="right">{(n1*100).toFixed(0)}</Text>
                  <Text fontSize="xs" color="text-secondary">vs</Text>
                  <Text fontSize="xs" w="42px">{(n2*100).toFixed(0)}</Text>
                  <Box flex={1}>
                    <Tooltip label={`Raw: ${r.raw2} | Normalized: ${n2.toFixed(2)}`}>
                      <Progress value={n2 * 100} size="sm" borderRadius="md" colorScheme="red" />
                    </Tooltip>
                  </Box>
                </HStack>
                <Divider mt={2} />
              </Box>
            );
          })}
          <Box>
            <Text fontSize="xs" color="text-secondary" mb={1}>Formula</Text>
            <Text fontSize="xs" lineHeight={1.4}>
              score = round( average( normalized_metric_values ) * 100 ). DNFs use inverted normalization so fewer DNFs yields a higher normalized value. If a metric has zero for both drivers its normalized value is 0.5 each (except DNFs which become 1.0 each when both are 0). Pole Positions only appear when season stats are selected for both drivers. 
            </Text>
          </Box>
        </VStack>
      </Collapse>
    </Box>
  );
};