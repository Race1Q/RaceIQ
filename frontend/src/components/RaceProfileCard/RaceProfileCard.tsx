// frontend/src/components/RaceProfileCard/RaceProfileCard.tsx

import React from 'react';
import { Box, VStack, HStack, Heading, Text, Flex } from '@chakra-ui/react';
import ReactCountryFlag from 'react-country-flag';
import { countryCodeMap } from '../../lib/countryCodeUtils';
import type { Race } from '../../types/races';

interface RaceProfileCardProps {
  race: Race;
}

const RaceProfileCard: React.FC<RaceProfileCardProps> = ({ race }) => {
  // --- Logic is preserved and cleaned up ---
  const gradientStart = `hsl(${(race.round * 20) % 360}, 70%, 50%)`;
  const gradientEnd = `hsl(${(race.round * 20 + 40) % 360}, 70%, 30%)`;

  const twoLetter = countryCodeMap[(race as any)?.circuit?.country_code?.toUpperCase?.() ?? ''] ?? '';

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
        p={{ base: 'md', md: 'xl' }}
        minH={{ base: '180px', md: '300px' }}
        bgGradient={`linear(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)`}
        color="white"
        textShadow="0 1px 4px rgba(0, 0, 0, 0.5)"
        position="relative"
        spacing={{ base: 2, md: 4 }}
      >
        <Heading
          as="h2"
          w="100%"
          lineHeight={1}
          position="relative"
          pb={{ base: 'xs', md: 'sm' }}
          mb={{ base: 'sm', md: 'md' }}
          _after={{ // Recreating the gradient underline
            content: '""', position: 'absolute', bottom: 0, left: 0,
            h: '2px', w: '100%',
            bgGradient: 'linear(to-right, rgba(255, 255, 255, 0.7) 50%, transparent 100%)',
          }}
        >
          <Text as="span" display="block" mb="-0.5rem"
            fontFamily="signature" fontWeight="400" textTransform="none"
            fontSize={{ base: 'clamp(1.2rem, 4vw, 1.8rem)', md: 'clamp(2.2rem, 6vw, 3rem)' }}
          >
            {shortName}
          </Text>
          <Text as="span" display="block" opacity={0.9}
            fontFamily="heading" fontWeight="bold" textTransform="uppercase"
            fontSize={{ base: 'clamp(0.8rem, 2.5vw, 1rem)', md: 'clamp(1.2rem, 4vw, 1.5rem)' }}
            mt="xs"
          >
            Grand Prix
          </Text>
        </Heading>
        <Text
          fontFamily="heading" fontWeight="bold"
          fontSize={{ base: '1rem', md: '1.5rem' }}
        >
          Round {race.round}
        </Text>
        
        {/* Flag - no wrapper box; render directly */}
        <Box position="absolute" top={{ base: 'sm', md: 'lg' }} right={{ base: 'sm', md: 'lg' }}>
          {twoLetter ? (
            <ReactCountryFlag
              countryCode={twoLetter.toLowerCase()}
              svg
              style={{ width: '28px', height: '20px' }}
              title={(race as any)?.circuit?.country || (race as any)?.circuit?.country_code}
            />
          ) : null}
        </Box>
      </VStack>

      {/* Bottom section */}
      <HStack
        p={{ base: 'sm', md: 'lg' }}
        bg="bg-surface"
        borderTopWidth="1px"
        borderColor="border-primary"
        justify="space-between"
        align="center"
        minH={{ base: '32px', md: '40px' }}
        wrap="wrap"
      >
        <Text 
          fontSize={{ base: 'xs', md: 'sm' }} 
          color="text-muted" 
          fontWeight="500"
          flex="1"
          minW="0"
        >
          {formattedDate}
        </Text>
        <Text 
          fontSize={{ base: 'xs', md: 'sm' }} 
          color="text-secondary" 
          fontWeight="600" 
          textTransform="uppercase" 
          letterSpacing="0.5px"
          flexShrink={0}
          ml={2}
        >
          View Details
        </Text>
      </HStack>
    </Flex>
  );
};

export default RaceProfileCard;