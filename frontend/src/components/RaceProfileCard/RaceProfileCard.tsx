// frontend/src/components/RaceProfileCard/RaceProfileCard.tsx

import React from 'react';
import { Box, VStack, HStack, Heading, Text, Flex } from '@chakra-ui/react';
import ReactCountryFlag from 'react-country-flag';
import { getCountryCode } from '../../lib/countryCodeUtils';
import type { Race } from '../../types/races';

interface RaceProfileCardProps {
  race: Race;
}

const RaceProfileCard: React.FC<RaceProfileCardProps> = ({ race }) => {
  // --- Logic is preserved and cleaned up ---
  const gradientStart = `hsl(${(race.round * 20) % 360}, 70%, 50%)`;
  const gradientEnd = `hsl(${(race.round * 20 + 40) % 360}, 70%, 30%)`;

  const countryCode = getCountryCode(race.circuit_id);

  const shortName = race.name.replace(/Grand Prix|GP/g, '').trim();

  const formattedDate = new Date(race.date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  return (
    <Flex
      direction="column"
      h="100%"
      bg="bg-surface"
      borderRadius="lg"
      borderWidth="1px"
      borderColor="border-primary"
      boxShadow="0 4px 15px rgba(0, 0, 0, 0.2)"
      transition="transform 0.3s ease, box-shadow 0.3s ease"
      overflow="hidden"
      _hover={{
        transform: 'translateY(-5px)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Top section with dynamic gradient */}
      <VStack
        flexGrow={1}
        align="flex-start"
        p={{ base: 'lg', md: 'xl' }}
        minH={{ base: '250px', md: '300px' }}
        bgGradient={`linear(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)`}
        color="white"
        textShadow="0 1px 4px rgba(0, 0, 0, 0.5)"
        position="relative"
        spacing={4}
      >
        <Heading
          as="h2"
          w="100%"
          lineHeight={1}
          position="relative"
          pb="sm"
          mb="md"
          _after={{ // Recreating the gradient underline
            content: '""', position: 'absolute', bottom: 0, left: 0,
            h: '2px', w: '100%',
            bgGradient: 'linear(to-right, rgba(255, 255, 255, 0.7) 50%, transparent 100%)',
          }}
        >
          <Text as="span" display="block" mb="-0.5rem"
            fontFamily="signature" fontWeight="400" textTransform="none"
            fontSize={{ base: 'clamp(1.8rem, 5vw, 2.5rem)', md: 'clamp(2.2rem, 6vw, 3rem)' }}
          >
            {shortName}
          </Text>
          <Text as="span" display="block" opacity={0.9}
            fontFamily="heading" fontWeight="bold" textTransform="uppercase"
            fontSize={{ base: 'clamp(1rem, 3vw, 1.2rem)', md: 'clamp(1.2rem, 4vw, 1.5rem)' }}
          >
            {race.name}
          </Text>
        </Heading>
        <Text
          fontFamily="heading" fontWeight="bold"
          fontSize={{ base: '1.2rem', md: '1.5rem' }}
        >
          Round {race.round}
        </Text>
        
        {/* Flag Wrapper */}
        <Box
          position="absolute"
          top={{ base: 'md', md: 'lg' }}
          right={{ base: 'md', md: 'lg' }}
          w={{ base: '50px', md: '30px' }}
          h={{ base: '35px', md: '30px' }}
          borderRadius="sm"
          overflow="hidden"
          boxShadow="0 2px 8px rgba(0, 0, 0, 0.3)"
          border="1px solid rgba(255, 255, 255, 0.15)"
        >
          {countryCode !== 'XX' ? (
            <ReactCountryFlag
              countryCode={countryCode}
              svg
              style={{ width: '100%', height: '100%', display: 'block' }}
              title={countryCode}
            />
          ) : (
            <Flex w="100%" h="100%" bg="#666" align="center" justify="center" fontSize="xl" fontWeight="bold">
              ?
            </Flex>
          )}
        </Box>
      </VStack>

      {/* Bottom section */}
      <HStack
        p={{ base: 'md', md: 'lg' }}
        bg="bg-surface"
        borderTopWidth="1px"
        borderColor="border-primary"
      >
        <Text fontSize="sm" color="text-muted" fontWeight="500">
          {formattedDate}
        </Text>
        <Text ml="auto" fontSize="sm" color="text-secondary" fontWeight="600" textTransform="uppercase" letterSpacing="0.5px">
          View Details
        </Text>
      </HStack>
    </Flex>
  );
};

export default RaceProfileCard;