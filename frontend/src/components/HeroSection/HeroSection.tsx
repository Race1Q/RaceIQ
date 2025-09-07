// src/components/HeroSection/HeroSection.tsx
import React from 'react';
import { Box, Button, Container, Heading, Text, VStack } from '@chakra-ui/react';
import { useAuth0 } from '@auth0/auth0-react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { useParallax } from '../../hooks/useParallax';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollToPlugin);

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ 
  title = "Track Every F1 Appearance",
  subtitle = "View race results and appearances for your favourite drivers and teams — across sports."
}) => {
  const { loginWithRedirect } = useAuth0();
  const offsetY = useParallax(0.5);

  const handleScrollDown = () => {
    const navbarHeight = 70; // The height of your sticky navbar in pixels
    gsap.to(window, { 
      duration: 1.5, // Slower scroll duration (1.5 seconds)
      scrollTo: window.innerHeight - navbarHeight, // Adjusted scroll target
      ease: 'power2.inOut' 
    });
  };

  return (
    <Box
      w="100%"
      h="90vh"
      position="relative"
      overflow="hidden" // Important: hide the parts of the image that move out of view
    >
      {/* New dedicated background layer */}
      <Box
        position="absolute"
        top={0}
        left={0}
        w="100%"
        h="140%" // Make image taller to prevent empty space when scrolling
        zIndex={1}
        bgImage="linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.pexels.com/photos/13641535/pexels-photo-13641535.jpeg')"
        bgSize="cover"
        bgPosition="top"
        // Apply the parallax effect
        style={{ transform: `translateY(${offsetY}px)` }}
      />
      
      {/* Text content now sits on top with a higher zIndex */}
      <Container maxW="1400px" h="100%" position="relative" zIndex={2}>
        <VStack
          h="100%"
          spacing={6}
          align={{ base: 'center', md: 'flex-start' }}
          justify="center"
          textAlign={{ base: 'center', md: 'left' }}
        >
          <Heading
            as="h1"
            fontSize={{ base: '4xl', md: '6xl', lg: '7xl' }}
            fontWeight="bold"
            bgGradient="linear(to-r, gray.100, gray.400)"
            bgClip="text"
          >
            {title}
          </Heading>
          <Text
            fontSize={{ base: 'lg', md: 'xl' }}
            color="gray.300"
            maxW="600px"
          >
            {subtitle}
          </Text>
          <Button
            size="lg"
            bg="brand.red"
            color="white"
            _hover={{ bg: 'brand.redDark' }}
            px={8}
            onClick={() => loginWithRedirect()}
          >
            Get Started
          </Button>
        </VStack>
      </Container>
      
      {/* Scroll arrow also needs a higher zIndex */}
      <Box
        position="absolute"
        bottom="30px"
        left="50%"
        transform="translateX(-50%)"
        color="white"
        fontSize="6xl"
        animation="bounceUpDown 2s infinite"
        cursor="pointer"
        onClick={handleScrollDown}
        _hover={{ opacity: 0.7 }}
        zIndex={3}
        sx={{
          '@keyframes bounceUpDown': {
            '0%, 100%': {
              transform: 'translateX(-50%) translateY(0px)',
            },
            '50%': {
              transform: 'translateX(-50%) translateY(-10px)',
            },
          },
        }}
      >
        <ChevronDownIcon />
      </Box>
    </Box>
  );
};

export default HeroSection;
