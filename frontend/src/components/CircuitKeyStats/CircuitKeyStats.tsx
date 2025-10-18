import React from 'react';
import { Box, HStack, VStack, Text, Icon } from '@chakra-ui/react';
import { 
  MapPin, 
  RotateCcw, 
  CornerUpRight, 
  Zap, 
  Clock, 
  Calendar, 
  TrendingUp, 
  Gauge 
} from 'lucide-react';
import type { CircuitKeyStats } from '../../lib/circuitBackgrounds';

interface CircuitKeyStatsProps {
  stats: CircuitKeyStats;
  color?: string;
}

const CircuitKeyStats: React.FC<CircuitKeyStatsProps> = ({ stats, color = 'white' }) => {
  // Handle null stats
  if (!stats) {
    return null;
  }

  const statItems = [
    {
      icon: MapPin,
      label: 'Length',
      value: stats.length,
      color: '#3B82F6' // Blue
    },
    {
      icon: RotateCcw,
      label: 'Laps',
      value: stats.laps.toString(),
      color: '#10B981' // Green
    },
    {
      icon: CornerUpRight,
      label: 'Corners',
      value: stats.corners.toString(),
      color: '#F59E0B' // Yellow
    },
    {
      icon: Zap,
      label: 'DRS Zones',
      value: stats.drsZones.toString(),
      color: '#EF4444' // Red
    }
  ];

  const additionalStats = [
    stats.recordLap && {
      icon: Clock,
      label: 'Record Lap',
      value: stats.recordLap,
      color: '#8B5CF6' // Purple
    },
    stats.firstRace && {
      icon: Calendar,
      label: 'First Race',
      value: stats.firstRace.toString(),
      color: '#06B6D4' // Cyan
    },
    stats.elevation && {
      icon: TrendingUp,
      label: 'Elevation',
      value: stats.elevation,
      color: '#84CC16' // Lime
    },
    stats.averageSpeed && {
      icon: Gauge,
      label: 'Avg Speed',
      value: stats.averageSpeed,
      color: '#F97316' // Orange
    }
  ].filter(Boolean);

  return (
    <VStack align="stretch" spacing={4} w="full">
      {/* Primary Stats Grid */}
      <Box
        display="grid"
        gridTemplateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }}
        gap={{ base: 3, md: 4 }}
        w="full"
      >
        {statItems.map((item, index) => (
          <Box
            key={index}
            bg="blackAlpha.200"
            border="1px solid"
            borderColor="whiteAlpha.200"
            borderRadius="lg"
            p={{ base: 3, md: 4 }}
            backdropFilter="blur(8px)"
            transition="all 0.2s ease"
            _hover={{
              bg: 'blackAlpha.300',
              borderColor: 'whiteAlpha.300',
              transform: 'translateY(-2px)'
            }}
          >
            <HStack spacing={3} align="center">
              <Box
                p={2}
                borderRadius="md"
                bg={`${item.color}20`}
                border="1px solid"
                borderColor={`${item.color}40`}
              >
                <Icon as={item.icon} boxSize={4} color={item.color} />
              </Box>
              <VStack align="flex-start" spacing={0} flex="1">
                <Text
                  fontSize={{ base: 'xs', md: 'sm' }}
                  color="gray.300"
                  fontWeight="500"
                  textTransform="uppercase"
                  letterSpacing="0.05em"
                >
                  {item.label}
                </Text>
                <Text
                  fontSize={{ base: 'sm', md: 'md' }}
                  color={color}
                  fontWeight="700"
                  lineHeight={1}
                >
                  {item.value}
                </Text>
              </VStack>
            </HStack>
          </Box>
        ))}
      </Box>

      {/* Additional Stats (if available) */}
      {additionalStats.length > 0 && (
        <Box
          display="grid"
          gridTemplateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }}
          gap={{ base: 2, md: 3 }}
          w="full"
        >
          {additionalStats.map((item, index) => (
            <Box
              key={index}
              bg="blackAlpha.150"
              border="1px solid"
              borderColor="whiteAlpha.150"
              borderRadius="md"
              p={{ base: 2, md: 3 }}
              backdropFilter="blur(6px)"
            >
              <HStack spacing={2} align="center">
                <Icon as={item!.icon} boxSize={3} color={item!.color} />
                <VStack align="flex-start" spacing={0} flex="1">
                  <Text
                    fontSize="xs"
                    color="gray.400"
                    fontWeight="500"
                    textTransform="uppercase"
                    letterSpacing="0.05em"
                  >
                    {item!.label}
                  </Text>
                  <Text
                    fontSize="xs"
                    color={color}
                    fontWeight="600"
                    lineHeight={1}
                  >
                    {item!.value}
                  </Text>
                </VStack>
              </HStack>
            </Box>
          ))}
        </Box>
      )}
    </VStack>
  );
};

export default CircuitKeyStats;
