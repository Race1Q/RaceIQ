// frontend/src/components/TeamBanner/TeamBanner.tsx

import React from 'react';
import { Flex, Heading, useColorModeValue, Box } from '@chakra-ui/react';
import TeamLogo from '../TeamLogo/TeamLogo';

interface TeamBannerProps {
  teamName: string;
  teamColor: string;
}

const TeamBanner: React.FC<TeamBannerProps> = ({ teamName, teamColor }) => {
  // Theme-aware colors for the banner
  const textColor = useColorModeValue('black', 'white');
  const textShadow = useColorModeValue('0 2px 8px rgba(255,255,255,0.3)', '0 2px 8px rgba(0,0,0,0.5)');
  
  // Base background colors
  const baseBg = useColorModeValue('white', 'black');
  
  // Safely parse team color or use default
  const safeTeamColor = teamColor || 'E10600'; // Default F1 red
  const cleanColor = safeTeamColor.replace('#', '');
  
  // Parse RGB values safely
  const getRgbValues = () => {
    if (cleanColor.length >= 6) {
      return `${parseInt(cleanColor.slice(0, 2), 16)}, ${parseInt(cleanColor.slice(2, 4), 16)}, ${parseInt(cleanColor.slice(4, 6), 16)}`;
    }
    return '225, 6, 0'; // Default F1 red RGB
  };
  
  return (
    <Box position="relative" mb="md">
      <Flex
        align="center"
        justify="space-between"
        p={{ base: 4, md: 6 }}
        borderRadius="lg"
        minH={{ base: '100px', md: '120px' }}
        position="relative"
        overflow="hidden"
        border="1px solid"
        borderColor="border-primary"
        bg={baseBg}
        boxShadow="lg"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `linear-gradient(135deg, rgba(${getRgbValues()}, 0.15), transparent)`,
          borderRadius: 'inherit',
          zIndex: 1,
        }}
      >
      
      {/* Team Name - Left Side */}
      <Flex
        flex="1"
        minW={0}
        align="center"
        mr={{ base: 3, md: 4 }}
        zIndex={2}
        position="relative"
      >
        <Heading
          as="h2"
          fontFamily="heading"
          fontSize={{ base: 'lg', sm: 'xl', md: '2xl' }}
          color={textColor}
          fontWeight="bold"
          textTransform="uppercase"
          textShadow={textShadow}
          noOfLines={2}
          lineHeight="shorter"
        >
          {teamName}
        </Heading>
      </Flex>

      {/* Team Logo - Right Side */}
      <Flex
        align="center"
        justify="center"
        flexShrink={0}
        w={{ base: '80px', sm: '100px', md: '120px' }}
        h={{ base: '60px', sm: '70px', md: '80px' }}
        maxW="100%"
        zIndex={2}
        position="relative"
      >
        <TeamLogo teamName={teamName} />
      </Flex>
      </Flex>
    </Box>
  );
};

export default TeamBanner;