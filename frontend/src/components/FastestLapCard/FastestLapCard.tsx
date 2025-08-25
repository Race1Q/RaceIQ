import React from 'react';
import { Box, Text, HStack, VStack } from '@chakra-ui/react';
import { Clock, Zap } from 'lucide-react';
import styles from './FastestLapCard.module.css';

interface FastestLapCardProps {
  driver: string;
  time: string;
}

const FastestLapCard: React.FC<FastestLapCardProps> = ({ driver, time }) => {
  return (
    <Box className={styles.container}>
      <HStack className={styles.header}>
        <Clock size={20} className={styles.icon} />
        <Text className={styles.title}>Fastest Lap</Text>
      </HStack>
      
      <VStack className={styles.content} spacing={2}>
        <Text className={styles.time}>{time}</Text>
        <HStack className={styles.driverInfo}>
          <Zap size={16} className={styles.driverIcon} />
          <Text className={styles.driverName}>{driver}</Text>
        </HStack>
      </VStack>
    </Box>
  );
};

export default FastestLapCard;
