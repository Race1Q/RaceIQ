import React from 'react';
import { Flex, Image, Heading, Text, Box } from '@chakra-ui/react';
import { teamColors } from '../../lib/teamColors';
import styles from './DriverProfileCard.module.css';

interface Driver {
  id: string;
  name: string;
  number: string;
  team: string;
  nationality: string;
  wins: number;
  podiums: number;
  fastestLaps: number;
  points: number;
  image: string;
}

interface DriverProfileCardProps {
  driver: Driver;
}

const DriverProfileCard: React.FC<DriverProfileCardProps> = ({ driver }) => {
  const teamColor = teamColors[driver.team] || '#666666';

  return (
    <Box className={styles.card} style={{ borderTopColor: teamColor }}>
      <Box className={styles.cardBody}>
        <Flex direction="column" align="center" textAlign="center">
          <Image
            src={driver.image}
            alt={driver.name}
            className={styles.driverImage}
          />
          
          <Box className={styles.driverNumber} style={{ color: teamColor }}>{driver.number}</Box>
          
          <Heading className={styles.driverName}>
            {driver.name}
          </Heading>
          
          <Text className={styles.driverTeam}>
            {driver.team}
          </Text>
          
          <Text className={styles.driverNationality}>
            {driver.nationality}
          </Text>
          
          <Box className={styles.statsContainer}>
            <Box className={styles.statItem}>
              <Text className={styles.statValue} style={{ color: teamColor }}>{driver.points}</Text>
              <Text className={styles.statLabel}>Points</Text>
            </Box>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
};

export default DriverProfileCard;
