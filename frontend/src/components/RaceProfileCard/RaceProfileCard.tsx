// frontend/src/components/RaceProfileCard/RaceProfileCard.tsx

import React, { useState, useRef } from 'react';
import { Box, VStack, HStack, Heading, Text, Flex } from '@chakra-ui/react';
import ReactCountryFlag from 'react-country-flag';
import { countryCodeMap } from '../../lib/countryCodeUtils';
import { getCircuitImage } from '../../lib/circuitImages';
import type { Race } from '../../types/races';

interface RaceProfileCardProps {
  race: Race;
}

const RaceProfileCard: React.FC<RaceProfileCardProps> = ({ race }) => {
  // Simple gradient based on round number
  const gradientStart = `hsl(${(race.round * 20) % 360}, 70%, 50%)`;
  const gradientEnd = `hsl(${(race.round * 20 + 40) % 360}, 70%, 30%)`;

  // Get circuit image if available
  const circuitImage = getCircuitImage(race.circuit_id);
  const twoLetter = countryCodeMap[(race as any)?.circuit?.country_code?.toUpperCase?.() ?? ''] ?? '';
  const shortName = race.name.replace(/Grand Prix|GP/g, '').trim();

  const formattedDate = new Date(race.date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  // Simple hover state
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  return (
    <Box
      ref={cardRef}
      height="100%"
      borderRadius="24px" // Match driver cards
      overflow="visible"
      boxShadow="lg"
      border="1px solid"
      borderColor="border-primary"
      transition="transform 0.3s ease, box-shadow 0.3s ease"
      _hover={{
        transform: 'translateY(-5px)',
        boxShadow: 'xl',
      }}
      role="group"
      position="relative"
      cursor="pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <VStack spacing={0} height="100%" align="stretch">
        <Box
          position="relative"
          flexGrow={1}
          p={{ base: 'sm', md: 'lg' }}
          bgImage={circuitImage ? circuitImage : undefined}
          bgGradient={!circuitImage ? `linear(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)` : undefined}
          bgSize="cover"
          bgPosition="center"
          minH={{ base: '200px', md: '300px' }}
          overflow="hidden"
          borderTopRadius="24px"
          _before={circuitImage ? {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bg: 'blackAlpha.500',
            zIndex: 0,
          } : undefined}
        >

          {/* Race Text Info */}
          <VStack
            align="flex-start"
            spacing={0}
            zIndex={3}
            position="relative"
            w="65%"
            color="white"
            textShadow="0 1px 4px rgba(0, 0, 0, 0.5)"
          >
            <Heading
              as="h2"
              fontFamily="signature"
              fontSize={{ base: '2xl', md: '4xl' }}
              fontWeight="normal"
              lineHeight="1"
              textTransform="none"
              mb="-0.2em"
            >
              {shortName}
            </Heading>
            <Heading
              as="span"
              fontFamily="heading"
              fontSize={{ base: 'xl', md: '3xl' }}
              fontWeight="bold"
              lineHeight="1.1"
              textTransform="uppercase"
            >
              Grand Prix
            </Heading>
            <Text
              fontFamily="heading"
              fontSize={{ base: 'xl', md: '3xl' }}
              fontWeight="bold"
              pt="sm"
            >
              Round {race.round}
            </Text>
          </VStack>

          {/* Race Date */}
          <Text
            position="absolute"
            right={{ base: 'sm', md: 'lg' }}
            top={{ base: 'sm', md: 'lg' }}
            zIndex={3}
            fontFamily="body"
            fontSize={{ base: 'sm', md: 'md' }}
            color="white"
            textShadow="0 1px 4px rgba(0, 0, 0, 0.5)"
          >
            {formattedDate}
          </Text>

          {/* Flag */}
          <Flex
            position="absolute"
            left={{ base: 'sm', md: 'lg' }}
            bottom={{ base: 'sm', md: 'lg' }}
            zIndex={3}
            align="center"
          >
            <Box
              boxShadow="lg"
              border="1px solid rgba(255, 255, 255, 0.15)"
              lineHeight="0"
            >
              {twoLetter && twoLetter.length === 2 ? (
                <ReactCountryFlag
                  countryCode={twoLetter.toLowerCase()}
                  svg
                  style={{ width: '32px', height: '24px' }}
                  title={(race as any)?.circuit?.country || (race as any)?.circuit?.country_code}
                />
              ) : null}
            </Box>
          </Flex>
        </Box>

        <Box
          bg={isHovered ? 'bg-elevated' : 'bg-surface'}
          textAlign="center"
          p={{ base: 'sm', md: 'md' }}
          fontFamily="heading"
          color={isHovered ? 'text-primary' : 'text-muted'}
          fontSize={{ base: 'xs', md: 'sm' }}
          transition="all 0.3s ease"
          borderTop="1px solid"
          borderColor="border-primary"
          borderBottomRadius="24px"
        >
          <Text>View Details</Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default RaceProfileCard;