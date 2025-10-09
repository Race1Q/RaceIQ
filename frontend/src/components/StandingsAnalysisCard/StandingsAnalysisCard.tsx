import React from 'react';
import { Box, VStack, HStack, Heading, Text, Alert, AlertIcon, Spinner, UnorderedList, ListItem, Divider } from '@chakra-ui/react';
import { useThemeColor } from '../../context/ThemeColorContext';
import { useAiStandingsAnalysis } from '../../hooks/useAiStandingsAnalysis';
import GeminiBadge from '../GeminiBadge/GeminiBadge';

interface StandingsAnalysisCardProps {
  season?: number;
}

const StandingsAnalysisCard: React.FC<StandingsAnalysisCardProps> = ({ season }) => {
  const { data: analysis, loading, error } = useAiStandingsAnalysis(season);
  const { accentColorWithHash } = useThemeColor();

  const formatGeneratedAt = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Box bg="bg-elevated" p={6} borderRadius="lg" border="1px solid" borderColor="border-subtle">
        <VStack align="start" spacing={4}>
          <HStack justify="space-between" w="full">
            <Heading size="md" color={accentColorWithHash}>
              Championship Analysis
            </Heading>
            <GeminiBadge />
          </HStack>
          <Spinner size="lg" color={accentColorWithHash} />
          <Text color="text-muted" fontSize="sm">Analyzing championship standings and trends...</Text>
        </VStack>
      </Box>
    );
  }

  if (error || !analysis) {
    return (
      <Box bg="bg-elevated" p={6} borderRadius="lg" border="1px solid" borderColor="border-subtle">
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <VStack align="start">
            <Text fontSize="sm">Unable to load championship analysis. Please try again later.</Text>
            {error && <Text fontSize="xs" color="text-muted">{error.message}</Text>}
          </VStack>
        </Alert>
      </Box>
    );
  }

  return (
    <Box bg="bg-elevated" p={6} borderRadius="lg" border="1px solid" borderColor="border-subtle">
      <VStack align="start" spacing={6}>
        {/* Header */}
        <HStack justify="space-between" w="full" flexWrap="wrap" gap={2}>
          <Heading size="lg" color={accentColorWithHash}>
            Championship Analysis
          </Heading>
          {!analysis.isFallback && <GeminiBadge />}
        </HStack>

        {/* Overview */}
        <Box w="full">
          <Text color="text-primary" fontSize="md" lineHeight="1.7" fontWeight="500">
            {analysis.overview}
          </Text>
        </Box>

        {/* Key Insights */}
        {analysis.keyInsights && analysis.keyInsights.length > 0 && (
          <Box w="full">
            <Heading size="md" color={accentColorWithHash} mb={3}>
              Key Insights
            </Heading>
            <UnorderedList spacing={2}>
              {analysis.keyInsights.map((insight, index) => (
                <ListItem key={index} color="text-primary" fontSize="sm">
                  {insight}
                </ListItem>
              ))}
            </UnorderedList>
          </Box>
        )}

        {/* Driver Analysis */}
        {analysis.driverAnalysis && (
          <Box w="full">
            <Heading size="md" color={accentColorWithHash} mb={3}>
              Driver Championship Analysis
            </Heading>
            <VStack align="start" spacing={3}>
              <Box>
                <Text color="text-secondary" fontSize="sm" fontWeight="600" mb={1}>
                  Championship Leader:
                </Text>
                <Text color="text-primary" fontSize="sm">
                  {analysis.driverAnalysis.leader}
                </Text>
              </Box>
              
              <Box>
                <Text color="text-secondary" fontSize="sm" fontWeight="600" mb={1}>
                  Biggest Riser:
                </Text>
                <Text color="text-primary" fontSize="sm">
                  {analysis.driverAnalysis.biggestRiser}
                </Text>
              </Box>
              
              <Box>
                <Text color="text-secondary" fontSize="sm" fontWeight="600" mb={1}>
                  Biggest Fall:
                </Text>
                <Text color="text-primary" fontSize="sm">
                  {analysis.driverAnalysis.biggestFall}
                </Text>
              </Box>
              
              <Box>
                <Text color="text-secondary" fontSize="sm" fontWeight="600" mb={1}>
                  Midfield Battle:
                </Text>
                <Text color="text-primary" fontSize="sm">
                  {analysis.driverAnalysis.midfieldBattle}
                </Text>
              </Box>
            </VStack>
          </Box>
        )}

        <Divider borderColor="border-subtle" />

        {/* Constructor Analysis */}
        {analysis.constructorAnalysis && (
          <Box w="full">
            <Heading size="md" color={accentColorWithHash} mb={3}>
              Constructor Championship Analysis
            </Heading>
            <VStack align="start" spacing={3}>
              <Box>
                <Text color="text-secondary" fontSize="sm" fontWeight="600" mb={1}>
                  Championship Leader:
                </Text>
                <Text color="text-primary" fontSize="sm">
                  {analysis.constructorAnalysis.leader}
                </Text>
              </Box>
              
              <Box>
                <Text color="text-secondary" fontSize="sm" fontWeight="600" mb={1}>
                  Competition:
                </Text>
                <Text color="text-primary" fontSize="sm">
                  {analysis.constructorAnalysis.competition}
                </Text>
              </Box>
              
              <Box>
                <Text color="text-secondary" fontSize="sm" fontWeight="600" mb={1}>
                  Surprises:
                </Text>
                <Text color="text-primary" fontSize="sm">
                  {analysis.constructorAnalysis.surprises}
                </Text>
              </Box>
            </VStack>
          </Box>
        )}

        <Divider borderColor="border-subtle" />

        {/* Trends and Predictions */}
        <HStack align="start" spacing={6} flexWrap="wrap" w="full">
          {/* Trends */}
          {analysis.trends && analysis.trends.length > 0 && (
            <Box flex="1" minW="300px">
              <Heading size="md" color={accentColorWithHash} mb={3}>
                Current Trends
              </Heading>
              <UnorderedList spacing={2}>
                {analysis.trends.map((trend, index) => (
                  <ListItem key={index} color="text-primary" fontSize="sm">
                    {trend}
                  </ListItem>
                ))}
              </UnorderedList>
            </Box>
          )}

          {/* Predictions */}
          {analysis.predictions && analysis.predictions.length > 0 && (
            <Box flex="1" minW="300px">
              <Heading size="md" color={accentColorWithHash} mb={3}>
                Season Predictions
              </Heading>
              <UnorderedList spacing={2}>
                {analysis.predictions.map((prediction, index) => (
                  <ListItem key={index} color="text-primary" fontSize="sm">
                    {prediction}
                  </ListItem>
                ))}
              </UnorderedList>
            </Box>
          )}
        </HStack>

        {/* Metadata */}
        <Text color="text-muted" fontSize="xs" pt={2}>
          Generated {formatGeneratedAt(analysis.generatedAt)} {season ? `• ${season} Season` : ''}
          {analysis.isFallback && <Text as="span" ml={1}>(Fallback Data)</Text>}
        </Text>
      </VStack>
    </Box>
  );
};

export default StandingsAnalysisCard;
