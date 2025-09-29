// frontend/src/components/RaceDetails/RaceEventsWidget.tsx
import React from 'react';
import { Box, Heading, Text, VStack, Flex, Icon, useColorModeValue } from '@chakra-ui/react';
import { Flag, XCircle } from 'lucide-react';

interface RaceEvents {
  yellowFlags: number;
  redFlags: number;
}

interface RaceEventsWidgetProps {
  data: RaceEvents | null | undefined;
}

const RaceEventsWidget: React.FC<RaceEventsWidgetProps> = ({ data }) => {
  if (!data) {
    return <Box p={4} border="1px solid" borderColor="border-subtle" borderRadius="lg" bg="bg-elevated"><Text>Event data unavailable.</Text></Box>;
  }

  const bgGradient = useColorModeValue('linear(to-br, gray.50, gray.200)', 'linear(to-br, gray.800, gray.900)');

  return (
    <Box
      p={4}
      border="1px solid"
      borderColor="border-subtle"
      borderRadius="lg"
      bgGradient={bgGradient}
      position="relative"
      overflow="hidden"
      h="100%"
    >
      <VStack align="flex-start" w="100%" h="100%" zIndex={1} position="relative" justify="space-between">
        <Heading size="sm" textTransform="uppercase" mb={4}>Events</Heading>
        
        <VStack align="flex-start" spacing={3} w="100%">
          {/* Yellow Flags */}
          <Flex align="center" gap={3}>
            <Icon as={Flag} color="yellow.400" w={6} h={6} />
            <Text 
              fontSize={{ base: '2xl', md: '3xl' }}
              fontWeight="bold" 
              color="yellow.400"
              fontFamily="mono"
            >
              Yellow Flags: {data.yellowFlags}
            </Text>
          </Flex>

          {/* Red Flags */}
          <Flex align="center" gap={3}>
            <Icon as={XCircle} color="red.500" w={6} h={6} />
            <Text 
              fontSize={{ base: '2xl', md: '3xl' }}
              fontWeight="bold" 
              color="red.500"
              fontFamily="mono"
            >
              Red Flags: {data.redFlags}
            </Text>
          </Flex>
        </VStack>
      </VStack>
    </Box>
  );
};

export default RaceEventsWidget;
