import React from 'react';
import { Box, Flex, SimpleGrid, Heading, Icon, Text, VStack, HStack, Badge, Spinner, Divider, useColorModeValue } from '@chakra-ui/react';
import { Trophy, TrendingUp, Calendar, Medal, Sparkles, AlertCircle, Flag } from 'lucide-react';
import { useThemeColor } from '../../context/ThemeColorContext';
import { useAiDriverFunFacts } from '../../hooks/useAiDriverFunFacts';
import StatCard from '../StatCard/StatCard';

// Removed InfoBlock - now using StatCard component for consistency

interface KeyInfoBarProps {
  driver: {
    id: number;
    teamName: string;
    championshipStanding: string;
    points: number;
    wins: number;
    podiums: number;
    firstRace: { year: string; event: string };
    worldChampionships?: number;
    grandsPrixEntered?: number;
  };
  teamColor?: string;
}

const KeyInfoBar: React.FC<KeyInfoBarProps> = ({ driver, teamColor }) => {
  // --- DEBUG STEP 4: Log the data as it's received by a child component ---
  console.log("%c4. Data Received by KeyInfoBar:", "color: violet; font-weight: bold;", driver);

  // Fetch AI-generated fun facts
  const { data: funFactsData, loading: funFactsLoading, error: funFactsError } = useAiDriverFunFacts(driver.id);
  const { accentColorWithHash } = useThemeColor();
  
  // Use team color for icons, fallback to accent color
  const iconColor = teamColor || accentColorWithHash;

  return (
    <Box
      bg="transparent"
      border="1px solid"
      borderColor="border-primary"
      borderRadius="lg"
      mx="auto"
      mt={{ base: 'lg', lg: '-2rem' }} // Pull up on larger screens
      position="relative"
      zIndex={10}
      w={{ base: '95%', lg: '90%' }}
      maxW="1100px"
      boxShadow="xl"
      overflow="hidden"
      backdropFilter="blur(12px)"
    >
      <Flex
        direction={{ base: 'column', lg: 'row' }}
        align="stretch"
        minH="200px"
      >
        {/* Career Stats Section - 65% width */}
        <Box 
          flex={{ base: 1, lg: '0 0 65%' }}
          p={{ base: 'md', md: 'lg' }}
        >
          <Heading 
            size="sm" 
            fontFamily="heading" 
            textTransform="uppercase" 
            color="text-muted" 
            mb="md"
            letterSpacing="0.05em"
          >
            Key Stats
          </Heading>
          <SimpleGrid 
            columns={{ base: 2, md: 3, lg: 3 }} 
            spacing={4}
            templateRows={{ base: 'repeat(3, 1fr)', md: 'repeat(2, 1fr)', lg: 'repeat(2, 1fr)' }}
          >
            {/* World Championships - Most important stat */}
            <StatCard
              icon={Trophy}
              value={driver.worldChampionships || 0}
              label="World Championships"
              color={iconColor}
            />
            
            {/* Wins - Core performance metric */}
            <StatCard
              icon={Trophy}
              value={driver.wins}
              label="Wins"
              color={iconColor}
            />
            
            {/* Podiums - Sustained excellence */}
            <StatCard
              icon={Medal}
              value={driver.podiums}
              label="Podiums"
              color={iconColor}
            />
            
            {/* Grands Prix Entered - Experience & longevity */}
            <StatCard
              icon={Calendar}
              value={driver.grandsPrixEntered || 0}
              label="Grands Prix Entered"
              color={iconColor}
            />
            
            {/* Career Points - Overall contribution */}
            <StatCard
              icon={TrendingUp}
              value={driver.points}
              label="Career Points"
              color={iconColor}
            />
            
            {/* First Race - Career start */}
            <StatCard
              icon={Flag}
              value={driver.firstRace.year}
              label="First Race"
              color={iconColor}
            />
          </SimpleGrid>
        </Box>

        {/* Divider */}
        <Divider 
          orientation="vertical" 
          display={{ base: 'none', lg: 'block' }}
          borderColor="border-primary"
        />

        {/* Fun Facts Section - 35% width */}
        <Box 
          flex={{ base: 1, lg: '0 0 35%' }}
          p={{ base: 'md', md: 'lg' }}
          minW={{ lg: '300px' }}
        >
          <HStack mb="md" align="center">
            <Heading 
              size="sm" 
              fontFamily="heading" 
              textTransform="uppercase" 
              color="text-muted"
              letterSpacing="0.05em"
            >
              Fun Facts
            </Heading>
            {funFactsData?.isFallback && (
              <Badge size="sm" colorScheme="orange" variant="subtle">
                Cached
              </Badge>
            )}
          </HStack>
          
          {funFactsLoading ? (
            <VStack spacing={3} align="stretch">
              <HStack>
                <Spinner size="sm" color={accentColorWithHash} />
                <Text fontSize="sm" color="text-muted">Generating fun facts...</Text>
              </HStack>
            </VStack>
          ) : funFactsError ? (
            <VStack spacing={3} align="stretch">
              <HStack>
                <Icon as={AlertCircle} boxSize={4} color="red.400" />
                <Text fontSize="sm" color="red.400">Unable to load fun facts</Text>
              </HStack>
            </VStack>
          ) : funFactsData ? (
            <VStack spacing={3} align="stretch">
              {funFactsData.facts.slice(0, 3).map((fact, index) => (
                <HStack key={index} align="flex-start" spacing={3}>
                  <Icon as={Sparkles} boxSize={4} color={accentColorWithHash} mt={0.5} flexShrink={0} />
                  <Text fontSize="sm" color="text-primary" lineHeight="1.5">
                    {fact}
                  </Text>
                </HStack>
              ))}
              {funFactsData.aiAttribution && (
                <Text fontSize="xs" color="text-muted" textAlign="right" mt={2}>
                  {funFactsData.aiAttribution}
                </Text>
              )}
            </VStack>
          ) : (
            <Text fontSize="sm" color="text-muted">No fun facts available</Text>
          )}
        </Box>
      </Flex>
    </Box>
  );
};

export default KeyInfoBar;