// frontend/src/components/DriverDetails/StatCard.tsx
import React from 'react';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import type { Stat } from '../../types';

interface StatCardProps {
  stat: Stat;
  gridColumn?: { base?: string; md?: string };
}

const StatCard: React.FC<StatCardProps> = ({ stat, gridColumn }) => {
  const alignment = stat.textAlign || 'flex-start';
  const textAlignment = stat.textAlign || 'left';
  
  return (
    <VStack
      bg="transparent"
      p="md"
      borderRadius="lg"
      border="1px solid"
      borderColor="border-primary"
      align={alignment}
      spacing={0}
      h="100%"
      backdropFilter="blur(8px)"
      gridColumn={gridColumn}
    >
      <Text fontSize="sm" color="text-muted" textTransform="uppercase" textAlign={textAlignment}>
        {stat.label}
      </Text>
      <Heading size="lg" fontFamily="heading" textAlign={textAlignment}>
        {stat.value}
      </Heading>
    </VStack>
  );
};

export default StatCard;
