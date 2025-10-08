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
      transition="all 0.3s ease"
      _hover={{
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.3)',
        borderColor: accentColorWithHash,
      }}
    >
      {/* Circle component is perfect for the icon background */}
      <Circle
        size={{ base: '60px', md: '80px' }}
        bg="bg-surface-raised"
        color={accentColorWithHash}
      >
        {/* Clone the icon to apply a new size */}
        {React.cloneElement(icon, { size: 40 })}
      </Circle>
      <Heading
        fontFamily="heading"
        fontSize={{ base: '1.25rem', md: '1.5rem' }}
        color="text-primary"
      >
        {title}
      </Heading>
      <Text color="text-secondary" lineHeight="1.6">
        {description}
      </Text>
    </VStack>
  );
};

export default FeatureCard;