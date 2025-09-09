import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  Text,
  VStack,
  Spinner,
  Alert,
  AlertIcon,
  Flex,
  Button,
} from '@chakra-ui/react';
import { useApi } from '@/hooks/useApi';

interface ApiDriver {
  id: number;
  full_name: string;
  driver_number: number | null;
  country_code: string | null;
  team_name: string;
}

const FeaturedDriverSection: React.FC = () => {
  const { authedFetch } = useApi();
  const [driver, setDriver] = useState<ApiDriver | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await authedFetch<ApiDriver[]>(`/api/drivers/by-standings/2025`);
        if (!Array.isArray(data) || data.length === 0) throw new Error('No driver data returned.');
        if (isMounted) setDriver(data[0]);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load featured driver.';
        if (isMounted) setError(message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchFeatured();
    return () => {
      isMounted = false;
    };
  }, [authedFetch]);

  if (loading) {
    return (
      <Box bg="bg-secondary">
        <Container maxW="1400px" py={{ base: 'lg', md: 'xl' }} px={{ base: 'md', lg: 'lg' }}>
          <Flex justify="center" p="xl">
            <Spinner size="lg" color="brand.red" />
          </Flex>
        </Container>
      </Box>
    );
  }

  if (error || !driver) {
    return (
      <Box bg="bg-secondary">
        <Container maxW="1400px" py={{ base: 'lg', md: 'xl' }} px={{ base: 'md', lg: 'lg' }}>
          <Alert status="error">
            <AlertIcon />
            {error || 'Driver data could not be found.'}
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg="whiteAlpha.50">
      <Container maxW="1400px" py={{ base: 'lg', md: 'xl' }} px={{ base: 'md', lg: 'lg' }}>
        <Grid templateColumns={{ base: '1fr', lg: '1.2fr 2fr' }} gap={{ base: 6, lg: 12 }} alignItems="center">
          <GridItem>
            <VStack align="center" spacing={2} bg="bg-surface-raised" border="1px solid" borderColor="border-primary" borderRadius="lg" p="lg">
              <Text color="text-muted" fontSize="sm">Featured Driver</Text>
              <Heading as="h3" size="lg" color="text-primary">{driver.full_name}</Heading>
              <Text color="text-secondary" fontSize="md">{driver.team_name} {driver.driver_number ? `• #${driver.driver_number}` : ''}</Text>
              <Text color="text-muted" fontSize="sm">Country: {driver.country_code || 'N/A'}</Text>
            </VStack>
          </GridItem>
          <GridItem>
            <VStack align="flex-start" spacing={4}>
              <Heading as="h2" size="xl" color="text-primary" fontFamily="heading">Championship Leader</Heading>
              <Text color="text-secondary" fontSize="lg">{driver.full_name} currently leads the 2025 standings.</Text>
              <Button bg="brand.red" color="white" _hover={{ bg: 'brand.redDark' }} _active={{ bg: 'brand.redDark' }}>
                View Drivers
              </Button>
            </VStack>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
};

export default FeaturedDriverSection;


