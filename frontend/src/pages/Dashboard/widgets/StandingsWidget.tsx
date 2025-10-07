import { Heading, Text, VStack, HStack, Box } from '@chakra-ui/react';
import type { StandingsItem } from '../../../types';
import { teamColors } from '../../../lib/teamColors';
import WidgetCard from './WidgetCard';
import { useThemeColor } from '../../../context/ThemeColorContext';

interface StandingsWidgetProps {
  data?: StandingsItem[];
}

function StandingsWidget({ data }: StandingsWidgetProps) {
  const { accentColorWithHash } = useThemeColor();
  
  if (!data || data.length === 0) {
    return (
      <WidgetCard>
        <VStack align="start" spacing="md">
          <Heading color={accentColorWithHash} size="md" fontFamily="heading">
            Championship Standings
          </Heading>
          <Text color="text-muted">Loading...</Text>
        </VStack>
      </WidgetCard>
    );
  }

  // Take top 5 standings for the widget
  const topStandings = data.slice(0, 5);

  return (
    <WidgetCard>
      <VStack align="start" spacing="md">
        <Heading color={accentColorWithHash} size="md" fontFamily="heading">
          Championship Standings
        </Heading>
        
        <VStack align="stretch" spacing="sm" w="full">
          {topStandings.map((item) => {
            const teamColor = teamColors[item.constructorName] || teamColors['Default'];
            return (
              <HStack key={item.position} spacing="md" align="center" p="sm" borderRadius="md" bg="whiteAlpha.50">
                <Box
                  w="8px"
                  h="8px"
                  borderRadius="full"
                  bg={`#${teamColor}`}
                  flexShrink={0}
                />
                <Text color="text-primary" fontWeight="bold" fontSize="sm" minW="20px">
                  {item.position}.
                </Text>
                <VStack align="start" spacing="xs" flex="1">
                  <Text color="text-primary" fontSize="sm" fontWeight="600">
                    {item.driverFullName}
                  </Text>
                  <Text color="text-muted" fontSize="xs">
                    {item.constructorName}
                  </Text>
                </VStack>
                <Text color={accentColorWithHash} fontSize="sm" fontWeight="bold" fontFamily="mono">
                  {item.points} pts
                </Text>
              </HStack>
            );
          })}
        </VStack>
      </VStack>
    </WidgetCard>
  );
}

export default StandingsWidget;
