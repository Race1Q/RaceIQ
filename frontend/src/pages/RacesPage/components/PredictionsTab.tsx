import { Box, Text, VStack, HStack, Progress, Heading, Alert, AlertIcon, AlertTitle, AlertDescription, Skeleton, Stack } from '@chakra-ui/react';
import { usePredictions } from '../../../hooks/usePredictions';
import { useThemeColor } from '../../../context/ThemeColorContext';
import { Trophy, TrendingUp } from 'lucide-react';

interface PredictionsTabProps {
  raceId: number;
}

const PredictionsTab = ({ raceId }: PredictionsTabProps) => {
  const { predictions, loading, error } = usePredictions(raceId);
  const { accentColor, accentColorWithHash } = useThemeColor();

  // Loading skeleton
  if (loading) {
    return (
      <VStack align="start" spacing={4} p={6}>
        <Skeleton height="32px" width="250px" />
        <Stack spacing={4} width="100%">
          {[1, 2, 3, 4, 5].map((i) => (
            <Box key={i} width="100%">
              <HStack justify="space-between" mb={2}>
                <Skeleton height="20px" width="200px" />
                <Skeleton height="20px" width="60px" />
              </HStack>
              <Skeleton height="8px" width="100%" borderRadius="md" />
            </Box>
          ))}
        </Stack>
      </VStack>
    );
  }

  // Error state
  if (error) {
    return (
      <VStack align="center" justify="center" p={8} spacing={4}>
        <Alert
          status="error"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          borderRadius="lg"
          py={6}
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            Unable to Load Predictions
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            {error}. Please try again later or contact support if the problem persists.
          </AlertDescription>
        </Alert>
      </VStack>
    );
  }

  // Empty state
  if (!predictions || predictions.length === 0) {
    return (
      <VStack align="center" justify="center" p={8} spacing={4}>
        <Alert
          status="info"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          borderRadius="lg"
          py={6}
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            No Predictions Available
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            Predictions for this race are not yet available. Check back closer to race day.
          </AlertDescription>
        </Alert>
      </VStack>
    );
  }

  return (
    <VStack align="start" spacing={6} p={6} width="100%">
      {/* Header */}
      <HStack spacing={3}>
        <Trophy size={24} color={accentColorWithHash} />
        <Heading size="md" fontFamily="heading">
          Podium Predictions
        </Heading>
      </HStack>

      <Text color="text-muted" fontSize="sm">
        AI-powered predictions based on driver performance, team form, and historical data.
      </Text>

      {/* Predictions List */}
      <VStack align="start" spacing={4} width="100%">
        {predictions.map((prediction, index) => {
          const probability = prediction.podiumProbability * 100;
          const isTopThree = index < 3;
          
          return (
            <Box 
              key={prediction.driverId} 
              width="100%" 
              p={4}
              borderRadius="lg"
              bg={isTopThree ? `${accentColor}.50` : 'transparent'}
              borderWidth={isTopThree ? '2px' : '1px'}
              borderColor={isTopThree ? accentColorWithHash : 'gray.200'}
              transition="all 0.2s"
              _hover={{ 
                transform: 'translateY(-2px)',
                shadow: 'md',
              }}
            >
              <HStack justify="space-between" mb={2}>
                <HStack spacing={3}>
                  {/* Position Badge */}
                  <Box
                    minW="32px"
                    h="32px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    borderRadius="full"
                    bg={isTopThree ? accentColorWithHash : 'gray.200'}
                    color={isTopThree ? 'white' : 'gray.700'}
                    fontWeight="bold"
                    fontSize="sm"
                  >
                    {index + 1}
                  </Box>

                  {/* Driver Info */}
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="bold" fontSize="md">
                      {prediction.driverName}
                    </Text>
                    <Text color="text-muted" fontSize="sm">
                      {prediction.constructorName}
                    </Text>
                  </VStack>

                  {/* Top 3 Icon */}
                  {isTopThree && index === 0 && (
                    <TrendingUp size={18} color={accentColorWithHash} />
                  )}
                </HStack>

                {/* Probability */}
                <VStack align="end" spacing={0}>
                  <Text fontWeight="bold" fontSize="lg" color={accentColorWithHash}>
                    {probability.toFixed(1)}%
                  </Text>
                  <Text color="text-muted" fontSize="xs">
                    podium chance
                  </Text>
                </VStack>
              </HStack>

              {/* Progress Bar */}
              <Progress 
                value={probability} 
                size="sm" 
                colorScheme={accentColor} 
                borderRadius="md"
                bg="gray.100"
              />
            </Box>
          );
        })}
      </VStack>

      {/* Footer Note */}
      <Text color="text-muted" fontSize="xs" fontStyle="italic" pt={2}>
        Predictions are based on current season performance and may change as race conditions evolve.
      </Text>
    </VStack>
  );
};

export default PredictionsTab;
