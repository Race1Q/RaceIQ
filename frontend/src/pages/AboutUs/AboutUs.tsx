import React from 'react';
import { 
  Box, 
  VStack, 
  Heading, 
  Text, 
  SimpleGrid, 
  Container,
  HStack,
  Image
} from '@chakra-ui/react';
import { UserCheck, Archive, BarChart3, DatabaseZap } from 'lucide-react';
import TeamMemberCard from '../../components/TeamMemberCard/TeamMemberCard';
import HeroSection from '../../components/HeroSection/HeroSection';
import styles from './AboutUs.module.css';

const AboutUs: React.FC = () => {
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
    <Box className={styles.container}>
      {/* Hero Section */}
      <HeroSection
        title="Beyond the Finish Line"
        subtitle="RaceIQ is the ultimate F1 stats tracker, delivering real-time data, deep historical analysis, and unparalleled insights into every driver and team. We bring you closer to the action, translating every millisecond into knowledge."
        backgroundImageUrl="https://images.pexels.com/photos/29252129/pexels-photo-29252129.jpeg"
      />

      {/* Features Section */}
      <Container maxWidth="1200px" className={styles.section}>
        <VStack spacing={12}>
          <Heading className={styles.sectionTitle}>What We Offer</Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} width="100%">
            <Box className={styles.featureCard}>
              <VStack spacing={4} textAlign="center">
                <Box className={styles.featureIcon}>
                  <UserCheck size={48} />
                </Box>
                <Heading className={styles.featureTitle}>Personalized Insights</Heading>
                <Text className={styles.featureDescription}>
                  Sign in to customize your dashboard and unlock a tailored F1 analysis experience.
                </Text>
              </VStack>
            </Box>

            <Box className={styles.featureCard}>
              <VStack spacing={4} textAlign="center">
                <Box className={styles.featureIcon}>
                  <Archive size={48} />
                </Box>
                <Heading className={styles.featureTitle}>Historical Analysis</Heading>
                <Text className={styles.featureDescription}>
                  Dive into a rich database of past races, driver performance, and championship outcomes. Uncover trends and relive classic moments.
                </Text>
              </VStack>
            </Box>

            <Box className={styles.featureCard}>
              <VStack spacing={4} textAlign="center">
                <Box className={styles.featureIcon}>
                  <BarChart3 size={48} />
                </Box>
                <Heading className={styles.featureTitle}>Deep Insights</Heading>
                <Text className={styles.featureDescription}>
                  Go beyond the numbers. Our analytics reveal tire strategies, lap-by-lap pace distribution, and the key moments that define a race.
                </Text>
              </VStack>
            </Box>
          </SimpleGrid>
        </VStack>
      </Container>

      {/* Team Section */}
      <Container maxWidth="1200px" className={styles.section}>
        <VStack spacing={12}>
          <Heading className={styles.sectionTitle}>The Team</Heading>
          <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={6} width="100%">
            {teamMembers.map((member, index) => (
              <TeamMemberCard
                key={index}
                name={member.name}
                role={member.role}
              />
            ))}
          </SimpleGrid>
        </VStack>
      </Container>

      {/* Tech Stack Section */}
      <Container maxWidth="1200px" className={styles.section}>
        <VStack spacing={12}>
          <Heading className={styles.sectionTitle}>Powered By</Heading>
          <HStack spacing={8} wrap="wrap" justify="center">
            {techStack.map((tech, index) => (
              <Box key={index} className={styles.techLogo}>
                {tech.logo ? (
                  <Image
                    src={tech.logo}
                    alt={tech.name}
                    height="40px"
                    objectFit="contain"
                  />
                ) : (
                  <Box className={styles.techIcon}>
                    {tech.icon && <tech.icon size={40} />}
                  </Box>
                )}
                <Text className={styles.techName}>{tech.name}</Text>
              </Box>
            ))}
          </HStack>
        </VStack>
      </Container>
    </Box>
  );
};

export default AboutUs;
