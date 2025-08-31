import React from 'react';
import { Box, Text, VStack, HStack, Image } from '@chakra-ui/react';
import { Trophy, Medal, Award } from 'lucide-react';
import type { RaceStanding } from '../../data/types';
import { teamLogoMap } from '../../lib/teamAssets';
import styles from './RaceStandings.module.css';

interface RaceStandingsProps {
  standings: RaceStanding[];
}

const RaceStandings: React.FC<RaceStandingsProps> = ({ standings }) => {
  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy size={20} className={styles.goldIcon} />;
      case 2:
        return <Medal size={20} className={styles.silverIcon} />;
      case 3:
        return <Award size={20} className={styles.bronzeIcon} />;
      default:
        return null;
    }
  };

  const getPositionClass = (position: number) => {
    switch (position) {
      case 1:
        return styles.first;
      case 2:
        return styles.second;
      case 3:
        return styles.third;
      default:
        return styles.other;
    }
  };

  return (
    <Box className={styles.container}>
      <Text className={styles.title}>Race Results</Text>
      
      <Box className={styles.standingsContainer}>
        <VStack className={styles.standingsList} spacing={0}>
          {standings.map((standing) => (
            <Box
              key={standing.position}
              className={`${styles.standingItem} ${getPositionClass(standing.position)}`}
            >
              <HStack className={styles.standingContent}>
                <Box className={styles.positionContainer}>
                  {getPositionIcon(standing.position)}
                  <Text className={styles.position}>{standing.position}</Text>
                </Box>
                
                <Image 
                  src={teamLogoMap[standing.team] || teamLogoMap["Default"]} 
                  alt={`${standing.team} logo`}
                  className={styles.teamLogo}
                  fallbackSrc={teamLogoMap["Default"]}
                />
                
                <Box className={styles.driverInfo}>
                  <Text className={styles.driverAbbreviation}>{standing.driverAbbreviation}</Text>
                  <Text className={styles.driverName}>{standing.driver}</Text>
                </Box>
                
                <Text className={styles.interval}>
                  {standing.interval}
                </Text>
              </HStack>
            </Box>
          ))}
        </VStack>
      </Box>
    </Box>
  );
};

export default RaceStandings;
