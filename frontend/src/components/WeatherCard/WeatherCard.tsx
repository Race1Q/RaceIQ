import React from 'react';
import { Box, Text, VStack, HStack } from '@chakra-ui/react';
import { Sun, Cloud, CloudRain, Wind, Thermometer } from 'lucide-react';
import type { WeatherInfo } from '../../data/types';
import styles from './WeatherCard.module.css';

interface WeatherCardProps {
  weather: WeatherInfo;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ weather }) => {
  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'rain':
        return <CloudRain size={24} />;
      case 'cloudy':
        return <Cloud size={24} />;
      default:
        return <Sun size={24} />;
    }
  };

  return (
    <Box className={styles.container}>
      <Text className={styles.title}>Weather Conditions</Text>
      
      <VStack className={styles.weatherContainer} spacing={4}>
        <HStack className={styles.weatherItem}>
          <Box className={styles.iconContainer}>
            {getWeatherIcon(weather.condition)}
          </Box>
          <Box className={styles.weatherContent}>
            <Text className={styles.weatherLabel}>Air Temperature</Text>
            <Text className={styles.weatherValue}>{weather.airTemp}°C</Text>
          </Box>
        </HStack>

        <HStack className={styles.weatherItem}>
          <Box className={styles.iconContainer}>
            <Thermometer size={24} />
          </Box>
          <Box className={styles.weatherContent}>
            <Text className={styles.weatherLabel}>Track Temperature</Text>
            <Text className={styles.weatherValue}>{weather.trackTemp}°C</Text>
          </Box>
        </HStack>

        <HStack className={styles.weatherItem}>
          <Box className={styles.iconContainer}>
            <Wind size={24} />
          </Box>
          <Box className={styles.weatherContent}>
            <Text className={styles.weatherLabel}>Wind Speed</Text>
            <Text className={styles.weatherValue}>{weather.windSpeed} km/h</Text>
          </Box>
        </HStack>
      </VStack>
    </Box>
  );
};

export default WeatherCard;
