// frontend/src/components/PodiumCard/PodiumCard.tsx

import React from 'react';
import { Box, VStack, Heading, Text, Image, HStack } from '@chakra-ui/react';

interface PodiumCardProps {
  position: number;
  driverName: string;
  teamName: string;
  points: number;
  driverImageUrl: string;
  accentColor: string;
}

const PodiumCard: React.FC<PodiumCardProps> = ({
  position,
  driverName,
  teamName,
  points,
  driverImageUrl,
  accentColor,
}) => {
  const getPositionText = (pos: number) => {
    switch (pos) {
      case 1: return '1st';
      case 2: return '2nd';
      case 3: return '3rd';
      default: return `${pos}th`;
    }
  };

  return (
    <Box
      position="relative"
      bg="bg-surface"
      borderRadius="lg"
      borderWidth="2px"
      borderColor={accentColor}
      p="md"
      minH="200px"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      boxShadow="lg"
      _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl' }}
      transition="all 0.2s"
    >
      <Text
        position="absolute"
        top="2"
        right="2"
        fontSize="sm"
        fontWeight="bold"
        color="text-secondary"
      >
        {getPositionText(position)}
      </Text>
      
      <VStack align="flex-start" spacing="sm" flex="1" justify="center">
        <Heading size="md" color="text-primary" fontFamily="heading">
          {driverName}
        </Heading>
        <Text color="text-secondary" fontSize="sm">
          {teamName}
        </Text>
      </VStack>

      <HStack justify="space-between" align="flex-end">
        <Text fontSize="lg" fontWeight="bold" color="text-primary">
          {points}Pts
        </Text>
        <Image
          src={driverImageUrl}
          alt={driverName}
          boxSize="60px"
          borderRadius="full"
          objectFit="cover"
        />
      </HStack>
    </Box>
  );
};

export default PodiumCard;