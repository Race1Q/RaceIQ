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
        <VStack align="start" spacing="xs">
          <Heading color={accentColorWithHash} size="sm" fontFamily="heading">
            Championship Standings
          </Heading>
          <Text color="text-muted" fontSize="xs">Loading...</Text>
        </VStack>
      </WidgetCard>
    );
  }

  // Take top 5 standings for the widget
  const topStandings = data.slice(0, 5);

  return (
    <WidgetCard>
      <VStack align="start" spacing="0" w="full">
        <Heading color={accentColorWithHash} size="sm" fontFamily="heading" mb="2">
          Championship Standings
        </Heading>
        
        <VStack align="stretch" spacing="1" w="full">
          {topStandings.map((item) => {
            const teamColor = teamColors[item.constructorName] || teamColors['Default'];
            return (
              <HStack key={item.position} spacing="2" align="center" py="1" px="2" borderRadius="md" bg="whiteAlpha.50">
                <Box
                  w="5px"
                  h="5px"
                  borderRadius="full"
                  bg={`#${teamColor}`}
                  flexShrink={0}
                />
                <Text color="text-primary" fontWeight="bold" fontSize="xs" minW="14px">
                  {item.position}.
                </Text>
                <VStack align="start" spacing="0" flex="1" minW="0">
                  <Text color="text-primary" fontSize="xs" fontWeight="600" noOfLines={1}>
                    {item.driverFullName}
                  </Text>
                  <Text color="text-muted" fontSize="2xs" noOfLines={1}>
                    {item.constructorName}
                  </Text>
                </VStack>
                <Text color={accentColorWithHash} fontSize="2xs" fontWeight="bold" fontFamily="mono" flexShrink={0}>
                  {item.points}
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
