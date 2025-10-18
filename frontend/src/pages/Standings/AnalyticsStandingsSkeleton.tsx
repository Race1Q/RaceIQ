// frontend/src/pages/Standings/AnalyticsStandingsSkeleton.tsx
import { Box, Flex, Text } from '@chakra-ui/react';
import SpeedometerMini from '../../components/loaders/SpeedometerMini';

// Chart Skeleton Component - Simple box with shimmer
const ChartSkeleton = () => (
  <Box 
    h="400px" 
    bg="bg-elevated" 
    borderRadius="md" 
    position="relative" 
    overflow="hidden"
    border="1px solid"
    borderColor="border-primary"
  >
    <Box
      position="absolute"
      inset={0}
      transform="translateX(-100%)"
      bgGradient="linear(to-r, transparent, whiteAlpha.200, transparent)"
      animation="shimmer 1.4s infinite"
      sx={{
        '@keyframes shimmer': { '100%': { transform: 'translateX(100%)' } },
      }}
    />
  </Box>
);

// AI Analysis Card Skeleton
const AIAnalysisCardSkeleton = () => (
  <Box 
    p={6} 
    bg="bg-elevated" 
    borderRadius="lg" 
    border="1px solid" 
    borderColor="border-subtle"
    position="relative"
    overflow="hidden"
    minH="300px"
  >
    <Box
      position="absolute"
      inset={0}
      transform="translateX(-100%)"
      bgGradient="linear(to-r, transparent, whiteAlpha.200, transparent)"
      animation="shimmer 1.4s infinite"
      sx={{
        '@keyframes shimmer': { '100%': { transform: 'translateX(100%)' } },
      }}
    />
  </Box>
);

export default function AnalyticsStandingsSkeleton() {
  return (
    <Box position="relative" minH={{ base: '50vh', md: '60vh' }}>
      {/* Background skeleton layer - only the chart/card shapes */}
      <Flex flexDirection="column" gap={6} opacity={0.7} pointerEvents="none" mt={8}>
        {/* Drivers Chart Skeleton */}
        <ChartSkeleton />
        
        {/* Constructors Chart Skeleton */}
        <ChartSkeleton />
        
        {/* AI Championship Analysis Skeleton */}
        <AIAnalysisCardSkeleton />
      </Flex>

      {/* Foreground: centered speedometer + text */}
      <Box position="absolute" inset={0} display="flex" flexDir="column" alignItems="center" justifyContent="flex-start" gap={4} pt={{ base: '120px', md: '140px' }}>
        <SpeedometerMini size={260} />
        <Text fontFamily="heading" fontWeight={700} fontSize={{ base: 'lg', md: 'xl' }} color="text-secondary" textAlign="center">
          Loading Analytics...
        </Text>
      </Box>
    </Box>
  );
}
