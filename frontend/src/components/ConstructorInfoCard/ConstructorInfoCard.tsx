import React from 'react';
import { Box, VStack, HStack, Heading, Text, Alert, AlertIcon, Spinner, UnorderedList, ListItem } from '@chakra-ui/react';
import { useThemeColor } from '../../context/ThemeColorContext';
import { useAiConstructorInfo } from '../../hooks/useAiConstructorInfo';
import GeminiBadge from '../GeminiBadge/GeminiBadge';

interface ConstructorInfoCardProps {
  constructorId: number;
  season?: number;
}

const ConstructorInfoCard: React.FC<ConstructorInfoCardProps> = ({ constructorId, season }) => {
  const { data: info, loading, error } = useAiConstructorInfo(constructorId, season);
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
              Team Analysis
            </Heading>
            <GeminiBadge />
          </HStack>
          <Spinner size="lg" color={accentColorWithHash} />
          <Text color="text-muted" fontSize="sm">Generating comprehensive team insights...</Text>
        </VStack>
      </Box>
    );
  }

  if (error || !info) {
    return (
      <Box bg="bg-elevated" p={6} borderRadius="lg" border="1px solid" borderColor="border-subtle">
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <VStack align="start">
            <Text fontSize="sm">Unable to load team analysis. Please try again later.</Text>
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
            Team Analysis
          </Heading>
          {!info.isFallback && <GeminiBadge />}
        </HStack>

        {/* Overview */}
        <Box w="full">
          <Heading size="md" color={accentColorWithHash} mb={3}>
            Overview
          </Heading>
          <Text color="text-primary" fontSize="md" lineHeight="1.7">
            {info.overview}
          </Text>
        </Box>

        {/* History */}
        <Box w="full">
          <Heading size="md" color={accentColorWithHash} mb={3}>
            Team History
          </Heading>
          <Text color="text-primary" fontSize="md" lineHeight="1.7">
            {info.history}
          </Text>
        </Box>

        {/* Strengths and Challenges Grid */}
        <Box w="full">
          <HStack align="start" spacing={6} flexWrap="wrap">
            {/* Strengths */}
            <Box flex="1" minW="300px">
              <Heading size="md" color={accentColorWithHash} mb={3}>
                Strengths
              </Heading>
              <UnorderedList spacing={2}>
                {info.strengths.map((strength, index) => (
                  <ListItem key={index} color="text-primary" fontSize="sm">
                    {strength}
                  </ListItem>
                ))}
              </UnorderedList>
            </Box>

            {/* Challenges */}
            <Box flex="1" minW="300px">
              <Heading size="md" color={accentColorWithHash} mb={3}>
                Challenges
              </Heading>
              <UnorderedList spacing={2}>
                {info.challenges.map((challenge, index) => (
                  <ListItem key={index} color="text-primary" fontSize="sm">
                    {challenge}
                  </ListItem>
                ))}
              </UnorderedList>
            </Box>
          </HStack>
        </Box>

        {/* Notable Achievements */}
        {info.notableAchievements && info.notableAchievements.length > 0 && (
          <Box w="full">
            <Heading size="md" color={accentColorWithHash} mb={3}>
              Notable Achievements
            </Heading>
            <UnorderedList spacing={2}>
              {info.notableAchievements.map((achievement, index) => (
                <ListItem key={index} color="text-primary" fontSize="sm">
                  {achievement}
                </ListItem>
              ))}
            </UnorderedList>
          </Box>
        )}

        {/* Current Season */}
        {info.currentSeason && (
          <Box w="full">
            <Heading size="md" color={accentColorWithHash} mb={3}>
              Current Season Analysis
            </Heading>
            <VStack align="start" spacing={3}>
              <Text color="text-primary" fontSize="md" lineHeight="1.7">
                <strong>Performance:</strong> {info.currentSeason.performance}
              </Text>
              
              {info.currentSeason.highlights && info.currentSeason.highlights.length > 0 && (
                <Box w="full">
                  <Text color="text-secondary" fontSize="sm" fontWeight="600" mb={2}>
                    Season Highlights:
                  </Text>
                  <UnorderedList spacing={1}>
                    {info.currentSeason.highlights.map((highlight, index) => (
                      <ListItem key={index} color="text-primary" fontSize="sm">
                        {highlight}
                      </ListItem>
                    ))}
                  </UnorderedList>
                </Box>
              )}
              
              <Text color="text-primary" fontSize="md" lineHeight="1.7">
                <strong>Outlook:</strong> {info.currentSeason.outlook}
              </Text>
            </VStack>
          </Box>
        )}

        {/* Metadata */}
        <Text color="text-muted" fontSize="xs" pt={2}>
          Generated {formatGeneratedAt(info.generatedAt)} {season ? `• ${season} Season` : ''}
          {info.isFallback && <Text as="span" ml={1}>(Fallback Data)</Text>}
        </Text>
      </VStack>
    </Box>
  );
};

export default ConstructorInfoCard;
