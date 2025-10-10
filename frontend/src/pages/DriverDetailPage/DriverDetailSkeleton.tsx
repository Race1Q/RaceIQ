// frontend/src/pages/DriverDetailPage/DriverDetailSkeleton.tsx
import React from 'react';
import { Box, HStack, VStack, Text, Container, Grid, SimpleGrid, Flex } from '@chakra-ui/react';
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

// Skeleton rectangle component
const SkeletonRect = ({ w = '100%', h = '100px', br = 'md' }: { w?: any; h?: any; br?: string }) => (
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
  <Box
    w="140px"
    h="40px"
    bg="bg-surface"
    border="1px solid"
    borderColor="border-primary"
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
      sx={{ '@keyframes shimmer': { '100%': { transform: 'translateX(100%)' } } }}
    />
  </Box>
);

// Header section skeleton - simplified to just a header box
const HeaderSkeleton = () => {
  return (
    <Box 
      bg="bg-primary" 
      color="text-primary" 
      py={{ base: 4, md: 6 }}
      position="relative"
    >
      <Container maxW="container.2xl" px={{ base: 4, md: 6 }} position="relative" zIndex={1}>
        <Box
          h={{ base: '120px', md: '140px' }}
          borderRadius="md"
          position="relative"
          overflow="hidden"
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
      </Container>
    </Box>
  );
};

// Key info bar skeleton - matches the new unified KeyInfoBar structure
const KeyInfoBarSkeleton = () => (
  <Box
    bg="bg-surface"
    border="1px solid"
    borderColor="border-primary"
    borderRadius="lg"
    mx="auto"
    mt={{ base: 'lg', lg: '-2rem' }}
    position="relative"
    zIndex={10}
    w={{ base: '95%', lg: '90%' }}
    maxW="1100px"
    boxShadow="xl"
    overflow="hidden"
  >
    <Flex
      direction={{ base: 'column', lg: 'row' }}
      align="stretch"
      minH="200px"
    >
      {/* Career stats section - 65% width */}
      <Box 
        flex={{ base: 1, lg: '0 0 65%' }}
        p={{ base: 'md', md: 'lg' }}
      >
        <SkeletonLine w="100px" h="12px" mb="md" />
        <Grid
          templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(3, 1fr)' }}
          templateRows={{ base: 'repeat(3, 1fr)', md: 'repeat(2, 1fr)', lg: 'repeat(2, 1fr)' }}
          gap={4}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <Box key={i} p={4} bg="blackAlpha.100" borderRadius="md" border="1px solid" borderColor="whiteAlpha.200">
              <Flex align="center" gap={4}>
                <SkeletonCircle size="48px" />
                <Box flex="1">
                  <SkeletonLine w="60px" h="10px" mb={2} />
                  <SkeletonLine w="40px" h="24px" />
                </Box>
              </Flex>
            </Box>
          ))}
        </Grid>
      </Box>

      {/* Divider skeleton */}
      <Box 
        w="1px" 
        bg="border-primary" 
        display={{ base: 'none', lg: 'block' }}
      />

      {/* Fun facts section skeleton - 35% width */}
      <Box 
        flex={{ base: 1, lg: '0 0 35%' }}
        p={{ base: 'md', md: 'lg' }}
        minW={{ lg: '300px' }}
      >
        <HStack mb="md">
          <SkeletonCircle size="16px" />
          <SkeletonLine w="80px" h="12px" />
        </HStack>
        <VStack spacing={3} align="stretch">
          {Array.from({ length: 3 }).map((_, i) => (
            <HStack key={i} align="flex-start" spacing={3}>
              <SkeletonCircle size="16px" mt={0.5} />
              <Box flex="1">
                <SkeletonLine w="100%" h="14px" mb={1} />
                <SkeletonLine w="80%" h="14px" />
              </Box>
            </HStack>
          ))}
          <SkeletonLine w="120px" h="10px" alignSelf="flex-end" mt={2} />
        </VStack>
      </Box>
    </Flex>
  </Box>
);

// Stats section skeleton - matches StatSection structure
const StatsSectionSkeleton = ({ title }: { title: string }) => (
  <VStack align="stretch" spacing={4}>
    <SkeletonLine w="150px" h="20px" />
    <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap="md">
      {Array.from({ length: 4 }).map((_, i) => (
        <VStack key={i} spacing={2} p={4} bg="bg-surface" border="1px solid" borderColor="border-primary" borderRadius="lg">
          <SkeletonLine w="80%" h="16px" />
          <SkeletonLine w="60%" h="20px" />
          <SkeletonLine w="70%" h="12px" />
        </VStack>
      ))}
    </Grid>
  </VStack>
);

// Chart section skeleton
const ChartSectionSkeleton = () => (
  <Box mt="xl">
    <SkeletonLine w="300px" h="20px" mb="md" />
    <Box bg="bg-surface" p="lg" borderRadius="lg" border="1px solid" borderColor="border-primary">
      <SkeletonRect w="100%" h="300px" />
    </Box>
  </Box>
);

export default function DriverDetailSkeleton() {
  return (
    <Box position="relative" minH={{ base: '70vh', md: '75vh' }}>
      {/* Background skeleton layer */}
      <Box opacity={0.7} pointerEvents="none">
        {/* Top Utility Bar */}
        <Box bg="bg-surface" borderBottom="1px solid" borderColor="border-primary">
          <Container maxW="container.2xl" px={{ base: 4, md: 6 }} py={{ base: 2, md: 3 }}>
            <BackButtonSkeleton />
          </Container>
        </Box>

        {/* Header Section - matches the gradient hero */}
        <HeaderSkeleton />

        {/* Key Info Bar - matches the actual KeyInfoBar layout */}
        <KeyInfoBarSkeleton />

        {/* Main Content */}
        <Container maxW="container.2xl" py="xl" px={{ base: 4, md: 6 }}>
          <VStack align="stretch" spacing="xl">
            {/* Stats Sections - matches StatSection components */}
            <StatsSectionSkeleton title="2025 Season" />
            <StatsSectionSkeleton title="Career" />
            
            {/* Chart Section */}
            <ChartSectionSkeleton />
          </VStack>
        </Container>
      </Box>

      {/* Foreground: centered speedometer + text */}
      <Box position="absolute" inset={0} display="flex" flexDir="column" alignItems="center" justifyContent="center" gap={4}>
        <SpeedometerMini size={260} />
        <Text fontFamily="heading" fontWeight={700} fontSize={{ base: 'lg', md: 'xl' }} color="text-secondary" textAlign="center">
          Loading driver details...
        </Text>
      </Box>
    </Box>
  );
}
