import { Heading, Text, VStack, HStack, Box, Image, Spinner, Button } from '@chakra-ui/react';
import { UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import WidgetCard from './WidgetCard';
import { useUserProfile } from '../../../hooks/useUserProfile';
import { driverHeadshots } from '../../../lib/driverHeadshots';
import { getTeamColor } from '../../../lib/teamColors';
import { useMemo } from 'react';
import { useThemeColor } from '../../../context/ThemeColorContext';
import { useDashboardSharedData } from '../../../context/DashboardDataContext';

function FavoriteDriverSnapshotWidget() {
  const { favoriteDriver, loading, error } = useUserProfile();
  const { accentColorWithHash } = useThemeColor();
  const { driverStandings } = useDashboardSharedData();

  // Find the favorite driver's current season stats from shared data
  const driverStats = useMemo(() => {
    if (!favoriteDriver) return null;
    
    const favId = Number((favoriteDriver as any).id);
    const fullName =
      (favoriteDriver as any).full_name ||
      (favoriteDriver as any).fullName ||
      [
        (favoriteDriver as any).first_name,
        (favoriteDriver as any).last_name
      ].filter(Boolean).join(' ');
    
    return driverStandings.find((d) =>
      d.id === favId || d.fullName === fullName
    ) || null;
  }, [favoriteDriver, driverStandings]);

  if (loading) {
    return (
      <WidgetCard>
        <VStack align="start" spacing="md">
          <Heading color={accentColorWithHash} size="md" fontFamily="heading">
            Favorite Driver
          </Heading>
          <HStack spacing="md" align="center" justify="center" w="full" h="100px">
            <Spinner color={accentColorWithHash} size="md" />
            <Text color="text-muted" fontSize="sm">Loading...</Text>
          </HStack>
        </VStack>
      </WidgetCard>
    );
  }

  if (error || !favoriteDriver) {
    return (
      <WidgetCard>
        <VStack align="start" spacing="md">
          <Heading color={accentColorWithHash} size="md" fontFamily="heading">
            Favorite Driver
          </Heading>
          
          <VStack align="center" spacing="md" w="full" py="lg">
            <Box
              w="60px"
              h="60px"
              borderRadius="full"
              bg="bg-subtle"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <UserPlus size={24} color="var(--chakra-colors-text-muted)" />
            </Box>
            
            <VStack align="center" spacing="sm">
              <Text color="text-muted" fontSize="sm" textAlign="center">
                No favorite driver set
              </Text>
              <Button as={Link} to="/profile" size="sm" variant="outline" borderColor={accentColorWithHash} color={accentColorWithHash} _hover={{ bg: accentColorWithHash, color: 'text-on-accent' }}>
                Select Driver
              </Button>
            </VStack>
          </VStack>
        </VStack>
      </WidgetCard>
    );
  }

  const driverFullName =
    (favoriteDriver as any).full_name ||
    (favoriteDriver as any).fullName ||
    [
      (favoriteDriver as any).first_name,
      (favoriteDriver as any).last_name
    ].filter(Boolean).join(' ');

  const teamName = (favoriteDriver as any).team_name || (favoriteDriver as any).teamName || '';

  const driverImage =
    driverHeadshots[driverFullName] ||
    (favoriteDriver as any).headshotUrl ||
    'https://media.formula1.com/content/dam/fom-website/drivers/placeholder.png.transform/2col-retina/image.png';
  const teamColorHex = getTeamColor(teamName, { hash: true });

  

  return (
    <WidgetCard>
      <VStack align="start" spacing="md">
        <Heading color={accentColorWithHash} size="md" fontFamily="heading">
          Favorite Driver
        </Heading>
        
        <HStack spacing="md" align="start" w="full">
          <Box
            w="60px"
            h="60px"
            minW="60px"
            minH="60px"
            borderRadius="full"
            overflow="hidden"
            border="2px solid"
            borderColor={teamColorHex}
            flexShrink={0}
          >
            <Image
              src={driverImage}
              alt={driverFullName}
              width="60px"
              height="60px"
              w="full"
              h="full"
              objectFit="cover"
              loading="eager"
              decoding="async"
              fallbackSrc="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
            />
          </Box>
          
          <VStack align="start" spacing="xs" flex="1">
            <Text color="text-primary" fontSize="lg" fontWeight="bold">
              {driverFullName}
            </Text>
            <Text color="text-secondary" fontSize="sm">
              {teamName}
            </Text>
            
            <VStack align="start" spacing="xs" mt="sm">
              <HStack spacing="md">
                <Text color={accentColorWithHash} fontSize="sm" fontWeight="bold">
                  #{(favoriteDriver as any).driver_number || (favoriteDriver as any).driverNumber || 'N/A'}
                </Text>
                <Text color="text-muted" fontSize="sm">
                  {(favoriteDriver as any).country_code || (favoriteDriver as any).countryCode || 'N/A'}
                </Text>
              </HStack>
              <Text color="text-muted" fontSize="xs">
                Driver Number
              </Text>
            </VStack>

            <Button as={Link} to="/profile" size="xs" mt="sm" variant="outline" borderColor={accentColorWithHash} color={accentColorWithHash} _hover={{ bg: accentColorWithHash, color: 'text-on-accent' }}>
              Change Driver
            </Button>
          </VStack>
        </HStack>
        
        {/* Points summary (mirrors Favorite Team styling) */}
        <VStack align="start" spacing="xs" mt="sm" w="full">
          <HStack spacing="md" justify="space-between" w="full">
            <Text color={accentColorWithHash} fontSize="lg" fontWeight="bold" fontFamily="mono">
              {driverStats?.points !== undefined ? `${driverStats.points} pts` : '—'}
            </Text>
            <Text color="text-muted" fontSize="sm">
              {driverStats?.position ? `P${driverStats.position}` : ''}
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
              w={driverStats?.position ? `${Math.max(10, 100 - (driverStats.position - 1) * 4)}%` : '0%'}
              h="full"
              bg={teamColorHex}
              borderRadius="full"
            />
          </Box>
        </VStack>
      </VStack>
    </WidgetCard>
  );
}

export default FavoriteDriverSnapshotWidget;
