// frontend/src/components/FeatureCard-AboutUs/FeatureCard.tsx

import React from 'react';
import { Box, VStack, Heading, Text, Circle } from '@chakra-ui/react';
import { useThemeColor } from '../../context/ThemeColorContext';

interface FeatureCardProps {
  icon: React.ReactElement;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  const { accentColorWithHash } = useThemeColor();
  
  return (
    <VStack
      bg="bg-surface"
      borderWidth="1px"
      borderColor="border-primary"
      borderRadius="lg"
      p={{ base: 'lg', md: 'xl' }}
      spacing={4}
      textAlign="center"
      h="100%"
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      position="relative"
      overflow="hidden"
      _hover={{
        transform: 'translateY(-8px)',
        boxShadow: `0 20px 40px rgba(0, 0, 0, 0.4), 0 0 30px ${accentColorWithHash}50`,
        borderColor: accentColorWithHash,
      }}
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `linear-gradient(135deg, ${accentColorWithHash}05 0%, transparent 50%, ${accentColorWithHash}05 100%)`,
        opacity: 0,
        transition: 'opacity 0.3s ease',
      }}
      _hover={{
        transform: 'translateY(-8px)',
        boxShadow: `0 20px 40px rgba(0, 0, 0, 0.4), 0 0 30px ${accentColorWithHash}50`,
        borderColor: accentColorWithHash,
        _before: {
          opacity: 1,
        },
      }}
    >
      {/* Circle component with enhanced hover effects */}
      <Circle
        size={{ base: '70px', md: '90px' }}
        bg="bg-surface-raised"
        color={accentColorWithHash}
        border="2px solid"
        borderColor="transparent"
        transition="all 0.3s ease"
        position="relative"
        _groupHover={{
          borderColor: accentColorWithHash,
          boxShadow: `0 0 20px ${accentColorWithHash}60`,
        }}
        sx={{
          '&:hover': {
            borderColor: accentColorWithHash,
            boxShadow: `0 0 20px ${accentColorWithHash}60`,
            transform: 'scale(1.05)',
          },
        }}
      >
        {/* Clone the icon to apply a new size */}
        {React.cloneElement(icon, { size: 40 })}
      </Circle>
      
      <Heading
        fontFamily="heading"
        fontSize={{ base: '1.25rem', md: '1.5rem' }}
        color="text-primary"
        fontWeight="700"
        transition="color 0.3s ease"
        sx={{
          '&:hover': {
            color: accentColorWithHash,
          },
        }}
      >
        {title}
      </Heading>
      
      <Text 
        color="text-secondary" 
        lineHeight="1.6"
        fontSize={{ base: 'sm', md: 'md' }}
      >
        {description}
      </Text>
    </VStack>
  );
};

export default FeatureCard;