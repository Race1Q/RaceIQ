import { Text, VStack, HStack, Icon, Alert, AlertIcon, Skeleton, Stack } from '@chakra-ui/react';
import { Trophy, TrendingUp } from 'lucide-react';
import { usePredictions } from '../../../hooks/usePredictions';
import { useThemeColor } from '../../../context/ThemeColorContext';

interface PodiumPredictionWidgetProps {
  /** Optional race ID - if not provided, will show a message asking for race data */
  raceId?: number | null;
}

const PodiumPredictionWidget = ({ raceId }: PodiumPredictionWidgetProps) => {
  const { topThree, loading, error } = usePredictions(raceId || null);
  const { accentColorWithHash } = useThemeColor();

  // Loading state
  if (loading) {
    return (
      <VStack align="start" spacing={3} width="100%">
        <HStack>
          <Icon as={Trophy} color={accentColorWithHash} />
          <Skeleton height="20px" width="150px" />
        </HStack>
        <Stack spacing={2} width="100%">
          {[1, 2, 3].map((i) => (
            <HStack key={i} spacing={2} width="100%">
              <Skeleton height="16px" width="20px" />
              <Skeleton height="16px" flex="1" />
              <Skeleton height="16px" width="50px" />
            </HStack>
          ))}
        </Stack>
      </VStack>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert status="warning" variant="subtle" borderRadius="md" size="sm">
        <AlertIcon />
        <Text fontSize="sm">Unable to load predictions</Text>
      </Alert>
    );
  }

  // No race ID provided
  if (!raceId) {
    return (
      <VStack align="start" spacing={3} width="100%">
        <HStack>
          <Icon as={Trophy} color={accentColorWithHash} />
          <Text fontWeight="bold" fontSize="sm">Podium Prediction</Text>
        </HStack>
        <Text color="text-muted" fontSize="xs">
          Predictions available for upcoming races
        </Text>
      </VStack>
    );
  }

  // Empty predictions
  if (!topThree || topThree.length === 0) {
    return (
      <VStack align="start" spacing={3} width="100%">
        <HStack>
          <Icon as={Trophy} color={accentColorWithHash} />
          <Text fontWeight="bold" fontSize="sm">Podium Prediction</Text>
        </HStack>
        <Text color="text-muted" fontSize="xs">
          No predictions available yet
        </Text>
      </VStack>
    );
  }

  // Success - display top 3
  return (
    <VStack align="start" spacing={3} width="100%">
      <HStack>
        <Icon as={Trophy} color={accentColorWithHash} />
        <Text fontWeight="bold" fontSize="sm">Podium Prediction</Text>
      </HStack>
      {topThree.map((prediction, index) => {
        const probability = prediction.podiumProbability * 100;
        const isFirst = index === 0;
        
        return (
          <HStack 
            key={prediction.driverId} 
            spacing={2} 
            width="100%"
            p={2}
            borderRadius="md"
            bg={isFirst ? `${accentColorWithHash}10` : 'transparent'}
            transition="all 0.2s"
          >
            <Text 
              fontWeight="bold" 
              fontSize="sm" 
              minW="24px"
              color={isFirst ? accentColorWithHash : 'text-secondary'}
            >
              {index + 1}.
            </Text>
            <VStack align="start" spacing={0} flex="1">
              <Text fontWeight={isFirst ? 'bold' : 'semibold'} fontSize="sm">
                {prediction.driverName.split(' ').pop()}
              </Text>
              <Text color="text-muted" fontSize="xs">
                {prediction.constructorName}
              </Text>
            </VStack>
            <HStack spacing={1}>
              {isFirst && <TrendingUp size={14} color={accentColorWithHash} />}
              <Text 
                fontWeight="bold" 
                fontSize="sm"
                color={isFirst ? accentColorWithHash : 'text-secondary'}
              >
                {probability.toFixed(0)}%
              </Text>
            </HStack>
          </HStack>
        );
      })}
      <Text color="text-muted" fontSize="xs" fontStyle="italic">
        AI-powered predictions
      </Text>
    </VStack>
  );
};

export default PodiumPredictionWidget;
