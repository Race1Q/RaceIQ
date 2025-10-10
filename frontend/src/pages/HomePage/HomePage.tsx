import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import { Box, Container, VStack, Heading, Text } from '@chakra-ui/react';
import React, { Suspense } from 'react';
const RaceSlider = React.lazy(() => import('../../components/RaceSlider/RaceSlider').then(m => ({ default: m.RaceSlider })));
import HeroSection from '../../components/HeroSection/HeroSection';
import FeaturedDriverSection from '../../components/FeaturedDriverSection/FeaturedDriverSection';
import FeaturedDriverSkeleton from '../../components/FeaturedDriverSection/FeaturedDriverSkeleton';
import ComparePreviewSection from '../../components/ComparePreviewSection/ComparePreviewSection';
import ScrollAnimationWrapper from '../../components/ScrollAnimationWrapper/ScrollAnimationWrapper';
import SectionConnector from '../../components/SectionConnector/SectionConnector';
import LoginButton from '../../components/LoginButton/LoginButton';
import { useHomePageData } from '../../hooks/useHomePageData';

function HomePage() {
  const { isAuthenticated, user } = useAuth0();
  const { featuredDriver, seasonSchedule, loading: dataLoading, error } = useHomePageData();

  // Ensure page loads at top
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  // Show hero section immediately, load data in background

  return (
    <Box w="100%" minH="100vh" bg="bg-primary">
      <HeroSection />
      
      {!isAuthenticated && (
        <>
          <ScrollAnimationWrapper position="relative">
            {dataLoading ? (
              <FeaturedDriverSkeleton />
            ) : (
              <FeaturedDriverSection featuredDriver={featuredDriver} isError={!!error} />
            )}
            <SectionConnector />
          </ScrollAnimationWrapper>
          
          <ScrollAnimationWrapper delay={0.2}>
            <ComparePreviewSection />
          </ScrollAnimationWrapper>
        </>
      )}
      
      <Box as="section" bg="bg-surface" w="100%">
        <Container maxW="1400px" py={{ base: '40px', md: '80px' }} px={{ base: 4, md: 6 }} w="100%">
          <VStack spacing={{ base: 8, md: 12 }} w="100%">
            {isAuthenticated && (
              <VStack spacing={4} w="100%">
                <Heading color="brand.red" fontSize={{ base: 'xl', md: '2xl' }} textAlign="center">Welcome back, {user?.name}!</Heading>
                <Text color="text-secondary" fontSize={{ base: 'md', md: 'lg' }} textAlign="center">Your personalized F1 feed will appear here.</Text>
              </VStack>
            )}
            <VStack spacing={{ base: 8, md: 12 }} width="100%" overflow="hidden">
              <Heading
                as="h4"
                size="sm"
                color="brand.red"
                textTransform="uppercase"
                letterSpacing="wider"
                fontWeight="bold"
                mb={{ base: 4, md: 8 }}
                textAlign="center"
                fontSize={{ base: 'xs', md: 'sm' }}
              >
                Recent Races
              </Heading>
              {/* Render slider only if we have schedule data available */}
              <Suspense fallback={null}>
                {!dataLoading && Array.isArray(seasonSchedule) && seasonSchedule.length > 0 && (
                  <RaceSlider seasonSchedule={seasonSchedule} />
                )}
              </Suspense>
            </VStack>
          </VStack>
        </Container>
      </Box>

      {!isAuthenticated && (
        <Box as="section" bgGradient="linear(to-r, brand.red, brand.redDark)" textAlign="center" w="100%">
          <Container maxW="1400px" py={{ base: '40px', md: '80px' }} px={{ base: 4, md: 6 }} w="100%">
            <VStack spacing={{ base: 6, md: 'xl' }} w="100%">
              <Heading size={{ base: 'md', md: 'lg' }} color="white" px={{ base: 4, md: 0 }} textAlign="center">
                Create your free account and get more from every race.
              </Heading>
              <Text fontSize={{ base: 'md', md: 'lg' }} color="gray.200" px={{ base: 4, md: 0 }} textAlign="center">
                Track your favorite drivers, get personalized insights, and never miss a race.
              </Text>
              <LoginButton />
            </VStack>
          </Container>
        </Box>
      )}
    </Box>
  );
}

export default HomePage;
