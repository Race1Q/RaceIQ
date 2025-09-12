// frontend/src/components/TrackStatsBars/TrackStatsBars.tsx

import React from 'react';
import { Box, Text, VStack, HStack } from '@chakra-ui/react';
import { Flag, MapPin, Route } from 'lucide-react';
import type { Race } from '../../data/types';
import { mockRaces } from '../../data/mockRaces';
import styles from './TrackStatsBars.module.css';

interface TrackStatsBarsProps {
  race: Race;
  teamColor?: string;
}

const TrackStatsBars: React.FC<TrackStatsBarsProps> = ({ race, teamColor }) => {
  // Calculate maximum values across all races for scaling
  const maxLaps = Math.max(...mockRaces.map(r => r.totalLaps));
  const maxCircuitLength = Math.max(...mockRaces.map(r => r.circuitLength));
  const maxRaceDistance = Math.max(...mockRaces.map(r => r.raceDistance));

  const getBarWidth = (value: number, maxValue: number) => {
    return (value / maxValue) * 100;
  };

  return (
    <Box className={styles.container}>
      <VStack className={styles.statsContainer} spacing={3}>
        <HStack className={styles.statItem}>
          <Flag size={16} className={styles.icon} style={{ color: teamColor || 'var(--color-primary-red)' }} />
          <Box className={styles.statContent}>
            <Text className={styles.statLabel}>Laps</Text>
            <Box className={styles.barContainer}>
              <Box 
                className={styles.bar}
                style={{ 
                  width: `${getBarWidth(race.totalLaps, maxLaps)}%`,
                  backgroundColor: teamColor || 'var(--color-primary-red)'
                }}
              />
            </Box>
            <Text className={styles.statValue}>{race.totalLaps}</Text>
          </Box>
        </HStack>

        <HStack className={styles.statItem}>
          <MapPin size={16} className={styles.icon} style={{ color: teamColor || 'var(--color-primary-red)' }} />
          <Box className={styles.statContent}>
            <Text className={styles.statLabel}>Circuit Length</Text>
            <Box className={styles.barContainer}>
              <Box 
                className={styles.bar}
                style={{ 
                  width: `${getBarWidth(race.circuitLength, maxCircuitLength)}%`,
                  backgroundColor: teamColor || 'var(--color-primary-red)'
                }}
              />
            </Box>
            <Text className={styles.statValue}>{race.circuitLength} km</Text>
          </Box>
        </HStack>

        <HStack className={styles.statItem}>
          <Route size={16} className={styles.icon} style={{ color: teamColor || 'var(--color-primary-red)' }} />
          <Box className={styles.statContent}>
            <Text className={styles.statLabel}>Race Distance</Text>
            <Box className={styles.barContainer}>
              <Box 
                className={styles.bar}
                style={{ 
                  width: `${getBarWidth(race.raceDistance, maxRaceDistance)}%`,
                  backgroundColor: teamColor || 'var(--color-primary-red)'
                }}
              />
            </Box>
            <Text className={styles.statValue}>{race.raceDistance} km</Text>
          </Box>
        </HStack>
      </VStack>
    </Box>
  );
};

export default TrackStatsBars;
