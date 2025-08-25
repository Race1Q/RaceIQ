import React from 'react';
import { Box, VStack, Heading, Text } from '@chakra-ui/react';
import styles from './PodiumCard.module.css';

interface PodiumCardProps {
  position: number;
  driverName: string;
  teamName: string;
  points: number;
  driverImageUrl: string;
  accentColor: string;
}

const PodiumCard: React.FC<PodiumCardProps> = ({
  position,
  driverName,
  teamName,
  points,
  driverImageUrl,
  accentColor,
}) => {
  const getPositionText = (pos: number) => {
    switch (pos) {
      case 1: return '1st';
      case 2: return '2nd';
      case 3: return '3rd';
      default: return `${pos}th`;
    }
  };

  return (
    <Box
      className={styles.card}
      style={{ '--accent-color': accentColor } as React.CSSProperties}
    >
      <Text className={styles.positionIndicator}>{getPositionText(position)}</Text>
      
      {/* Central text content */}
      <VStack className={styles.textContent} align="flex-start">
        {/* VStack to group driver and team name */}
        <VStack align="flex-start" spacing={1}> {/* CHANGED: Added spacing */}
          <Heading className={styles.driverName}>{driverName}</Heading>
          <Text className={styles.teamName}>{teamName}</Text>
        </VStack>
      </VStack>

      {/* Points are positioned absolutely via CSS */}
      <Text className={styles.points}>{points}Pts</Text>

      <img
        src={driverImageUrl}
        alt={driverName}
        className={styles.driverImage}
      />
    </Box>
  );
};

export default PodiumCard;