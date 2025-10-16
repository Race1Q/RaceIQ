// frontend/src/components/DriverDetails/StatCard.tsx
import React from 'react';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import type { Stat } from '../../types';

interface StatCardProps {
  stat: Stat;
}

const StatCard: React.FC<StatCardProps> = ({ stat }) => {
  return (
    <VStack
      bg="transparent"
      p="md"
      borderRadius="lg"
      border="1px solid"
      borderColor="border-primary"
      align="flex-start"
      spacing={0}
      h="100%"
      backdropFilter="blur(8px)"
    >
      <Text fontSize="sm" color="text-muted" textTransform="uppercase">
        {stat.label}
      </Text>
      <Heading size="lg" fontFamily="heading">
        {stat.value}
      </Heading>
    </VStack>
  );
};

export default StatCard;
