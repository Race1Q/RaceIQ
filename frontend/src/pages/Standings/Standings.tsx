// src/pages/Standings/Standings.tsx
import React from 'react';
import { Box, Flex, Heading, Text, Button } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const Standings: React.FC = () => {
  return (
    <Box p={['4', '6', '8']} fontFamily="var(--font-display)">
      <Heading mb={6} color="white">
        F1 Standings
      </Heading>

      <Flex gap={6} flexDirection={['column', 'row']}>
        {/* Drivers Standings Card */}
        <Box
          flex={1}
          p={6}
          borderRadius="2xl"
          bg="gray.800"
          color="white"
          boxShadow="xl"
          _hover={{ transform: 'translateY(-4px)', boxShadow: '2xl', transition: 'all 0.2s ease-in-out' }}
        >
          <Heading size="md" mb={3}>
            Drivers Standings
          </Heading>
          <Text mb={4} color="gray.300">
            View all drivers ranked by points, wins, and positions for each season.
          </Text>
          <Button as={Link} to="/standings/drivers" colorScheme="red">
            View Drivers
          </Button>
        </Box>

        {/* Constructors Standings Card */}
        <Box
          flex={1}
          p={6}
          borderRadius="2xl"
          bg="gray.800"
          color="white"
          boxShadow="xl"
          _hover={{ transform: 'translateY(-4px)', boxShadow: '2xl', transition: 'all 0.2s ease-in-out' }}
        >
          <Heading size="md" mb={3}>
            Constructors Standings
          </Heading>
          <Text mb={4} color="gray.300">
            Explore constructor rankings, team performance, and championship points.
          </Text>
          <Button as={Link} to="/standings/constructors" colorScheme="blue">
            View Constructors
          </Button>
        </Box>
      </Flex>
    </Box>
  );
};

export default Standings;