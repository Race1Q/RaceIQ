import { Heading, Text, VStack, HStack, Box, Avatar, Flex } from '@chakra-ui/react';
import type { LastRacePodium } from '../../../types';
import { teamColors } from '../../../lib/teamColors';
import WidgetCard from './WidgetCard';
import { driverHeadshots } from '../../../lib/driverHeadshots';

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
        
        <VStack align="stretch" w="100%" spacing={2}>
          {data.podium.map((item) => {
            const isWinner = item.position === 1;
            const teamColor = teamColors[item.constructorName] || teamColors['Default'];
            const headshot = driverHeadshots[item.driverFullName] || '';
            return (
              <Flex
                key={item.position}
                align="center"
                bg={isWinner ? teamColor : 'transparent'}
                p={isWinner ? 4 : 2}
                borderRadius="md"
                transition="all 0.2s ease-in-out"
              >
                <Flex align="center" flex={1}>
                  <Text w="2em" color={isWinner ? 'white' : 'brand.red'} fontWeight="bold">{item.position}.</Text>
                  <Avatar size="sm" src={headshot} mr={3} />
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="bold" color={isWinner ? 'white' : 'text-primary'}>{item.driverFullName}</Text>
                    <Text fontSize="sm" color={isWinner ? 'whiteAlpha.800' : 'text-muted'}>{item.constructorName}</Text>
                  </VStack>
                </Flex>
                <Text fontWeight="bold" color={isWinner ? 'white' : 'brand.red'}>{getMedal(item.position)}</Text>
              </Flex>
            );
          })}
        </VStack>
      </VStack>
    </WidgetCard>
  );
}

export default LastPodiumWidget;
