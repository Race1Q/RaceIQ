// frontend/src/pages/Standings/StandingsSkeleton.tsx
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

// Standings Tabs Skeleton
const StandingsTabsSkeleton = () => (
  <Flex
    bg="bg-surface"
    border="1px solid"
    borderColor="border-primary"
    borderRadius="full"
    p="6px"
    w="fit-content"
    boxShadow="shadow-md"
    mb={8}
    gap={2}
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
      <SkeletonLine w="60px" h="16px" />
    </Box>
    
    {/* Inactive tab */}
    <Box px={6} h="44px" borderRadius="full" display="flex" alignItems="center">
      <SkeletonLine w="80px" h="16px" />
    </Box>
  </Flex>
);

// Season Selector Skeleton
const SeasonSelectorSkeleton = () => (
  <Flex mb={4} alignItems="center" justifyContent="space-between" flexDirection={{ base: 'column', md: 'row' }} gap={4}>
    <Box maxW={{ base: 'full', md: '220px' }} w="full">
      <VStack align="start" spacing={2}>
        <SkeletonLine w="100px" h="14px" />
        <Box
          w="full"
          h="40px"
          bg="bg-surface"
          borderRadius="md"
          border="1px solid"
          borderColor="border-primary"
          display="flex"
          alignItems="center"
          px={3}
        >
          <SkeletonLine w="60px" h="16px" />
        </Box>
      </VStack>
    </Box>
  </Flex>
);

// Driver Standing Card Skeleton
const DriverStandingCardSkeleton = () => (
  <Flex
    minW={{ base: "100%", md: "660px" }}
    w="full"
    px={{ base: 3, md: 4 }}
    py={{ base: 2, md: 3 }}
    align="center"
    gap={{ base: 2, md: 4 }}
    position="relative"
    bg="bg-primary"
    borderRadius="lg"
    border="1px solid"
    borderColor="border-primary"
    overflow="hidden"
    flexWrap={{ base: "wrap", md: "nowrap" }}
  >
    {/* Accent Bar */}
    <Box position="absolute" left={0} top={0} bottom={0} w="6px" bg="bg-surface" />

    {/* Position number */}
    <Box w={{ base: "30px", md: "40px" }} textAlign="center">
      <SkeletonLine w="20px" h={{ base: "md", md: "lg" }} />
    </Box>

    {/* Driver avatar */}
    <SkeletonCircle size={{ base: "md", md: "lg" }} />

    {/* Driver info */}
    <Flex direction="column" flex={1} minW={0}>
      <SkeletonLine w="120px" h={{ base: "sm", md: "md" }} mb={1} />
      <HStack spacing={2} mt={1}>
        <Box
          w="80px"
          h="20px"
          bg="bg-surface"
          borderRadius="full"
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
      </HStack>
    </Flex>

    {/* Statistics */}
    <HStack spacing={{ base: 3, md: 6 }} pr={2} flexWrap={{ base: "wrap", md: "nowrap" }}>
      {/* Points */}
      <VStack align="end" spacing={1} minW={{ base: "50px", md: "70px" }}>
        <SkeletonLine w="40px" h="xs" />
        <SkeletonLine w="30px" h={{ base: "md", md: "lg" }} />
      </VStack>
      
      {/* Wins */}
      <VStack align="end" spacing={1} minW={{ base: "45px", md: "60px" }}>
        <SkeletonLine w="30px" h="xs" />
        <SkeletonLine w="20px" h={{ base: "md", md: "lg" }} />
      </VStack>
      
      {/* Podiums */}
      <VStack align="end" spacing={1} minW={{ base: "55px", md: "72px" }}>
        <SkeletonLine w="50px" h="xs" />
        <SkeletonLine w="20px" h={{ base: "md", md: "lg" }} />
      </VStack>
    </HStack>
  </Flex>
);

export default function StandingsSkeleton() {
  return (
    <Box position="relative" minH={{ base: '70vh', md: '75vh' }}>
      {/* Background skeleton layer */}
      <VStack spacing="xl" align="stretch" opacity={0.7} pointerEvents="none">
        {/* Standings tabs */}
        <StandingsTabsSkeleton />

        {/* Season selector */}
        <SeasonSelectorSkeleton />

        {/* Driver standings list */}
        <Flex flexDirection="column" gap={3}>
          {Array.from({ length: 6 }).map((_, i) => (
            <DriverStandingCardSkeleton key={i} />
          ))}
        </Flex>
      </VStack>

      {/* Foreground: centered speedometer + text */}
      <Box position="absolute" inset={0} display="flex" flexDir="column" alignItems="center" justifyContent="center" gap={4}>
        <SpeedometerMini size={260} />
        <Text fontFamily="heading" fontWeight={700} fontSize={{ base: 'lg', md: 'xl' }} color="text-secondary" textAlign="center">
          Loading standings...
        </Text>
      </Box>
    </Box>
  );
}
