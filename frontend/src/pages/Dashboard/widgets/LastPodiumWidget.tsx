import { Heading, Text, VStack, HStack, Box } from '@chakra-ui/react';
import type { LastRacePodium } from '../../../types';
import { teamColors } from '../../../lib/teamColors';
import WidgetCard from './WidgetCard';

interface LastPodiumWidgetProps {
  data?: LastRacePodium;
}

function LastPodiumWidget({ data }: LastPodiumWidgetProps) {
  if (!data) {
    return (
      <WidgetCard>
        <VStack align="start" spacing="md">
          <Heading color="brand.red" size="md" fontFamily="heading">
            Last Race Podium
          </Heading>
          <Text color="text-muted">Loading...</Text>
        </VStack>
      </WidgetCard>
    );
  }

  const getMedal = (position: number) => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  };

  return (
    <WidgetCard>
      <VStack align="start" spacing="md">
        <Heading color="brand.red" size="md" fontFamily="heading">
          Last Race: {data.raceName} Podium
        </Heading>
        
        <VStack align="stretch" spacing="sm" w="full">
          {data.podium.map((podiumItem) => {
            const teamColor = teamColors[podiumItem.constructorName] || teamColors['Default'];
            return (
              <HStack key={podiumItem.position} spacing="md" align="center" p="sm" borderRadius="md" bg="whiteAlpha.50">
                <Text fontSize="lg">{getMedal(podiumItem.position)}</Text>
                <Box
                  w="8px"
                  h="8px"
                  borderRadius="full"
                  bg={`#${teamColor}`}
                  flexShrink={0}
                />
                <VStack align="start" spacing="xs" flex="1">
                  <Text color="text-primary" fontSize="sm" fontWeight="600">
                    {podiumItem.driverFullName}
                  </Text>
                  <Text color="text-muted" fontSize="xs">
                    {podiumItem.constructorName}
                  </Text>
                </VStack>
              </HStack>
            );
          })}
        </VStack>
      </VStack>
    </WidgetCard>
  );
}

export default LastPodiumWidget;
