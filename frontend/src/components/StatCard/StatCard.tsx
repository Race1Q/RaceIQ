import React from 'react';
import { Box, HStack, VStack, Text, Icon } from '@chakra-ui/react';

interface StatCardProps {
  icon: React.ComponentType<any>;
  value: string | number;
  label: string;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  icon, 
  value, 
  label, 
  color = '#dc2626' // Default brand red
}) => {
  return (
    <Box
      borderWidth="1px"
      borderColor="whiteAlpha.200"
      borderRadius="md"
      p={4}
      bg="blackAlpha.100"
      backdropFilter="blur(8px)"
      transition="all 0.2s ease"
      _hover={{
        bg: 'blackAlpha.200',
        borderColor: 'whiteAlpha.300',
        transform: 'translateY(-2px)'
      }}
    >
      <HStack spacing={4} align="center">
        <Box
          p={3}
          borderRadius="md"
          bg={`${color}20`}
          border="1px solid"
          borderColor={`${color}40`}
          flexShrink={0}
        >
          <Icon as={icon} boxSize={6} color={color} />
        </Box>
        <VStack align="flex-start" spacing={0} flex="1">
          <Text
            fontSize="2xl"
            fontWeight="bold"
            color="white"
            lineHeight={1}
          >
            {value}
          </Text>
          <Text
            fontSize="sm"
            color="gray.300"
            textTransform="uppercase"
            letterSpacing="0.05em"
            fontWeight="500"
          >
            {label}
          </Text>
        </VStack>
      </HStack>
    </Box>
  );
};

export default StatCard;