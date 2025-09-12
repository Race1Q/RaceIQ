// frontend/src/components/ComparePreviewSection/ComparePreviewSection.tsx

import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Crown } from 'lucide-react';
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
  Flex, 
  Spinner
} from '@chakra-ui/react';

// Interface for comparison driver data
interface ComparisonDriver {
  fullName: string;
  teamName: string;
  imageUrl: string;
  teamColorToken: string;
  stats: {
    fastestLap: string;
    fastestLapRank: number;
    championships: number;
    championshipsRank: number;
  };
}

interface ComparisonData {
  driver1: ComparisonDriver;
  driver2: ComparisonDriver;
}

const ComparePreviewSection: React.FC = () => {
  const { loginWithRedirect } = useAuth0();
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to convert lap time to seconds for comparison
  const timeToSeconds = (timeString: string): number => {
    const [minutes, seconds] = timeString.split(':');
    return parseInt(minutes) * 60 + parseFloat(seconds);
  };

  // Helper function to calculate bar width for "higher is better" stats
  const calculateHigherIsBetterBarWidth = (value1: number, value2: number, currentValue: number): number => {
    const maxValue = Math.max(value1, value2);
    return (currentValue / maxValue) * 100;
  };

  // Helper function to calculate bar width for "lower is better" stats (like lap times)
  const calculateLowerIsBetterBarWidth = (time1: string, time2: string, currentTime: string): number => {
    const time1Seconds = timeToSeconds(time1);
    const time2Seconds = timeToSeconds(time2);
    const currentTimeSeconds = timeToSeconds(currentTime);
    const bestTime = Math.min(time1Seconds, time2Seconds);
    return (bestTime / currentTimeSeconds) * 100;
  };

  // Winner determination logic
  const getWinners = () => {
    if (!comparisonData) return { fastestLap: null, championships: null };
    
    const { driver1, driver2 } = comparisonData;
    
    // For fastest lap, lower time is better
    const driver1LapSeconds = timeToSeconds(driver1.stats.fastestLap);
    const driver2LapSeconds = timeToSeconds(driver2.stats.fastestLap);
    const fastestLapWinner = driver1LapSeconds < driver2LapSeconds ? 'driver1' : 'driver2';
    
    // For championships, higher number is better
    const championshipsWinner = driver1.stats.championships > driver2.stats.championships ? 'driver1' : 'driver2';
    
    return {
      fastestLap: fastestLapWinner,
      championships: championshipsWinner
    };
  };

  const winners = getWinners();

  useEffect(() => {
    const fetchComparisonData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Mock data for Lewis Hamilton vs Max Verstappen comparison
        const mockComparisonData: ComparisonData = {
          driver1: {
            fullName: "Lewis Hamilton",
            teamName: "Mercedes",
            imageUrl: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png.transform/2col-retina/image.png",
            teamColorToken: "#00D2BE", // Mercedes teal
            stats: {
              fastestLap: "1:18.123",
              fastestLapRank: 2,
              championships: 7,
              championshipsRank: 1
            }
          },
          driver2: {
            fullName: "Max Verstappen",
            teamName: "Red Bull Racing",
            imageUrl: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png.transform/2col-retina/image.png",
            teamColorToken: "#3671C6", // Red Bull blue
            stats: {
              fastestLap: "1:17.456",
              fastestLapRank: 1,
              championships: 3,
              championshipsRank: 9
            }
          }
        };
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        setComparisonData(mockComparisonData);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(errorMessage);
        console.error('Error fetching comparison data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchComparisonData();
  }, []);

  if (loading) {
    return (
      <Box 
        bg="bg-primary" 
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

  if (error || !comparisonData) {
    return null; // Fail silently for public preview
  }

  return (
    <Box 
      bg="blackAlpha.200" 
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
        <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap="xl" alignItems="center">
          {/* Left Column - Information & CTA */}
          <GridItem>
            <VStack align="flex-start" justify="center" spacing="lg" h="full">
              <VStack align="flex-start" spacing="sm">
                <Text 
                  color="brand.red" 
                  fontWeight="bold" 
                  fontSize="sm" 
                  textTransform="uppercase" 
                  letterSpacing="wide"
                >
                  Head-to-Head
                </Text>
                
                <Heading 
                  as="h2" 
                  size="2xl" 
                  color="text-primary"
                  fontFamily="heading"
                  lineHeight="shorter"
                >
                  Compare Every Stat.
                </Heading>
              </VStack>
              
              <Text 
                color="text-secondary" 
                fontSize="lg"
                lineHeight="tall"
                maxW="400px"
              >
                Dive deep into career statistics. Pit your favorite drivers against each other and settle the debate with hard data.
              </Text>
              
              <Button
                bg="brand.red"
                color="white"
                _hover={{ 
                  bg: "brand.redDark",
                  transform: 'translateY(-2px)',
                  boxShadow: 'lg'
                }}
                _active={{ bg: "brand.redDark" }}
                size="lg"
                fontFamily="heading"
                fontWeight="bold"
                px="xl"
                py="md"
                borderRadius="md"
                onClick={() => loginWithRedirect()}
                transition="all 0.3s ease"
                mt="md"
              >
                Customize Your Comparison
              </Button>
            </VStack>
          </GridItem>

          {/* Right Column - Visual Showdown */}
          <GridItem>
            <VStack spacing="lg" w="100%">
              {/* Section for Driver Images and VS */}
              <Flex align="center" justify="center" w="100%">
                {/* Lewis Hamilton Image */}
                <VStack spacing="sm">
                  <Box
                    _hover={{ transform: 'scale(1.05)' }}
                    transition="all 0.3s ease"
                  >
                    <Box
                      boxShadow={`0 0 15px ${comparisonData.driver1.teamColorToken}40`}
                      borderRadius="full"
                      p="2"
                      bg="white"
                    >
                      <Image
                        src={comparisonData.driver1.imageUrl}
                        alt={comparisonData.driver1.fullName}
                        boxSize={{ base: '100px', md: '140px' }}
                        objectFit="cover"
                        borderRadius="full"
                        border="3px solid"
                        borderColor="white"
                      />
                    </Box>
                  </Box>
                  <Text fontSize="sm" color="brand.red" fontWeight="bold">
                    2020
                  </Text>
                </VStack>

                <Heading as="h3" size="2xl" color="brand.red" mx="4" fontFamily="heading" fontWeight="bold">
                  VS
                </Heading>

                {/* Max Verstappen Image */}
                <VStack spacing="sm">
                  <Box
                    _hover={{ transform: 'scale(1.05)' }}
                    transition="all 0.3s ease"
                  >
                    <Box
                      boxShadow={`0 0 15px ${comparisonData.driver2.teamColorToken}40`}
                      borderRadius="full"
                      p="2"
                      bg="white"
                    >
                      <Image
                        src={comparisonData.driver2.imageUrl}
                        alt={comparisonData.driver2.fullName}
                        boxSize={{ base: '100px', md: '140px' }}
                        objectFit="cover"
                        borderRadius="full"
                        border="3px solid"
                        borderColor="white"
                      />
                    </Box>
                  </Box>
                  <Text fontSize="sm" color="brand.red" fontWeight="bold">
                    2023
                  </Text>
                </VStack>
              </Flex>

              {/* Section for Stat Comparisons with Visual Bars */}
              <VStack spacing={6} w="100%" maxW="450px" pt="md">
                {/* Comparison 1: Fastest Lap */}
                <VStack w="100%">
                  <Text color="text-muted" fontWeight="bold" textTransform="uppercase" fontSize="sm">
                    Fastest Lap
                  </Text>
                  <Grid templateColumns="1fr 1fr" gap={4} w="100%">
                    {/* Driver 1 (Hamilton) Stat */}
                    <VStack align="flex-start" spacing={1}>
                      <Flex align="center" gap={2}>
                        <Text fontSize="xl" fontWeight="bold">{comparisonData.driver1.stats.fastestLap}</Text>
                        {winners.fastestLap === 'driver1' && <Crown color="#FFD700" size={20} />}
                      </Flex>
                      <Box w="100%" h="8px" bg="bg-surface" borderRadius="md" overflow="hidden">
                        <Box 
                          w={`${calculateLowerIsBetterBarWidth(
                            comparisonData.driver1.stats.fastestLap, 
                            comparisonData.driver2.stats.fastestLap, 
                            comparisonData.driver1.stats.fastestLap
                          )}%`} 
                          h="100%" 
                          bg={comparisonData.driver1.teamColorToken} 
                        /> 
                      </Box>
                      <Text fontSize="xs" color="text-muted">All-time: #{comparisonData.driver1.stats.fastestLapRank}</Text>
                    </VStack>
                    {/* Driver 2 (Verstappen) Stat */}
                    <VStack align="flex-end" spacing={1}>
                      <Flex align="center" gap={2} direction="row-reverse">
                        <Text fontSize="xl" fontWeight="bold">{comparisonData.driver2.stats.fastestLap}</Text>
                        {winners.fastestLap === 'driver2' && <Crown color="#FFD700" size={20} />}
                      </Flex>
                      <Box w="100%" h="8px" bg="bg-surface" borderRadius="md" overflow="hidden" dir="rtl">
                        <Box 
                          w={`${calculateLowerIsBetterBarWidth(
                            comparisonData.driver1.stats.fastestLap, 
                            comparisonData.driver2.stats.fastestLap, 
                            comparisonData.driver2.stats.fastestLap
                          )}%`} 
                          h="100%" 
                          bg={comparisonData.driver2.teamColorToken} 
                        />
                      </Box>
                      <Text fontSize="xs" color="text-muted">All-time: #{comparisonData.driver2.stats.fastestLapRank}</Text>
                    </VStack>
                  </Grid>
                </VStack>

                {/* Comparison 2: Championships */}
                <VStack w="100%">
                  <Text color="text-muted" fontWeight="bold" textTransform="uppercase" fontSize="sm">
                    Championships
                  </Text>
                  <Grid templateColumns="1fr 1fr" gap={4} w="100%">
                    {/* Driver 1 (Hamilton) Stat */}
                    <VStack align="flex-start" spacing={1}>
                      <Flex align="center" gap={2}>
                        <Text fontSize="xl" fontWeight="bold">{comparisonData.driver1.stats.championships}</Text>
                        {winners.championships === 'driver1' && <Crown color="#FFD700" size={20} />}
                      </Flex>
                      <Box w="100%" h="8px" bg="bg-surface" borderRadius="md" overflow="hidden">
                        <Box 
                          w={`${calculateHigherIsBetterBarWidth(
                            comparisonData.driver1.stats.championships, 
                            comparisonData.driver2.stats.championships, 
                            comparisonData.driver1.stats.championships
                          )}%`} 
                          h="100%" 
                          bg={comparisonData.driver1.teamColorToken} 
                        />
                      </Box>
                      <Text fontSize="xs" color="text-muted">All-time: #{comparisonData.driver1.stats.championshipsRank}</Text>
                    </VStack>
                    {/* Driver 2 (Verstappen) Stat */}
                    <VStack align="flex-end" spacing={1}>
                      <Flex align="center" gap={2} direction="row-reverse">
                        <Text fontSize="xl" fontWeight="bold">{comparisonData.driver2.stats.championships}</Text>
                        {winners.championships === 'driver2' && <Crown color="#FFD700" size={20} />}
                      </Flex>
                      <Box w="100%" h="8px" bg="bg-surface" borderRadius="md" overflow="hidden" dir="rtl">
                        <Box 
                          w={`${calculateHigherIsBetterBarWidth(
                            comparisonData.driver1.stats.championships, 
                            comparisonData.driver2.stats.championships, 
                            comparisonData.driver2.stats.championships
                          )}%`} 
                          h="100%" 
                          bg={comparisonData.driver2.teamColorToken} 
                        />
                      </Box>
                      <Text fontSize="xs" color="text-muted">All-time: #{comparisonData.driver2.stats.championshipsRank}</Text>
                    </VStack>
                  </Grid>
                </VStack>
              </VStack>
            </VStack>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
};

export default ComparePreviewSection;
