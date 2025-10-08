// frontend/src/pages/Constructors/ConstructorsSkeleton.tsx
import React from 'react';
import { Box, Flex, SimpleGrid, Text, VStack } from '@chakra-ui/react';
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

// Filter Dropdown Skeleton
const FilterDropdownSkeleton = () => (
  <Box mb={6}>
    <Flex justify="space-between" align="center" mb={4}>
      <SkeletonLine w="200px" h="20px" />
      <SkeletonLine w="120px" h="36px" br="md" />
    </Flex>
  </Box>
);

// Constructor Card Skeleton
const ConstructorCardSkeleton = () => (
  <Box
    position="relative"
    bg="bg-surface"
    borderRadius="lg"
    p={6}
    overflow="hidden"
    minH="200px"
    cursor="pointer"
    transition="all 0.2s ease-in-out"
  >
    {/* Background gradient effect */}
    <Box
      position="absolute"
      inset={0}
      bg="linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.05) 100%)"
      borderRadius="lg"
    />
    
    {/* Radial gradient overlay */}
    <Box
      position="absolute"
      inset={0}
      background="radial-gradient(1200px 600px at 85% 30%, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 60%)"
      borderRadius="lg"
      pointerEvents="none"
    />

    <Flex
      position="relative"
      zIndex={1}
      align="center"
      justify="space-between"
      h="full"
    >
      {/* Left side - Team info */}
      <Box textAlign="left" flex={1}>
        {/* Team name */}
        <SkeletonLine w="140px" h="20px" mb={2} />
        
        {/* Nationality with flag */}
        <Flex align="center" gap={2} mb={4}>
          <SkeletonCircle size="16px" />
          <SkeletonLine w="80px" h="14px" />
        </Flex>
        
        {/* Position and Points */}
        <Flex gap={4}>
          <Box>
            <SkeletonLine w="50px" h="12px" mb={1} />
            <SkeletonLine w="20px" h="16px" />
          </Box>
          <Box>
            <SkeletonLine w="40px" h="12px" mb={1} />
            <SkeletonLine w="30px" h="16px" />
          </Box>
        </Flex>
      </Box>

      {/* Right side - F1 Car image */}
      <Box
        w="200px"
        h="120px"
        bg="bg-primary"
        borderRadius="md"
        display="flex"
        alignItems="center"
        justifyContent="center"
        position="relative"
        overflow="hidden"
      >
        {/* Car silhouette placeholder */}
        <Box
          w="180px"
          h="80px"
          bg="bg-surface"
          borderRadius="lg"
          position="relative"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {/* Car shape approximation */}
          <Box
            w="160px"
            h="40px"
            bg="bg-primary"
            borderRadius="full"
            position="relative"
          >
            {/* Car details */}
            <Box
              position="absolute"
              top="8px"
              left="20px"
              w="120px"
              h="24px"
              bg="bg-surface"
              borderRadius="md"
            />
            <Box
              position="absolute"
              bottom="4px"
              left="10px"
              w="20px"
              h="20px"
              bg="bg-surface"
              borderRadius="full"
            />
            <Box
              position="absolute"
              bottom="4px"
              right="10px"
              w="20px"
              h="20px"
              bg="bg-surface"
              borderRadius="full"
            />
          </Box>
        </Box>
      </Box>
    </Flex>
  </Box>
);

export default function ConstructorsSkeleton() {
  return (
    <Box position="relative" minH={{ base: '70vh', md: '75vh' }}>
      {/* Background skeleton layer */}
      <VStack spacing="xl" align="stretch" opacity={0.7} pointerEvents="none">
        {/* Filter dropdown */}
        <FilterDropdownSkeleton />

        {/* Constructor cards grid */}
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="lg">
          {Array.from({ length: 8 }).map((_, i) => (
            <ConstructorCardSkeleton key={i} />
          ))}
        </SimpleGrid>
      </VStack>

      {/* Foreground: centered speedometer + text */}
      <Box position="absolute" inset={0} display="flex" flexDir="column" alignItems="center" justifyContent="center" gap={4}>
        <SpeedometerMini size={260} />
        <Text fontFamily="heading" fontWeight={700} fontSize={{ base: 'lg', md: 'xl' }} color="text-secondary" textAlign="center">
          Loading constructors...
        </Text>
      </Box>
    </Box>
  );
}
