import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { 
  Box, 
  Container, 
  Grid, 
  Image, 
  Heading, 
  Text, 
  Button, 
  VStack, 
  SimpleGrid, 
  Flex, 
  Spinner
} from '@chakra-ui/react';

// Interface for the featured driver data
interface FeaturedDriver {
  id: number;
  full_name: string;
  driver_number: number;
  country_code: string;
  team_name: string;
  headshot_url: string;
  team_color: string;
  stats: {
    wins: number;
    podiums: number;
    points: number;
  };
}

const FeaturedDriverSection: React.FC = () => {
  const { loginWithRedirect } = useAuth0();
  const [driver, setDriver] = useState<FeaturedDriver | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('FeaturedDriverSection component rendered');

  useEffect(() => {
    const fetchFeaturedDriver = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // For now, use mock data since the API endpoint might not exist yet
        const mockDriver: FeaturedDriver = {
          id: 1,
          full_name: "Max Verstappen",
          driver_number: 1,
          country_code: "NL",
          team_name: "Red Bull Racing",
          headshot_url: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png.transform/2col-retina/image.png",
          team_color: "#3671C6",
          stats: {
            wins: 19,
            podiums: 22,
            points: 575
          }
        };
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setDriver(mockDriver);
        
        // Uncomment this when the API endpoint is ready:
        /*
        const response = await fetch(buildApiUrl('/api/drivers/standings/top/2025'));
        
        if (!response.ok) {
          throw new Error(`Failed to fetch featured driver: ${response.status} ${response.statusText}`);
        }
        
        const driverData = await response.json();
        setDriver(driverData);
        */
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(errorMessage);
        console.error('Error fetching featured driver:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedDriver();
  }, []);

  if (loading) {
    return (
      <Box 
        bg="bg-secondary" 
        position="relative"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M10 10 Q50 5 90 10 Q95 50 90 90 Q50 95 10 90 Q5 50 10 10" stroke="%23ff0000" stroke-width="0.5" fill="none" opacity="0.05"/%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
          opacity: 0.05,
          zIndex: 0,
        }}
      >
        <Container maxW="1400px" py={{ base: 'lg', md: 'xl' }} px={{ base: 'md', lg: 'lg' }} position="relative" zIndex={1}>
          <Flex justify="center" p="xl">
            <Spinner size="lg" color="brand.red" />
          </Flex>
        </Container>
      </Box>
    );
  }

  if (error || !driver) {
    // Show a fallback message for debugging
    return (
      <Box 
        bg="bg-secondary" 
        position="relative"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M10 10 Q50 5 90 10 Q95 50 90 90 Q50 95 10 90 Q5 50 10 10" stroke="%23ff0000" stroke-width="0.5" fill="none" opacity="0.05"/%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
          opacity: 0.05,
          zIndex: 0,
        }}
      >
        <Container maxW="1400px" py={{ base: 'lg', md: 'xl' }} px={{ base: 'md', lg: 'lg' }} position="relative" zIndex={1}>
          <Text color="text-primary" textAlign="center">
            Featured Driver Section - No data available
          </Text>
        </Container>
      </Box>
    );
  }

  return (
    <Box 
      bg="bg-secondary" 
      position="relative"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M10 10 Q50 5 90 10 Q95 50 90 90 Q50 95 10 90 Q5 50 10 10" stroke="%23ff0000" stroke-width="0.5" fill="none" opacity="0.05"/%3E%3C/svg%3E")',
        backgroundRepeat: 'repeat',
        backgroundSize: '200px 200px',
        opacity: 0.05,
        zIndex: 0,
      }}
    >
      <Container maxW="1400px" py={{ base: 'lg', md: 'xl' }} px={{ base: 'md', lg: 'lg' }} position="relative" zIndex={1}>
        <Grid templateColumns={{ base: '1fr', lg: '1fr 2fr' }} gap="lg" alignItems="center">
          {/* Left Column - Driver Image */}
          <Flex justify="center" align="center">
            <Box position="relative">
              <Box
                position="relative"
                borderRadius="full"
                overflow="hidden"
                w={{ base: '200px', md: '250px' }}
                h={{ base: '200px', md: '250px' }}
                _after={{
                  content: '""',
                  position: 'absolute',
                  top: '-10px',
                  left: '-10px',
                  right: '-10px',
                  bottom: '-10px',
                  borderRadius: 'full',
                  background: `linear-gradient(135deg, ${driver.team_color}40, ${driver.team_color}20)`,
                  zIndex: -1,
                }}
              >
                <Image
                  src={driver.headshot_url}
                  alt={`${driver.full_name} headshot`}
                  w="100%"
                  h="100%"
                  objectFit="cover"
                  borderRadius="full"
                  border="4px solid"
                  borderColor="white"
                  boxShadow="lg"
                />
              </Box>
            </Box>
          </Flex>

          {/* Right Column - Driver Information */}
          <VStack align="stretch" spacing="md">
            {/* Header */}
            <VStack align="flex-start" spacing="sm">
              <Text 
                color="brand.red" 
                fontWeight="bold" 
                fontSize="sm" 
                textTransform="uppercase" 
                letterSpacing="wide"
              >
                Driver Spotlight
              </Text>
              <Heading 
                as="h2" 
                size="xl" 
                color="text-primary"
                fontFamily="heading"
              >
                {driver.full_name}
              </Heading>
              <Text 
                color="text-secondary" 
                fontSize="lg"
                fontWeight="medium"
              >
                {driver.team_name} • #{driver.driver_number}
              </Text>
            </VStack>

            {/* Stats Display */}
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing="md" mt="md">
              <Box
                bg="bg-surface-raised"
                p="lg"
                borderRadius="lg"
                border="1px solid"
                borderColor="border-primary"
                textAlign="center"
                transition="all 0.3s ease"
                _hover={{ 
                  transform: 'translateY(-2px)', 
                  boxShadow: 'md',
                  borderColor: driver.team_color
                }}
              >
                <Text 
                  fontSize="4xl" 
                  fontWeight="bold" 
                  color="brand.red"
                  lineHeight="1"
                >
                  {driver.stats.points}
                </Text>
                <Text 
                  color="text-muted" 
                  fontSize="sm" 
                  fontWeight="medium"
                  textTransform="uppercase"
                  letterSpacing="wide"
                >
                  Points
                </Text>
              </Box>

              <Box
                bg="bg-surface-raised"
                p="lg"
                borderRadius="lg"
                border="1px solid"
                borderColor="border-primary"
                textAlign="center"
                transition="all 0.3s ease"
                _hover={{ 
                  transform: 'translateY(-2px)', 
                  boxShadow: 'md',
                  borderColor: driver.team_color
                }}
              >
                <Text 
                  fontSize="4xl" 
                  fontWeight="bold" 
                  color="brand.red"
                  lineHeight="1"
                >
                  {driver.stats.wins}
                </Text>
                <Text 
                  color="text-muted" 
                  fontSize="sm" 
                  fontWeight="medium"
                  textTransform="uppercase"
                  letterSpacing="wide"
                >
                  Wins
                </Text>
              </Box>

              <Box
                bg="bg-surface-raised"
                p="lg"
                borderRadius="lg"
                border="1px solid"
                borderColor="border-primary"
                textAlign="center"
                transition="all 0.3s ease"
                _hover={{ 
                  transform: 'translateY(-2px)', 
                  boxShadow: 'md',
                  borderColor: driver.team_color
                }}
              >
                <Text 
                  fontSize="4xl" 
                  fontWeight="bold" 
                  color="brand.red"
                  lineHeight="1"
                >
                  {driver.stats.podiums}
                </Text>
                <Text 
                  color="text-muted" 
                  fontSize="sm" 
                  fontWeight="medium"
                  textTransform="uppercase"
                  letterSpacing="wide"
                >
                  Podiums
                </Text>
              </Box>
            </SimpleGrid>

            {/* Call to Action */}
            <Flex justify="flex-end" mt="lg">
              <Button
                bg="brand.red"
                color="white"
                _hover={{ 
                  bg: 'brand.redDark',
                  transform: 'translateY(-2px)',
                  boxShadow: 'lg'
                }}
                _active={{ bg: 'brand.redDark' }}
                size="lg"
                fontFamily="heading"
                fontWeight="bold"
                px="xl"
                py="md"
                borderRadius="md"
                onClick={() => loginWithRedirect()}
                transition="all 0.3s ease"
              >
                View All Drivers & Stats
              </Button>
            </Flex>
          </VStack>
        </Grid>
      </Container>
    </Box>
  );
};

export default FeaturedDriverSection;
