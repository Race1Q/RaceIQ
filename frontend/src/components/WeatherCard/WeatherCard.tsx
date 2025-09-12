// frontend/src/components/WeatherCard/WeatherCard.tsx

import React from 'react';
import { Box, Text, VStack, HStack, Heading, Progress } from '@chakra-ui/react';
import { Sun, Cloud, CloudRain, Wind, Thermometer, Flag, MapPin, Route } from 'lucide-react';
import type { WeatherInfo, Race } from '../../data/types';
import { mockRaces } from '../../data/mockRaces';

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
    <VStack spacing="lg" bg="bg-surface" p="lg" borderRadius="lg" borderWidth="1px" borderColor="border-primary" h="100%">
      {/* Track Stats Section */}
      <Box w="100%">
        <Heading as="h3" size="md" fontFamily="heading" color="text-primary" mb="md">
          Track Information
        </Heading>
        
        <VStack spacing="md" align="stretch">
          <Box>
            <HStack justify="space-between" mb="sm">
              <HStack spacing="sm">
                <Box as={Flag} size="16px" color="text-secondary" />
                <Text fontSize="sm" color="text-secondary" fontWeight="medium">LAPS</Text>
              </HStack>
              <Text fontSize="sm" color="text-primary" fontWeight="bold">{race.totalLaps}</Text>
            </HStack>
            <Progress value={getBarWidth(race.totalLaps, maxLaps)} size="sm" colorScheme="red" borderRadius="full" />
          </Box>

          <Box>
            <HStack justify="space-between" mb="sm">
              <HStack spacing="sm">
                <Box as={Flag} size="16px" color="text-secondary" />
                <Text fontSize="sm" color="text-secondary" fontWeight="medium">CIRCUIT LENGTH</Text>
              </HStack>
              <Text fontSize="sm" color="text-primary" fontWeight="bold">{race.circuitLength} km</Text>
            </HStack>
            <Progress value={getBarWidth(race.circuitLength, maxCircuitLength)} size="sm" colorScheme="blue" borderRadius="full" />
              </Box>

          <Box>
            <HStack justify="space-between" mb="sm">
              <HStack spacing="sm">
                <Box as={Route} size="16px" color="text-secondary" />
                <Text fontSize="sm" color="text-secondary" fontWeight="medium">RACE DISTANCE</Text>
              </HStack>
              <Text fontSize="sm" color="text-primary" fontWeight="bold">{race.raceDistance} km</Text>
            </HStack>
            <Progress value={getBarWidth(race.raceDistance, maxRaceDistance)} size="sm" colorScheme="green" borderRadius="full" />
          </Box>
        </VStack>
      </Box>

      {/* Weather Conditions Section */}
      <Box w="100%">
        <Heading as="h3" size="md" fontFamily="heading" color="text-primary" mb="md">
          Weather Conditions
        </Heading>
        
        <VStack spacing="md" align="stretch">
          <HStack spacing="md">
            <Box p="sm" bg="bg-surface-raised" borderRadius="md">
              {getWeatherIcon(weather.condition)}
            </Box>
            <Box>
              <Text fontSize="sm" color="text-secondary">Air Temperature</Text>
              <Text fontSize="lg" color="text-primary" fontWeight="bold">{weather.airTemp}°C</Text>
            </Box>
          </HStack>

          <HStack spacing="md">
            <Box p="sm" bg="bg-surface-raised" borderRadius="md">
              <Box as={Thermometer} size="24px" color="text-secondary" />
            </Box>
            <Box>
              <Text fontSize="sm" color="text-secondary">Track Temperature</Text>
              <Text fontSize="lg" color="text-primary" fontWeight="bold">{weather.trackTemp}°C</Text>
            </Box>
          </HStack>

          <HStack spacing="md">
            <Box p="sm" bg="bg-surface-raised" borderRadius="md">
              <Box as={Wind} size="24px" color="text-secondary" />
            </Box>
            <Box>
              <Text fontSize="sm" color="text-secondary">Wind Speed</Text>
              <Text fontSize="lg" color="text-primary" fontWeight="bold">{weather.windSpeed} km/h</Text>
            </Box>
          </HStack>
        </VStack>
      </Box>
    </VStack>
  );
};

export default WeatherCard;
