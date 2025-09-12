// frontend/src/components/RaceHeader/RaceHeader.tsx

import React from 'react';
import { Box, Heading, Text, HStack, VStack, Divider, Image } from '@chakra-ui/react';
import { Calendar } from 'lucide-react';
import type { Race } from '../../data/types';
import { getCountryFlagUrl } from '../../lib/assets';

interface RaceHeaderProps {
  race: Race;
}

const RaceHeader: React.FC<RaceHeaderProps> = ({ race }) => {
  return (
    <VStack spacing="md" align="flex-start" w="100%" mb="lg">
      <VStack spacing="sm" align="flex-start">
        <Heading as="h1" fontFamily="heading" fontSize={{ base: '4xl', md: '6xl' }} color="text-primary">
          {race.trackName}
        </Heading>
        <HStack spacing="md">
          <HStack spacing="sm" align="center">
            <Image 
              src={getCountryFlagUrl(race.countryCode)} 
              alt={`${race.country} flag`}
              boxSize="32px"
              borderRadius="sm"
            />
            <Text fontSize="xl" color="text-secondary">{race.country}</Text>
          </HStack>
          <HStack spacing="sm" align="center">
            <Box as={Calendar} size="24px" color="text-secondary" />
            <Text fontSize="xl" color="text-secondary">
              {new Date(race.date).toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })}
            </Text>
          </HStack>
        </HStack>
      </VStack>
      <Divider borderColor="border-primary" />
    </VStack>
  );
};

export default RaceHeader;
