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
      p={{ base: 4, md: 6 }}
      borderRadius="lg"
      mb="md"
      minH={{ base: '100px', md: '120px' }}
      position="relative"
      overflow="hidden"
      border="1px solid"
      borderColor="border-primary"
      bgGradient={`linear(90deg, ${teamColor} 0%, rgba(0,0,0,0.5) 60%, bg-surface-dark 100%)`}
      boxShadow="lg"
    >
      {/* Team Name - Left Side */}
      <Flex
        flex="1"
        minW={0}
        align="center"
        mr={{ base: 3, md: 4 }}
      >
        <Heading
          as="h2"
          fontFamily="heading"
          fontSize={{ base: 'lg', sm: 'xl', md: '2xl' }}
          color="white"
          fontWeight="bold"
          textTransform="uppercase"
          textShadow="0 2px 8px rgba(0,0,0,0.5)"
          noOfLines={2}
          lineHeight="shorter"
          zIndex={2}
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
      >
        <TeamLogo teamName={teamName} />
      </Flex>
    </Flex>
  );
};

export default TeamBanner;