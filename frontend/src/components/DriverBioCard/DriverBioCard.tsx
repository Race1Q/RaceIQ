import React from 'react';
import { Box, VStack, Heading, Text, Skeleton, Alert, AlertIcon, UnorderedList, ListItem, HStack } from '@chakra-ui/react';
import { useAiDriverBio } from '../../hooks/useAiDriverBio';
import { useThemeColor } from '../../context/ThemeColorContext';
import GeminiBadge from '../GeminiBadge/GeminiBadge';

interface DriverBioCardProps {
  driverId: number;
  season?: number;
}

export const DriverBioCard: React.FC<DriverBioCardProps> = ({ driverId, season }) => {
  const { data, loading, error } = useAiDriverBio(driverId, season);
  const { accentColorWithHash } = useThemeColor();

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <Box
        bg="bg-elevated"
        borderRadius="lg"
        border="1px solid"
        borderColor="border-subtle"
        p={6}
      >
        <VStack align="start" spacing={4}>
          <Skeleton height="32px" width="70%" />
          <Skeleton height="20px" width="90%" />
          <Skeleton height="100px" width="100%" />
          <Skeleton height="80px" width="100%" />
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        bg="bg-elevated"
        borderRadius="lg"
        border="1px solid"
        borderColor="border-subtle"
        p={6}
      >
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <Text fontSize="sm">Unable to load driver biography. Please try again later.</Text>
        </Alert>
      </Box>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Box
      bg="bg-elevated"
      borderRadius="lg"
      border="1px solid"
      borderColor="border-subtle"
      p={6}
    >
      <VStack align="start" spacing={5}>
        {/* Header with Title and Badge */}
        <HStack justify="space-between" w="full" flexWrap="wrap">
          <Heading
            size="lg"
            color={accentColorWithHash}
            fontFamily="heading"
          >
            {data.title}
          </Heading>
          {!data.isFallback && <GeminiBadge />}
        </HStack>

        {/* Teaser */}
        {data.teaser && (
          <Text
            color="text-primary"
            fontSize="lg"
            fontWeight="600"
            fontStyle="italic"
            lineHeight="1.6"
          >
            {data.teaser}
          </Text>
        )}

        {/* Paragraphs */}
        <VStack align="start" spacing={4} w="full">
          {data.paragraphs.map((paragraph, index) => (
            <Text
              key={index}
              color="text-primary"
              fontSize="md"
              lineHeight="1.8"
            >
              {paragraph}
            </Text>
          ))}
        </VStack>

        {/* Highlights */}
        {data.highlights && data.highlights.length > 0 && (
          <Box w="full">
            <Heading size="sm" color={accentColorWithHash} mb={3}>
              Career Highlights
            </Heading>
            <UnorderedList spacing={2} pl={4}>
              {data.highlights.map((highlight, index) => (
                <ListItem key={index} color="text-primary" fontSize="md">
                  {highlight}
                </ListItem>
              ))}
            </UnorderedList>
          </Box>
        )}

        {/* Metadata */}
        <Text color="text-muted" fontSize="xs" pt={2}>
          Generated {formatTime(data.generatedAt)}
          {data.season && ` • ${data.season} Season`}
        </Text>
      </VStack>
    </Box>
  );
};

export default DriverBioCard;

