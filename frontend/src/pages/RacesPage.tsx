import React, { useState } from 'react';
import { Container, Flex, Grid, GridItem, Box, useBreakpointValue, VStack, HStack } from '@chakra-ui/react';
import RaceList from '../components/RaceList/RaceList';
import RaceHeader from '../components/RaceHeader/RaceHeader';
import TrackMap from '../components/TrackMap/TrackMap';
import WeatherCard from '../components/WeatherCard/WeatherCard';
import PodiumCard from '../components/PodiumCard/PodiumCard';
import LapPositionChart from '../components/LapPositionChart/LapPositionChart';
import HistoricalStatsTable from '../components/HistoricalStatsTable/HistoricalStatsTable';
import FastestLapCard from '../components/FastestLapCard/FastestLapCard';
import RaceControlLog from '../components/RaceControlLog/RaceControlLog';
import FlagsTimeline from '../components/FlagsTimeline/FlagsTimeline';
import PaceDistributionChart from '../components/PaceDistributionChart/PaceDistributionChart';
import TireStrategyChart from '../components/TireStrategyChart/TireStrategyChart';
import { mockRaces } from '../data/mockRaces';
import { teamColors } from '../lib/assets';
import type { Race } from '../data/types';
import styles from './RacesPage.module.css';

const RacesPage: React.FC = () => {
  const [selectedRaceId, setSelectedRaceId] = useState('monza_2024');
  const isDesktop = useBreakpointValue({ base: false, lg: true });
  
  const selectedRace = mockRaces.find(race => race.id === selectedRaceId) || mockRaces[0];

  const handleRaceSelect = (raceId: string) => {
    setSelectedRaceId(raceId);
  };

  return (
    <Container maxWidth="1400px" px={8}>
      <Flex className={styles.layout}>
        {/* Desktop Sidebar - Part of flex layout */}
        {isDesktop && (
          <RaceList
            races={mockRaces}
            selectedRaceId={selectedRaceId}
            onRaceSelect={handleRaceSelect}
          />
        )}

        {/* Mobile Sidebar */}
        {!isDesktop && (
          <Box className={styles.sidebar}>
            <RaceList
              races={mockRaces}
              selectedRaceId={selectedRaceId}
              onRaceSelect={handleRaceSelect}
            />
          </Box>
        )}

        {/* Main Content */}
        <Box className={styles.mainContent}>
          {/* Race Header */}
          <RaceHeader race={selectedRace} />

          {/* Top Row: Two-column layout */}
          <Flex className={styles.topRow} gap={6}>
            {/* Left Column: Track Layout and Standings */}
            <Box className={styles.leftColumn} flex="8">
              <VStack className={styles.leftContent} spacing={6}>
                {/* Track Layout */}
                <Box className={styles.trackMapSection}>
                  <TrackMap
                    coords={selectedRace.trackMapCoords}
                    trackName={selectedRace.trackName}
                    race={selectedRace}
                  />
                </Box>

                {/* Standings */}
                <Box className={styles.standingsSection}>
                  <HStack spacing={4} className={styles.podiumContainer}>
                    <PodiumCard
                      position={1}
                      driverName={selectedRace.standings[0].driver}
                      teamName={selectedRace.standings[0].team}
                      points={selectedRace.standings[0].points}
                      driverImageUrl={selectedRace.standings[0].driverImageUrl}
                      accentColor={teamColors[selectedRace.standings[0].team] || '#00D2BE'}
                    />
                    <Box className={styles.podiumCard2nd}>
                      <PodiumCard
                        position={2}
                        driverName={selectedRace.standings[1].driver}
                        teamName={selectedRace.standings[1].team}
                        points={selectedRace.standings[1].points}
                        driverImageUrl={selectedRace.standings[1].driverImageUrl}
                        accentColor={teamColors[selectedRace.standings[1].team] || '#00D2BE'}
                      />
                    </Box>
                    <Box className={styles.podiumCard3rd}>
                      <PodiumCard
                        position={3}
                        driverName={selectedRace.standings[2].driver}
                        teamName={selectedRace.standings[2].team}
                        points={selectedRace.standings[2].points}
                        driverImageUrl={selectedRace.standings[2].driverImageUrl}
                        accentColor={teamColors[selectedRace.standings[2].team] || '#00D2BE'}
                      />
                    </Box>
                  </HStack>
                </Box>
              </VStack>
            </Box>

            {/* Right Column: Track Info & Weather (spans both rows) */}
            <Box className={styles.rightColumn} flex="2">
              <WeatherCard weather={selectedRace.weather} race={selectedRace} />
            </Box>
          </Flex>

          {/* Analytics Grid */}
          <Grid className={styles.analyticsGrid} templateColumns="repeat(12, 1fr)" gap={6}>
            {/* Lap Position Chart */}
            <GridItem colSpan={{ base: 12, lg: 8 }}>
              <LapPositionChart race={selectedRace} />
            </GridItem>

            {/* Historical Stats */}
            <GridItem colSpan={{ base: 12, md: 6, lg: 4 }}>
              <HistoricalStatsTable stats={selectedRace.historicalStats} />
            </GridItem>

            {/* Fastest Lap Card */}
            <GridItem colSpan={{ base: 12, lg: 4 }}>
              <FastestLapCard 
                driver={selectedRace.keyInfo.fastestLap.driver}
                time={selectedRace.keyInfo.fastestLap.time}
              />
            </GridItem>

            {/* Race Control Log */}
            <GridItem colSpan={{ base: 12, lg: 4 }}>
              <RaceControlLog messages={selectedRace.raceControlMessages} />
            </GridItem>

            {/* Flags Timeline */}
            <GridItem colSpan={{ base: 12, lg: 4 }}>
              <FlagsTimeline timeline={selectedRace.flagsTimeline} />
            </GridItem>

            {/* Pace Distribution Chart */}
            <GridItem colSpan={{ base: 12, lg: 6 }}>
              <PaceDistributionChart data={selectedRace.paceDistribution} />
            </GridItem>

            {/* Tire Strategy Chart */}
            <GridItem colSpan={{ base: 12, lg: 6 }}>
              <TireStrategyChart data={selectedRace.tireStrategies} />
            </GridItem>
          </Grid>
        </Box>
      </Flex>
    </Container>
  );
};

export default RacesPage;
