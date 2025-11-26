import { Heading, Text, VStack, HStack, Box, Avatar, Flex, useColorModeValue } from '@chakra-ui/react';
import type { LastRacePodium } from '../../../types';
import { teamColors } from '../../../lib/teamColors';
import WidgetCard from './WidgetCard';
import { getDriverHeadshot } from '../../../lib/driverHeadshotUtils';
import { useThemeColor } from '../../../context/ThemeColorContext';

interface LastPodiumWidgetProps {
  data?: LastRacePodium;
}

function LastPodiumWidget({ data }: LastPodiumWidgetProps) {
  const { accentColorWithHash } = useThemeColor();
  
  // Use semantic tokens for winner text colors that work on team color backgrounds
  const winnerTextColor = useColorModeValue('gray.900', 'white');
  const winnerSecondaryColor = useColorModeValue('gray.700', 'whiteAlpha.800');
  
  if (!data) {
    return (
      <WidgetCard>
        <VStack align="start" spacing="md">
          <Heading color={accentColorWithHash} size="md" fontFamily="heading">
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
        <Heading color={accentColorWithHash} size="md" fontFamily="heading">
          Last Race: {data.raceName} Podium
        </Heading>
        
        <VStack align="stretch" w="100%" spacing={2}>
          {data.podium.map((item) => {
            const isWinner = item.position === 1;
            const teamColor = teamColors[item.constructorName] || teamColors['Default'];
            const headshot = getDriverHeadshot(item.driverProfileImageUrl, item.driverFullName);
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
                  <Text w="2em" color={isWinner ? winnerTextColor : accentColorWithHash} fontWeight="bold">{item.position}.</Text>
                  <Avatar size="sm" src={headshot} mr={3} />
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="bold" color={isWinner ? winnerTextColor : 'text-primary'}>{item.driverFullName}</Text>
                    <Text fontSize="sm" color={isWinner ? winnerSecondaryColor : 'text-muted'}>{item.constructorName}</Text>
                  </VStack>
                </Flex>
                <Text fontWeight="bold" color={isWinner ? winnerTextColor : accentColorWithHash}>{getMedal(item.position)}</Text>
              </Flex>
            );
          })}
        </VStack>
      </VStack>
    </WidgetCard>
  );
}

export default LastPodiumWidget;
