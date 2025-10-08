// frontend/src/pages/CompareDriversPage/components/ComparisonTable.tsx
import { Box, Heading, Thead, Tbody, Tr, Th, Td, HStack, Text, VStack, Grid, Button, Image } from '@chakra-ui/react';
import { driverHeadshots } from '../../../lib/driverHeadshots';
import ResponsiveTable from '../../../components/layout/ResponsiveTable';
import type { DriverDetails, DriverComparisonStats, EnabledMetrics, DriverSelection, MetricKey, CompositeScore } from '../../../hooks/useDriverComparison';
import { useThemeColor } from '../../../context/ThemeColorContext';

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
  const { accentColorWithHash } = useThemeColor();
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
                  borderColor={selection1?.year === 'career' ? 'border-accent' : 'transparent'}
                  _hover={{ color: 'text-primary' }}
                  _active={{ 
                    color: 'border-accent', 
                    borderColor: 'border-accent' 
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
                    borderColor={selection1?.year === year ? 'border-accent' : 'transparent'}
                    _hover={{ color: 'text-primary' }}
                    _active={{ 
                      color: 'border-accent', 
                      borderColor: 'border-accent' 
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
                  borderColor={selection2?.year === 'career' ? 'border-accent' : 'transparent'}
                  _hover={{ color: 'text-primary' }}
                  _active={{ 
                    color: 'border-accent', 
                    borderColor: 'border-accent' 
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
                    borderColor={selection2?.year === year ? 'border-accent' : 'transparent'}
                    _hover={{ color: 'text-primary' }}
                    _active={{ 
                      color: 'border-accent', 
                      borderColor: 'border-accent' 
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
                    borderColor={isSelected ? 'border-accent' : 'border-subtle'}
                    boxShadow={isSelected ? `0 0 8px 2px ${accentColorWithHash}` : undefined}
                    bg={isSelected ? 'bg-elevated' : 'bg-surface'}
                    fontWeight="bold"
                    color={isSelected ? 'border-accent' : 'text-primary'}
                    cursor="pointer"
                    m={1}
                    transition="all 0.2s"
                    onClick={() => onMetricToggle(key as MetricKey)}
                    _hover={{
                      borderColor: 'border-accent',
                      color: 'border-accent',
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
          <Box bg="bg-surface" p="lg" borderRadius="md" textAlign="center">
            <Heading size="lg" mb="md" fontFamily="heading">Composite Score</Heading>
            <HStack justify="center" spacing="xl">
              <Box>
                <Text fontSize="sm" color="text-secondary">
                  {selection1 ? `Driver 1 ${selection1.year === 'career' ? '(Career)' : `(${selection1.year})`}` : 'Driver 1'}
                </Text>
                <Text fontSize="3xl" fontWeight="bold" color="border-accent">
                  {score.d1}/100
                </Text>
              </Box>
              <Text fontSize="2xl" color="text-secondary">VS</Text>
              <Box>
                <Text fontSize="sm" color="text-secondary">
                  {selection2 ? `Driver 2 ${selection2.year === 'career' ? '(Career)' : `(${selection2.year})`}` : 'Driver 2'}
                </Text>
                <Text fontSize="3xl" fontWeight="bold" color="border-accent">
                  {score.d2}/100
                </Text>
              </Box>
            </HStack>
          </Box>
        )}
        
        {/* Comparison Table */}
        <Box bg="bg-surface" p="lg" borderRadius="md">
          <Heading size="xl" textAlign="center" mb="lg" fontFamily="heading">Head-to-Head Comparison</Heading>
          <ResponsiveTable>
              <Thead>
                {/* Aligned driver headshots and names as header row */}
                <Tr>
                  <Th></Th>
                  <Th textAlign="center">
                    <VStack spacing={2}>
                      <Image
                        src={driverHeadshots[driver1.fullName] || (driver1 as any).imageUrl || 'https://media.formula1.com/content/dam/fom-website/drivers/placeholder.png.transform/2col-retina/image.png'}
                        alt={driver1.fullName}
                        boxSize={{ base: '64px', md: '96px' }}
                        objectFit="cover"
                        borderRadius="full"
                        borderWidth="3px"
                        borderColor="bg-surface"
                        boxShadow="lg"
                        mx="auto"
                      />
                      <Text fontWeight="bold">{title1}</Text>
                    </VStack>
                  </Th>
                  <Th textAlign="center">
                    <VStack spacing={2}>
                      <Image
                        src={driverHeadshots[driver2.fullName] || (driver2 as any).imageUrl || 'https://media.formula1.com/content/dam/fom-website/drivers/placeholder.png.transform/2col-retina/image.png'}
                        alt={driver2.fullName}
                        boxSize={{ base: '64px', md: '96px' }}
                        objectFit="cover"
                        borderRadius="full"
                        borderWidth="3px"
                        borderColor="bg-surface"
                        boxShadow="lg"
                        mx="auto"
                      />
                      <Text fontWeight="bold">{title2}</Text>
                    </VStack>
                  </Th>
                </Tr>
                <Tr>
                  <Th>Statistic</Th>
                  <Th></Th>
                  <Th></Th>
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
                        color={better1 ? 'border-accent' : 'text-primary'}
                        textAlign="center"
                      >
                        {value1}
                      </Td>
                      <Td 
                        fontWeight={better2 ? 'bold' : 'normal'}
                        color={better2 ? 'border-accent' : 'text-primary'}
                        textAlign="center"
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
            {/* Aligned driver headshots and names as header row (legacy) */}
            <Tr>
              <Th></Th>
              <Th textAlign="center">
                <VStack spacing={2}>
                  <Image
                    src={driverHeadshots[driver1.fullName] || (driver1 as any).imageUrl || 'https://media.formula1.com/content/dam/fom-website/drivers/placeholder.png.transform/2col-retina/image.png'}
                    alt={driver1.fullName}
                    boxSize={{ base: '64px', md: '96px' }}
                    objectFit="cover"
                    borderRadius="full"
                    borderWidth="3px"
                    borderColor="bg-surface"
                    boxShadow="lg"
                    mx="auto"
                  />
                  <Text fontWeight="bold">{driver1.fullName}</Text>
                </VStack>
              </Th>
              <Th textAlign="center">
                <VStack spacing={2}>
                  <Image
                    src={driverHeadshots[driver2.fullName] || (driver2 as any).imageUrl || 'https://media.formula1.com/content/dam/fom-website/drivers/placeholder.png.transform/2col-retina/image.png'}
                    alt={driver2.fullName}
                    boxSize={{ base: '64px', md: '96px' }}
                    objectFit="cover"
                    borderRadius="full"
                    borderWidth="3px"
                    borderColor="bg-surface"
                    boxShadow="lg"
                    mx="auto"
                  />
                  <Text fontWeight="bold">{driver2.fullName}</Text>
                </VStack>
              </Th>
            </Tr>
            <Tr>
              <Th>Statistic</Th>
              <Th textAlign="center"></Th>
              <Th textAlign="center"></Th>
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