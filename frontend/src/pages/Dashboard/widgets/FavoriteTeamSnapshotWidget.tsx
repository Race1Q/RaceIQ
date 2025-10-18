import { Heading, Text, VStack, HStack, Box, Image, Spinner, Button } from '@chakra-ui/react';
import { Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import WidgetCard from './WidgetCard';
import { useUserProfile } from '../../../hooks/useUserProfile';
import { teamColors } from '../../../lib/teamColors';
import { getTeamLogo } from '../../../lib/teamAssets';
import { useThemeColor } from '../../../context/ThemeColorContext';
import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
import { buildApiUrl } from '../../../lib/api';
import { useDashboardSharedData } from '../../../context/DashboardDataContext';

function FavoriteTeamSnapshotWidget() {
  const { favoriteConstructor, loading, error } = useUserProfile();
  const { getAccessTokenSilently } = useAuth0();
  const { accentColorWithHash } = useThemeColor();
  const { seasons } = useDashboardSharedData();
  const [points, setPoints] = useState<number | null>(null);
  const [position, setPosition] = useState<number | null>(null);

  // Fetch current season points for the favorite constructor using shared seasons data
  useEffect(() => {
    const fetchPoints = async () => {
      try {
        if (!favoriteConstructor || seasons.length === 0) return;
        const season = new Date().getFullYear();
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          },
        });
        const constructorId = (favoriteConstructor as any).id;
        
        // Use shared seasons data to find season ID
        const targetSeason = seasons.find((s: any) => s.year === season);
        
        if (!targetSeason) {
          return;
        }
        
        // Fetch season points for this specific constructor
        const response = await fetch(
          buildApiUrl(`/api/race-results/constructor/${constructorId}/season-points`),
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        if (!response.ok) {
          return;
        }
        
        const seasonPoints = await response.json();
        
        const currentSeasonData = seasonPoints.find((sp: any) => sp.season === targetSeason.id);
        
        if (currentSeasonData) {
          const points = Number(currentSeasonData.points || 0);
          
          // For position, we need to get all constructors and sort them
          // For now, let's just set the points and leave position as null
          setPoints(points);
          setPosition(null); // We'll calculate this later if needed
        }
      } catch {
        // Error is non-critical
      }
    };

    fetchPoints();
  }, [favoriteConstructor, getAccessTokenSilently, seasons]);

  if (loading) {
    return (
      <WidgetCard>
        <VStack align="start" spacing="md">
          <Heading color={accentColorWithHash} size="md" fontFamily="heading">
            Favorite Team
          </Heading>
          <HStack spacing="md" align="center" justify="center" w="full" h="100px">
            <Spinner color={accentColorWithHash} size="md" />
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
          <Heading color={accentColorWithHash} size="md" fontFamily="heading">
            Favorite Team
          </Heading>
          
          <VStack align="center" spacing="md" w="full" py="lg">
            <Box
              w="50px"
              h="50px"
              borderRadius="md"
              bg="bg-subtle"
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
              <Button as={Link} to="/profile" size="sm" variant="outline" borderColor={accentColorWithHash} color={accentColorWithHash} _hover={{ bg: accentColorWithHash, color: 'text-on-accent' }}>
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
        <Heading color={accentColorWithHash} size="md" fontFamily="heading">
          Favorite Team
        </Heading>
        
        <VStack align="start" spacing="md" w="full">
          <HStack spacing="md" align="center" w="full">
            <Box
              w="50px"
              h="50px"
              minW="50px"
              minH="50px"
              borderRadius="md"
              overflow="hidden"
              border="2px solid"
              borderColor={`#${teamColor}`}
              flexShrink={0}
              bg="bg-subtle"
            >
              <Image
                src={teamLogo}
                alt={`${teamName} Logo`}
                width="50px"
                height="50px"
                w="full"
                h="full"
                objectFit="contain"
                loading="eager"
                decoding="async"
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
            <Button as={Link} to="/profile" size="xs" mt="sm" variant="outline" borderColor={accentColorWithHash} color={accentColorWithHash} _hover={{ bg: accentColorWithHash, color: 'text-on-accent' }}>
              Change Team
            </Button>
            </VStack>
          </HStack>
          
          <VStack align="start" spacing="xs" w="full">
            <HStack spacing="md" justify="space-between" w="full">
              <Text color={accentColorWithHash} fontSize="lg" fontWeight="bold" fontFamily="mono">
                {points !== null ? `${points} pts` : '—'}
              </Text>
              <Text color="text-muted" fontSize="sm">
                {position ? `P${position}` : ''}
              </Text>
            </HStack>
            
            <Box
              w="full"
              h="4px"
              bg="bg-subtle"
              borderRadius="full"
              overflow="hidden"
            >
              <Box
                w={position ? `${Math.max(10, 100 - (position - 1) * 10)}%` : '0%'}
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
