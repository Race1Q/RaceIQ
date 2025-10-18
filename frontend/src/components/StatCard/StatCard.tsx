import React from 'react';
import { Box, HStack, VStack, Text, Icon, useColorModeValue } from '@chakra-ui/react';

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
  // Theme-aware colors
  const backgroundColor = useColorModeValue('white', 'blackAlpha.100');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const hoverBackground = useColorModeValue('gray.50', 'blackAlpha.200');
  const hoverBorderColor = useColorModeValue('gray.300', 'whiteAlpha.300');
  const textColor = useColorModeValue('gray.800', 'white');
  const labelColor = useColorModeValue('gray.600', 'gray.300');
  
  return (
    <Box
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="md"
      p={4}
      bg={backgroundColor}
      backdropFilter="blur(8px)"
      transition="all 0.2s ease"
      _hover={{
        bg: hoverBackground,
        borderColor: hoverBorderColor,
        transform: 'translateY(-2px)'
      }}
    >
      <VStack align="center" spacing={3} textAlign="center">
        <Box
          p={3}
          borderRadius="md"
          bg={`${color}20`}
          border="1px solid"
          borderColor={`${color}40`}
        >
          <Icon as={icon} boxSize={6} color={color} />
        </Box>
        <VStack align="center" spacing={1}>
          <Text
            fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
            fontWeight="bold"
            color={textColor}
            lineHeight={1}
            wordBreak="break-word"
            textAlign="center"
          >
            {value}
          </Text>
          <Text
            fontSize={{ base: "xs", md: "sm" }}
            color={labelColor}
            textTransform="uppercase"
            letterSpacing="0.05em"
            fontWeight="500"
            textAlign="center"
            wordBreak="break-word"
          >
            {label}
          </Text>
        </VStack>
      </VStack>
    </Box>
  );
};

export default StatCard;