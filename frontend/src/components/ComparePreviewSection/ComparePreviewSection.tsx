// frontend/src/components/ComparePreviewSection/ComparePreviewSection.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Shuffle } from 'lucide-react';
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
import { teamColors } from '../../lib/teamColors';
import { apiFetch } from '../../lib/api';
import { useThemeColor } from '../../context/ThemeColorContext';
import userIcon from '../../assets/UserIcon.png'; // Fallback icon

// Interface for comparison driver data (real stats)
interface ComparisonDriver {
  fullName: string;
  teamName: string;
  imageUrl: string;
  teamColorToken: string;
  stats: {
    championships: number;
    allTimeFastestLapMs: number | null;
  };
}

interface ComparisonData {
  driver1: ComparisonDriver;
  driver2: ComparisonDriver;
}

const ComparePreviewSection: React.FC = () => {
  const navigate = useNavigate();
  const { accentColorWithHash } = useThemeColor();
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [randomizeLoading, setRandomizeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Cache for career stats to improve performance
  const [careerStatsCache] = useState<Map<number, any>>(new Map());
  // Cache for filtered champions list for even better performance
  const [championsCache, setChampionsCache] = useState<any[] | null>(null);


  // Helper: team color from shared map
  const getTeamColor = (teamName: string): string => {
    const hex = teamColors[teamName] ?? teamColors['Default'];
    return `#${hex}`;
  };

  // Helper: format lap time from ms
  const formatLapTime = (ms: number | null): string => {
    if (ms === null || ms <= 0 || Number.isNaN(ms)) return 'N/A';
    const date = new Date(ms);
    const minutes = date.getUTCMinutes();
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');
    const milliseconds = date.getUTCMilliseconds().toString().padStart(3, '0');
    return `${minutes}:${seconds}.${milliseconds}`;
  };

  // Helpers: bar width calculations from ms and numbers
  const calculateHigherIsBetterBarWidth = (value1: number, value2: number, currentValue: number): number => {
    const maxValue = Math.max(value1, value2, 1);
    return Math.max(0, Math.min(100, (currentValue / maxValue) * 100));
  };

  const calculateLowerIsBetterBarWidthMs = (ms1: number | null, ms2: number | null, currentMs: number | null): number => {
    const v1 = typeof ms1 === 'number' && ms1 > 0 ? ms1 : Number.POSITIVE_INFINITY;
    const v2 = typeof ms2 === 'number' && ms2 > 0 ? ms2 : Number.POSITIVE_INFINITY;
    const cur = typeof currentMs === 'number' && currentMs > 0 ? currentMs : Number.POSITIVE_INFINITY;
    const best = Math.min(v1, v2);
    if (!Number.isFinite(best) || !Number.isFinite(cur)) return 0;
    const pct = (best / cur) * 100;
    return Math.max(0, Math.min(100, pct));
  };

  // Winner determination using real stats
  const getWinners = () => {
    if (!comparisonData) return { fastestLap: null as null | 'driver1' | 'driver2', championships: null as null | 'driver1' | 'driver2' };
    const { driver1, driver2 } = comparisonData;

    // Fastest lap: lower ms wins; if one is null, the other wins; if both null -> null
    let fastestLap: null | 'driver1' | 'driver2' = null;
    const ms1 = driver1.stats.allTimeFastestLapMs;
    const ms2 = driver2.stats.allTimeFastestLapMs;
    if (typeof ms1 === 'number' && ms1 > 0 && typeof ms2 === 'number' && ms2 > 0) {
      fastestLap = ms1 < ms2 ? 'driver1' : 'driver2';
    } else if (typeof ms1 === 'number' && ms1 > 0 && (ms2 === null || ms2 <= 0)) {
      fastestLap = 'driver1';
    } else if (typeof ms2 === 'number' && ms2 > 0 && (ms1 === null || ms1 <= 0)) {
      fastestLap = 'driver2';
    }

    // Championships: higher championship count; tie -> null
    let championships: null | 'driver1' | 'driver2' = null;
    if (driver1.stats.championships > driver2.stats.championships) championships = 'driver1';
    else if (driver2.stats.championships > driver1.stats.championships) championships = 'driver2';

    return { fastestLap, championships };
  };

  const winners = getWinners();

  // Randomize: fetch from backend endpoints (no direct Supabase)
  // Helper function to get cached or fetch driver stats
  const getCachedOrFetchDriverStats = async (driverId: number): Promise<any | null> => {
    if (careerStatsCache.has(driverId)) {
      return careerStatsCache.get(driverId);
    }
    try {
      const stats = await apiFetch<any>(`/api/drivers/${driverId}/career-stats`);
      careerStatsCache.set(driverId, stats);
      return stats;
    } catch (error) {
      console.error(`Failed to fetch stats for driver ${driverId}:`, error);
      return null;
    }
  };


  const handleRandomize = async () => {
    try {
      setRandomizeLoading(true);
      setError(null);

      // Step 1: Use cached champions or fetch from new endpoint
      let champions: any[] = [];
      
      if (championsCache) {
        // Use cached champions for instant response
        champions = championsCache;
        console.log('🔍 Using cached champions:', champions.length);
      } else {
        // Fetch all drivers with championships from new endpoint
        console.log('🔍 Fetching champions from /api/drivers/champions...');
        const championsResponse = await apiFetch<any[]>('/api/drivers/champions');
        
        if (!Array.isArray(championsResponse) || championsResponse.length === 0) {
          throw new Error('No champions returned from backend');
        }

        // Cache the champions for future use
        setChampionsCache(championsResponse);
        champions = championsResponse;
        console.log('🔍 Cached champions for future use:', champions.length);
      }

      // Step 2: Check if we have enough champions
      if (champions.length < 2) {
        throw new Error(`Only ${champions.length} champions found. Need at least 2.`);
      }

      // Step 3: Randomly select TWO distinct champions
      const shuffledChampions = [...champions].sort(() => Math.random() - 0.5);
      const selectedChampion1 = shuffledChampions[0];
      const selectedChampion2 = shuffledChampions[1];

      // Step 4: Fetch detailed stats for only the two selected champions
      console.log('🔍 Fetching detailed stats for selected champions...');
      const [d1Stats, d2Stats] = await Promise.all([
        getCachedOrFetchDriverStats(selectedChampion1.driverId),
        getCachedOrFetchDriverStats(selectedChampion2.driverId)
      ]);

      if (!d1Stats || !d2Stats) {
        throw new Error('Failed to fetch detailed stats for selected champions');
      }

      // Step 5: Build driver data using the champions data and detailed stats
      const d1 = {
        driverId: selectedChampion1.driverId,
        fullName: selectedChampion1.driverFullName,
        teamName: d1Stats?.driver?.teamName || 'Unknown Team',
        imageUrl: selectedChampion1.profileImageUrl || d1Stats?.driver?.image_url || d1Stats?.driver?.profile_image_url || '',
        championships: selectedChampion1.championships || 0, // Use championship count from champions endpoint
        wins: d1Stats?.careerStats?.wins || 0, // Use career wins for comparison
        allTimeFastestLapMs: d1Stats?.bestLapMs ?? null,
      };

      const d2 = {
        driverId: selectedChampion2.driverId,
        fullName: selectedChampion2.driverFullName,
        teamName: d2Stats?.driver?.teamName || 'Unknown Team',
        imageUrl: selectedChampion2.profileImageUrl || d2Stats?.driver?.image_url || d2Stats?.driver?.profile_image_url || '',
        championships: selectedChampion2.championships || 0, // Use championship count from champions endpoint
        wins: d2Stats?.careerStats?.wins || 0, // Use career wins for comparison
        allTimeFastestLapMs: d2Stats?.bestLapMs ?? null,
      };

      // DEBUG: Sample of champions pool
      console.log('🔍 ComparePreview (backend) champions pool:', {
        size: champions.length,
        sample: champions.slice(0, 3).map(d => ({
          name: d.driverFullName,
          championships: d.championships
        }))
      });

      const d1FullName: string = d1.fullName || 'Unknown Driver 1';
      const d2FullName: string = d2.fullName || 'Unknown Driver 2';
      const d1Team: string = d1.teamName || 'Unknown Team';
      const d2Team: string = d2.teamName || 'Unknown Team';
      const d1LapMs: number | null = d1.allTimeFastestLapMs;
      const d2LapMs: number | null = d2.allTimeFastestLapMs;
      
      // DEBUG: Show resolved values with real bestLapMs
      console.log('🔍 ComparePreview (backend) resolved:', {
        driver1: {
          fullName: d1FullName,
          hasImageUrl: !!d1.imageUrl,
          imageUrl: d1.imageUrl || 'No image URL from API',
          championships: d1.championships,
          bestLapMs: d1.allTimeFastestLapMs,
          hasBestLap: !!d1.allTimeFastestLapMs,
          teamName: d1Team
        },
        driver2: {
          fullName: d2FullName,
          hasImageUrl: !!d2.imageUrl,
          imageUrl: d2.imageUrl || 'No image URL from API',
          championships: d2.championships,
          bestLapMs: d2.allTimeFastestLapMs,
          hasBestLap: !!d2.allTimeFastestLapMs,
          teamName: d2Team
        }
      });

      const newComparisonData: ComparisonData = {
        driver1: {
          fullName: d1FullName,
          teamName: d1Team,
          imageUrl: d1.imageUrl || '',
          teamColorToken: getTeamColor(d1Team),
        stats: {
          championships: d1.championships, // Use actual championship count for comparison
          allTimeFastestLapMs: d1LapMs,
        },
        },
        driver2: {
          fullName: d2FullName,
          teamName: d2Team,
          imageUrl: d2.imageUrl || '',
          teamColorToken: getTeamColor(d2Team),
        stats: {
          championships: d2.championships, // Use actual championship count for comparison
          allTimeFastestLapMs: d2LapMs,
        },
        },
      };

      setComparisonData(newComparisonData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to randomize drivers';
      setError(errorMessage);
      console.error('Error randomizing drivers:', err);
    } finally {
      setRandomizeLoading(false);
    }
  };

  // Initial load: set mock data synchronously, no fetch
  useEffect(() => {
    // DEBUG: This is using MOCK DATA, not real API data
    console.log('🔍 ComparePreviewSection: Using MOCK DATA (not API data)');
    
    const mockComparisonData: ComparisonData = {
      driver1: {
        fullName: 'Lewis Hamilton',
        teamName: 'Mercedes',
        imageUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png.transform/2col-retina/image.png',
        teamColorToken: getTeamColor('Mercedes'),
        stats: {
          championships: 7,
          allTimeFastestLapMs: 78123, // 1:18.123
        },
      },
      driver2: {
        fullName: 'Max Verstappen',
        teamName: 'Red Bull Racing',
        imageUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png.transform/2col-retina/image.png',
        teamColorToken: getTeamColor('Red Bull Racing'),
        stats: {
          championships: 4,
          allTimeFastestLapMs: 77456, // 1:17.456
        },
      },
    };

    setComparisonData(mockComparisonData);
    setLoading(false);
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
          backgroundImage: `url("data:image/svg+xml,%3Csvg width=\"100\" height=\"100\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M10 10 Q50 5 90 10 Q95 50 90 90 Q50 95 10 90 Q5 50 10 10\" stroke=\"${accentColorWithHash.replace('#', '%23')}\" stroke-width=\"0.5\" fill=\"none\" opacity=\"0.05\"/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
          opacity: 0.05,
          zIndex: 0,
        }}
      >
        <Container maxW="1400px" py={{ base: '2xl', md: '3xl' }} px={{ base: 'md', lg: 'lg' }} position="relative" zIndex={1} minH="80vh">
          <Flex justify="center" p="xl">
            <Spinner size="lg" color={accentColorWithHash} />
          </Flex>
        </Container>
      </Box>
    );
  }

  if (error || !comparisonData) {
    return null; // Public preview: fail silently
  }

  return (
    <Box 
      bg="blackAlpha.200" 
      position="relative"
      w="100%"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width=\"100\" height=\"100\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M10 10 Q50 5 90 10 Q95 50 90 90 Q50 95 10 90 Q5 50 10 10\" stroke=\"${accentColorWithHash.replace('#', '%23')}\" stroke-width=\"0.5\" fill=\"none\" opacity=\"0.05\"/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '200px 200px',
        opacity: 0.05,
        zIndex: 0,
      }}
    >
      <Container maxW="1400px" py={{ base: '2xl', md: '3xl' }} px={{ base: 'md', lg: 'lg' }} position="relative" zIndex={1} w="100%" minH="80vh">
        <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={{ base: 6, md: 'xl' }} alignItems="center" h="full" minH="60vh">
          {/* Left Column - Information & CTA */}
          <GridItem>
            <VStack align="flex-start" justify="center" spacing="lg" h="full">
              <VStack align="flex-start" spacing="sm">
                <Heading
                  as="h4"
                  size="sm"
                  color="border-accent"
                  textTransform="uppercase"
                  letterSpacing="wider"
                  fontWeight="bold"
                >
                  HEAD-TO-HEAD
                </Heading>

                <Heading 
                  as="h2" 
                  size={{ base: 'xl', md: '2xl' }}
                  color="text-primary"
                  fontFamily="heading"
                  lineHeight="shorter"
                >
                  Compare Every Stat.
                </Heading>
              </VStack>
              
              <Text 
                color="text-secondary" 
                fontSize={{ base: 'md', md: 'lg' }}
                lineHeight="tall"
                maxW={{ base: '100%', md: '400px' }}
              >
                Dive deep into career statistics. Pit your favorite drivers against each other and settle the debate with hard data.
              </Text>
              
              <Button
                bg="border-accent"
                color="white"
                _hover={{ 
                  bg: "border-accentDark",
                  transform: 'translateY(-2px)',
                  boxShadow: 'lg'
                }}
                _active={{ bg: "border-accentDark" }}
                size={{ base: 'md', md: 'lg' }}
                fontFamily="heading"
                fontWeight="bold"
                px={{ base: 6, md: 'xl' }}
                py={{ base: 3, md: 'md' }}
                borderRadius="md"
                onClick={() => navigate('/compare-login')}
                transition="all 0.3s ease"
                mt="md"
                w={{ base: 'full', md: 'auto' }}
              >
                Customize Your Comparison
              </Button>
            </VStack>
          </GridItem>

          {/* Right Column - Visual Showdown */}
          <GridItem>
            <VStack spacing="lg" w="100%">
              {/* Randomize action centered above images */}
              <Button
                leftIcon={<Shuffle size={16} />}
                onClick={handleRandomize}
                isLoading={randomizeLoading}
                variant="ghost"
                _hover={{ bg: 'border-accent', color: 'white' }}
                _active={{ bg: 'border-accentDark', color: 'white' }}
                alignSelf="center"
              >
                Randomize
              </Button>

              {/* Images and VS */}
              <Flex align="center" justify="center" w="100%">
                {/* Driver 1 Image */}
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
                        src={comparisonData.driver1.imageUrl || userIcon}
                        alt={comparisonData.driver1.fullName}
                        boxSize={{ base: '80px', md: '140px' }}
                        objectFit="cover"
                        borderRadius="full"
                        border="3px solid"
                        borderColor="white"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = userIcon; }}
                      />
                    </Box>
                  </Box>
                  <Heading as="h3" size={{ base: 'sm', md: 'md' }} color={comparisonData.driver1.teamColorToken} textAlign="center">
                    {comparisonData.driver1.fullName}
                  </Heading>
                  <Text fontSize={{ base: 'xs', md: 'sm' }} color={comparisonData.driver1.teamColorToken} mt={1} textAlign="center">
                    {comparisonData.driver1.teamName}
                  </Text>
                </VStack>

                <Heading as="h3" size={{ base: 'xl', md: '2xl' }} color="border-accent" mx={{ base: 2, md: 4 }} fontFamily="heading" fontWeight="bold">
                  VS
                </Heading>

                {/* Driver 2 Image */}
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
                        src={comparisonData.driver2.imageUrl || userIcon}
                        alt={comparisonData.driver2.fullName}
                        boxSize={{ base: '80px', md: '140px' }}
                        objectFit="cover"
                        borderRadius="full"
                        border="3px solid"
                        borderColor="white"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = userIcon; }}
                      />
                    </Box>
                  </Box>
                  <Heading as="h3" size={{ base: 'sm', md: 'md' }} color={comparisonData.driver2.teamColorToken} textAlign="center">
                    {comparisonData.driver2.fullName}
                  </Heading>
                  <Text fontSize={{ base: 'xs', md: 'sm' }} color={comparisonData.driver2.teamColorToken} mt={1} textAlign="center">
                    {comparisonData.driver2.teamName}
                  </Text>
                </VStack>
              </Flex>

              {/* Stat Comparisons */}
              <VStack spacing={{ base: 4, md: 6 }} w="100%" maxW={{ base: '100%', md: '450px' }} pt="md">
                {/* Fastest Lap */}
                <VStack w="100%">
                  <Text color="text-muted" fontWeight="bold" textTransform="uppercase" fontSize={{ base: 'xs', md: 'sm' }}>
                    Fastest Lap (All-Time)
                  </Text>
                  <Grid templateColumns="1fr auto 1fr" gap={4} w="100%" alignItems="start">
                    {/* Driver 1 */}
                    <VStack align="flex-start" spacing={1}>
                      <Flex align="center" gap={2}>
                        <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="bold">{formatLapTime(comparisonData.driver1.stats.allTimeFastestLapMs)}</Text>
                        {winners.fastestLap === 'driver1' && <Crown color="#FFD700" size={20} />}
                      </Flex>
                      <Box w="100%" h="8px" bg="bg-surface" borderRadius="md" overflow="hidden">
                        <Box 
                          w={`${calculateLowerIsBetterBarWidthMs(
                            comparisonData.driver1.stats.allTimeFastestLapMs,
                            comparisonData.driver2.stats.allTimeFastestLapMs,
                            comparisonData.driver1.stats.allTimeFastestLapMs
                          )}%`} 
                          h="100%" 
                          bg={comparisonData.driver1.teamColorToken} 
                        /> 
                      </Box>
                    </VStack>
                    {/* Middle indicator for draw */}
                    <Flex align="center" justify="center" h="full" pt={6}>
                      {winners.fastestLap === null && (
                        <Crown color="#FFD700" size={20} aria-label="draw" />
                      )}
                    </Flex>
                    {/* Driver 2 */}
                    <VStack align="flex-end" spacing={1}>
                      <Flex align="center" gap={2} direction="row-reverse">
                        <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="bold">{formatLapTime(comparisonData.driver2.stats.allTimeFastestLapMs)}</Text>
                        {winners.fastestLap === 'driver2' && <Crown color="#FFD700" size={20} />}
                      </Flex>
                      <Box w="100%" h="8px" bg="bg-surface" borderRadius="md" overflow="hidden" dir="rtl">
                        <Box 
                          w={`${calculateLowerIsBetterBarWidthMs(
                            comparisonData.driver1.stats.allTimeFastestLapMs,
                            comparisonData.driver2.stats.allTimeFastestLapMs,
                            comparisonData.driver2.stats.allTimeFastestLapMs
                          )}%`} 
                          h="100%" 
                          bg={comparisonData.driver2.teamColorToken} 
                        />
                      </Box>
                    </VStack>
                  </Grid>
                </VStack>

                {/* Championships */}
                <VStack w="100%">
                  <Text color="text-muted" fontWeight="bold" textTransform="uppercase" fontSize={{ base: 'xs', md: 'sm' }}>
                    Championships
                  </Text>
                  <Grid templateColumns="1fr auto 1fr" gap={4} w="100%" alignItems="start">
                    {/* Driver 1 */}
                    <VStack align="flex-start" spacing={1}>
                      <Flex align="center" gap={2}>
                        <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="bold">{comparisonData.driver1.stats.championships}</Text>
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
                    </VStack>
                    {/* Middle indicator for draw */}
                    <Flex align="center" justify="center" h="full" pt={6}>
                      {winners.championships === null && (
                        <Crown color="#FFD700" size={20} aria-label="draw" />
                      )}
                    </Flex>
                    {/* Driver 2 */}
                    <VStack align="flex-end" spacing={1}>
                      <Flex align="center" gap={2} direction="row-reverse">
                        <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="bold">{comparisonData.driver2.stats.championships}</Text>
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
