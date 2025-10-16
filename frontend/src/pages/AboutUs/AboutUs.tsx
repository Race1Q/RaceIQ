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
  Flex,
  Circle,
  Divider,
} from '@chakra-ui/react';
import { 
  DatabaseZap, 
  Trophy, 
  Zap, 
  Target,
  ChevronRight,
  Github,
  Linkedin,
  Mail
} from 'lucide-react';
import TeamMemberCard from '../../components/TeamMemberCard/TeamMemberCard';
import FeatureCard from '../../components/FeatureCard-AboutUs/FeatureCard';
import { useThemeColor } from '../../context/ThemeColorContext';

const AboutUsPage: React.FC = () => {
  const { accentColorWithHash } = useThemeColor();
  
  // Enhanced team data with social links
  const teamMembers = [
    { 
      name: 'Abdullah', 
      role: 'Frontend Developer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      github: 'https://github.com/abdullah',
      linkedin: 'https://linkedin.com/in/abdullah'
    },
    { 
      name: 'Shives', 
      role: 'Backend Developer',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      github: 'https://github.com/shives',
      linkedin: 'https://linkedin.com/in/shives'
    },
    { 
      name: 'Jay', 
      role: 'Full Stack Developer',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      github: 'https://github.com/jay',
      linkedin: 'https://linkedin.com/in/jay'
    },
    { 
      name: 'Kovis', 
      role: 'UI/UX Designer',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      github: 'https://github.com/kovis',
      linkedin: 'https://linkedin.com/in/kovis'
    },
    { 
      name: 'Umayr', 
      role: 'Quality Assurance',
      avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face',
      github: 'https://github.com/umayr',
      linkedin: 'https://linkedin.com/in/umayr'
    },
    { 
      name: 'MA', 
      role: 'Project Lead',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
      github: 'https://github.com/ma',
      linkedin: 'https://linkedin.com/in/ma'
    },
  ];

  const techStack = [
    { name: 'React', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg' },
    { name: 'NestJS', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/NestJS.svg' },
    { name: 'Supabase', logo: 'https://pipedream.com/s.v0/app_1dBhP3/logo/96' },
    { name: 'Auth0', logo: 'https://www.svgrepo.com/show/448296/auth0.svg' },
    { name: 'OpenF1 API', logo: null, icon: DatabaseZap },
  ];

  return (
    <Box 
      minH="100vh" 
      position="relative"
      sx={{
        background: `
          radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0),
          linear-gradient(45deg, #0a0a0a 25%, transparent 25%, transparent 75%, #0a0a0a 75%),
          linear-gradient(-45deg, #0a0a0a 25%, transparent 25%, transparent 75%, #0a0a0a 75%)
        `,
        backgroundSize: '20px 20px, 20px 20px, 20px 20px',
        backgroundColor: '#0a0a0a',
        _light: {
          background: `
            radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 0),
            linear-gradient(45deg, #f8f9fa 25%, transparent 25%, transparent 75%, #f8f9fa 75%),
            linear-gradient(-45deg, #f8f9fa 25%, transparent 25%, transparent 75%, #f8f9fa 75%)
          `,
          backgroundSize: '20px 20px, 20px 20px, 20px 20px',
          backgroundColor: '#f8f9fa',
        }
      }}
    >
      {/* Subtle grid overlay for HUD effect */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        opacity={0.03}
        backgroundImage={`
          linear-gradient(${accentColorWithHash} 1px, transparent 1px),
          linear-gradient(90deg, ${accentColorWithHash} 1px, transparent 1px)
        `}
        backgroundSize="50px 50px"
        pointerEvents="none"
        zIndex={0}
      />

      {/* Custom Hero Section */}
      <Box
        position="relative"
        bg="bg-surface-raised"
        p={{ base: 'xl', md: '2xl' }}
        borderBottom="2px solid"
        borderColor="border-subtle"
        overflow="hidden"
        sx={{
          '@keyframes raceIn': {
            'from': { 
              opacity: 0, 
              transform: 'translateX(-40px) skewX(-3deg)',
            },
            'to': { 
              opacity: 1, 
              transform: 'translateX(0) skewX(0deg)',
            },
          },
          '@keyframes expandLine': {
            'from': {
              width: '0%',
              opacity: 0,
            },
            'to': {
              width: '100%',
              opacity: 1,
            },
          },
          '@keyframes glowPulse': {
            '0%, 100%': {
              boxShadow: `0 0 8px ${accentColorWithHash}60, 0 0 15px ${accentColorWithHash}30`,
            },
            '50%': {
              boxShadow: `0 0 15px ${accentColorWithHash}90, 0 0 25px ${accentColorWithHash}50`,
            },
          },
        }}
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          background: `
            radial-gradient(ellipse at top left, ${accentColorWithHash}10 0%, transparent 50%),
            radial-gradient(ellipse at top right, ${accentColorWithHash}08 0%, transparent 50%),
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 20px,
              ${accentColorWithHash}03 20px,
              ${accentColorWithHash}03 22px
            )
          `,
          pointerEvents: 'none',
          zIndex: 0,
        }}
        _after={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, 
            ${accentColorWithHash} 0%, 
            ${accentColorWithHash}ff 20%,
            ${accentColorWithHash}ff 80%,
            ${accentColorWithHash} 100%)`,
          boxShadow: `0 2px 20px ${accentColorWithHash}70, 0 0 40px ${accentColorWithHash}40`,
          animation: 'expandLine 0.8s ease-out, glowPulse 3s ease-in-out infinite 0.8s',
        }}
      >
        {/* Racing corner brackets */}
        <Box
          position="absolute"
          top="0"
          right="0"
          width="100px"
          height="4px"
          background={`linear-gradient(270deg, ${accentColorWithHash}, transparent)`}
          boxShadow={`0 0 10px ${accentColorWithHash}60`}
          sx={{
            animation: 'expandLine 0.6s ease-out 0.2s backwards',
            transformOrigin: 'right',
          }}
        />
        <Box
          position="absolute"
          top="0"
          right="0"
          width="4px"
          height="40px"
          background={`linear-gradient(180deg, ${accentColorWithHash}, transparent)`}
          boxShadow={`0 0 10px ${accentColorWithHash}60`}
          sx={{
            animation: 'expandLine 0.6s ease-out 0.3s backwards',
            transformOrigin: 'top',
          }}
        />

        {/* Speed chevrons */}
        <Box
          position="absolute"
          left="0"
          top="50%"
          transform="translateY(-50%)"
          display="flex"
          gap="2px"
          opacity="0.15"
          zIndex={0}
        >
          {[0, 1, 2].map((i) => (
            <ChevronRight
              key={i}
              size={40}
              color={accentColorWithHash}
              style={{
                animation: `chevronSlide 1.5s ease-in-out infinite ${i * 0.15}s`,
              }}
            />
          ))}
        </Box>

        <VStack 
          spacing={6} 
          align="center" 
          position="relative" 
          zIndex={1}
          sx={{
            animation: 'raceIn 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <Heading 
            fontFamily="heading" 
            fontSize={{ base: '2rem', md: '2.5rem' }} 
            color="text-primary" 
            textAlign="center"
            fontWeight="700"
            letterSpacing="tight"
            sx={{
              textShadow: `0 2px 15px ${accentColorWithHash}25`,
              background: `linear-gradient(135deg, var(--chakra-colors-text-primary) 0%, var(--chakra-colors-text-primary) 70%, ${accentColorWithHash}80 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
            }}
            _after={{
              content: '""',
              position: 'absolute',
              bottom: '-10px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '120px',
              height: '4px',
              background: `linear-gradient(90deg, ${accentColorWithHash} 0%, ${accentColorWithHash}80 70%, transparent 100%)`,
              boxShadow: `0 0 10px ${accentColorWithHash}80, 0 2px 5px ${accentColorWithHash}40`,
              borderRadius: '2px',
            }}
          >
            About RaceIQ
          </Heading>
          
          <Text 
            color="text-secondary"
            fontSize={{ base: 'lg', md: 'xl' }}
            textAlign="center"
            maxW="800px"
            lineHeight="1.6"
            sx={{
              opacity: 0,
              animation: 'raceIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.15s forwards',
            }}
          >
            The <Text as="span" color={accentColorWithHash} fontWeight="700">ultimate</Text> F1 stats tracker, delivering real-time data, deep historical analysis, and unparalleled insights
          </Text>
        </VStack>
      </Box>

      {/* Features Section */}
      <Container maxWidth="1200px" py="xl" position="relative" zIndex={1}>
        <VStack spacing={12}>
          <Heading 
            fontFamily="heading" 
            fontSize={{ base: '2rem', md: '2.5rem' }} 
            color="text-primary" 
            textAlign="center"
            position="relative"
            _after={{
              content: '""',
              position: 'absolute',
              bottom: '-8px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '80px',
              height: '3px',
              background: `linear-gradient(90deg, ${accentColorWithHash} 0%, transparent 100%)`,
              borderRadius: '2px',
            }}
          >
            What We Offer
          </Heading>
          
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} width="100%">
            <FeatureCard 
              icon={<Trophy size={40} />} 
              title="Personalized Insights" 
              description="Sign in to customize your dashboard and unlock a tailored F1 analysis experience with your favorite drivers and teams." 
            />
            <FeatureCard 
              icon={<Target size={40} />} 
              title="Historical Analysis" 
              description="Dive into a rich database of past races, driver performance, and championship outcomes. Uncover trends and relive classic moments." 
            />
            <FeatureCard 
              icon={<Zap size={40} />} 
              title="Deep Insights" 
              description="Go beyond the numbers. Our analytics reveal tire strategies, lap-by-lap pace distribution, and the key moments that define a race." 
            />
          </SimpleGrid>
        </VStack>
      </Container>

      {/* Angled divider */}
      <Box
        position="relative"
        height="60px"
        overflow="hidden"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          background: `linear-gradient(135deg, ${accentColorWithHash}20 0%, transparent 50%, ${accentColorWithHash}20 100%)`,
          transform: 'skewY(-2deg)',
          transformOrigin: 'top left',
        }}
      />

      {/* Team Section */}
      <Container maxWidth="1200px" py="xl" position="relative" zIndex={1}>
        <VStack spacing={12}>
          <Heading 
            fontFamily="heading" 
            fontSize={{ base: '2rem', md: '2.5rem' }} 
            color="text-primary" 
            textAlign="center"
            position="relative"
            _after={{
              content: '""',
              position: 'absolute',
              bottom: '-8px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '80px',
              height: '3px',
              background: `linear-gradient(90deg, ${accentColorWithHash} 0%, transparent 100%)`,
              borderRadius: '2px',
            }}
          >
            The Team
          </Heading>
          
          <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={6} width="100%">
            {teamMembers.map((member) => (
              <Box
                key={member.name}
                bg="bg-surface"
                borderWidth="1px"
                borderColor="border-primary"
                borderRadius="lg"
                p="lg"
                textAlign="center"
                transition="all 0.3s ease"
                _hover={{
                  transform: 'translateY(-8px)',
                  boxShadow: `0 12px 30px rgba(0, 0, 0, 0.3), 0 0 20px ${accentColorWithHash}40`,
                  borderColor: accentColorWithHash,
                }}
              >
                <VStack spacing={4}>
                  <Circle
                    size="80px"
                    bg="bg-surface-raised"
                    border="3px solid"
                    borderColor={accentColorWithHash}
                    overflow="hidden"
                    position="relative"
                    _before={{
                      content: '""',
                      position: 'absolute',
                      inset: 0,
                      background: `linear-gradient(135deg, ${accentColorWithHash}20, transparent)`,
                    }}
                  >
                    <Image
                      src={member.avatar}
                      alt={member.name}
                      width="100%"
                      height="100%"
                      objectFit="cover"
                    />
                  </Circle>
                  
                  <VStack spacing={2}>
                    <Text 
                      fontFamily="heading" 
                      fontSize="lg" 
                      fontWeight="700" 
                      color="text-primary"
                    >
                      {member.name}
                    </Text>
                    <Text 
                      color="text-secondary" 
                      fontSize="sm" 
                      fontWeight="500"
                    >
                      {member.role}
                    </Text>
                  </VStack>

                  <HStack spacing={3}>
                    <Circle
                      size="32px"
                      bg="bg-surface-raised"
                      border="1px solid"
                      borderColor="border-primary"
                      cursor="pointer"
                      transition="all 0.2s ease"
                      _hover={{
                        bg: accentColorWithHash,
                        borderColor: accentColorWithHash,
                        transform: 'scale(1.1)',
                      }}
                    >
                      <Icon as={Github} boxSize="16px" color="text-secondary" />
                    </Circle>
                    <Circle
                      size="32px"
                      bg="bg-surface-raised"
                      border="1px solid"
                      borderColor="border-primary"
                      cursor="pointer"
                      transition="all 0.2s ease"
                      _hover={{
                        bg: accentColorWithHash,
                        borderColor: accentColorWithHash,
                        transform: 'scale(1.1)',
                      }}
                    >
                      <Icon as={Linkedin} boxSize="16px" color="text-secondary" />
                    </Circle>
                  </HStack>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>

      {/* Tech Stack Section */}
      <Container maxWidth="1200px" py="xl" position="relative" zIndex={1}>
        <VStack spacing={12}>
          <Heading 
            fontFamily="heading" 
            fontSize={{ base: '2rem', md: '2.5rem' }} 
            color="text-primary" 
            textAlign="center"
            position="relative"
            _after={{
              content: '""',
              position: 'absolute',
              bottom: '-8px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '80px',
              height: '3px',
              background: `linear-gradient(90deg, ${accentColorWithHash} 0%, transparent 100%)`,
              borderRadius: '2px',
            }}
          >
            Powered By
          </Heading>
          
          <HStack spacing={8} wrap="wrap" justify="center">
            {techStack.map((tech) => (
              <VStack
                key={tech.name}
                p="lg"
                bg="bg-surface"
                borderWidth="1px"
                borderColor="border-primary"
                borderRadius="lg"
                transition="all 0.3s ease"
                _hover={{
                  transform: 'translateY(-6px)',
                  boxShadow: `0 12px 30px rgba(0, 0, 0, 0.3), 0 0 20px ${accentColorWithHash}40`,
                  borderColor: accentColorWithHash,
                }}
              >
                {tech.logo ? (
                  <Image src={tech.logo} alt={tech.name} height="50px" objectFit="contain" />
                ) : (
                  <Icon as={tech.icon} boxSize="50px" color={accentColorWithHash} />
                )}
                <Text color="text-secondary" fontSize="sm" fontWeight="600">
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