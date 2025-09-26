// frontend/src/components/TeamBanner/TeamBanner.tsx

import React from 'react';
import { Flex, Heading, Spacer } from '@chakra-ui/react';
import TeamLogo from '../TeamLogo/TeamLogo';

interface TeamBannerProps {
  teamName: string;
  teamColor: string;
}

const TeamBanner: React.FC<TeamBannerProps> = ({ teamName, teamColor }) => {

  return (
    <Flex
      align="center"
      justify="space-between"
      p={{ base: 'md', md: 'lg' }}
      borderRadius="lg"
      mb="md"
      h="120px"
      position="relative"
      overflow="hidden"
      border="1px solid"
      borderColor="border-primary"
      bgGradient={`linear(90deg, ${teamColor} 0%, rgba(0,0,0,0.5) 60%, bg-surface-dark 100%)`}
      boxShadow="lg" // Add shadow for polish
    >
      <Heading
        as="h2"
        fontFamily="heading"
        fontSize={{ base: 'xl', md: '2xl' }}
        color="white" // Explicitly white text for better contrast on gradient
        fontWeight="bold"
        textTransform="uppercase"
        textShadow="0 2px 8px rgba(0,0,0,0.5)"
        ml="md"
        zIndex={2} // Ensure text is above image
      >
        {teamName}
      </Heading>

      <Spacer />
      
      <TeamLogo teamName={teamName} />
    </Flex>
  );
};

export default TeamBanner;