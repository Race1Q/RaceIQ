// frontend/src/pages/RacesPage/RacesSkeleton.tsx
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

// Race Card Skeleton
const RaceCardSkeleton = () => (
  <Flex
    direction="column"
    h="100%"
    bg="bg-surface"
    borderRadius="lg"
    borderWidth="1px"
    borderColor="border-primary"
    boxShadow="0 4px 15px rgba(0, 0, 0, 0.2)"
    overflow="hidden"
    position="relative"
  >
    {/* Top section with gradient background */}
    <VStack
      flexGrow={1}
      align="flex-start"
      p={{ base: 'md', md: 'xl' }}
      minH={{ base: '180px', md: '300px' }}
      bg="bg-surface"
      color="white"
      position="relative"
      spacing={{ base: 2, md: 4 }}
    >
      {/* Background gradient effect */}
      <Box
        position="absolute"
        inset={0}
        bgGradient="linear(135deg, rgba(100, 100, 100, 0.3) 0%, rgba(150, 150, 150, 0.2) 100%)"
      />
      
      {/* Race name skeleton */}
      <Box w="100%" position="relative" zIndex={1}>
        <SkeletonLine w="80%" h="32px" mb={2} />
        <SkeletonLine w="60%" h="24px" />
      </Box>
      
      {/* Round number skeleton */}
      <Box position="relative" zIndex={1}>
        <SkeletonLine w="100px" h="28px" />
      </Box>
      
      {/* Flag skeleton */}
      <Box 
        position="absolute" 
        top={{ base: 'sm', md: 'lg' }} 
        right={{ base: 'sm', md: 'lg' }}
        borderRadius="sm"
        overflow="hidden"
        zIndex={1}
      >
        <SkeletonLine w="28px" h="20px" />
      </Box>
    </VStack>

    {/* Bottom section */}
    <HStack
      p={{ base: 'sm', md: 'lg' }}
      bg="bg-surface"
      borderTopWidth="1px"
      borderColor="border-primary"
      justify="space-between"
      align="center"
      minH={{ base: '32px', md: '40px' }}
      wrap="wrap"
    >
      {/* Date skeleton */}
      <VStack align="start" spacing={1}>
        <SkeletonLine w="80px" h="14px" />
        <SkeletonLine w="60px" h="12px" />
      </VStack>
      
      {/* Location skeleton */}
      <VStack align="end" spacing={1}>
        <SkeletonLine w="70px" h="14px" />
        <SkeletonLine w="50px" h="12px" />
      </VStack>
    </HStack>
  </Flex>
);

export default function RacesSkeleton() {
  return (
    <Box position="relative" minH={{ base: '70vh', md: '75vh' }}>
      {/* Background skeleton layer */}
      <Box opacity={0.7} pointerEvents="none">
        <VStack align="stretch" spacing={10}>
          {/* Upcoming races section */}
          <Box>
            <SkeletonLine w="200px" h="24px" mb={4} />
            <Box
              display="grid"
              gridTemplateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" }}
              gap={{ base: 3, md: 6 }}
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <RaceCardSkeleton key={i} />
              ))}
            </Box>
          </Box>
          
          {/* Past races section */}
          <Box>
            <SkeletonLine w="150px" h="24px" mb={4} />
            <Box
              display="grid"
              gridTemplateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" }}
              gap={{ base: 3, md: 6 }}
            >
              {Array.from({ length: 4 }).map((_, i) => (
                <RaceCardSkeleton key={i} />
              ))}
            </Box>
          </Box>
        </VStack>
      </Box>

      {/* Foreground: centered speedometer + text */}
      <Box position="absolute" inset={0} display="flex" flexDir="column" alignItems="center" justifyContent="flex-start" gap={4} pt={{ base: '120px', md: '140px' }}>
        <SpeedometerMini size={260} />
        <Text fontFamily="heading" fontWeight={700} fontSize={{ base: 'lg', md: 'xl' }} color="text-secondary" textAlign="center">
          Loading races...
        </Text>
      </Box>
    </Box>
  );
}
