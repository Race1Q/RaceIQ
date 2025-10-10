import React from 'react';
import { Box, Flex, Grid, Heading, Icon, Text, VStack, HStack, Badge, Spinner } from '@chakra-ui/react';
import { Trophy, TrendingUp, Calendar, Medal, Lightbulb, AlertCircle } from 'lucide-react';
import { useThemeColor } from '../../context/ThemeColorContext';
import { useAiDriverFunFacts } from '../../hooks/useAiDriverFunFacts';

interface InfoBlockProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: React.ElementType;
}

const InfoBlock: React.FC<InfoBlockProps> = ({ label, value, subValue, icon }) => {
  const { accentColorWithHash } = useThemeColor();
  
  return (
    <Flex align="center" gap={4} p={{ base: 2, md: 4 }}>
      <Icon as={icon} boxSize={8} color={accentColorWithHash} />
    <Box>
      <Text fontSize="xs" color="text-muted" textTransform="uppercase">{label}</Text>
      <Heading size="md" fontWeight="bold">{value}</Heading>
      {subValue && <Text fontSize="sm" color="text-muted">{subValue}</Text>}
    </Box>
  </Flex>
  );
};

interface KeyInfoBarProps {
  driver: {
    id: number;
    teamName: string;
    championshipStanding: string;
    points: number;
    wins: number;
    podiums: number;
    firstRace: { year: string; event: string };
  };
}

const KeyInfoBar: React.FC<KeyInfoBarProps> = ({ driver }) => {
  // --- DEBUG STEP 4: Log the data as it's received by a child component ---
  console.log("%c4. Data Received by KeyInfoBar:", "color: violet; font-weight: bold;", driver);

  // Fetch AI-generated fun facts
  const { data: funFactsData, loading: funFactsLoading, error: funFactsError } = useAiDriverFunFacts(driver.id);

  return (
    <Flex
      direction={{ base: 'column', lg: 'row' }}
      align="stretch"
      bg="bg-surface"
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
    >
      {/* Career Stats Section */}
      <Box p={{ base: 'md', md: 'lg' }} flexGrow={1}>
        <Text fontSize="xs" textTransform="uppercase" color="text-muted" mb="sm">
          Career Stats
        </Text>
        <Grid
          templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' }}
          gap={{ base: 2, md: 4 }}
        >
          <InfoBlock label="First Race" value={driver.firstRace.year} subValue={driver.firstRace.event} icon={Calendar} />
          <InfoBlock label="Wins" value={driver.wins} icon={Trophy} />
          <InfoBlock label="Podiums" value={driver.podiums} icon={Medal} />
          <InfoBlock label="Points" value={driver.points} icon={TrendingUp} />
          <InfoBlock label="Standing" value={driver.championshipStanding} icon={Trophy} />
        </Grid>
      </Box>

      {/* Fun Facts Section */}
      <Box 
        p={{ base: 'md', md: 'lg' }} 
        borderLeft={{ base: 'none', lg: '1px solid' }}
        borderTop={{ base: '1px solid', lg: 'none' }}
        borderColor="border-primary"
        minW={{ lg: '300px' }}
        maxW={{ lg: '400px' }}
      >
        <HStack mb="sm" align="center">
          <Icon as={Lightbulb} boxSize={4} color="accent" />
          <Text fontSize="xs" textTransform="uppercase" color="text-muted">
            Fun Facts
          </Text>
          {funFactsData?.isFallback && (
            <Badge size="sm" colorScheme="orange" variant="subtle">
              Cached
            </Badge>
          )}
        </HStack>
        
        {funFactsLoading ? (
          <VStack spacing={2} align="stretch">
            <HStack>
              <Spinner size="sm" />
              <Text fontSize="sm" color="text-muted">Generating fun facts...</Text>
            </HStack>
          </VStack>
        ) : funFactsError ? (
          <VStack spacing={2} align="stretch">
            <HStack>
              <Icon as={AlertCircle} boxSize={4} color="red.400" />
              <Text fontSize="sm" color="red.400">Unable to load fun facts</Text>
            </HStack>
          </VStack>
        ) : funFactsData ? (
          <VStack spacing={2} align="stretch">
            {funFactsData.facts.slice(0, 3).map((fact, index) => (
              <Box key={index} p={2} bg="bg-secondary" borderRadius="md" border="1px solid" borderColor="border-secondary">
                <Text fontSize="sm" color="text-primary" lineHeight="1.4">
                  {fact}
                </Text>
              </Box>
            ))}
          </VStack>
        ) : (
          <Text fontSize="sm" color="text-muted">No fun facts available</Text>
        )}
      </Box>
    </Flex>
  );
};

export default KeyInfoBar;