// frontend/src/pages/AboutUs/AboutUs.tsx

import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  SimpleGrid,
  Container,
  HStack,
  Image,
  Icon,
} from '@chakra-ui/react';
import { UserCheck, Archive, BarChart3, DatabaseZap } from 'lucide-react';
import TeamMemberCard from '../../components/TeamMemberCard/TeamMemberCard';
import PageHeader from '../../components/layout/PageHeader';
import FeatureCard from '../../components/FeatureCard-AboutUs/FeatureCard'; // Import the new component
import { useThemeColor } from '../../context/ThemeColorContext';

const AboutUsPage: React.FC = () => {
  const { accentColorWithHash } = useThemeColor();
  
  // Data remains the same
  const teamMembers = [
    { name: 'Abdullah', role: 'Frontend Developer' },
    { name: 'Shives', role: 'Backend Developer' },
    { name: 'Jay', role: 'Full Stack Developer' },
    { name: 'Kovis', role: 'UI/UX Designer' },
    { name: 'Umayr', role: 'Tester' },
    { name: 'MA', role: 'Project Lead' },
  ];

  const techStack = [
    { name: 'React', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg' },
    { name: 'NestJS', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/NestJS.svg' },
    { name: 'Supabase', logo: 'https://pipedream.com/s.v0/app_1dBhP3/logo/96' },
    { name: 'Auth0', logo: 'https://www.svgrepo.com/show/448296/auth0.svg' },
    { name: 'OpenF1 API', logo: null, icon: DatabaseZap },
  ];

  return (
    <Box bg="bg-primary" minH="100vh">
      <PageHeader
        title="About RaceIQ"
        subtitle="The ultimate F1 stats tracker, delivering real-time data, deep historical analysis, and unparalleled insights"
      />

      {/* Features Section */}
      <Container maxWidth="1200px" py="xl">
        <VStack spacing={12}>
          <Heading fontFamily="heading" fontSize={{ base: '2rem', md: '2.5rem' }} color="text-primary" textAlign="center">
            What We Offer
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} width="100%">
            <FeatureCard icon={<UserCheck />} title="Personalized Insights" description="Sign in to customize your dashboard and unlock a tailored F1 analysis experience." />
            <FeatureCard icon={<Archive />} title="Historical Analysis" description="Dive into a rich database of past races, driver performance, and championship outcomes. Uncover trends and relive classic moments." />
            <FeatureCard icon={<BarChart3 />} title="Deep Insights" description="Go beyond the numbers. Our analytics reveal tire strategies, lap-by-lap pace distribution, and the key moments that define a race." />
          </SimpleGrid>
        </VStack>
      </Container>

      {/* Team Section */}
      <Container maxWidth="1200px" py="xl">
        <VStack spacing={12}>
          <Heading fontFamily="heading" fontSize={{ base: '2rem', md: '2.5rem' }} color="text-primary" textAlign="center">
            The Team
          </Heading>
          <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={6} width="100%">
            {teamMembers.map((member) => (
              <TeamMemberCard key={member.name} name={member.name} role={member.role} />
            ))}
          </SimpleGrid>
        </VStack>
      </Container>

      {/* Tech Stack Section */}
      <Container maxWidth="1200px" py="xl">
        <VStack spacing={12}>
          <Heading fontFamily="heading" fontSize={{ base: '2rem', md: '2.5rem' }} color="text-primary" textAlign="center">
            Powered By
          </Heading>
          <HStack spacing={8} wrap="wrap" justify="center">
            {techStack.map((tech) => (
              <VStack
                key={tech.name}
                p="md"
                bg="bg-surface"
                borderWidth="1px"
                borderColor="border-primary"
                borderRadius="md"
                transition="all 0.3s ease"
                _hover={{
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
                  borderColor: accentColorWithHash,
                }}
              >
                {tech.logo ? (
                  <Image src={tech.logo} alt={tech.name} height="40px" objectFit="contain" />
                ) : (
                  <Icon as={tech.icon} boxSize="40px" color={accentColorWithHash} />
                )}
                <Text color="text-secondary" fontSize="sm" fontWeight="500">
                  {tech.name}
                </Text>
              </VStack>
            ))}
          </HStack>
        </VStack>
      </Container>
    </Box>
  );
};

export default AboutUsPage;