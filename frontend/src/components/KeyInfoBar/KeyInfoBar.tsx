import React from 'react';
import { Box, Flex, Grid, Heading, Icon, Text } from '@chakra-ui/react';
import { Trophy, TrendingUp, Calendar, Medal } from 'lucide-react';
import TeamLogo from '../TeamLogo/TeamLogo';
import { useThemeColor } from '../../context/ThemeColorContext';

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
      <Flex
        align="center"
        justify="center"
        p="lg"
        borderRight={{ base: 'none', lg: '1px solid' }}
        borderBottom={{ base: '1px solid', lg: 'none' }}
        borderColor="border-primary"
        minW={{ lg: '220px' }}
      >
        <TeamLogo teamName={driver.teamName} />
      </Flex>

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
    </Flex>
  );
};

export default KeyInfoBar;