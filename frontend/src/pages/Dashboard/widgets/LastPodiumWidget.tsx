import { Heading, Text, VStack, HStack, Box } from '@chakra-ui/react';
import WidgetCard from './WidgetCard';

function LastPodiumWidget() {
  const podium = [
    { position: 1, driver: 'Max Verstappen', team: 'Red Bull Racing', teamColor: '#3671C6', medal: '🥇' },
    { position: 2, driver: 'Oscar Piastri', team: 'McLaren', teamColor: '#F58020', medal: '🥈' },
    { position: 3, driver: 'Lando Norris', team: 'McLaren', teamColor: '#F58020', medal: '🥉' },
  ];

  return (
    <WidgetCard>
      <VStack align="start" spacing="md">
        <Heading color="brand.red" size="md" fontFamily="heading">
          Last Race: British GP Podium
        </Heading>
        
        <VStack align="stretch" spacing="sm" w="full">
          {podium.map(({ position, driver, team, teamColor, medal }) => (
            <HStack key={position} spacing="md" align="center" p="sm" borderRadius="md" bg="whiteAlpha.50">
              <Text fontSize="lg">{medal}</Text>
              <Box
                w="8px"
                h="8px"
                borderRadius="full"
                bg={teamColor}
                flexShrink={0}
              />
              <VStack align="start" spacing="xs" flex="1">
                <Text color="text-primary" fontSize="sm" fontWeight="600">
                  {driver}
                </Text>
                <Text color="text-muted" fontSize="xs">
                  {team}
                </Text>
              </VStack>
            </HStack>
          ))}
        </VStack>
      </VStack>
    </WidgetCard>
  );
}

export default LastPodiumWidget;
