import { Heading, Text, VStack, HStack, Box, Image, Spinner, Button } from '@chakra-ui/react';
import { Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import WidgetCard from './WidgetCard';
import { useUserProfile } from '../../../hooks/useUserProfile';
import { teamColors } from '../../../lib/teamColors';
import { getTeamLogo } from '../../../lib/teamAssets';

function FavoriteTeamSnapshotWidget() {
  const { favoriteConstructor, loading, error } = useUserProfile();
  
  // Debug logging
  console.log('🏎️ [FavoriteTeamWidget] State:', { favoriteConstructor, loading, error });

  if (loading) {
    return (
      <WidgetCard>
        <VStack align="start" spacing="md">
          <Heading color="brand.red" size="md" fontFamily="heading">
            Favorite Team
          </Heading>
          <HStack spacing="md" align="center" justify="center" w="full" h="100px">
            <Spinner color="brand.red" size="md" />
            <Text color="text-muted" fontSize="sm">Loading...</Text>
          </HStack>
        </VStack>
      </WidgetCard>
    );
  }

  if (error || !favoriteConstructor) {
    return (
      <WidgetCard>
        <VStack align="start" spacing="md">
          <Heading color="brand.red" size="md" fontFamily="heading">
            Favorite Team
          </Heading>
          
          <VStack align="center" spacing="md" w="full" py="lg">
            <Box
              w="50px"
              h="50px"
              borderRadius="md"
              bg="whiteAlpha.100"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Building2 size={24} color="var(--chakra-colors-text-muted)" />
            </Box>
            
            <VStack align="center" spacing="sm">
              <Text color="text-muted" fontSize="sm" textAlign="center">
                No favorite team set
              </Text>
              <Button as={Link} to="/profile" size="sm" variant="outline" borderColor="brand.red" color="brand.red" _hover={{ bg: 'brand.red', color: 'white' }}>
                Select Constructor
              </Button>
            </VStack>
          </VStack>
        </VStack>
      </WidgetCard>
    );
  }

  const teamName = favoriteConstructor.name;
  const teamColor = teamColors[teamName] || teamColors['Default'];
  const teamLogo = getTeamLogo(teamName);
  
  return (
    <WidgetCard>
      <VStack align="start" spacing="md">
        <Heading color="brand.red" size="md" fontFamily="heading">
          Favorite Team
        </Heading>
        
        <VStack align="start" spacing="md" w="full">
          <HStack spacing="md" align="center" w="full">
            <Box
              w="50px"
              h="50px"
              borderRadius="md"
              overflow="hidden"
              border="2px solid"
              borderColor={`#${teamColor}`}
              flexShrink={0}
              bg="whiteAlpha.100"
            >
              <Image
                src={teamLogo}
                alt={`${teamName} Logo`}
                w="full"
                h="full"
                objectFit="contain"
                p="1"
                fallbackSrc="/assets/placeholder.svg"
              />
            </Box>
            
            <VStack align="start" spacing="xs" flex="1">
              <Text color="text-primary" fontSize="lg" fontWeight="bold">
                {teamName}
              </Text>
              <Text color="text-secondary" fontSize="sm">
                Constructor's Championship
              </Text>
            <Button as={Link} to="/profile" size="xs" mt="sm" variant="outline" borderColor="brand.red" color="brand.red" _hover={{ bg: 'brand.red', color: 'white' }}>
              Select Constructor
            </Button>
            </VStack>
          </HStack>
          
          <VStack align="start" spacing="xs" w="full">
            <HStack spacing="md" justify="space-between" w="full">
              <Text color="brand.red" fontSize="lg" fontWeight="bold" fontFamily="mono">
                600 pts
              </Text>
              <Text color="text-muted" fontSize="sm">
                P2
              </Text>
            </HStack>
            
            <Box
              w="full"
              h="4px"
              bg="whiteAlpha.200"
              borderRadius="full"
              overflow="hidden"
            >
              <Box
                w="75%"
                h="full"
                bg={`#${teamColor}`}
                borderRadius="full"
              />
            </Box>
          </VStack>
        </VStack>
      </VStack>
    </WidgetCard>
  );
}

export default FavoriteTeamSnapshotWidget;
