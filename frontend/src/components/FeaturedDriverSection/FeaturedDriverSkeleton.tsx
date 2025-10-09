// frontend/src/components/FeaturedDriverSection/FeaturedDriverSkeleton.tsx

import React from 'react';
import {
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  VStack,
  HStack,
  SimpleGrid,
  Skeleton,
} from '@chakra-ui/react';

const FeaturedDriverSkeleton: React.FC = () => {
  return (
    <Box bg="bg-surface-raised" w="100%" overflow="hidden">
      <Container maxW="1400px" py={{ base: 'lg', md: 'xl' }} px={{ base: 'md', lg: 'lg' }} w="100%" overflow="hidden">
        <Heading
          as="h4"
          size="sm"
          color="brand.red"
          textTransform="uppercase"
          letterSpacing="wider"
          fontWeight="bold"
          mb={6}
          textAlign="left"
        >
          Featured Driver - Best recent form
        </Heading>
        <Grid templateColumns={{ base: '1fr', md: '1fr', lg: '0.4fr 0.6fr' }} gap={{ base: 4, md: 6, lg: 8 }} alignItems="stretch">
          {/* Left: Driver Card Skeleton */}
          <GridItem
            bg="bg-surface"
            borderRadius="lg"
            p={{ base: 4, md: 6 }}
            height="100%"
            position="relative"
          >
            <VStack spacing={4} align="center" height="100%">
              {/* Driver Image Skeleton */}
              <Box w="100%" display="flex" justifyContent="center" alignItems="center">
                <Skeleton
                  w="100%"
                  maxW={{ base: '200px', md: '300px' }}
                  maxH={{ base: '180px', md: '320px' }}
                  h={{ base: '180px', md: '320px' }}
                  borderRadius="lg"
                />
              </Box>
              
              {/* Driver Name and Info Skeleton */}
              <VStack align="center" spacing={1} mt={2}>
                <Skeleton height="32px" width="200px" />
                <HStack spacing={4} mt={2}>
                  <Skeleton height="20px" width="120px" />
                  <Skeleton height="20px" width="40px" />
                </HStack>
              </VStack>
            </VStack>
          </GridItem>

          {/* Right: Stats Skeleton */}
          <GridItem overflow="hidden">
            <VStack align="flex-start" spacing={{ base: 4, md: 6 }} w="full" overflow="hidden">
              {/* Season Stats Skeleton */}
              <VStack align="flex-start" spacing={{ base: 2, md: 3 }} w="full">
                <Skeleton height="20px" width="120px" />
                <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={{ base: 2, md: 3 }} w="full" maxW="100%">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <VStack
                      key={i}
                      bg="bg-surface"
                      p={{ base: 2, md: 4 }}
                      borderRadius="lg"
                      align="center"
                      spacing={1}
                      borderWidth="1px"
                      borderColor="border-primary"
                    >
                      <Skeleton height="16px" width="60px" />
                      <Skeleton height="24px" width="40px" />
                    </VStack>
                  ))}
                </SimpleGrid>
              </VStack>

              {/* Career Stats Skeleton */}
              <VStack align="flex-start" spacing={{ base: 2, md: 3 }} w="full">
                <Skeleton height="20px" width="100px" />
                <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={{ base: 2, md: 3 }} w="full" maxW="100%">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <VStack
                      key={i}
                      bg="bg-surface"
                      p={{ base: 2, md: 4 }}
                      borderRadius="lg"
                      align="center"
                      spacing={1}
                      borderWidth="1px"
                      borderColor="border-primary"
                    >
                      <Skeleton height="16px" width="60px" />
                      <Skeleton height="24px" width="40px" />
                    </VStack>
                  ))}
                </SimpleGrid>
              </VStack>

              {/* Recent Form Skeleton */}
              <VStack align="flex-start" w="100%" spacing={{ base: 2, md: 3 }} pt={4}>
                <Skeleton height="20px" width="100px" />
                <HStack spacing={{ base: 2, md: 4 }} w="100%" align="stretch" overflowX="auto" pb={2}>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <VStack
                      key={index}
                      flex={1}
                      minW={{ base: '80px', md: '100px' }}
                      bg="bg-surface"
                      p={{ base: 2, md: 4 }}
                      borderRadius="lg"
                      borderWidth="1px"
                      borderColor="border-primary"
                      align="center"
                      justify="space-between"
                      spacing={2}
                    >
                      <Skeleton height="24px" width="30px" />
                      <Skeleton height="16px" width="80px" />
                      <Skeleton height="24px" width="32px" borderRadius="4px" />
                    </VStack>
                  ))}
                </HStack>
              </VStack>
            </VStack>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
};

export default FeaturedDriverSkeleton;
