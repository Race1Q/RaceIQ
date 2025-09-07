import { Heading, Text, VStack, HStack, Box, Image } from '@chakra-ui/react';
import WidgetCard from './WidgetCard';
import { driverHeadshots } from '../../../lib/driverHeadshots';
import { teamColors } from '../../../lib/teamColors';
import { getTeamLogo } from '../../../lib/teamAssets';

function HeadToHeadQuickCompareWidget() {
  // Using real driver data with proper headshots and team logos
  const driver1 = {
    name: "Lando Norris",
    team: "McLaren",
    teamColor: teamColors["McLaren"] || teamColors['Default'],
    teamLogo: getTeamLogo("McLaren"),
    image: driverHeadshots["Lando Norris"] || '',
    wins: 5,
    podiums: 15
  };

  const driver2 = {
    name: "Oscar Piastri", 
    team: "McLaren",
    teamColor: teamColors["McLaren"] || teamColors['Default'],
    teamLogo: getTeamLogo("McLaren"),
    image: driverHeadshots["Oscar Piastri"] || '',
    wins: 2,
    podiums: 8
  };

  return (
    <WidgetCard>
      <VStack align="start" spacing="md">
        <Heading color="brand.red" size="md" fontFamily="heading">
          Head to Head
        </Heading>
        
        <HStack spacing="lg" align="center" w="full" justify="space-between">
          {/* Driver 1 */}
          <VStack spacing="sm" align="center" flex="1">
            <Box
              w="60px"
              h="60px"
              borderRadius="full"
              overflow="hidden"
              border="2px solid"
              borderColor={`#${driver1.teamColor}`}
            >
              <Image
                src={driver1.image}
                alt={driver1.name}
                w="full"
                h="full"
                objectFit="cover"
                fallbackSrc="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
              />
            </Box>
            
            <VStack spacing="xs" align="center">
              <Text color="text-primary" fontSize="sm" fontWeight="bold" textAlign="center">
                {driver1.name}
              </Text>
              <HStack spacing="xs" align="center">
                <Box w="12px" h="12px" borderRadius="sm" overflow="hidden" bg="whiteAlpha.100">
                  <Image
                    src={driver1.teamLogo}
                    alt={`${driver1.team} Logo`}
                    w="full"
                    h="full"
                    objectFit="contain"
                    p="1px"
                  />
                </Box>
                <Text color="text-secondary" fontSize="xs" textAlign="center">
                  {driver1.team}
                </Text>
              </HStack>
            </VStack>
            
            <VStack spacing="xs" align="center">
              <Text color="brand.red" fontSize="sm" fontWeight="bold">
                Wins: {driver1.wins}
              </Text>
              <Text color="text-muted" fontSize="xs">
                Podiums: {driver1.podiums}
              </Text>
            </VStack>
          </VStack>
          
          {/* VS */}
          <VStack spacing="xs" align="center">
            <Text color="brand.red" fontSize="2xl" fontWeight="bold" fontFamily="heading">
              VS
            </Text>
            <Box
              w="2px"
              h="40px"
              bg="brand.red"
              borderRadius="full"
            />
          </VStack>
          
          {/* Driver 2 */}
          <VStack spacing="sm" align="center" flex="1">
            <Box
              w="60px"
              h="60px"
              borderRadius="full"
              overflow="hidden"
              border="2px solid"
              borderColor={`#${driver2.teamColor}`}
            >
              <Image
                src={driver2.image}
                alt={driver2.name}
                w="full"
                h="full"
                objectFit="cover"
                fallbackSrc="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
              />
            </Box>
            
            <VStack spacing="xs" align="center">
              <Text color="text-primary" fontSize="sm" fontWeight="bold" textAlign="center">
                {driver2.name}
              </Text>
              <HStack spacing="xs" align="center">
                <Box w="12px" h="12px" borderRadius="sm" overflow="hidden" bg="whiteAlpha.100">
                  <Image
                    src={driver2.teamLogo}
                    alt={`${driver2.team} Logo`}
                    w="full"
                    h="full"
                    objectFit="contain"
                    p="1px"
                  />
                </Box>
                <Text color="text-secondary" fontSize="xs" textAlign="center">
                  {driver2.team}
                </Text>
              </HStack>
            </VStack>
            
            <VStack spacing="xs" align="center">
              <Text color="brand.red" fontSize="sm" fontWeight="bold">
                Wins: {driver2.wins}
              </Text>
              <Text color="text-muted" fontSize="xs">
                Podiums: {driver2.podiums}
              </Text>
            </VStack>
          </VStack>
        </HStack>
      </VStack>
    </WidgetCard>
  );
}

export default HeadToHeadQuickCompareWidget;
