import React, { useState } from 'react';
import { Container, Box, Tabs, TabList, TabPanels, Tab, TabPanel, VStack, Grid, useTheme, Flex, Text, Button } from '@chakra-ui/react';
import { useAuth0 } from '@auth0/auth0-react';

// Import all the refactored child components
import RaceHeader from '../../components/RaceHeader/RaceHeader';
import TrackMap from '../../components/TrackMap/TrackMap';
import WeatherCard from '../../components/WeatherCard/WeatherCard';
import PodiumCard from '../../components/PodiumCard/PodiumCard';
import LapPositionChart from '../../components/LapPositionChart/LapPositionChart';
import HistoricalStatsTable from '../../components/HistoricalStatsTable/HistoricalStatsTable';
import FastestLapCard from '../../components/FastestLapCard/FastestLapCard';
import RaceControlLog from '../../components/RaceControlLog/RaceControlLog';
import FlagsTimeline from '../../components/FlagsTimeline/FlagsTimeline';
import PaceDistributionChart from '../../components/PaceDistributionChart/PaceDistributionChart';
import TireStrategyChart from '../../components/TireStrategyChart/TireStrategyChart';
import RaceStandingsTable from '../../components/RaceStandingsTable/RaceStandingsTable';
import HeroSection from '../../components/HeroSection/HeroSection';

// Data and Types
import { mockRaces } from '../../data/mockRaces';
import { teamColors } from '../../lib/assets';
import type { Race } from '../../data/types';

const RacesPage: React.FC = () => {
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const [selectedRaceId, setSelectedRaceId] = useState('monza_2024');
  const selectedRace = mockRaces.find(race => race.id === selectedRaceId) || mockRaces[0];
  const theme = useTheme();

  if (!isAuthenticated) {
    return (
      <Box bg="bg-primary">
        <HeroSection
          title="Race Analytics"
          subtitle="A deep dive into the strategy, performance, and key moments from every Grand Prix."
          backgroundColor={theme.colors.brand.red}
          disableOverlay
        />
        <Container maxW="1400px" py="xl" px={{ base: 'md', lg: 'lg' }}>
          <Flex direction="column" align="center" justify="center" minH="30vh" gap={4}>
            <Text fontSize="xl" color="text-primary">Please signup / login</Text>
            <Button bg="brand.red" _hover={{ bg: 'brand.redDark' }} color="white" onClick={() => loginWithRedirect()}>Login</Button>
          </Flex>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg="bg-primary">
      <HeroSection
        title="Race Analytics"
        subtitle="A deep dive into the strategy, performance, and key moments from every Grand Prix."
        backgroundColor={theme.colors.brand.red}
        disableOverlay
      />
      
      <Container maxW="1400px" py="xl" px={{ base: 'md', lg: 'lg' }}>
        <Tabs variant="enclosed-colored" colorScheme="red">
          <TabList>
            <Tab>Overview</Tab>
            <Tab>Race Results</Tab>
            <Tab>Detailed Analytics</Tab>
            <Tab>Weather</Tab>
            <Tab>Historical Stats</Tab>
          </TabList>

          <TabPanels>
            {/* TAB 1: OVERVIEW */}
            <TabPanel p={{ base: 'md', lg: 'lg' }}>
              <VStack spacing="lg" align="stretch">
                <RaceHeader race={selectedRace} />
                <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap="lg">
                  <VStack spacing="lg" align="stretch">
                    <TrackMap
                      coords={selectedRace.trackMapCoords}
                      trackName={selectedRace.trackName}
                      race={selectedRace}
                    />
                    <Box>
                      <VStack spacing="md" align="stretch">
                        <Box textAlign="center" mb="md">
                          <Box as="h3" fontSize="xl" fontWeight="bold" color="text-primary" mb="md">
                            Podium Results
                          </Box>
                        </Box>
                        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap="md">
                          <PodiumCard
                            position={1}
                            driverName={selectedRace.standings[0].driver}
                            teamName={selectedRace.standings[0].team}
                            points={selectedRace.standings[0].points}
                            driverImageUrl={selectedRace.standings[0].driverImageUrl}
                            accentColor={teamColors[selectedRace.standings[0].team] || '#00D2BE'}
                          />
                          <PodiumCard
                            position={2}
                            driverName={selectedRace.standings[1].driver}
                            teamName={selectedRace.standings[1].team}
                            points={selectedRace.standings[1].points}
                            driverImageUrl={selectedRace.standings[1].driverImageUrl}
                            accentColor={teamColors[selectedRace.standings[1].team] || '#00D2BE'}
                          />
                          <PodiumCard
                            position={3}
                            driverName={selectedRace.standings[2].driver}
                            teamName={selectedRace.standings[2].team}
                            points={selectedRace.standings[2].points}
                            driverImageUrl={selectedRace.standings[2].driverImageUrl}
                            accentColor={teamColors[selectedRace.standings[2].team] || '#00D2BE'}
                          />
                        </Grid>
                      </VStack>
                    </Box>
                  </VStack>
                  <WeatherCard weather={selectedRace.weather} race={selectedRace} />
                </Grid>
              </VStack>
            </TabPanel>

            {/* TAB 2: RACE RESULTS */}
            <TabPanel p={{ base: 'md', lg: 'lg' }}>
              <VStack spacing="lg" align="stretch">
                <RaceStandingsTable race={selectedRace} allRaces={mockRaces} onSelectRace={setSelectedRaceId} />
                <LapPositionChart race={selectedRace} />
              </VStack>
            </TabPanel>

            {/* TAB 3: DETAILED ANALYTICS */}
            <TabPanel p={{ base: 'md', lg: 'lg' }}>
              <Grid templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap="lg">
                <FastestLapCard 
                  driver={selectedRace.keyInfo.fastestLap.driver}
                  time={selectedRace.keyInfo.fastestLap.time}
                />
                <RaceControlLog messages={selectedRace.raceControlMessages} />
                <FlagsTimeline timeline={selectedRace.flagsTimeline} />
                <PaceDistributionChart data={selectedRace.paceDistribution} />
                <TireStrategyChart data={selectedRace.tireStrategies} />
              </Grid>
            </TabPanel>

            {/* TAB 4: WEATHER */}
            <TabPanel p={{ base: 'md', lg: 'lg' }}>
              <WeatherCard weather={selectedRace.weather} race={selectedRace} />
            </TabPanel>

            {/* TAB 5: HISTORICAL STATS */}
            <TabPanel p={{ base: 'md', lg: 'lg' }}>
              <HistoricalStatsTable stats={selectedRace.historicalStats} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </Box>
  );
};

export default RacesPage;
