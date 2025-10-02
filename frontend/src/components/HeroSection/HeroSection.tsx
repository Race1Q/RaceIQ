// frontend/src/components/HeroSection/HeroSection.tsx
import React from 'react';
import { Box, Container, Heading, Text, VStack } from '@chakra-ui/react';
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
  const offsetY = useParallax(0.5);

  const handleScrollDown = () => {
    // Account for fixed header + extra spacing to stop slightly higher
    const headerOffsetPx = 100; // menu (~70px) + 30px buffer
    gsap.to(window, { 
      duration: 1.2,
      scrollTo: window.innerHeight - headerOffsetPx,
      ease: 'power2.inOut' 
    });
  };

  return (
    <Box
      w="100%"
      minH={{ base: '50vh', md: '90vh' }}
      h={{ base: 'auto', md: '90vh' }}
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        w="100%"
        h="140%"
        zIndex={1}
        bgImage="linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.pexels.com/photos/13641535/pexels-photo-13641535.jpeg')"
        bgSize="cover"
        bgPosition="center" // Changed to 'center' for better responsiveness
        style={{ transform: `translateY(${offsetY}px)` }}
      />
      
      <Container maxW="1400px" h="100%" position="relative" zIndex={2} px={{ base: 4, md: 6 }}>
        <VStack
          h="100%"
          spacing={{ base: 2, md: 6 }}
          align={{ base: 'center', md: 'flex-start' }}
          justify="center"
          textAlign={{ base: 'center', md: 'left' }}
          py={{ base: 4, md: 0 }}
        >
          <Heading
            as="h1"
            fontSize={{ base: '3xl', sm: '4xl', md: '6xl', lg: '7xl' }}
            fontWeight="bold"
            fontFamily="heading"
            // IMPROVEMENT: Use semantic text tokens for the gradient.
            // In dark mode, this resolves to white/cccccc. In light mode, it will be dark.
            bgGradient="linear(to-r, text-primary, text-secondary)"
            bgClip="text"
            textAlign={{ base: 'center', md: 'left' }}
            px={{ base: 4, md: 0 }}
          >
            {title}
          </Heading>
          <Text
            fontSize={{ base: 'md', sm: 'lg', md: 'xl' }}
            // IMPROVEMENT: Use a semantic token for the subtitle.
            color="text-secondary" 
            maxW={{ base: '100%', md: '600px' }}
            textAlign={{ base: 'center', md: 'left' }}
            px={{ base: 4, md: 0 }}
          >
            {subtitle}
          </Text>
          {/* Primary CTA removed per request */}
        </VStack>
      </Container>
      
      <Box
        position="absolute"
        bottom={{ base: '20px', md: '30px' }}
        left="50%"
        transform="translateX(-50%)"
        color="white" // 'white' is acceptable here over the dark image background
        fontSize={{ base: '4xl', md: '6xl' }}
        animation="bounceUpDown 2s infinite"
        cursor="pointer"
        onClick={handleScrollDown}
        _hover={{ opacity: 0.7 }}
        zIndex={3}
        display={{ base: 'block', sm: 'block' }}
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