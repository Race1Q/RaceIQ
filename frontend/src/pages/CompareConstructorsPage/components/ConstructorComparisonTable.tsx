// frontend/src/pages/CompareConstructorsPage/components/ConstructorComparisonTable.tsx
import { Box, Text, VStack, HStack, Flex, Badge, Image, Grid, useColorModeValue } from '@chakra-ui/react';
import { Trophy, Star, Flag, Zap, Target, Clock, Award } from 'lucide-react';
import { getTeamLogo } from '../../../lib/teamAssets';
import { TEAM_META, type TeamKey } from '../../../theme/teamTokens';

// Function to get team gradient by constructor name
const getTeamGradient = (constructorName: string): string => {
  const teamEntry = Object.entries(TEAM_META).find(([_, meta]) => 
    meta.name.toLowerCase() === constructorName.toLowerCase()
  );
  return teamEntry ? teamEntry[1].gradient : 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)';
};

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

// A reusable component for a single stat card with winner highlighting
const StatCard = ({ 
  label, 
  value, 
  icon, 
  teamColor, 
  isWinner = false,
  metric 
}: { 
  label: string; 
  value: number; 
  icon: any; 
  teamColor: string;
  isWinner?: boolean;
  metric?: string;
}) => {
  // Theme-aware colors
  const cardBg = useColorModeValue('white', 'rgba(255, 255, 255, 0.05)');
  const cardBorder = useColorModeValue('gray.200', 'whiteAlpha.200');
  const cardBorderHover = useColorModeValue('gray.300', 'whiteAlpha.300');
  const iconColor = useColorModeValue('gray.600', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const valueColor = useColorModeValue('gray.800', 'white');
  const shadowColor = useColorModeValue('rgba(0,0,0,0.1)', 'rgba(0,0,0,0.3)');

  return (
    <Flex
      justify="space-between"
      align="center"
      p={4}
      bg={cardBg}
      borderRadius="md"
      border="2px solid"
      borderColor={isWinner ? `#${teamColor}` : cardBorder}
      w="100%"
    transition="all 0.3s ease"
    position="relative"
    _hover={{
      transform: 'translateY(-2px)',
      boxShadow: isWinner ? `0 8px 25px #${teamColor}30` : `0 8px 25px ${shadowColor}`,
      borderColor: isWinner ? `#${teamColor}` : cardBorderHover
    }}
    _before={isWinner ? {
      content: '""',
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: '4px',
      background: `#${teamColor}`,
      borderRadius: 'md 0 0 md',
    } : undefined}
  >
    <HStack>
      <Box as={icon} color={isWinner ? `#${teamColor}` : iconColor} w="16px" h="16px" />
      <Text fontSize="sm" color={textColor}>{label}</Text>
    </HStack>
    <HStack spacing={2}>
      <Text 
        fontSize="lg" 
        fontFamily="heading" 
        color={isWinner ? `#${teamColor}` : valueColor} 
        fontWeight={isWinner ? "bold" : "normal"}
        textShadow={isWinner ? `0 0 8px #${teamColor}40` : "none"}
        transition="all 0.3s ease"
      >
        {value}
      </Text>
      {isWinner && (
        <Box as={Trophy} color={`#${teamColor}`} w="16px" h="16px" />
      )}
    </HStack>
  </Flex>
  );
};

// Helper function to determine winner for each metric
const determineWinner = (value1: number, value2: number, metric: string): boolean => {
  // For DNFs, lower is better (fewer DNFs)
  if (metric === 'dnf' || metric === 'dnfs') {
    return value1 < value2;
  }
  
  // For all other metrics, higher is better
  return value1 > value2;
};

// A reusable component for an entire constructor's column
const ConstructorStatsColumn = ({ 
  constructor, 
  stats, 
  teamColor, 
  enabledMetrics, 
  availableMetrics,
  opponentStats,
  isConstructor1
}: {
  constructor: any;
  stats: any;
  teamColor: string;
  enabledMetrics: string[];
  availableMetrics: Record<string, string>;
  opponentStats: any;
  isConstructor1: boolean;
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
  const useOpponentYearStats = opponentStats?.yearStats !== null;
  const statData = useYearStats ? stats.yearStats : stats.career;
  const opponentStatData = useOpponentYearStats ? opponentStats.yearStats : opponentStats?.career;
  
  return (
    <VStack spacing="md" align="stretch">
      {/* Constructor Logo and Info */}
      <VStack spacing="md">
        <Box position="relative">
          <Box
            w="140px"
            h="140px"
            borderRadius="full"
            bgGradient={getTeamGradient(constructor.name)}
            display="flex"
            alignItems="center"
            justifyContent="center"
            border="4px solid"
            borderColor={teamColor}
            boxShadow="lg"
            overflow="hidden"
            position="relative"
            _before={{
              content: '""',
              position: 'absolute',
              inset: 0,
              borderRadius: 'full',
              background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
              pointerEvents: 'none',
            }}
          >
            <Box position="relative" zIndex={1}>
              {(() => {
                const logoUrl = getTeamLogo(constructor.name);
                return logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={`${constructor.name} logo`}
                    w="100px"
                    h="100px"
                    objectFit="contain"
                    fallbackSrc=""
                  />
                ) : (
                  <Text fontSize="3xl" fontWeight="bold" color="white">
                    {constructor.name?.charAt(0) || 'C'}
                  </Text>
                );
              })()}
            </Box>
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
          <Text fontFamily="heading" fontWeight="bold" fontSize="lg" color={useColorModeValue('gray.800', 'white')}>
            {constructor.name}
          </Text>
          <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.300')}>
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
          const opponentValue = (opponentStatData as any)?.[statKey] ?? 0;
          const label = availableMetrics[metric as keyof typeof availableMetrics];
          const icon = metricIconMap[metric] || Star; // Default to Star icon
          
          // Determine if this constructor wins this metric
          const isWinner = determineWinner(value, opponentValue, metric);
          
          return (
            <StatCard 
              key={metric} 
              label={label} 
              value={value} 
              icon={icon} 
              teamColor={teamColor}
              isWinner={isWinner}
              metric={metric}
            />
          );
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
          opponentStats={stats2}
          isConstructor1={true}
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
          opponentStats={stats1}
          isConstructor1={false}
        />
      </Grid>
    </Box>
  );
};
