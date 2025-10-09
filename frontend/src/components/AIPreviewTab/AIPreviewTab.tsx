import React from 'react';
import {
  Box, VStack, HStack, Heading, Text, Icon, Alert, AlertIcon,
  SimpleGrid
} from '@chakra-ui/react';
import { MapPin, RotateCcw, CornerUpRight, Zap, Info, TrendingUp, Clock } from 'lucide-react';
import { useThemeColor } from '../../context/ThemeColorContext';
import { useAiTrackPreview } from '../../hooks/useAiTrackPreview';
import GeminiBadge from '../GeminiBadge/GeminiBadge';
import StatCard from '../StatCard/StatCard';
import { motion } from 'framer-motion';

const MotionBox = motion.create(Box);

interface AIPreviewTabProps {
  circuitId: number;
  circuitName: string;
  raceId?: number;
  trackStats: {
    length: string;
    laps: number;
    corners: number;
    drsZones: number;
  };
}

const AIPreviewTab: React.FC<AIPreviewTabProps> = ({
  circuitId,
  circuitName,
  raceId,
  trackStats
}) => {
  const { accentColorWithHash } = useThemeColor();
  const { data: trackPreview, loading: previewLoading, error } = useAiTrackPreview(
    circuitName || circuitId?.toString() || '',
    raceId
  );

  if (previewLoading) {
    return (
      <VStack align="stretch" spacing={4} p={4}>
        <HStack justify="space-between" align="center">
          <Heading size="lg" color={accentColorWithHash}>
            AI Track Preview
          </Heading>
          <GeminiBadge />
        </HStack>
        
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
          {[1, 2, 3, 4].map((i) => (
            <Box key={i} p={4} border="1px solid" borderColor="border-subtle" borderRadius="lg" bg="bg-elevated">
              <Box h="20px" bg="gray.600" borderRadius="md" mb={2} />
              <Box h="16px" bg="gray.700" borderRadius="sm" />
            </Box>
          ))}
        </SimpleGrid>

        <VStack align="start" spacing={4}>
          <Box h="24px" w="40%" bg="gray.600" borderRadius="md" />
          <Box h="60px" w="100%" bg="gray.600" borderRadius="md" />
          <Box h="80px" w="100%" bg="gray.600" borderRadius="md" />
        </VStack>
      </VStack>
    );
  }

  if (error) {
    return (
      <VStack align="stretch" spacing={4} p={4}>
        <HStack justify="space-between" align="center">
          <Heading size="lg" color={accentColorWithHash}>
            AI Track Preview
          </Heading>
          <GeminiBadge />
        </HStack>
        
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <Text fontSize="sm">
            Unable to load AI track preview. Please try again later.
          </Text>
        </Alert>
      </VStack>
    );
  }

  return (
    <VStack align="stretch" spacing={6} p={4}>
      {/* Header */}
      <HStack justify="space-between" align="center" flexWrap="wrap" gap={2}>
        <Heading size="lg" color={accentColorWithHash}>
          AI Track Preview
        </Heading>
        {trackPreview && !trackPreview.isFallback && <GeminiBadge />}
      </HStack>

      {/* Track Stats Grid */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
        <StatCard
          icon={MapPin}
          value={trackStats.length}
          label="Track Length"
          color="#3B82F6"
        />
        <StatCard
          icon={RotateCcw}
          value={trackStats.laps}
          label="Laps"
          color="#10B981"
        />
        <StatCard
          icon={CornerUpRight}
          value={trackStats.corners}
          label="Corners"
          color="#F59E0B"
        />
        <StatCard
          icon={Zap}
          value={trackStats.drsZones}
          label="DRS Zones"
          color="#EF4444"
        />
      </SimpleGrid>

      {/* AI Preview Content */}
      {trackPreview && !trackPreview.isFallback ? (
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <VStack align="stretch" spacing={6}>
            {/* Introduction */}
            <Box
              bg="bg-elevated"
              borderRadius="lg"
              border="1px solid"
              borderColor="border-subtle"
              p={6}
            >
              <VStack align="start" spacing={4}>
                <HStack align="center" spacing={3}>
                  <Icon as={Info} boxSize={5} color={accentColorWithHash} />
                  <Heading size="md" color={accentColorWithHash}>
                    Circuit Overview
                  </Heading>
                </HStack>
                
                <Text color="text-primary" fontSize="md" lineHeight="1.8">
                  {trackPreview.intro}
                </Text>
              </VStack>
            </Box>

            {/* Strategy Insights */}
            {trackPreview.strategyNotes && trackPreview.strategyNotes.length > 0 && (
              <Box
                bg="bg-elevated"
                borderRadius="lg"
                border="1px solid"
                borderColor="border-subtle"
                p={6}
              >
                <VStack align="start" spacing={4}>
                  <HStack align="center" spacing={3}>
                    <Icon as={TrendingUp} boxSize={5} color={accentColorWithHash} />
                    <Heading size="md" color={accentColorWithHash}>
                      Strategy Insights
                    </Heading>
                  </HStack>
                  
                  <VStack align="start" spacing={3}>
                    {trackPreview.strategyNotes.map((note, index) => (
                      <HStack key={index} align="start" spacing={3}>
                        <Box
                          w={2}
                          h={2}
                          bg={accentColorWithHash}
                          borderRadius="full"
                          mt={2}
                          flexShrink={0}
                        />
                        <Text color="text-primary" fontSize="sm" lineHeight="1.6">
                          {note}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                </VStack>
              </Box>
            )}

            {/* Weather Considerations */}
            {trackPreview.weatherAngle && (
              <Box
                bg="bg-elevated"
                borderRadius="lg"
                border="1px solid"
                borderColor="border-subtle"
                p={6}
              >
                <VStack align="start" spacing={4}>
                  <HStack align="center" spacing={3}>
                    <Icon as={Clock} boxSize={5} color={accentColorWithHash} />
                    <Heading size="md" color={accentColorWithHash}>
                      Weather Considerations
                    </Heading>
                  </HStack>
                  
                  <Text color="text-primary" fontSize="sm" lineHeight="1.6">
                    {trackPreview.weatherAngle}
                  </Text>
                </VStack>
              </Box>
            )}

            {/* Circuit History */}
            {trackPreview.historyBlurb && (
              <Box
                bg="bg-elevated"
                borderRadius="lg"
                border="1px solid"
                borderColor="border-subtle"
                p={6}
              >
                <VStack align="start" spacing={4}>
                  <HStack align="center" spacing={3}>
                    <Icon as={MapPin} boxSize={5} color={accentColorWithHash} />
                    <Heading size="md" color={accentColorWithHash}>
                      Circuit History
                    </Heading>
                  </HStack>
                  
                  <Text color="text-primary" fontSize="sm" lineHeight="1.6">
                    {trackPreview.historyBlurb}
                  </Text>
                </VStack>
              </Box>
            )}

            {/* Generation Info */}
            <Box textAlign="center" py={2}>
              <Text color="text-muted" fontSize="xs">
                Generated by Gemini AI • Last updated: {new Date(trackPreview.generatedAt).toLocaleString()}
              </Text>
            </Box>
          </VStack>
        </MotionBox>
      ) : (
        <Box
          bg="bg-elevated"
          borderRadius="lg"
          border="1px solid"
          borderColor="border-subtle"
          p={6}
        >
          <VStack align="center" spacing={4}>
            <Text color="text-muted" fontSize="sm" textAlign="center">
              AI track preview is temporarily unavailable. Check back soon for intelligent insights about this circuit.
            </Text>
          </VStack>
        </Box>
      )}
    </VStack>
  );
};

export default AIPreviewTab;
