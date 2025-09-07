import { Heading, Text, VStack, HStack, Box, Image, Spinner, Button, IconButton } from '@chakra-ui/react';
import { UserPlus, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import WidgetCard from './WidgetCard';
import { useUserProfile } from '../../../hooks/useUserProfile';
import { driverHeadshots } from '../../../lib/driverHeadshots';
import { teamColors } from '../../../lib/teamColors';

function FavoriteDriverSnapshotWidget() {
  const { favoriteDriver, loading, error, refetch } = useUserProfile();

  if (loading) {
    return (
      <WidgetCard>
        <VStack align="start" spacing="md">
          <Heading color="brand.red" size="md" fontFamily="heading">
            Favorite Driver
          </Heading>
          <HStack spacing="md" align="center" justify="center" w="full" h="100px">
            <Spinner color="brand.red" size="md" />
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
          <Heading color="brand.red" size="md" fontFamily="heading">
            Favorite Driver
          </Heading>
          
          <VStack align="center" spacing="md" w="full" py="lg">
            <Box
              w="60px"
              h="60px"
              borderRadius="full"
              bg="whiteAlpha.100"
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
              <Button
                as={Link}
                to="/profile"
                size="sm"
                variant="outline"
                borderColor="brand.red"
                color="brand.red"
                _hover={{ bg: 'brand.red', color: 'white' }}
              >
                Set Favorite
              </Button>
            </VStack>
          </VStack>
        </VStack>
      </WidgetCard>
    );
  }

  const driverImage = driverHeadshots[favoriteDriver.full_name] || '';
  const teamColor = teamColors[favoriteDriver.team_name] || teamColors['Default'];

  return (
    <WidgetCard>
      <VStack align="start" spacing="md">
        <HStack justify="space-between" align="center" w="full">
          <Heading color="brand.red" size="md" fontFamily="heading">
            Favorite Driver
          </Heading>
          <IconButton
            aria-label="Refresh favorite driver"
            icon={<RefreshCw size={16} />}
            size="sm"
            variant="ghost"
            color="text-muted"
            _hover={{ color: 'brand.red' }}
            onClick={refetch}
            isLoading={loading}
          />
        </HStack>
        
        <HStack spacing="md" align="start" w="full">
          <Box
            w="60px"
            h="60px"
            borderRadius="full"
            overflow="hidden"
            border="2px solid"
            borderColor={`#${teamColor}`}
            flexShrink={0}
          >
            <Image
              src={driverImage}
              alt={favoriteDriver.full_name}
              w="full"
              h="full"
              objectFit="cover"
              fallbackSrc="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
            />
          </Box>
          
          <VStack align="start" spacing="xs" flex="1">
            <Text color="text-primary" fontSize="lg" fontWeight="bold">
              {favoriteDriver.full_name}
            </Text>
            <Text color="text-secondary" fontSize="sm">
              {favoriteDriver.team_name}
            </Text>
            
            <VStack align="start" spacing="xs" mt="sm">
              <HStack spacing="md">
                <Text color="brand.red" fontSize="sm" fontWeight="bold">
                  #{favoriteDriver.driver_number || 'N/A'}
                </Text>
                <Text color="text-muted" fontSize="sm">
                  {favoriteDriver.country_code || 'N/A'}
                </Text>
              </HStack>
              <Text color="text-muted" fontSize="xs">
                Driver Number
              </Text>
            </VStack>
          </VStack>
        </HStack>
      </VStack>
    </WidgetCard>
  );
}

export default FavoriteDriverSnapshotWidget;
