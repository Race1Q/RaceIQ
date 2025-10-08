// frontend/src/pages/Constructors/ConstructorsSkeleton.tsx
import { Box, Flex, Text, SimpleGrid, Container } from '@chakra-ui/react';
import SpeedometerMini from '../../components/loaders/SpeedometerMini';

// Skeleton line component with shimmer animation
const SkeletonLine = ({ w = '60%', h = '12px', br = 'md', mt = 0 }: { w?: any; h?: any; br?: string; mt?: number }) => (
  <Box w={w} h={h} borderRadius={br} bg="bg-surface" position="relative" overflow="hidden" mt={mt}>
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

// Constructor Card Skeleton
const ConstructorCardSkeleton = () => (
  <Box
    position="relative"
    bg="bg-surface"
    borderRadius="lg"
    p={6}
    overflow="hidden"
    minH="180px"
  >
    {/* Gradient background skeleton */}
    <Box
      position="absolute"
      inset={0}
      bgGradient="linear(135deg, bg-surface 0%, bg-surface-raised 100%)"
      opacity={0.8}
    />
    
    {/* Decorative blur circle */}
    <Box
      position="absolute"
      right={-20}
      top={-20}
      w="220px"
      h="220px"
      borderRadius="full"
      bg="whiteAlpha.100"
      filter="blur(30px)"
    />

    <Flex align="center" justify="space-between" position="relative" zIndex={1}>
      {/* Left side - Team info */}
      <Box textAlign="left" flex={1}>
        {/* Team name */}
        <SkeletonLine w="140px" h="20px" />
        
        {/* Nationality with flag */}
        <Flex align="center" gap={2} mt={2}>
          <SkeletonCircle size="16px" />
          <SkeletonLine w="80px" h="14px" />
        </Flex>
        
        {/* Stats */}
        <Flex mt={4} gap={6}>
          <Box>
            <SkeletonLine w="50px" h="12px" />
            <SkeletonLine w="20px" h="16px" mt={1} />
          </Box>
          <Box>
            <SkeletonLine w="40px" h="12px" />
            <SkeletonLine w="25px" h="16px" mt={1} />
          </Box>
        </Flex>
      </Box>

      {/* Right side - Car image placeholder */}
      <Box
        w={{ base: '120px', md: '200px' }}
        h={{ base: '60px', md: '100px' }}
        bg="bg-surface-raised"
        borderRadius="md"
        position="relative"
        overflow="hidden"
        ml={{ base: 2, md: 4 }}
        flexShrink={0}
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
    </Flex>
  </Box>
);


interface ConstructorsSkeletonProps {
  text?: string;
}

export default function ConstructorsSkeleton({ text = "Loading Constructors..." }: ConstructorsSkeletonProps) {
  return (
    <Box bg="bg-primary" color="text-primary" py={{ base: 'md', md: 'lg' }}>
      <Container maxW="container.2xl" px={{ base: 4, md: 6 }}>
        <Box position="relative" minH={{ base: '50vh', md: '60vh' }}>
          {/* Background skeleton layer - constructor cards */}
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="lg" opacity={0.7} pointerEvents="none">
            {Array.from({ length: 6 }).map((_, i) => (
              <ConstructorCardSkeleton key={i} />
            ))}
          </SimpleGrid>

          {/* Foreground: centered speedometer + text */}
          <Box 
            position="absolute" 
            inset={0} 
            display="flex" 
            flexDir="column" 
            alignItems="center" 
            justifyContent="flex-start" 
            gap={4} 
            pt={{ base: '120px', md: '140px' }}
          >
            <SpeedometerMini size={260} />
            <Text 
              fontFamily="heading" 
              fontWeight={700} 
              fontSize={{ base: 'lg', md: 'xl' }} 
              color="text-secondary" 
              textAlign="center"
            >
              {text}
            </Text>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
