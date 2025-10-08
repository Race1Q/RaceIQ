// frontend/src/pages/Drivers/DriversSkeleton.tsx
import { Box, HStack, SimpleGrid, VStack } from '@chakra-ui/react';
import SpeedometerMini from '../../components/loaders/SpeedometerMini';

const Line = ({ w = '60%', h = '12px', br = 'md' }: { w?: any; h?: any; br?: string }) => (
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

export default function DriversSkeleton() {
  return (
    <Box position="relative" minH={{ base: '70vh', md: '75vh' }}>
      {/* Background skeleton layer */}
      <VStack spacing="xl" align="stretch" opacity={0.7} pointerEvents="none">
        {/* header + filters */}
        <VStack align="stretch" spacing={4}>
          <Line w={{ base: '60%', md: '320px' }} h="20px" />
          <HStack gap={3} wrap="wrap">
            {Array.from({ length: 8 }).map((_, i) => (
              <Line key={i} w="96px" h="36px" br="full" />
            ))}
          </HStack>
        </VStack>

        {/* team sections with cards grid skeleton */}
        {Array.from({ length: 2 }).map((_, section) => (
          <VStack key={section} align="stretch" spacing={4}>
            <Line w="220px" h="22px" />
            <SimpleGrid columns={{ base: 2, sm: 2, md: 2 }} gap={{ base: 3, md: 6 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <VStack key={i} align="stretch" spacing={3} p={3} bg="bg-primary" border="1px solid" borderColor="border-primary" borderRadius="lg">
                  <HStack align="center" gap={3}>
                    <Line w="40px" h="40px" br="full" />
                    <VStack flex={1} align="stretch" spacing={2}>
                      <Line w="70%" />
                      <Line w="50%" />
                    </VStack>
                    <Line w="40px" h="24px" />
                  </HStack>
                  <Line w="100%" h="120px" />
                </VStack>
              ))}
            </SimpleGrid>
          </VStack>
        ))}
      </VStack>

      {/* Foreground: centered speedometer */}
      <Box position="absolute" inset={0} display="flex" alignItems="center" justifyContent="center">
        <SpeedometerMini size={260} />
      </Box>
    </Box>
  );
}
