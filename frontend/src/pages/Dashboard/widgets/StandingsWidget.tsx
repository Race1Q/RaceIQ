import { Heading, Text, VStack, HStack, Box } from '@chakra-ui/react';
import WidgetCard from './WidgetCard';

function StandingsWidget() {
  const standings = [
    { position: 1, driver: 'Max Verstappen', points: 350, team: 'Red Bull Racing', teamColor: '#3671C6' },
    { position: 2, driver: 'Lando Norris', points: 332, team: 'McLaren', teamColor: '#F58020' },
    { position: 3, driver: 'Charles Leclerc', points: 301, team: 'Ferrari', teamColor: '#DC143C' },
  ];

  return (
    <WidgetCard>
      <VStack align="start" spacing="md">
        <Heading color="brand.red" size="md" fontFamily="heading">
          Championship Standings
        </Heading>
        
        <VStack align="stretch" spacing="sm" w="full">
          {standings.map(({ position, driver, points, team, teamColor }) => (
            <HStack key={position} spacing="md" align="center" p="sm" borderRadius="md" bg="whiteAlpha.50">
              <Box
                w="8px"
                h="8px"
                borderRadius="full"
                bg={teamColor}
                flexShrink={0}
              />
              <Text color="text-primary" fontWeight="bold" fontSize="sm" minW="20px">
                {position}.
              </Text>
              <VStack align="start" spacing="xs" flex="1">
                <Text color="text-primary" fontSize="sm" fontWeight="600">
                  {driver}
                </Text>
                <Text color="text-muted" fontSize="xs">
                  {team}
                </Text>
              </VStack>
              <Text color="brand.red" fontSize="sm" fontWeight="bold" fontFamily="mono">
                {points} pts
              </Text>
            </HStack>
          ))}
        </VStack>
      </VStack>
    </WidgetCard>
  );
}

export default StandingsWidget;
