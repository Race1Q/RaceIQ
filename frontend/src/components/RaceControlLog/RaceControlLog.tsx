import React from 'react';
import { Box, Text, VStack, HStack, Heading, Badge } from '@chakra-ui/react';
import { MessageSquare } from 'lucide-react';
import type { RaceControlMessage } from '../../data/types';

interface RaceControlLogProps {
  messages: RaceControlMessage[];
}

const RaceControlLog: React.FC<RaceControlLogProps> = ({ messages }) => {
  return (
    <VStack spacing="lg" bg="bg-surface" p="lg" borderRadius="lg" borderWidth="1px" borderColor="border-primary" h="100%">
      <Heading as="h3" size="md" fontFamily="heading" color="text-primary">Race Control</Heading>
      
      <Box w="100%" maxH="300px" overflowY="auto">
        <VStack spacing="sm" align="stretch">
          {messages.map((message, index) => (
            <Box key={index} p="sm" bg="bg-surface-raised" borderRadius="md" borderLeft="4px" borderColor="brand.red">
              <HStack spacing="md" align="flex-start">
                <Badge colorScheme="red" variant="solid" fontSize="xs">
                  L{message.lap}
                </Badge>
                <Text color="text-primary" fontSize="sm">{message.message}</Text>
              </HStack>
            </Box>
          ))}
        </VStack>
      </Box>
    </VStack>
  );
};

export default RaceControlLog;
