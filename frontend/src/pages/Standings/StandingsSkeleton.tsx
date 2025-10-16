// frontend/src/pages/Standings/StandingsSkeleton.tsx
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
const SkeletonCircle = ({ size = '40px' }: { size?: string | { base?: string; md?: string } }) => {
  const sizeValue = typeof size === 'object' ? size : { base: size, md: size };
  return (
    <Box w={sizeValue} h={sizeValue} borderRadius="full" bg="bg-surface" position="relative" overflow="hidden">
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
};

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
      <SkeletonLine w="20px" h="24px" />
    </Box>

    {/* Driver avatar - Match actual card dimensions */}
    <Box
      w={{ base: "48px", md: "64px" }}
      h={{ base: "48px", md: "64px" }}
      minW={{ base: "48px", md: "64px" }}
      minH={{ base: "48px", md: "64px" }}
      flexShrink={0}
    >
      <SkeletonCircle size={{ base: "48px", md: "64px" }} />
    </Box>

    {/* Driver info */}
    <Flex direction="column" flex={1} minW={0}>
      <SkeletonLine w="120px" h="16px" />
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
        <SkeletonLine w="40px" h="12px" />
        <SkeletonLine w="30px" h="20px" />
      </VStack>
      
      {/* Wins */}
      <VStack align="end" spacing={1} minW={{ base: "45px", md: "60px" }}>
        <SkeletonLine w="30px" h="12px" />
        <SkeletonLine w="20px" h="20px" />
      </VStack>
      
      {/* Podiums */}
      <VStack align="end" spacing={1} minW={{ base: "55px", md: "72px" }}>
        <SkeletonLine w="50px" h="12px" />
        <SkeletonLine w="20px" h="20px" />
      </VStack>
    </HStack>
  </Flex>
);

// Constructor Standing Card Skeleton
const ConstructorStandingCardSkeleton = () => (
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
      <SkeletonLine w="20px" h="24px" />
    </Box>

    {/* Constructor logo */}
    <SkeletonCircle size="48px" />

    {/* Constructor info */}
    <Flex direction="column" flex={1} minW={0}>
      <SkeletonLine w="140px" h="16px" />
      <HStack spacing={2} mt={1}>
        <Box
          w="100px"
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
        <SkeletonLine w="40px" h="12px" />
        <SkeletonLine w="30px" h="20px" />
      </VStack>
      
      {/* Wins */}
      <VStack align="end" spacing={1} minW={{ base: "45px", md: "60px" }}>
        <SkeletonLine w="30px" h="12px" />
        <SkeletonLine w="20px" h="20px" />
      </VStack>
      
      {/* Podiums */}
      <VStack align="end" spacing={1} minW={{ base: "55px", md: "72px" }}>
        <SkeletonLine w="50px" h="12px" />
        <SkeletonLine w="20px" h="20px" />
      </VStack>
    </HStack>
  </Flex>
);

interface StandingsSkeletonProps {
  type?: 'drivers' | 'constructors';
  text?: string;
}

export default function StandingsSkeleton({ type = 'drivers', text }: StandingsSkeletonProps) {
  const loadingText = text || `Loading ${type} standings...`;

  return (
    <Box position="relative" minH={{ base: '50vh', md: '60vh' }}>
      {/* Background skeleton layer - only the cards */}
      <Flex flexDirection="column" gap={3} opacity={0.7} pointerEvents="none">
        {Array.from({ length: 8 }).map((_, i) => (
          type === 'drivers' ? (
            <DriverStandingCardSkeleton key={i} />
          ) : (
            <ConstructorStandingCardSkeleton key={i} />
          )
        ))}
      </Flex>

      {/* Foreground: centered speedometer + text */}
      <Box position="absolute" inset={0} display="flex" flexDir="column" alignItems="center" justifyContent="flex-start" gap={4} pt={{ base: '120px', md: '140px' }}>
        <SpeedometerMini size={260} />
        <Text fontFamily="heading" fontWeight={700} fontSize={{ base: 'lg', md: 'xl' }} color="text-secondary" textAlign="center">
          {loadingText}
        </Text>
      </Box>
    </Box>
  );
}
