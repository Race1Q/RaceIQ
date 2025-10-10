// frontend/src/pages/Standings/AnalyticsStandingsSkeleton.tsx
import React from 'react';
import { Box, Flex, Text, VStack, HStack } from '@chakra-ui/react';
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
      sx={{
        '@keyframes shimmer': { '100%': { transform: 'translateX(100%)' } },
      }}
    />
  </Box>
);

// Skeleton circle component
const SkeletonCircle = ({ size = '40px' }: { size?: string }) => (
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
      sx={{
        '@keyframes shimmer': { '100%': { transform: 'translateX(100%)' } },
      }}
    />
  </Box>
);

// Page Header Skeleton
const PageHeaderSkeleton = () => (
  <VStack spacing={2} align="center" py={8}>
    <SkeletonLine w="400px" h="32px" />
    <SkeletonLine w="300px" h="16px" />
  </VStack>
);

// Standings Tabs Skeleton
const StandingsTabsSkeleton = () => (
  <HStack spacing={0} justify="center" mb={8}>
    <Box
      w="120px"
      h="40px"
      bg="bg-surface"
      borderRadius="md"
      position="relative"
      overflow="hidden"
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
    <Box
      w="120px"
      h="40px"
      bg="bg-surface"
      borderRadius="md"
      position="relative"
      overflow="hidden"
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
    <Box
      w="120px"
      h="40px"
      bg="accent.500"
      borderRadius="md"
      position="relative"
      overflow="hidden"
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
  </HStack>
);

// Chart Skeleton Component
const ChartSkeleton = ({ title }: { title: string }) => {
  const isConstructors = title.includes('Constructors');
  const yAxisValues = isConstructors ? [800, 600, 400, 200, 0] : [320, 240, 160, 80, 0];
  
  return (
    <Box h="400px" bg="gray.900" p={4} borderRadius="md" position="relative">
      {/* Chart Title */}
      <Text fontSize="lg" fontWeight="bold" mb={4} color="white">
        {title}
      </Text>
      
      {/* Chart Area */}
      <Box h="90%" position="relative">
        {/* Grid Lines */}
        <Box position="absolute" inset={0} opacity={0.3}>
          {/* Horizontal grid lines */}
          {Array.from({ length: 5 }).map((_, i) => (
            <Box
              key={`h-${i}`}
              position="absolute"
              top={`${i * 20}%`}
              left={0}
              right={0}
              h="1px"
              bg="gray.600"
              borderStyle="dashed"
            />
          ))}
          {/* Vertical grid lines */}
          {Array.from({ length: 18 }).map((_, i) => (
            <Box
              key={`v-${i}`}
              position="absolute"
              left={`${(i * 100) / 17}%`}
              top={0}
              bottom={0}
              w="1px"
              bg="gray.600"
              borderStyle="dashed"
            />
          ))}
        </Box>
        
        {/* Y-axis labels */}
        <VStack position="absolute" left={0} top={0} bottom={0} justify="space-between" align="flex-start" spacing={0}>
          {yAxisValues.map((value) => (
            <Text key={value} fontSize="xs" color="gray.400" transform="translateY(-50%)">
              {value}
            </Text>
          ))}
        </VStack>
        
        {/* X-axis labels */}
        <HStack position="absolute" bottom={0} left={0} right={0} justify="space-between" align="flex-end" spacing={0}>
          {Array.from({ length: 18 }, (_, i) => i + 1).map((value) => (
            <Text key={value} fontSize="xs" color="gray.400" transform="translateX(-50%)">
              {value}
            </Text>
          ))}
        </HStack>
      
      {/* Skeleton Lines - Multiple lines with different colors and paths */}
      <Box position="absolute" inset={0}>
        {/* Line 1 - Orange (leading) - most prominent */}
        <Box
          position="absolute"
          top="15%"
          left="0"
          right="0"
          h="4px"
          bg="orange.400"
          borderRadius="full"
          style={{
            clipPath: 'polygon(0% 100%, 5% 90%, 10% 80%, 15% 70%, 20% 60%, 25% 50%, 30% 40%, 35% 30%, 40% 25%, 45% 20%, 50% 15%, 55% 10%, 60% 8%, 65% 5%, 70% 3%, 75% 2%, 80% 1%, 85% 0%, 90% 0%, 95% 0%, 100% 0%)',
            filter: 'drop-shadow(0 0 8px rgba(251, 146, 60, 0.5)) drop-shadow(0 0 16px rgba(251, 146, 60, 0.3)) drop-shadow(0 0 24px rgba(251, 146, 60, 0.1))'
          }}
        />
        
        {/* Line 2 - Light Blue */}
        <Box
          position="absolute"
          top="25%"
          left="0"
          right="0"
          h="2px"
          bg="cyan.300"
          borderRadius="full"
          style={{
            clipPath: 'polygon(0% 100%, 5% 95%, 10% 90%, 15% 85%, 20% 80%, 25% 75%, 30% 70%, 35% 65%, 40% 60%, 45% 55%, 50% 50%, 55% 45%, 60% 40%, 65% 35%, 70% 30%, 75% 25%, 80% 20%, 85% 15%, 90% 10%, 95% 5%, 100% 0%)'
          }}
        />
        
        {/* Line 3 - Dark Blue */}
        <Box
          position="absolute"
          top="35%"
          left="0"
          right="0"
          h="2px"
          bg="blue.600"
          borderRadius="full"
          style={{
            clipPath: 'polygon(0% 100%, 5% 97%, 10% 94%, 15% 90%, 20% 87%, 25% 83%, 30% 80%, 35% 76%, 40% 73%, 45% 69%, 50% 66%, 55% 62%, 60% 59%, 65% 55%, 70% 52%, 75% 48%, 80% 45%, 85% 41%, 90% 38%, 95% 34%, 100% 31%)'
          }}
        />
        
        {/* Line 4 - Red */}
        <Box
          position="absolute"
          top="45%"
          left="0"
          right="0"
          h="2px"
          bg="red.400"
          borderRadius="full"
          style={{
            clipPath: 'polygon(0% 100%, 5% 96%, 10% 92%, 15% 88%, 20% 84%, 25% 80%, 30% 76%, 35% 72%, 40% 68%, 45% 64%, 50% 60%, 55% 56%, 60% 52%, 65% 48%, 70% 44%, 75% 40%, 80% 36%, 85% 32%, 90% 28%, 95% 24%, 100% 20%)'
          }}
        />
        
        {/* Line 5 - Green */}
        <Box
          position="absolute"
          top="55%"
          left="0"
          right="0"
          h="2px"
          bg="green.400"
          borderRadius="full"
          style={{
            clipPath: 'polygon(0% 100%, 5% 95%, 10% 90%, 15% 85%, 20% 80%, 25% 75%, 30% 70%, 35% 65%, 40% 60%, 45% 55%, 50% 50%, 55% 45%, 60% 40%, 65% 35%, 70% 30%, 75% 25%, 80% 20%, 85% 15%, 90% 10%, 95% 5%, 100% 0%)'
          }}
        />
        
        {/* Line 6 - Purple */}
        <Box
          position="absolute"
          top="65%"
          left="0"
          right="0"
          h="2px"
          bg="purple.400"
          borderRadius="full"
          style={{
            clipPath: 'polygon(0% 100%, 5% 94%, 10% 88%, 15% 82%, 20% 76%, 25% 70%, 30% 64%, 35% 58%, 40% 52%, 45% 46%, 50% 40%, 55% 34%, 60% 28%, 65% 22%, 70% 16%, 75% 10%, 80% 4%, 85% 0%, 90% 0%, 95% 0%, 100% 0%)'
          }}
        />
        
        {/* Line 7 - Light Green */}
        <Box
          position="absolute"
          top="75%"
          left="0"
          right="0"
          h="2px"
          bg="green.300"
          borderRadius="full"
          style={{
            clipPath: 'polygon(0% 100%, 5% 93%, 10% 86%, 15% 79%, 20% 72%, 25% 65%, 30% 58%, 35% 51%, 40% 44%, 45% 37%, 50% 30%, 55% 23%, 60% 16%, 65% 9%, 70% 2%, 75% 0%, 80% 0%, 85% 0%, 90% 0%, 95% 0%, 100% 0%)'
          }}
        />
        
        {/* Line 8 - Light Pink */}
        <Box
          position="absolute"
          top="85%"
          left="0"
          right="0"
          h="2px"
          bg="pink.300"
          borderRadius="full"
          style={{
            clipPath: 'polygon(0% 100%, 5% 92%, 10% 84%, 15% 76%, 20% 68%, 25% 60%, 30% 52%, 35% 44%, 40% 36%, 45% 28%, 50% 20%, 55% 12%, 60% 4%, 65% 0%, 70% 0%, 75% 0%, 80% 0%, 85% 0%, 90% 0%, 95% 0%, 100% 0%)'
          }}
        />
      </Box>
    </Box>
  </Box>
  );
};

