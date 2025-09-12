// frontend/src/components/StatCard/StatCard.tsx

import React from 'react';
import { Flex, Box, Text } from '@chakra-ui/react';
import styles from './StatCard.module.css';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
  teamColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, description, teamColor }) => {
  return (
    <Box className={styles.card}>
      <Box className={styles.cardBody}>
        <Flex align="center" justify="space-between">
          <Box 
            className={styles.iconContainer}
            style={{ backgroundColor: teamColor || 'var(--color-primary-red)' }}
          >
            {icon}
          </Box>
          <Box className={styles.stat}>
            <Text className={styles.statLabel}>{label}</Text>
            <Text className={styles.statNumber}>{value}</Text>
            <Text className={styles.statHelpText}>{description}</Text>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
};

export default StatCard;
