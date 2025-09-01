import React from 'react';
import { Box, VStack, Heading, Text, Container } from '@chakra-ui/react';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  backgroundImageUrl?: string;
  backgroundColor?: string;
  disableOverlay?: boolean;
  children?: React.ReactNode;
}

const HeroSection: React.FC<HeroSectionProps> = ({ 
  title, 
  subtitle, 
  backgroundImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/8/88/Sebastian_Vettel_Red_Bull_Racing_2013_Silverstone_F1_Test_009.jpg',
  backgroundColor,
  disableOverlay = false,
  children
}) => {
  return (
    <Box
      bgImage={backgroundColor ? 'none' : `url(${backgroundImageUrl})`}
      bgColor={backgroundColor || undefined}
      bgSize="cover"
      bgPosition="center"
      bgRepeat="no-repeat"
      position="relative"
      py="xl"
      minH="400px"
      display="flex"
      alignItems="center"
    >
      <Box 
        bg={disableOverlay ? 'none' : 'rgba(0, 0, 0, 0.6)'} 
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
      />
      <Container maxW="1200px" position="relative" zIndex="1">
        {children ? (
          children
        ) : (
          <VStack spacing="8" textAlign="center">
            <Heading 
              as="h1" 
              size="2xl" 
              fontFamily="heading" 
              color="white"
              textShadow="2px 2px 4px rgba(0,0,0,0.8)"
            >
              {title}
            </Heading>
            <Text 
              fontSize="xl" 
              color="white"
              textShadow="1px 1px 2px rgba(0,0,0,0.8)"
            >
              {subtitle}
            </Text>
          </VStack>
        )}
      </Container>
    </Box>
  );
};

export default HeroSection;
