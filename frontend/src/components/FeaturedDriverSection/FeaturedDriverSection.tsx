import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { 
  Box, 
  Container, 
  Grid, 
  GridItem,
  Image, 
  Heading, 
  Text, 
  Button, 
  VStack, 
  SimpleGrid, 
  Flex, 
  Spinner,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { f1ApiService, type FeaturedDriver } from '../../services/f1Api';

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
        
        const featuredDriver = await f1ApiService.getFeaturedDriver(2024);
        setDriver(featuredDriver);
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
          <Alert status="error">
            <AlertIcon />
            {error || 'Driver data could not be found.'}
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box 
      bg="whiteAlpha.50" 
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
        <Grid templateColumns={{ base: '1fr', lg: '1.5fr 2fr' }} gap={{ base: 6, lg: 12 }} alignItems="center">
          {/* GridItem 1: The Image (now on the left) */}
          <GridItem>
            <Flex justify="center" align="center">
              <Box position="relative">
                {/* Define the clip path reusable value */}
                {(() => {
                  const rhombusClipPath = 'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)';
                  
                  return (
                    <Box
                      position="relative"
                      w={{ base: '280px', md: '350px', lg: '400px' }}
                      h={{ base: '300px', md: '375px', lg: '430px' }}
                      sx={{
                        clipPath: rhombusClipPath,
                        // Add a pseudo-element for the checkered border
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          // This gradient creates a checkered pattern
                          backgroundImage: `repeating-linear-gradient(
                            -45deg,
                            rgba(255, 255, 255, 0.8),
                            rgba(255, 255, 255, 0.8) 10px,
                            transparent 10px,
                            transparent 20px
                          )`,
                          zIndex: 1,
                        }
                      }}
                    >
                      <Image
                        src={driver.headshotUrl}
                        alt={driver.fullName}
                        objectFit="cover"
                        w="100%"
                        h="100%"
                        position="relative"
                        zIndex={2}
                        // Apply the same clip-path but inset slightly to reveal the border
                        sx={{ clipPath: rhombusClipPath }}
                      />
                    </Box>
                  );
                })()}
              </Box>
            </Flex>
          </GridItem>

          {/* GridItem 2: The Text/Stats (now on the right) */}
          <GridItem>
            <VStack align="flex-start" spacing={4}>
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
                {driver.fullName}
              </Heading>
              <Text 
                color="text-secondary" 
                fontSize="lg"
                fontWeight="medium"
              >
                {driver.teamName} • #{driver.driverNumber}
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
                  borderColor: 'brand.red'
                }}
              >
                <Text 
                  fontSize="4xl" 
                  fontWeight="bold" 
                  color="brand.red"
                  lineHeight="1"
                >
                  {driver.points}
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
                  borderColor: 'brand.red'
                }}
              >
                <Text 
                  fontSize="4xl" 
                  fontWeight="bold" 
                  color="brand.red"
                  lineHeight="1"
                >
                  {driver.wins}
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
                  borderColor: 'brand.red'
                }}
              >
                <Text 
                  fontSize="4xl" 
                  fontWeight="bold" 
                  color="brand.red"
                  lineHeight="1"
                >
                  {driver.podiums}
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
            <Flex justify="flex-start" mt="lg">
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
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
};

export default FeaturedDriverSection;
