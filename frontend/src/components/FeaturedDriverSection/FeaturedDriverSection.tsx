// frontend/src/components/FeaturedDriverSection/FeaturedDriverSection.tsx

import React from 'react';
import {
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  Text,
  VStack,
  Button,
  Badge,
  Image,
} from '@chakra-ui/react';
import { driverHeadshots } from '../../lib/driverHeadshots';

interface DriverStats {
  wins: number;
  podiums: number;
  poles: number;
  totalPoints: number;
  fastestLaps: number;
  racesCompleted: number;
}

interface FeaturedDriver {
  id: number;
  fullName: string;
  driverNumber: number | null;
  countryCode: string | null;
  teamName: string;
  seasonPoints: number;
  seasonWins: number;
  position: number;
  careerStats: DriverStats;
}

export interface FeaturedDriverSectionProps {
  featuredDriver: FeaturedDriver | null;
  isError: boolean;
}

const FeaturedDriverSection: React.FC<FeaturedDriverSectionProps> = ({ featuredDriver, isError }) => {
  if (!featuredDriver) {
    return null;
  }

  const imageUrl = driverHeadshots[featuredDriver.fullName] || 'https://media.formula1.com/content/dam/fom-website/drivers/placeholder.png.transform/2col-retina/image.png';

  return (
    <Box bg="whiteAlpha.50">
      <Container maxW="1400px" py={{ base: 'lg', md: 'xl' }} px={{ base: 'md', lg: 'lg' }}>
        <Grid templateColumns={{ base: '1fr', lg: '1.2fr 2fr' }} gap={{ base: 6, lg: 12 }} alignItems="center">
          <GridItem>
            <VStack align="center" spacing={2} bg="bg-surface-raised" border="1px solid" borderColor="border-primary" borderRadius="lg" p="lg">
              <Text color="text-muted" fontSize="sm">Featured Driver</Text>
              {isError && (
                <Badge colorScheme="orange" variant="subtle" fontSize="0.7rem">Live Data Unavailable</Badge>
              )}
              <Image
                src={imageUrl}
                alt={featuredDriver.fullName}
                boxSize={{ base: '96px', md: '120px' }}
                objectFit="cover"
                borderRadius="full"
                border="3px solid"
                borderColor="white"
              />
              <Heading as="h3" size="lg" color="text-primary">{featuredDriver.fullName}</Heading>
              <Text color="text-secondary" fontSize="md">{featuredDriver.teamName} {featuredDriver.driverNumber ? `• #${featuredDriver.driverNumber}` : ''}</Text>
              <Text color="text-muted" fontSize="sm">Country: {featuredDriver.countryCode || 'N/A'}</Text>
              <Text color="text-muted" fontSize="sm">Position: #{featuredDriver.position}</Text>
            </VStack>
          </GridItem>
          <GridItem>
            <VStack align="flex-start" spacing={4}>
              <Heading as="h2" size="xl" color="text-primary" fontFamily="heading">Championship Leader</Heading>
              <Text color="text-secondary" fontSize="lg">{featuredDriver.fullName} currently leads the {new Date().getFullYear()} standings with {featuredDriver.seasonPoints} points and {featuredDriver.seasonWins} wins.</Text>
              <VStack align="flex-start" spacing={2}>
                <Text color="text-muted" fontSize="sm">Career Stats: {featuredDriver.careerStats.wins} wins • {featuredDriver.careerStats.podiums} podiums • {featuredDriver.careerStats.poles} poles</Text>
                <Text color="text-muted" fontSize="sm">Total Races: {featuredDriver.careerStats.racesCompleted} • Total Points: {featuredDriver.careerStats.totalPoints}</Text>
              </VStack>
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


