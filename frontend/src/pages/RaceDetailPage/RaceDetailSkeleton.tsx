// frontend/src/pages/RaceDetailPage/RaceDetailSkeleton.tsx
import React from 'react';
import { Box, HStack, VStack, Text, Flex } from '@chakra-ui/react';
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

// Top Utility Bar Skeleton
const TopUtilityBarSkeleton = () => (
  <Box bg="bg-surface" borderBottom="1px solid" borderColor="border-primary" mb={0}>
    <Box px={{ base: 4, md: 6 }} py={{ base: 2, md: 3 }}>
      <SkeletonLine w="120px" h="32px" br="md" />
    </Box>
  </Box>
);

// Header Bar Skeleton (matches the new sophisticated header)
const HeaderBarSkeleton = () => (
  <Box
    mb={4}
    p={{ base: 6, md: 8 }}
    minH={{ base: '180px', md: '240px' }}
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
  >
    <Flex justify="space-between" align="center" h="100%" direction={{ base: 'column', md: 'row' }} gap={{ base: 4, md: 0 }}>
      {/* Left: Race Info */}
      <Flex direction="column" align={{ base: 'center', md: 'flex-start' }} gap={4} flex="1">
        <SkeletonLine w="300px" h={{ base: '40px', md: '60px' }} />
        <SkeletonLine w="200px" h="24px" />
      </Flex>
      
      {/* Middle: Circuit Image */}
      <Box flex="1" display="flex" justify="center">
        <SkeletonLine w="200px" h="120px" />
      </Box>
      
      {/* Right: Flag */}
      <Box display={{ base: 'none', md: 'block' }}>
        <SkeletonLine w="64px" h="48px" br="md" />
      </Box>
    </Flex>
  </Box>
);

// 3D Track Visualization Skeleton
const Track3DSkeleton = () => (
  <Box
    bg="bg-elevated"
    borderRadius="lg"
    border="1px solid"
    borderColor="border-subtle"
    mb={8}
    overflow="hidden"
    h={{ base: '300px', md: '400px' }}
    position="relative"
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

// Tab Navigation Skeleton
const TabNavigationSkeleton = () => (
  <Box mb={8}>
    <Box
      bg="bg-surface"
      border="1px solid"
      borderColor="border-primary"
      borderRadius="full"
      p="6px"
      w="fit-content"
      display="flex"
      gap={2}
    >
      {/* Active tab (highlighted) */}
      <Box
        px={{ base: 3, md: 6 }}
        h={{ base: "32px", md: "44px" }}
        bg="bg-surface-raised"
        borderRadius="full"
        display="flex"
        alignItems="center"
        justifyContent="center"
        position="relative"
        _after={{
          content: '""',
          position: 'absolute',
          inset: 0,
          transform: 'translateX(-100%)',
          bgGradient: 'linear(to-r, transparent, whiteAlpha.200, transparent)',
          animation: 'shimmer 1.4s infinite',
          sx: { '@keyframes shimmer': { '100%': { transform: 'translateX(100%)' } } }
        }}
      >
        <SkeletonLine w="60px" h="16px" />
      </Box>
      
      {/* Inactive tabs */}
      {Array.from({ length: 3 }).map((_, i) => (
        <Box 
          key={i} 
          px={{ base: 3, md: 6 }}
          h={{ base: "32px", md: "44px" }}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <SkeletonLine w={i === 0 ? "40px" : i === 1 ? "80px" : "120px"} h="16px" />
        </Box>
      ))}
    </Box>
  </Box>
);

// Podium Card Skeleton
const PodiumCardSkeleton = () => (
  <Box
    p={4}
    bg="bg-surface"
    border="1px solid"
    borderColor="border-primary"
    borderRadius="lg"
    position="relative"
    overflow="hidden"
    minH="200px"
  >
    {/* Driver image placeholder */}
    <Box
      position="absolute"
      top={4}
      right={4}
      w="80px"
      h="80px"
      bg="bg-surface-raised"
      borderRadius="lg"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <SkeletonCircle size="60px" />
    </Box>
    
    <VStack align="flex-start" spacing={2} h="full" position="relative" zIndex={1}>
      {/* Driver name */}
      <SkeletonLine w="120px" h="20px" />
      
      {/* Team name */}
      <SkeletonLine w="100px" h="16px" />
      
      {/* Position number */}
      <Box position="absolute" bottom={4} left="50%" transform="translateX(-50%)">
        <SkeletonCircle size="40px" />
      </Box>
      
      {/* Flag placeholder */}
      <Box position="absolute" bottom={4} left={4}>
        <SkeletonLine w="24px" h="16px" br="sm" />
      </Box>
    </VStack>
  </Box>
);

// Content Area Skeleton
const ContentAreaSkeleton = () => (
  <VStack align="stretch" spacing={6}>
    {/* Summary heading */}
    <SkeletonLine w="100px" h="24px" />
    
    {/* Podium heading */}
    <SkeletonLine w="80px" h="20px" />
    
    {/* Podium cards */}
    <Flex gap={4} justify="space-between">
      <Box flex="1">
        <PodiumCardSkeleton />
      </Box>
      <Box flex="1">
        <PodiumCardSkeleton />
      </Box>
      <Box flex="1">
        <PodiumCardSkeleton />
      </Box>
    </Flex>
  </VStack>
);

export default function RaceDetailSkeleton() {
  return (
    <Box bg="bg-primary" color="text-primary" minH="100vh" pb={{ base: 4, md: 6, lg: 8 }} fontFamily="var(--font-display)" position="relative">
      {/* Background skeleton layer */}
      <Box opacity={0.7} pointerEvents="none">
        {/* Top Utility Bar */}
        <TopUtilityBarSkeleton />
        
        <Box px={{ base: 4, md: 6 }}>
          {/* Header Bar */}
          <HeaderBarSkeleton />
          
          {/* 3D Track Visualization Skeleton */}
          <Track3DSkeleton />
          
          {/* Tab navigation skeleton */}
          <TabNavigationSkeleton />
          
          {/* Content area skeleton */}
          <ContentAreaSkeleton />
        </Box>
      </Box>

      {/* Foreground: centered speedometer + text */}
      <Box position="absolute" inset={0} display="flex" flexDir="column" alignItems="center" justifyContent="flex-start" gap={4} pt={{ base: '20%', md: '15%' }}>
        <SpeedometerMini size={260} />
        <Text fontFamily="heading" fontWeight={700} fontSize={{ base: 'lg', md: 'xl' }} color="text-secondary" textAlign="center">
          Loading race details...
        </Text>
      </Box>
    </Box>
  );
}
