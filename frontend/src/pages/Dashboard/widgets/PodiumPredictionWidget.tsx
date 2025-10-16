import { useState, useEffect } from 'react';
import { Text, Spinner, VStack, HStack, Icon } from '@chakra-ui/react';
import { Trophy } from 'lucide-react';
import type { PredictionResponse } from '../../../services/predictionService';
import { getPredictions } from '../../../services/predictionService';
import { useDriversData } from '../../../hooks/useDriversData';
import { useThemeColor } from '../../../context/ThemeColorContext';

import { preparePredictionPayload } from '../../../lib/preparePredictionPayload';

const PodiumPredictionWidget = () => {
  const [predictions, setPredictions] = useState<PredictionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { drivers } = useDriversData(new Date().getFullYear());
  const { accentColorWithHash } = useThemeColor();

  useEffect(() => {
    if (drivers.length > 0) {
      const fetchPredictions = async () => {
        try {
          setLoading(true);
          
          const driverPredictionRequest = await preparePredictionPayload(drivers, new Date().getFullYear());

          const predictionResults = await getPredictions(driverPredictionRequest);
          
          const sortedPredictions = predictionResults.sort(
            (a, b) => b.prediction.podium_probability - a.prediction.podium_probability
          );

          setPredictions(sortedPredictions.slice(0, 3));
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
  }, [drivers]);

  if (loading) {
    return <Spinner color={accentColorWithHash} />;
  }

  if (error) {
    return <Text color="red.500">{error}</Text>;
  }

  return (
    <VStack align="start" spacing={4}>
      <HStack>
        <Icon as={Trophy} color={accentColorWithHash} />
        <Text fontWeight="bold">Podium Prediction</Text>
      </HStack>
      {predictions.map((p, index) => {
        const driver = drivers.find(d => d.id.toString() === p.driverId);
        return (
          <HStack key={p.driverId}>
            <Text>{index + 1}.</Text>
            <Text>{driver?.fullName.split(' ')[1] || 'N/A'}</Text>
            <Text>{(p.prediction.podium_probability * 100).toFixed(0)}%</Text>
          </HStack>
        );
      })}
    </VStack>
  );
};

export default PodiumPredictionWidget;
