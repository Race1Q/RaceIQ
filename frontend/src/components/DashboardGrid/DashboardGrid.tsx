import React from 'react';
import { Box, Grid, Heading, Icon, Image, Text, VStack, Flex } from '@chakra-ui/react';
import { Trophy, Medal, Zap } from 'lucide-react';
import WinsPerSeasonChart from '../WinsPerSeasonChart/WinsPerSeasonChart';
import userIcon from '../../assets/UserIcon.png';
import { teamColors } from '../../lib/teamColors';

interface StatTileProps {
  icon: React.ElementType;
  label: string;
  value: string;
  description: string;
}

const StatTile: React.FC<StatTileProps> = ({ icon, label, value, description }) => (
  <VStack bg="bg-surface" p="lg" borderRadius="lg" border="1px solid" borderColor="border-primary" align="start" spacing={4} h="100%">
    <Flex align="center" gap={3} color="text-muted">
      <Icon as={icon} boxSize={5} />
      <Text fontSize="sm">{label}</Text>
    </Flex>
    <Heading size="2xl" fontFamily="heading">{value}</Heading>
    <Text fontSize="sm" color="text-muted">{description}</Text>
  </VStack>
);

const DriverInfoTile = ({ driver }: { driver: any }) => (
  <VStack bg="bg-surface" p="lg" borderRadius="lg" border="1px solid" borderColor="border-primary" align="start" spacing={4}>
    <Image src={driver.imageUrl || userIcon} alt={driver.fullName} borderRadius="md" objectFit="cover" h="200px" w="100%" />
    <Heading size="lg">{driver.fullName}</Heading>
    <Text color="text-muted" fontWeight="bold">{driver.teamName}</Text>
    <Text fontSize="sm" color="text-primary">{driver.funFact}</Text>
  </VStack>
);

const DashboardGrid: React.FC<{ driver: any }> = ({ driver }) => {
  const teamColor = teamColors[driver.teamName] || '#e10600';

  return (
    <Grid
      w="100%"
      gap="lg"
      templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }}
      templateRows="auto"
    >
      <Box gridColumn={{ base: 'span 1', md: 'span 2', xl: 'span 1' }} gridRow={{ base: '1', xl: 'span 2' }}>
        <DriverInfoTile driver={driver} />
      </Box>
      <StatTile icon={Trophy} label="Wins" value={driver.wins} description="Career victories" />
      <StatTile icon={Medal} label="Podiums" value={driver.podiums} description="Top 3 finishes" />
      <StatTile icon={Zap} label="Fastest Laps" value={driver.fastestLaps > 0 ? driver.fastestLaps.toString() : 'N/A'} description="Career fastest laps" />
      <Box gridColumn={{ base: 'span 1', md: 'span 2', xl: 'span 2' }}>
        {driver.winsPerSeason?.length > 0 && (
          <Box bg="bg-surface" p="lg" borderRadius="lg" border="1px solid" borderColor="border-primary">
            <WinsPerSeasonChart data={driver.winsPerSeason} teamColor={teamColor} />
          </Box>
        )}
      </Box>
    </Grid>
  );
};

export default DashboardGrid;