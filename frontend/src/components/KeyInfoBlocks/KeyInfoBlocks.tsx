import React from 'react';
import { Box, Text, HStack } from '@chakra-ui/react';
import { Sun, CloudRain, Clock, TrendingUp } from 'lucide-react';
import StatCard from '../StatCard/StatCard';
import type { KeyInfo } from '../../data/types.ts';
import styles from './KeyInfoBlocks.module.css';

interface KeyInfoBlocksProps {
  keyInfo: KeyInfo;
  teamColor?: string;
}

const KeyInfoBlocks: React.FC<KeyInfoBlocksProps> = ({ keyInfo, teamColor }) => {
  const getWeatherIcon = (weather: string) => {
    switch (weather.toLowerCase()) {
      case 'rain':
        return <CloudRain size={24} />;
      case 'cloudy':
        return <CloudRain size={24} />;
      default:
        return <Sun size={24} />;
    }
  };

  return (
    <Box className={styles.container}>
      <Text className={styles.title}>Key Information</Text>
      
      <HStack className={styles.cardsContainer} spacing={4} wrap="wrap">
        <StatCard
          icon={getWeatherIcon(keyInfo.weather)}
          label="Weather"
          value={keyInfo.weather}
          description="Race conditions"
          teamColor={teamColor}
        />
        
        <StatCard
          icon={<Clock size={24} />}
          label="Fastest Lap"
          value={keyInfo.fastestLap.time}
          description={`by ${keyInfo.fastestLap.driver}`}
          teamColor={teamColor}
        />
        
        <StatCard
          icon={<TrendingUp size={24} />}
          label="Overtakes"
          value={keyInfo.totalOvertakes.toString()}
          description="Total overtakes"
          teamColor={teamColor}
        />
      </HStack>
    </Box>
  );
};

export default KeyInfoBlocks;