// AI Analysis Card Skeleton
const AIAnalysisCardSkeleton = () => (
  <Box p={6} bg="gray.800" borderRadius="md" border="1px solid" borderColor="gray.700">
    <VStack spacing={4} align="stretch">
      <HStack justify="space-between" align="center">
        <SkeletonLine w="200px" h="20px" />
        <SkeletonCircle size="24px" />
      </HStack>
      <VStack spacing={3} align="stretch">
        <SkeletonLine w="100%" h="16px" />
        <SkeletonLine w="90%" h="16px" />
        <SkeletonLine w="85%" h="16px" />
        <SkeletonLine w="95%" h="16px" />
      </VStack>
    </VStack>
  </Box>
);

export default function AnalyticsStandingsSkeleton() {
  return (
    <Box position="relative" minH={{ base: '70vh', md: '75vh' }}>
      {/* Background skeleton layer */}
      <Box opacity={0.7} pointerEvents="none">
        {/* Layout Container with proper spacing */}
        <Box maxW={{ base: 'full', sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1400px' }} mx="auto" px={{ base: 4, sm: 6, md: 8, lg: 12 }} py={{ base: 4, sm: 6, md: 8, lg: 12 }}>
          {/* Main Content */}
          <Flex gap={6} flexDirection="column">
            {/* Drivers Chart */}
            <ChartSkeleton title="2025 Drivers Points Progression" />
            
            {/* Constructors Chart */}
            <ChartSkeleton title="2025 Constructors Points Progression" />
            
            {/* AI Championship Analysis */}
            <AIAnalysisCardSkeleton />
          </Flex>
        </Box>
      </Box>

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
