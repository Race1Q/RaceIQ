// frontend/src/components/RaceDetails/Podium.tsx
import React from 'react';
import { Box, Flex, Heading, Text, VStack, Image } from '@chakra-ui/react';
import { getDriverHeadshot } from '../../lib/driverHeadshotUtils';

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
  const headshot = getDriverHeadshot(driver.driver_picture, driverName);
  
  // Get podium gradient and effects based on position
  const getPodiumEffects = (position: number) => {
    switch (position) {
      case 1: return {
        gradient: 'linear(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
        glow: '0 0 20px #FFD700, 0 0 40px #FFA500, 0 0 60px #FFD700',
        shadow: '0 8px 32px rgba(255, 215, 0, 0.4)',
        border: '2px solid #FFD700'
      };
      case 2: return {
        gradient: 'linear(135deg, #E8E8E8 0%, #C0C0C0 50%, #A8A8A8 100%)',
        glow: '0 0 20px #C0C0C0, 0 0 40px #A8A8A8',
        shadow: '0 8px 32px rgba(192, 192, 192, 0.4)',
        border: '2px solid #C0C0C0'
      };
      case 3: return {
        gradient: 'linear(135deg, #CD7F32 0%, #B8860B 50%, #8B4513 100%)',
        glow: '0 0 20px #CD7F32, 0 0 40px #B8860B',
        shadow: '0 8px 32px rgba(205, 127, 50, 0.4)',
        border: '2px solid #CD7F32'
      };
      default: return {
        gradient: 'linear(135deg, #8B5CF6 0%, #7C3AED 100%)',
        glow: '0 0 20px #8B5CF6',
        shadow: '0 8px 32px rgba(139, 92, 246, 0.4)',
        border: '2px solid #8B5CF6'
      };
    }
  };
  
  const effects = getPodiumEffects(driver.position);

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
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = getDriverHeadshot(null, null); }}
      />
      <Box position="relative" w="100%" pt={2}>
        <Box
          h={height}
          bgGradient={effects.gradient}
          borderRadius="md"
          boxShadow={effects.shadow}
          display="flex"
          alignItems="center"
          justifyContent="center"
          position="relative"
          border={effects.border}
          _before={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 'inherit',
            background: effects.gradient,
            filter: 'blur(8px)',
            opacity: 0.6,
            zIndex: -1,
          }}
          _after={{
            content: '""',
            position: 'absolute',
            top: '2px',
            left: '2px',
            right: '2px',
            bottom: '2px',
            borderRadius: 'inherit',
            background: 'rgba(255, 255, 255, 0.1)',
            zIndex: 1,
          }}
          transition="all 0.3s ease"
        >
          <Text
            fontFamily="heading"
            fontSize={{ base: '5xl', md: '7xl' }}
            fontWeight="black"
            color="white"
            textShadow="2px 2px 8px rgba(0,0,0,0.8), 0 0 20px rgba(255,255,255,0.3)"
            filter="drop-shadow(0 0 10px rgba(255,255,255,0.5))"
            zIndex={2}
            position="relative"
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
