// frontend/src/pages/Drivers/DriversSkeleton.tsx
import React from 'react';
import { Box, HStack, SimpleGrid, VStack, Text } from '@chakra-ui/react';
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

// Team Filter Tabs Skeleton
const TeamFilterSkeleton = () => (
  <Box position="relative" mb="xl">
    <Box overflowX="auto" sx={{ '&::-webkit-scrollbar': { display: 'none' }, 'scrollbarWidth': 'none' }}>
      <Box minW="max-content" w="max-content">
        <HStack
          bg="bg-surface"
          border="1px solid"
          borderColor="border-primary"
          borderRadius="full"
          p="6px"
          gap={2}
          boxShadow="shadow-md"
        >
          {/* Active tab (highlighted) */}
          <Box
            px={6}
            h="44px"
            bg="bg-primary"
            borderRadius="full"
            display="flex"
            alignItems="center"
            boxShadow="0 6px 24px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.1) inset"
          >
            <SkeletonLine w="40px" h="16px" />
          </Box>
          
          {/* Inactive tabs */}
          {Array.from({ length: 8 }).map((_, i) => (
            <Box key={i} px={6} h="44px" borderRadius="full" display="flex" alignItems="center">
              <SkeletonLine w={i % 2 === 0 ? "80px" : "60px"} h="16px" />
            </Box>
          ))}
        </HStack>
      </Box>
    </Box>
  </Box>
);

// Team Banner Skeleton
const TeamBannerSkeleton = () => (
  <HStack justify="space-between" align="center" mb={4}>
    <SkeletonLine w="200px" h="32px" />
    <SkeletonCircle size="60px" />
  </HStack>
);

// Driver Card Skeleton
const DriverCardSkeleton = () => (
  <Box
    p={4}
    bg="bg-primary"
    border="1px solid"
    borderColor="border-primary"
    borderRadius="lg"
    position="relative"
    overflow="hidden"
    minH="300px"
  >
    {/* Background gradient effect */}
    <Box
      position="absolute"
      top={0}
      right={0}
      w="200px"
      h="200px"
      bg="bg-surface"
      borderRadius="full"
      opacity={0.1}
      transform="translate(50%, -50%)"
    />
    
    <VStack align="start" spacing={3} h="full" position="relative" zIndex={1}>
      {/* Driver name and number */}
      <VStack align="start" spacing={1}>
        <SkeletonLine w="140px" h="20px" />
        <SkeletonLine w="40px" h="16px" />
      </VStack>
      
      {/* Driver image placeholder */}
      <Box
        position="absolute"
        top={4}
        right={4}
        w="120px"
        h="120px"
        bg="bg-surface"
        borderRadius="lg"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <SkeletonCircle size="80px" />
      </Box>
      
      {/* Flag placeholder */}
      <Box position="absolute" bottom={4} left={4}>
        <SkeletonLine w="30px" h="20px" br="sm" />
      </Box>
      
      {/* View Profile button */}
      <Box position="absolute" bottom={4} left="50%" transform="translateX(-50%)">
        <SkeletonLine w="100px" h="32px" br="full" />
      </Box>
    </VStack>
  </Box>
);

// Team Section Skeleton
const TeamSectionSkeleton = () => (
  <VStack align="stretch" spacing={4}>
    <TeamBannerSkeleton />
    <SimpleGrid columns={{ base: 2, sm: 2, md: 2 }} gap={{ base: 3, md: 6 }}>
      <DriverCardSkeleton />
      <DriverCardSkeleton />
    </SimpleGrid>
  </VStack>
);

export default function DriversSkeleton() {
  return (
    <Box position="relative" minH={{ base: '70vh', md: '75vh' }}>
      {/* Background skeleton layer */}
      <VStack spacing="xl" align="stretch" opacity={0.7} pointerEvents="none">
        {/* Team filter tabs */}
        <TeamFilterSkeleton />

        {/* Team sections with driver cards */}
        {Array.from({ length: 3 }).map((_, section) => (
          <TeamSectionSkeleton key={section} />
        ))}
      </VStack>

      {/* Foreground: centered speedometer + text */}
      <Box position="absolute" inset={0} display="flex" flexDir="column" alignItems="center" justifyContent="flex-start" gap={4} pt={{ base: '120px', md: '140px' }}>
        <SpeedometerMini size={260} />
        <Text fontFamily="heading" fontWeight={700} fontSize={{ base: 'lg', md: 'xl' }} color="text-secondary" textAlign="center">
          Loading drivers...
        </Text>
      </Box>
    </Box>
  );
}
