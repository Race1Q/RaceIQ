import React from 'react';
import { Box, Text, VStack, HStack } from '@chakra-ui/react';
import { Sun, Cloud, CloudRain, Wind, Thermometer, Flag, MapPin, Route } from 'lucide-react';
import type { WeatherInfo, Race } from '../../data/types';
import { mockRaces } from '../../data/mockRaces';
import styles from './WeatherCard.module.css';

interface WeatherCardProps {
  weather: WeatherInfo;
  race: Race;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ weather, race }) => {
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

  // Calculate maximum values across all races for scaling
  const maxLaps = Math.max(...mockRaces.map(r => r.totalLaps));
  const maxCircuitLength = Math.max(...mockRaces.map(r => r.circuitLength));
  const maxRaceDistance = Math.max(...mockRaces.map(r => r.raceDistance));

  const getBarWidth = (value: number, maxValue: number) => {
    return (value / maxValue) * 100;
  };

  return (
    <Box className={styles.container}>
      {/* Track Stats Section - Now First */}
      <Box className={styles.trackStatsSection}>
        <Text className={styles.trackStatsTitle}>Track Information</Text>
        
        <VStack className={styles.trackStatsContainer} spacing={3}>
          <HStack className={styles.trackStatItem}>
            <Flag size={16} className={styles.trackStatIcon} />
            <Box className={styles.trackStatContent}>
              <Text className={styles.trackStatLabel}>LAPS</Text>
              <Box className={styles.trackStatBarContainer}>
                <Box 
                  className={styles.trackStatBar}
                  style={{ width: `${getBarWidth(race.totalLaps, maxLaps)}%` }}
                />
              </Box>
              <Text className={styles.trackStatValue}>{race.totalLaps}</Text>
            </Box>
          </HStack>

          <HStack className={styles.trackStatItem}>
            <MapPin size={16} className={styles.trackStatIcon} />
            <Box className={styles.trackStatContent}>
              <Text className={styles.trackStatLabel}>CIRCUIT LENGTH</Text>
              <Box className={styles.trackStatBarContainer}>
                <Box 
                  className={styles.trackStatBar}
                  style={{ width: `${getBarWidth(race.circuitLength, maxCircuitLength)}%` }}
                />
              </Box>
              <Text className={styles.trackStatValue}>{race.circuitLength} km</Text>
            </Box>
          </HStack>

          <HStack className={styles.trackStatItem}>
            <Route size={16} className={styles.trackStatIcon} />
            <Box className={styles.trackStatContent}>
              <Text className={styles.trackStatLabel}>RACE DISTANCE</Text>
              <Box className={styles.trackStatBarContainer}>
                <Box 
                  className={styles.trackStatBar}
                  style={{ width: `${getBarWidth(race.raceDistance, maxRaceDistance)}%` }}
                />
              </Box>
              <Text className={styles.trackStatValue}>{race.raceDistance} km</Text>
            </Box>
          </HStack>
        </VStack>
      </Box>

      {/* Weather Conditions Section - Now Second */}
      <Box className={styles.weatherSection}>
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
    </Box>
  );
};

export default WeatherCard;
