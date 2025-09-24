import { useAuth0 } from '@auth0/auth0-react';
import { Box, Container, VStack, Heading, Text, SimpleGrid } from '@chakra-ui/react';
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
  const { featuredDriver, recentRaces, loading: dataLoading, error } = useHomePageData();

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
            <VStack spacing={12}>
              <Heading color="text-primary">Recent Races</Heading>
              <SimpleGrid columns={{ base: 1, md: 3 }} gap="lg">
                {recentRaces.map((race) => (
                  <Box
                    key={race.id}
                    bg="bg-surface-raised"
                    border="1px solid"
                    borderColor="border-primary"
                    borderRadius="lg"
                    p="lg"
                    transition="all 0.3s ease"
                    _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg', borderColor: 'brand.red' }}
                  >
                    <Heading as="h3" color="brand.red" size="md" mb="sm">{race.name}</Heading>
                    <Text color="text-muted" fontSize="sm" mb="xs">Round {race.round}</Text>
                    <Text color="text-muted" fontSize="sm">{new Date(race.date).toLocaleDateString()}</Text>
                  </Box>
                ))}
              </SimpleGrid>
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
