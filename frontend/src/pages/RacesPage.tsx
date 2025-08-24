import React, { useState } from 'react';
import { Container, Flex, Grid, GridItem, Box, useBreakpointValue } from '@chakra-ui/react';
import RaceList from '../components/RaceList/RaceList';
import RaceHeader from '../components/RaceHeader/RaceHeader';
import TrackMap from '../components/TrackMap/TrackMap';
import RaceStandings from '../components/RaceStandings/RaceStandings';
import KeyInfoBlocks from '../components/KeyInfoBlocks/KeyInfoBlocks';
import FlagsTimeline from '../components/FlagsTimeline/FlagsTimeline';
import PaceDistributionChart from '../components/PaceDistributionChart/PaceDistributionChart';
import TireStrategyChart from '../components/TireStrategyChart/TireStrategyChart';
import HistoricalStatsTable from '../components/HistoricalStatsTable/HistoricalStatsTable';
import LapPositionChart from '../components/LapPositionChart/LapPositionChart';
import WeatherCard from '../components/WeatherCard/WeatherCard';
import RaceControlLog from '../components/RaceControlLog/RaceControlLog';
import FastestLapCard from '../components/FastestLapCard/FastestLapCard';
import TrackStatsBars from '../components/TrackStatsBars/TrackStatsBars';
import { mockRaces } from '../data/mockRaces';
import styles from './RacesPage.module.css';

const RacesPage: React.FC = () => {
  const [selectedRaceId, setSelectedRaceId] = useState('monza_2024');
  const isDesktop = useBreakpointValue({ base: false, lg: true });
  
  const selectedRace = mockRaces.find(race => race.id === selectedRaceId) || mockRaces[0];

  const handleRaceSelect = (raceId: string) => {
    setSelectedRaceId(raceId);
  };

  return (
    <Container maxWidth="1400px" className={styles.container}>
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

          {/* Top Row: TrackStatsBars, TrackMap, WeatherCard (1:2:1 ratio) */}
          <Flex className={styles.topRow} gap={6}>
            {/* TrackStatsBars - 1 part */}
            <Box className={styles.trackStatsSection} flex="1">
              <TrackStatsBars race={selectedRace} />
            </Box>

            {/* TrackMap - 2 parts */}
            <Box className={styles.trackMapSection} flex="2">
              <TrackMap
                coords={selectedRace.trackMapCoords}
                trackName={selectedRace.trackName}
                race={selectedRace}
              />
            </Box>

            {/* WeatherCard - 1 part */}
            <Box className={styles.weatherSection} flex="1">
              <WeatherCard weather={selectedRace.weather} />
            </Box>
          </Flex>

          {/* Analytics Grid */}
          <Grid className={styles.analyticsGrid} templateColumns="repeat(12, 1fr)" gap={6}>
            {/* Lap Position Chart */}
            <GridItem colSpan={{ base: 12, lg: 8 }}>
              <LapPositionChart race={selectedRace} />
            </GridItem>

            {/* Race Standings */}
            <GridItem colSpan={{ base: 12, md: 6, lg: 4 }}>
              <RaceStandings standings={selectedRace.standings} />
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
