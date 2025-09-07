// src/components/HeroSection/HeroSection.tsx
import React from 'react';
import { Box, Button, Container, Heading, Text, VStack } from '@chakra-ui/react';
import { useAuth0 } from '@auth0/auth0-react';
import { ChevronDownIcon } from '@chakra-ui/icons';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ 
  title = "Track Every F1 Appearance",
  subtitle = "View race results and appearances for your favourite drivers and teams — across sports."
}) => {
  const { loginWithRedirect } = useAuth0();

  return (
    <Box
      w="100%"
      h="90vh"
      position="relative"
      // Restore the background image and gradient overlay
      bg="linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://images.pexels.com/photos/12028373/pexels-photo-12028373.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')"
      bgSize="cover"
      bgPosition="center"
    >
      {/* Text content - zIndex is no longer needed */}
      <Container maxW="1400px" h="100%" position="relative">
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
      
      {/* Big scroll arrow */}
      <Box
        position="absolute"
        bottom="30px"
        left="50%"
        transform="translateX(-50%)"
        color="white"
        fontSize="6xl"
        animation="bounceUpDown 2s infinite"
        cursor="pointer"
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        _hover={{ opacity: 0.7 }}
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
