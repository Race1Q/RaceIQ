// frontend/src/pages/ConstructorsDetails/ConstructorsDetailsSkeleton.tsx
import React from 'react';
import { Box, HStack, VStack, Text, Container, SimpleGrid, Flex, Button } from '@chakra-ui/react';
import SpeedometerMini from '../../components/loaders/SpeedometerMini';

// Skeleton line component with shimmer animation
const SkeletonLine = ({ w = '60%', h = '12px', br = 'md' }: { w?: any; h?: any; br?: string }) => (
  <Box w={w} h={h} borderRadius={br} bg="bg-surface" position="relative" overflow="hidden">
    <Box
      position="absolute"
      inset={0}
      transform="translateX(-100%)"
      bgGradient="linear(to-r, transparent, whiteAlpha.200, transparent)"
      animation="shimmer 1.4s infinite"
      sx={{ '@keyframes shimmer': { '100%': { transform: 'translateX(100%)' } } }}
    />
  </Box>
);

// Skeleton circle component with shimmer animation
const SkeletonCircle = ({ size = '40px' }: { size?: any }) => (
  <Box
    w={size}
    h={size}
    borderRadius="full"
    bg="bg-surface"
    position="relative"
    overflow="hidden"
  >
    <Box
      position="absolute"
      inset={0}
      transform="translateX(-100%)"
      bgGradient="linear(to-r, transparent, whiteAlpha.200, transparent)"
      animation="shimmer 1.4s infinite"
      sx={{ '@keyframes shimmer': { '100%': { transform: 'translateX(100%)' } } }}
    />
  </Box>
);

// Skeleton rectangle component with shimmer animation
const SkeletonRect = ({ w = '100px', h = '100px', br = 'md' }: { w?: any; h?: any; br?: string }) => (
  <Box w={w} h={h} borderRadius={br} bg="bg-surface" position="relative" overflow="hidden">
    <Box
      position="absolute"
      inset={0}
      transform="translateX(-100%)"
      bgGradient="linear(to-r, transparent, whiteAlpha.200, transparent)"
      animation="shimmer 1.4s infinite"
      sx={{ '@keyframes shimmer': { '100%': { transform: 'translateX(100%)' } } }}
    />
  </Box>
);

// Back button skeleton
const BackButtonSkeleton = () => (
  <Box bg="bg-surface" borderBottom="1px solid" borderColor="border-primary" mt={0}>
    <Container maxW="container.2xl" px={{ base: 4, md: 6 }} py={{ base: 2, md: 3 }}>
      <SkeletonRect w="140px" h="32px" />
    </Container>
  </Box>
);

// Header section skeleton - simplified to just a header box
const HeaderSkeleton = () => {
  return (
    <Box
      mb={4}
      p={{ base: 6, md: 8 }}
      h={{ base: '120px', md: '140px' }}
      borderRadius="md"
      position="relative"
      bg="bg-surface"
      _after={{
        content: '""',
        position: 'absolute',
        inset: 0,
        transform: 'translateX(-100%)',
        bgGradient: 'linear(to-r, transparent, whiteAlpha.200, transparent)',
        animation: 'shimmer 1.4s infinite',
        sx: { '@keyframes shimmer': { '100%': { transform: 'translateX(100%)' } } }
      }}
    />
  );
};

// Stat section skeleton - matches the StatSection component
const StatSectionSkeleton = ({ title }: { title: string }) => (
  <Box mb={6}>
    <VStack spacing={4} align="stretch">
      {/* Section title */}
      <SkeletonLine w="200px" h="24px" />
      
      {/* Stats grid - 4 columns on desktop, 2 on tablet, 1 on mobile */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Box
            key={i}
            bg="bg-surface-raised"
            borderRadius="lg"
            p={6}
            textAlign="center"
            border="1px solid"
            borderColor="border-primary"
          >
            <VStack spacing={3}>
              {/* Stat label skeleton */}
              <SkeletonLine w="80px" h="14px" />
              {/* Stat value skeleton */}
              <SkeletonLine w="60px" h="32px" />
            </VStack>
          </Box>
        ))}
      </SimpleGrid>
    </VStack>
  </Box>
);

// Chart skeleton - matches the chart containers
const ChartSkeleton = ({ title }: { title: string }) => (
  <Box w="100%" h="300px" bg="bg-surface-raised" p={4} borderRadius="md" border="1px solid" borderColor="border-primary">
    <VStack spacing={4} align="stretch" h="100%">
      {/* Chart title */}
      <SkeletonLine w="150px" h="20px" />
      
      {/* Chart area skeleton */}
      <Box flex={1} position="relative">
        <SkeletonRect w="100%" h="100%" />
      </Box>
    </VStack>
  </Box>
);

// Full width chart skeleton
const FullWidthChartSkeleton = ({ title }: { title: string }) => (
  <Box w="100%" h="400px" bg="bg-surface-raised" p={4} borderRadius="md" mb={6} border="1px solid" borderColor="border-primary">
    <VStack spacing={4} align="stretch" h="100%">
      {/* Chart title */}
      <SkeletonLine w="250px" h="20px" />
      
      {/* Chart area skeleton */}
      <Box flex={1} position="relative">
        <SkeletonRect w="100%" h="100%" />
      </Box>
    </VStack>
  </Box>
);

// Best race section skeleton
const BestRaceSkeleton = () => (
  <Box p={4} bg="bg-surface-raised" borderRadius="md" minW="200px" border="1px solid" borderColor="border-primary">
    <VStack spacing={2} align="flex-start">
      <SkeletonLine w="200px" h="20px" />
      <SkeletonLine w="150px" h="20px" />
      <SkeletonLine w="100px" h="24px" />
    </VStack>
  </Box>
);

const ConstructorsDetailsSkeleton: React.FC = () => {
  return (
    <Box bg="bg-primary" color="text-primary" minH="100vh" position="relative" fontFamily="var(--font-display)">
      {/* Background: skeleton content */}
      <Box>
        {/* Top Utility Bar */}
        <BackButtonSkeleton />
        
        <Container maxW="container.2xl" px={{ base: 4, md: 6 }}>
          {/* Header Section */}
          <HeaderSkeleton />

          {/* 2025 Season Stats */}
          <StatSectionSkeleton title="2025 Season" />

          {/* Career Totals */}
          <StatSectionSkeleton title="Career Totals" />

          {/* Charts Grid - 2x2 on desktop, 1x4 on mobile */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6} mb={6}>
            <ChartSkeleton title="Points by Season" />
            <ChartSkeleton title="Wins by Season" />
            <ChartSkeleton title="Podiums by Season" />
            <ChartSkeleton title="Poles by Season" />
          </SimpleGrid>

          {/* Cumulative Progression Chart - Full Width */}
          <FullWidthChartSkeleton title="Cumulative Points Progression" />

          {/* Best Race Section */}
          <BestRaceSkeleton />
        </Container>
      </Box>

      {/* Foreground: centered speedometer + text */}
      <Box position="absolute" inset={0} display="flex" flexDir="column" alignItems="center" justifyContent="flex-start" pt={{ base: '20%', md: '15%' }} gap={4}>
        <SpeedometerMini size={260} />
        <Text fontFamily="heading" fontWeight={700} fontSize={{ base: 'lg', md: 'xl' }} color="text-secondary" textAlign="center">
          Loading constructor details...
        </Text>
      </Box>
    </Box>
  );
};

export default ConstructorsDetailsSkeleton;
