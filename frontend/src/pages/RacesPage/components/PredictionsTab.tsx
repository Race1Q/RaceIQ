import { useState, useEffect } from 'react';
import { Box, Text, Spinner, VStack, HStack, Progress, Heading } from '@chakra-ui/react';
import { getPredictions } from '../../../services/predictionService';
import type { PredictionResponse } from '../../../services/predictionService';
import { useDriversData } from '../../../hooks/useDriversData';
import { useThemeColor } from '../../../context/ThemeColorContext';
import { preparePredictionPayload } from '../../../lib/preparePredictionPayload';
import type { Driver } from '../../../types';

interface PredictionsTabProps {
  raceId: number;
}

const PredictionsTab = ({ raceId }: PredictionsTabProps) => {
  const [predictions, setPredictions] = useState<PredictionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentYear = new Date().getFullYear();
  const { drivers } = useDriversData(currentYear);
  const { accentColor, accentColorWithHash } = useThemeColor();

  useEffect(() => {
    // The raceId is not used yet, but it's passed in.
    // This will be a follow up to make predictions race-specific.
    if (drivers.length > 0) {
      const fetchPredictions = async () => {
        try {
          setLoading(true);
          const driverPredictionRequest = await preparePredictionPayload(drivers as Driver[], currentYear);
          const predictionResults = await getPredictions(driverPredictionRequest);
          
          const sortedPredictions = predictionResults.sort(
            (a, b) => b.prediction.podium_probability - a.prediction.podium_probability
          );

          setPredictions(sortedPredictions);
          setError(null);
        } catch (err) {
          setError('Failed to fetch predictions.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchPredictions();
    }
  }, [drivers, currentYear, raceId]); // Added raceId to dependency array

  if (loading) {
    return <Spinner color={accentColorWithHash} />;
  }

  if (error) {
    return <Text color="red.500">{error}</Text>;
  }

  return (
    <VStack align="start" spacing={4} p={4}>
      <Heading size="md">Podium Predictions</Heading>
      {predictions.map((p, index) => {
        const driver = drivers.find(d => d.id.toString() === p.driverId);
        const probability = p.prediction.podium_probability * 100;
        return (
          <Box key={p.driverId} w="100%">
            <HStack justify="space-between">
              <HStack>
                <Text fontWeight="bold">{index + 1}.</Text>
                <Text>{driver?.fullName || 'N/A'}</Text>
              </HStack>
              <Text fontWeight="bold">{probability.toFixed(1)}%</Text>
            </HStack>
            <Progress value={probability} size="sm" colorScheme={accentColor} borderRadius="md" />
          </Box>
        );
      })}
    </VStack>
  );
};

export default PredictionsTab;
