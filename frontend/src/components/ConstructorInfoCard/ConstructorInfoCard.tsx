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
  const { data: rawInfo, loading, error } = useAiConstructorInfo(constructorId, season);
  const { accentColorWithHash } = useThemeColor();

  // Handle malformed data structure where data might be wrapped in a "0" key
  const info = React.useMemo(() => {
    if (!rawInfo) return null;
    
    // Check if data is malformed (has a "0" key instead of direct properties)
    if ((rawInfo as any)[0] && typeof (rawInfo as any)[0] === 'object') {
      const actualData = (rawInfo as any)[0];
      return {
        ...actualData,
        generatedAt: rawInfo.generatedAt || actualData.generatedAt,
        isFallback: rawInfo.isFallback !== undefined ? rawInfo.isFallback : actualData.isFallback
      };
    }
    
    return rawInfo;
  }, [rawInfo]);

  // Debug logging
  React.useEffect(() => {
    if (!loading) {
      console.log('[ConstructorInfoCard] Constructor ID:', constructorId);
      console.log('[ConstructorInfoCard] Raw info data:', rawInfo);
      console.log('[ConstructorInfoCard] Processed info:', info);
      console.log('[ConstructorInfoCard] Error:', error);
    }
  }, [loading, rawInfo, info, error, constructorId]);

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

  if (error) {
    return (
      <Box bg="bg-elevated" p={6} borderRadius="lg" border="1px solid" borderColor="border-subtle">
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <VStack align="start">
            <Text fontSize="sm">Unable to load team analysis. Please try again later.</Text>
            <Text fontSize="xs" color="text-muted">{error.message}</Text>
          </VStack>
        </Alert>
      </Box>
    );
  }

  if (!info) {
    return (
      <Box bg="bg-elevated" p={6} borderRadius="lg" border="1px solid" borderColor="border-subtle">
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Text fontSize="sm">Team analysis is not available for this constructor yet.</Text>
        </Alert>
      </Box>
    );
  }

  // Check if we have any content at all
  const hasAnyContent = info.overview || info.history || 
    (info.strengths && info.strengths.length > 0) || 
    (info.challenges && info.challenges.length > 0) ||
    (info.notableAchievements && info.notableAchievements.length > 0) ||
    info.currentSeason;

  if (!hasAnyContent) {
    return (
      <Box bg="bg-elevated" p={6} borderRadius="lg" border="1px solid" borderColor="border-subtle">
        <VStack align="start" spacing={4}>
          <HStack justify="space-between" w="full">
            <Heading size="md" color={accentColorWithHash}>
              Team Analysis
            </Heading>
          </HStack>
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <Text fontSize="sm">Team analysis data is being generated. Please check back later.</Text>
          </Alert>
        </VStack>
      </Box>
    );
  }

  return (
    <Box bg="bg-elevated" p={{ base: 4, md: 6 }} borderRadius="lg" border="1px solid" borderColor="border-subtle">
      <VStack align="start" spacing={{ base: 4, md: 6 }}>
        {/* Header */}
        <HStack justify="space-between" w="full" flexWrap="wrap" gap={2}>
          <Heading size={{ base: "md", md: "lg" }} color={accentColorWithHash}>
            Team Analysis
          </Heading>
          {!info.isFallback && <GeminiBadge />}
        </HStack>

        {/* Overview */}
        {info.overview && (
          <Box w="full">
            <Heading size={{ base: "sm", md: "md" }} color={accentColorWithHash} mb={{ base: 2, md: 3 }}>
              Overview
            </Heading>
            <Text color="text-primary" fontSize={{ base: "sm", md: "md" }} lineHeight="1.7">
              {info.overview}
            </Text>
          </Box>
        )}

        {/* History */}
        {info.history && (
          <Box w="full">
            <Heading size={{ base: "sm", md: "md" }} color={accentColorWithHash} mb={{ base: 2, md: 3 }}>
              Team History
            </Heading>
            <Text color="text-primary" fontSize={{ base: "sm", md: "md" }} lineHeight="1.7">
              {info.history}
            </Text>
          </Box>
        )}

        {/* Strengths and Challenges Grid */}
        {(info.strengths || info.challenges) && (
          <Box w="full">
            <VStack align="start" spacing={{ base: 4, md: 0 }} w="full">
              <HStack align="start" spacing={{ base: 0, md: 6 }} flexDirection={{ base: "column", md: "row" }} w="full">
                {/* Strengths */}
                {info.strengths && info.strengths.length > 0 && (
                  <Box flex="1" w={{ base: "full", md: "auto" }} minW={{ md: "300px" }} mb={{ base: 4, md: 0 }}>
                    <Heading size={{ base: "sm", md: "md" }} color={accentColorWithHash} mb={{ base: 2, md: 3 }}>
                      Strengths
                    </Heading>
                    <UnorderedList spacing={2} pl={{ base: 4, md: 5 }}>
                      {info.strengths.map((strength: string, index: number) => (
                        <ListItem key={index} color="text-primary" fontSize={{ base: "xs", md: "sm" }}>
                          {strength}
                        </ListItem>
                      ))}
                    </UnorderedList>
                  </Box>
                )}

                {/* Challenges */}
                {info.challenges && info.challenges.length > 0 && (
                  <Box flex="1" w={{ base: "full", md: "auto" }} minW={{ md: "300px" }}>
                    <Heading size={{ base: "sm", md: "md" }} color={accentColorWithHash} mb={{ base: 2, md: 3 }}>
                      Challenges
                    </Heading>
                    <UnorderedList spacing={2} pl={{ base: 4, md: 5 }}>
                      {info.challenges.map((challenge: string, index: number) => (
                        <ListItem key={index} color="text-primary" fontSize={{ base: "xs", md: "sm" }}>
                          {challenge}
                        </ListItem>
                      ))}
                    </UnorderedList>
                  </Box>
                )}
              </HStack>
            </VStack>
          </Box>
        )}

        {/* Notable Achievements */}
        {info.notableAchievements && info.notableAchievements.length > 0 && (
          <Box w="full">
            <Heading size={{ base: "sm", md: "md" }} color={accentColorWithHash} mb={{ base: 2, md: 3 }}>
              Notable Achievements
            </Heading>
            <UnorderedList spacing={2} pl={{ base: 4, md: 5 }}>
              {info.notableAchievements.map((achievement: string, index: number) => (
                <ListItem key={index} color="text-primary" fontSize={{ base: "xs", md: "sm" }}>
                  {achievement}
                </ListItem>
              ))}
            </UnorderedList>
          </Box>
        )}

        {/* Current Season */}
        {info.currentSeason && (
          <Box w="full">
            <Heading size={{ base: "sm", md: "md" }} color={accentColorWithHash} mb={{ base: 2, md: 3 }}>
              Current Season Analysis
            </Heading>
            <VStack align="start" spacing={{ base: 2, md: 3 }}>
              <Text color="text-primary" fontSize={{ base: "sm", md: "md" }} lineHeight="1.7">
                <strong>Performance:</strong> {info.currentSeason.performance}
              </Text>
              
              {info.currentSeason.highlights && info.currentSeason.highlights.length > 0 && (
                <Box w="full">
                  <Text color="text-secondary" fontSize={{ base: "xs", md: "sm" }} fontWeight="600" mb={2}>
                    Season Highlights:
                  </Text>
                  <UnorderedList spacing={1} pl={{ base: 4, md: 5 }}>
                    {info.currentSeason.highlights.map((highlight: string, index: number) => (
                      <ListItem key={index} color="text-primary" fontSize={{ base: "xs", md: "sm" }}>
                        {highlight}
                      </ListItem>
                    ))}
                  </UnorderedList>
                </Box>
              )}
              
              <Text color="text-primary" fontSize={{ base: "sm", md: "md" }} lineHeight="1.7">
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
