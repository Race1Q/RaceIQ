// frontend/src/pages/Dashboard/DashboardSkeleton.tsx
import React from 'react';
import { Box, HStack, VStack, Text } from '@chakra-ui/react';
import { Responsive as RGL, WidthProvider } from 'react-grid-layout';
import SpeedometerMini from '../../components/loaders/SpeedometerMini';

// Apply WidthProvider to ResponsiveGridLayout
const ResponsiveGridLayout = WidthProvider(RGL);

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

// Skeleton circle component
const SkeletonCircle = ({ size = '40px' }: { size?: string }) => (
  <Box w={size} h={size} borderRadius="full" bg="bg-surface" position="relative" overflow="hidden">
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

// Next Race Widget Skeleton (2x2 - wide)
const NextRaceSkeleton = () => (
  <Box p={4} bg="bg-primary" border="1px solid" borderColor="border-primary" borderRadius="lg" h="full">
    <VStack align="start" spacing={3} h="full">
      <SkeletonLine w="80%" h="18px" />
      <HStack spacing={2} align="center">
        <SkeletonCircle size="16px" />
        <SkeletonLine w="60%" h="14px" />
      </HStack>
      <HStack spacing={2} align="center">
        <SkeletonCircle size="16px" />
        <SkeletonLine w="40%" h="14px" />
      </HStack>
      <VStack align="start" spacing={1} flex={1} justify="center">
        <SkeletonLine w="100%" h="24px" />
        <SkeletonLine w="70%" h="16px" />
      </VStack>
    </VStack>
  </Box>
);

// Driver Standings Widget Skeleton (1x2 - tall)
const DriverStandingsSkeleton = () => (
  <Box p={4} bg="bg-primary" border="1px solid" borderColor="border-primary" borderRadius="lg" h="full">
    <VStack align="start" spacing={3} h="full">
      <SkeletonLine w="70%" h="16px" />
      <VStack align="stretch" spacing={2} flex={1}>
        {Array.from({ length: 3 }).map((_, i) => (
          <HStack key={i} spacing={3} align="center">
            <SkeletonLine w="20px" h="16px" />
            <SkeletonCircle size="32px" />
            <VStack align="start" spacing={1} flex={1}>
              <SkeletonLine w="80%" h="12px" />
              <SkeletonLine w="60%" h="10px" />
            </VStack>
            <SkeletonLine w="40px" h="14px" />
          </HStack>
        ))}
      </VStack>
    </VStack>
  </Box>
);

// Constructor Standings Widget Skeleton (1x2 - tall)
const ConstructorStandingsSkeleton = () => (
  <Box p={4} bg="bg-primary" border="1px solid" borderColor="border-primary" borderRadius="lg" h="full">
    <VStack align="start" spacing={3} h="full">
      <SkeletonLine w="80%" h="16px" />
      <VStack align="stretch" spacing={2} flex={1}>
        {Array.from({ length: 3 }).map((_, i) => (
          <HStack key={i} spacing={3} align="center">
            <SkeletonLine w="20px" h="16px" />
            <SkeletonCircle size="32px" />
            <VStack align="start" spacing={1} flex={1}>
              <SkeletonLine w="70%" h="12px" />
            </VStack>
            <SkeletonLine w="40px" h="14px" />
          </HStack>
        ))}
      </VStack>
    </VStack>
  </Box>
);

// Square Widget Skeleton (1x2 - square)
const SquareWidgetSkeleton = () => (
  <Box p={4} bg="bg-primary" border="1px solid" borderColor="border-primary" borderRadius="lg" h="full">
    <VStack align="start" spacing={3} h="full">
      <SkeletonLine w="70%" h="16px" />
      <VStack align="center" spacing={3} flex={1} justify="center">
        <SkeletonCircle size="60px" />
        <VStack align="center" spacing={1}>
          <SkeletonLine w="80%" h="14px" />
          <SkeletonLine w="60%" h="12px" />
        </VStack>
        <SkeletonLine w="90%" h="20px" />
      </VStack>
    </VStack>
  </Box>
);

// Head to Head Widget Skeleton (2x2 - wide)
const HeadToHeadSkeleton = () => (
  <Box p={4} bg="bg-primary" border="1px solid" borderColor="border-primary" borderRadius="lg" h="full">
    <VStack align="start" spacing={3} h="full">
      <SkeletonLine w="60%" h="16px" />
      <HStack spacing={4} align="center" justify="center" flex={1} w="full">
        <VStack align="center" spacing={2}>
          <SkeletonCircle size="50px" />
          <SkeletonLine w="80px" h="12px" />
          <SkeletonLine w="60px" h="10px" />
          <VStack align="center" spacing={1}>
            <SkeletonLine w="40px" h="10px" />
            <SkeletonLine w="30px" h="10px" />
            <SkeletonLine w="35px" h="10px" />
          </VStack>
        </VStack>
        <SkeletonLine w="40px" h="20px" />
        <VStack align="center" spacing={2}>
          <SkeletonCircle size="50px" />
          <SkeletonLine w="80px" h="12px" />
          <SkeletonLine w="60px" h="10px" />
          <VStack align="center" spacing={1}>
            <SkeletonLine w="40px" h="10px" />
            <SkeletonLine w="30px" h="10px" />
            <SkeletonLine w="35px" h="10px" />
          </VStack>
        </VStack>
      </HStack>
    </VStack>
  </Box>
);

// F1 News Widget Skeleton (2x2 - wide)
const F1NewsSkeleton = () => (
  <Box p={4} bg="bg-primary" border="1px solid" borderColor="border-primary" borderRadius="lg" h="full">
    <VStack align="start" spacing={3} h="full">
      <SkeletonLine w="50%" h="16px" />
      <VStack align="stretch" spacing={2} flex={1}>
        {Array.from({ length: 3 }).map((_, i) => (
          <HStack key={i} spacing={3} align="start">
            <SkeletonCircle size="16px" />
            <VStack align="start" spacing={1} flex={1}>
              <SkeletonLine w="100%" h="12px" />
              <SkeletonLine w="80%" h="10px" />
            </VStack>
            <SkeletonLine w="50px" h="10px" />
          </HStack>
        ))}
      </VStack>
    </VStack>
  </Box>
);

// Define skeleton layout configuration matching the actual dashboard
const skeletonLayouts = {
  lg: [
    // Row 1: Two horizontal rectangles
    { i: 'nextRace', x: 0, y: 0, w: 2, h: 2, isResizable: false },
    { i: 'standings', x: 2, y: 0, w: 1, h: 2, isResizable: false },
    { i: 'constructorStandings', x: 3, y: 0, w: 1, h: 2, isResizable: false },

    // Row 2: Four squares
    { i: 'lastPodium', x: 0, y: 2, w: 1, h: 2, isResizable: false },
    { i: 'fastestLap', x: 1, y: 2, w: 1, h: 2, isResizable: false },
    { i: 'favoriteDriver', x: 2, y: 2, w: 1, h: 2, isResizable: false },
    { i: 'favoriteTeam', x: 3, y: 2, w: 1, h: 2, isResizable: false },

    // Row 3: Two horizontal rectangles
    { i: 'headToHead', x: 0, y: 4, w: 2, h: 2, isResizable: false },
    { i: 'f1News', x: 2, y: 4, w: 2, h: 2, isResizable: false },
  ]
};

// Skeleton components map
const skeletonComponents: { [key: string]: React.ReactNode } = {
  nextRace: <NextRaceSkeleton />,
  standings: <DriverStandingsSkeleton />,
  constructorStandings: <ConstructorStandingsSkeleton />,
  lastPodium: <SquareWidgetSkeleton />,
  fastestLap: <SquareWidgetSkeleton />,
  favoriteDriver: <SquareWidgetSkeleton />,
  favoriteTeam: <SquareWidgetSkeleton />,
  headToHead: <HeadToHeadSkeleton />,
  f1News: <F1NewsSkeleton />,
};

export default function DashboardSkeleton() {
  return (
    <Box position="relative" minH={{ base: '70vh', md: '75vh' }}>
      {/* Background skeleton layer */}
      <Box opacity={0.7} pointerEvents="none">
        <ResponsiveGridLayout
          layouts={skeletonLayouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 4, md: 3, sm: 2, xs: 1, xxs: 1 }}
          rowHeight={120}
          isDraggable={false}
          isResizable={false}
          preventCollision={false}
          isBounded={true}
          compactType="vertical"
          margin={[8, 8]}
          containerPadding={[4, 4]}
          useCSSTransforms={true}
          transformScale={1}
          isDroppable={false}
          allowOverlap={false}
        >
          {Object.keys(skeletonComponents).map(widgetKey => (
            <Box key={widgetKey}>
              {skeletonComponents[widgetKey]}
            </Box>
          ))}
        </ResponsiveGridLayout>
      </Box>

      {/* Foreground: centered speedometer + text */}
      <Box position="absolute" inset={0} display="flex" flexDir="column" alignItems="center" justifyContent="center" gap={4}>
        <SpeedometerMini size={260} />
        <Text fontFamily="heading" fontWeight={700} fontSize={{ base: 'lg', md: 'xl' }} color="text-secondary" textAlign="center">
          Loading your personalized dashboard...
        </Text>
      </Box>
    </Box>
  );
}
