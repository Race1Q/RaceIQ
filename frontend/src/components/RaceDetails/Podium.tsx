// frontend/src/components/RaceDetails/Podium.tsx
import React from 'react';
import { Box, Flex, Heading, Text, VStack, useColorModeValue, Image } from '@chakra-ui/react';
import { driverHeadshots } from '../../lib/driverHeadshots';
import userIcon from '../../assets/UserIcon.png';

// Define the shape of the podium data prop
interface PodiumDriver {
  position: number;
  driver_name?: string;
  driver_code?: string;
  driver_id: string | number;
  team_name?: string;
  constructor_name?: string;
  driver_picture?: string | null;
}

interface PodiumProps {
  podiumData: PodiumDriver[];
}

// A sub-component for each step
const PodiumStep = ({ driver, height }: { driver: PodiumDriver; height: string }) => {
  const driverName = driver.driver_name || driver.driver_code || String(driver.driver_id);
  const teamName = driver.team_name || driver.constructor_name || 'Unknown Team';
  const headshot = driverHeadshots[driverName] || driver.driver_picture || userIcon;
  
  const metallicGradient = useColorModeValue('linear(to-b, gray.200, gray.400)', 'linear(to-b, gray.700, gray.800)');
  const highlightColor = useColorModeValue('gray.300', 'gray.600');

  // The main VStack no longer needs padding-top
  return (
    <VStack spacing={0} w={{ base: '30%', md: '25%' }}>
      <Image
        src={headshot}
        alt={driverName}
        h="140px"
        objectFit="contain"
        zIndex={3}
        filter="drop-shadow(0 5px 10px rgba(0,0,0,0.5))"
        // THIS IS THE KEY CHANGE: A negative margin pulls the podium step up
        mb="-7.5px" 
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = userIcon; }}
      />
      <Box position="relative" w="100%" pt={2}>
        <Box
          h={height}
          bgGradient={metallicGradient}
          borderRadius="md"
          borderTop="2px solid"
          borderTopColor={highlightColor}
          boxShadow="md"
          display="flex"
          alignItems="center"
          justifyContent="center"
          position="relative"
        >
          <Text
            fontFamily="heading"
            fontSize={{ base: '5xl', md: '7xl' }}
            fontWeight="black"
            color={useColorModeValue('blackAlpha.200', 'whiteAlpha.100')}
          >
            {driver.position}
          </Text>
        </Box>
        <VStack spacing={0} mt={2} textAlign="center">
          <Heading size={{ base: 'xs', md: 'sm' }}>{driverName}</Heading>
          <Text fontSize="xs" color="text-muted">{teamName}</Text>
        </VStack>
      </Box>
    </VStack>
  );
};

const Podium: React.FC<PodiumProps> = ({ podiumData }) => {
  if (!podiumData || podiumData.length < 3) {
    return <Text>Podium data not available.</Text>;
  }

  const p1 = podiumData.find(d => d.position === 1);
  const p2 = podiumData.find(d => d.position === 2);
  const p3 = podiumData.find(d => d.position === 3);

  if (!p1 || !p2 || !p3) return null;

  return (
    <Box position="relative" w="100%">
      <Flex align="flex-end" justify="center" gap={{ base: 2, md: 4 }} pb={4} w="100%">
        <PodiumStep driver={p2} height="140px" />
        <PodiumStep driver={p1} height="180px" />
        <PodiumStep driver={p3} height="110px" />
      </Flex>
    </Box>
  );
};

export default Podium;
