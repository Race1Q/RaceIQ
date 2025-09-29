import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import { Box, Container, VStack, Heading, Text } from '@chakra-ui/react';
import { RaceSlider } from '../../components/RaceSlider/RaceSlider';
import F1LoadingSpinner from '../../components/F1LoadingSpinner/F1LoadingSpinner';
import HeroSection from '../../components/HeroSection/HeroSection';
import FeaturedDriverSection from '../../components/FeaturedDriverSection/FeaturedDriverSection';
import ComparePreviewSection from '../../components/ComparePreviewSection/ComparePreviewSection';
import ScrollAnimationWrapper from '../../components/ScrollAnimationWrapper/ScrollAnimationWrapper';
import SectionConnector from '../../components/SectionConnector/SectionConnector';
import LoginButton from '../../components/LoginButton/LoginButton';
import { useHomePageData } from '../../hooks/useHomePageData';

function HomePage() {
  const { isAuthenticated, isLoading, user } = useAuth0();
  const { featuredDriver, seasonSchedule, loading: dataLoading, error, isFallback } = useHomePageData();

  // Ensure page loads at top
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  if (isLoading || dataLoading) {
    return <F1LoadingSpinner text="Loading RaceIQ" />;
  }

  return (
    <Box>
      <HeroSection />
      
      {!isAuthenticated && (
        <>
          <ScrollAnimationWrapper position="relative">
            <FeaturedDriverSection featuredDriver={featuredDriver} isError={!!error} />
            <SectionConnector />
          </ScrollAnimationWrapper>
          
          <ScrollAnimationWrapper delay={0.2}>
            <ComparePreviewSection />
          </ScrollAnimationWrapper>
        </>
      )}
      
      <Box as="section" bg="bg-surface">
        <Container maxW="1400px" py="80px">
          <VStack spacing={12}>
            {isAuthenticated && (
              <VStack spacing={4}>
                <Heading color="brand.red">Welcome back, {user?.name}!</Heading>
                <Text color="text-secondary">Your personalized F1 feed will appear here.</Text>
              </VStack>
            )}
            <VStack spacing={12} width="100%" overflow="hidden">
              <Heading
                as="h4"
                size="sm"
                color="brand.red"
                textTransform="uppercase"
                letterSpacing="wider"
                fontWeight="bold"
                mb={8}
                textAlign="center"
              >
                Recent Races
              </Heading>
              {/* Render slider only if we have schedule data available */}
              {!dataLoading && Array.isArray(seasonSchedule) && seasonSchedule.length > 0 && (
                <RaceSlider seasonSchedule={seasonSchedule} />
              )}
            </VStack>
          </VStack>
        </Container>
      </Box>

      {!isAuthenticated && (
        <Box as="section" bgGradient="linear(to-r, brand.red, brand.redDark)" textAlign="center">
          <Container maxW="1400px" py="80px">
            <VStack spacing="xl">
              <Heading size="lg" color="white">Create your free account and get more from every race.</Heading>
              <Text fontSize="lg" color="gray.200">Track your favorite drivers, get personalized insights, and never miss a race.</Text>
              <LoginButton />
            </VStack>
          </Container>
        </Box>
      )}
    </Box>
  );
}

export default HomePage;
