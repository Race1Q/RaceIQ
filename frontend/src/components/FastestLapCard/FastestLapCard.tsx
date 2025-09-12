// frontend/src/components/FastestLapCard/FastestLapCard.tsx

import React from 'react';
import { Box, Text, HStack, VStack, Heading } from '@chakra-ui/react';
import { Clock, Zap } from 'lucide-react';

interface FastestLapCardProps {
  driver: string;
  time: string;
  teamColor?: string;
}

const FastestLapCard: React.FC<FastestLapCardProps> = ({ driver, time, teamColor }) => {
  const gradientColor = teamColor || 'var(--color-primary-red)';
  const gradientColorDark = teamColor ? `${teamColor}CC` : '#c00500'; // Add transparency for darker variant

  return (
    <Box 
      bg={`linear-gradient(135deg, ${gradientColor} 0%, ${gradientColorDark} 100%)`}
      p="lg"
      borderRadius="lg"
      color="white"
      h="100%"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
    >
      <HStack spacing="sm" mb="md">
        <Box as={Clock} size="20px" />
        <Heading as="h4" size="sm">Fastest Lap</Heading>
      </HStack>
      
      <VStack spacing="sm" align="center">
        <Text fontSize="3xl" fontWeight="bold">{time}</Text>
        <HStack spacing="sm">
          <Box as={Zap} size="16px" />
          <Text fontSize="md" fontWeight="medium">{driver}</Text>
        </HStack>
      </VStack>
    </Box>
  );
};

export default FastestLapCard;
