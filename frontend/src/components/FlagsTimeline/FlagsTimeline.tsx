import React from 'react';
import { Box, Text, HStack, VStack, Heading } from '@chakra-ui/react';
import { Flag } from 'lucide-react';
import type { FlagSegment } from '../../data/types.ts';

interface FlagsTimelineProps {
  timeline: FlagSegment[];
}

const FlagsTimeline: React.FC<FlagsTimelineProps> = ({ timeline }) => {
  const getFlagColor = (type: string) => {
    switch (type) {
      case 'green':
        return 'green.500';
      case 'yellow':
        return 'yellow.500';
      case 'red':
        return 'red.500';
      case 'safety_car':
        return 'orange.500';
      case 'virtual_safety_car':
        return 'purple.500';
      default:
        return 'green.500';
    }
  };

  const getFlagLabel = (type: string) => {
    switch (type) {
      case 'green':
        return 'Green Flag';
      case 'yellow':
        return 'Yellow Flag';
      case 'red':
        return 'Red Flag';
      case 'safety_car':
        return 'Safety Car';
      case 'virtual_safety_car':
        return 'Virtual Safety Car';
      default:
        return 'Green Flag';
    }
  };

  const totalLaps = timeline.reduce((total, segment) => {
    return Math.max(total, segment.endLap);
  }, 0);

  return (
    <VStack spacing="lg" bg="bg-surface" p="lg" borderRadius="lg" borderWidth="1px" borderColor="border-primary" h="100%">
      <Heading as="h3" size="md" fontFamily="heading" color="text-primary">Race Timeline</Heading>
      
      <Box w="100%">
        <HStack spacing={0} w="100%" h="8" bg="gray.100" borderRadius="full" overflow="hidden">
          {timeline.map((segment, index) => {
            const duration = segment.endLap - segment.startLap + 1;
            const width = (duration / totalLaps) * 100;
            
            return (
              <Box
                key={index}
                bg={getFlagColor(segment.type)}
                w={`${width}%`}
                h="100%"
                title={`${getFlagLabel(segment.type)} - Laps ${segment.startLap}-${segment.endLap}`}
              />
            );
          })}
        </HStack>
        
        <HStack justify="space-between" mt="sm">
          <Text fontSize="sm" color="text-secondary">Lap 1</Text>
          <Text fontSize="sm" color="text-secondary">Lap {totalLaps}</Text>
        </HStack>
      </Box>
      
      <VStack spacing="sm" align="stretch" w="100%">
        <Text fontSize="sm" color="text-secondary" fontWeight="medium">Flag Types:</Text>
        <HStack spacing="md" wrap="wrap">
          <HStack spacing="sm">
            <Box w="4" h="4" bg="green.500" borderRadius="sm" />
            <Text fontSize="sm" color="text-secondary">Green Flag</Text>
          </HStack>
          <HStack spacing="sm">
            <Box w="4" h="4" bg="yellow.500" borderRadius="sm" />
            <Text fontSize="sm" color="text-secondary">Yellow Flag</Text>
          </HStack>
          <HStack spacing="sm">
            <Box w="4" h="4" bg="orange.500" borderRadius="sm" />
            <Text fontSize="sm" color="text-secondary">Safety Car</Text>
          </HStack>
          <HStack spacing="sm">
            <Box w="4" h="4" bg="purple.500" borderRadius="sm" />
            <Text fontSize="sm" color="text-secondary">Virtual Safety Car</Text>
          </HStack>
        </HStack>
      </VStack>
    </VStack>
  );
};

export default FlagsTimeline;
