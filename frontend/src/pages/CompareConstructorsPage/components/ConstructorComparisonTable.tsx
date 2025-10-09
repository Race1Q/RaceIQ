// frontend/src/pages/CompareConstructorsPage/components/ConstructorComparisonTable.tsx
import { Box, Text, VStack, HStack, Flex, Badge, Image, Skeleton, SkeletonText, Grid } from '@chakra-ui/react';
import { Trophy, Star, Flag, Zap, Target, Clock, Award } from 'lucide-react';
import { getTeamColor } from '../../../lib/teamColors';

interface ConstructorComparisonTableProps {
  constructor1: any;
  constructor2: any;
  stats1: any;
  stats2: any;
  enabledMetrics: string[];
  availableMetrics: Record<string, string>;
  teamColor1: string;
  teamColor2: string;
}

// A reusable component for a single stat card
const StatCard = ({ label, value, icon, teamColor }: { 
  label: string; 
  value: number; 
  icon: any; 
  teamColor: string; 
}) => (
  <Flex
    justify="space-between"
    align="center"
    p={4}
    bg="bg-glassmorphism"
    borderRadius="md"
    border="1px solid"
    borderColor="border-subtle"
    w="100%"
    transition="all 0.3s ease"
    _hover={{
      transform: 'translateY(-2px)',
      boxShadow: `0 8px 25px ${teamColor}20`,
      borderColor: `${teamColor}40`
    }}
  >
    <HStack>
      <Box as={icon} color={teamColor} w="16px" h="16px" />
      <Text fontSize="sm" color="text-muted">{label}</Text>
    </HStack>
    <Text fontSize="lg" fontFamily="heading" color={teamColor} fontWeight="bold">{value}</Text>
  </Flex>
);

// A reusable component for an entire constructor's column
const ConstructorStatsColumn = ({ 
  constructor, 
  stats, 
  teamColor, 
  enabledMetrics, 
  availableMetrics 
}: {
  constructor: any;
  stats: any;
  teamColor: string;
  enabledMetrics: string[];
  availableMetrics: Record<string, string>;
}) => {
  if (!constructor || !stats) return null;

  // Map metric keys to icons
  const metricIconMap: Record<string, any> = {
    'wins': Trophy,
    'podiums': Star,
    'poles': Flag,
    'fastestLaps': Zap,
    'points': Target,
    'races': Clock,
    'dnf': Award,
  };

  const useYearStats = stats.yearStats !== null;
  const statData = useYearStats ? stats.yearStats : stats.career;
  
  return (
    <VStack spacing="md" align="stretch">
      {/* Constructor Logo and Info */}
      <VStack spacing="md">
        <Box position="relative">
          <Box
            w="120px"
            h="120px"
            borderRadius="full"
            bg={teamColor}
            display="flex"
            alignItems="center"
            justifyContent="center"
            border="4px solid"
            borderColor={teamColor}
            boxShadow="lg"
          >
            <Text fontSize="2xl" fontWeight="bold" color="white">
              {constructor.name?.charAt(0) || 'C'}
            </Text>
          </Box>
          <Badge
            position="absolute"
            top="-8px"
            right="-8px"
            bg={teamColor}
            color="white"
            borderRadius="full"
            w="32px"
            h="32px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="sm"
            fontWeight="bold"
          >
            {constructor.id}
          </Badge>
        </Box>
        <VStack spacing="xs" textAlign="center">
          <Text fontFamily="heading" fontWeight="bold" fontSize="lg" color="text-primary">
            {constructor.name}
          </Text>
          <Text fontSize="sm" color="text-muted">
            {constructor.nationality}
          </Text>
          <Badge
            colorScheme={constructor.isActive ? "green" : "gray"}
            variant="solid"
            fontSize="xs"
          >
            {constructor.isActive ? "Active" : "Historical"}
          </Badge>
        </VStack>
      </VStack>

      {/* List of Stat Cards */}
      <VStack spacing={3} align="stretch" w="100%">
        {enabledMetrics.map(metric => {
          // Map metric names to the correct property names
          const metricMap: Record<string, string> = {
            'wins': 'wins',
            'podiums': 'podiums', 
            'poles': 'poles',
            'fastestLaps': 'fastestLaps',
            'points': 'points',
            'races': 'races',
            'dnf': 'dnfs',
          };
          
          const statKey = metricMap[metric] || metric;
          const value = (statData as any)[statKey] ?? 0;
          const label = availableMetrics[metric as keyof typeof availableMetrics];
          const icon = metricIconMap[metric] || Star; // Default to Star icon
          
          return <StatCard key={metric} label={label} value={value} icon={icon} teamColor={teamColor} />;
        })}
      </VStack>
    </VStack>
  );
};

export const ConstructorComparisonTable: React.FC<ConstructorComparisonTableProps> = ({
  constructor1,
  constructor2,
  stats1,
  stats2,
  enabledMetrics,
  availableMetrics,
  teamColor1,
  teamColor2,
}) => {
  return (
    <Box
      w="full"
      maxW="1400px"
      mx="auto"
      p={{ base: 4, md: 8 }}
    >
      <Grid
        templateColumns={{ base: '1fr', md: '1fr auto 1fr' }}
        gap={{ base: 6, md: 8 }}
        alignItems="start"
      >
        {/* Constructor 1 Column */}
        <ConstructorStatsColumn
          constructor={constructor1}
          stats={stats1}
          teamColor={teamColor1}
          enabledMetrics={enabledMetrics}
          availableMetrics={availableMetrics}
        />

        {/* VS Divider */}
        <VStack spacing="sm" h="100%" justify="center" pt="120px">
          <Text fontSize="2xl" color="border-accent" fontFamily="heading" fontWeight="bold">
            VS
          </Text>
          <Box w="2px" h="full" bg="border-accent" borderRadius="full" minH="200px" />
        </VStack>

        {/* Constructor 2 Column */}
        <ConstructorStatsColumn
          constructor={constructor2}
          stats={stats2}
          teamColor={teamColor2}
          enabledMetrics={enabledMetrics}
          availableMetrics={availableMetrics}
        />
      </Grid>
    </Box>
  );
};
