import React from 'react';
import { Box, Flex, Text, HStack, Stat, StatLabel, StatNumber, Badge, useColorModeValue, Image } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { teamColors } from '../../lib/teamColors';
import { teamCarImages } from '../../lib/teamCars';
import { COUNTRY_COLORS } from '../../theme/teamTokens';
import TeamLogo from '../TeamLogo/TeamLogo';

interface ConstructorStandingCardProps {
  constructorId: number;
  position: number;
  constructorName: string;
  nationality: string;
  points: number;
  wins: number;
  podiums: number;
}

export const ConstructorStandingCard: React.FC<ConstructorStandingCardProps> = ({
  constructorId, position, constructorName, nationality, points, wins, podiums
}) => {
  const navigate = useNavigate();
  
  // Prioritize defined team colors, fall back to country colors if no team color exists
  const hasTeamColor = !!teamColors[constructorName];
  const teamColor = hasTeamColor
    ? `#${teamColors[constructorName]}`
    : `#${COUNTRY_COLORS[nationality]?.hex || COUNTRY_COLORS['default'].hex}`;
  
  const subtleBorder = useColorModeValue('blackAlpha.200', 'whiteAlpha.200');
  const baseGradient = useColorModeValue(
    `linear(to-r, ${teamColor}15, ${teamColor}08)`, // much more subtle
    `linear(to-r, ${teamColor}20, ${teamColor}0A)`  // much more subtle
  );
  const hoverGradient = useColorModeValue(
    `linear(to-r, ${teamColor}20, ${teamColor}0F)`,
    `linear(to-r, ${teamColor}30, ${teamColor}15)`
  );

  return (
    <Flex
      role="button"
      aria-label={`Constructor ${constructorName} position ${position} with ${points} points`}
      onClick={() => navigate(`/constructors/${constructorId}`)}
      cursor="pointer"
      minW={{ base: "100%", md: "600px" }}
      w="full"
      px={{ base: 3, md: 4 }}
      py={{ base: 2, md: 3 }}
      align="center"
      gap={{ base: 2, md: 4 }}
      position="relative"
      bgGradient={baseGradient}
      _hover={{ 
        bgGradient: hoverGradient, 
        transform: 'translateY(-4px)', 
        boxShadow: position === 1 
          ? `0 0 20px ${teamColor}80, 0 0 40px ${teamColor}40, 0 0 60px ${teamColor}20, 0 6px 18px -4px ${teamColor}80, 0 2px 4px -1px rgba(0,0,0,0.4)`
          : `0 6px 18px -4px ${teamColor}80, 0 2px 4px -1px rgba(0,0,0,0.4)`
      }}
      transition="all .25s ease"
      borderRadius="lg"
      border="1px solid"
      borderColor={position === 1 ? teamColor : subtleBorder}
      boxShadow={position === 1 
        ? `0 0 20px ${teamColor}80, 0 0 40px ${teamColor}40, 0 0 60px ${teamColor}20, 0 2px 6px -2px rgba(0,0,0,0.45), 0 0 0 1px ${teamColor}22`
        : `0 2px 6px -2px rgba(0,0,0,0.45), 0 0 0 1px ${teamColor}22`
      }
      overflow="hidden"
      flexWrap={{ base: "wrap", md: "nowrap" }}
      _before={position === 1 ? {
        content: '""',
        position: 'absolute',
        top: '-2px',
        left: '-2px',
        right: '-2px',
        bottom: '-2px',
        background: `linear-gradient(45deg, ${teamColor}, ${teamColor}80, ${teamColor})`,
        borderRadius: 'lg',
        zIndex: -1,
        animation: 'glow 2s ease-in-out infinite alternate'
      } : undefined}
      sx={position === 1 ? {
        '@keyframes glow': {
          '0%': {
            boxShadow: `0 0 20px ${teamColor}80, 0 0 40px ${teamColor}40, 0 0 60px ${teamColor}20, 0 2px 6px -2px rgba(0,0,0,0.45), 0 0 0 1px ${teamColor}22`
          },
          '100%': {
            boxShadow: `0 0 30px ${teamColor}, 0 0 60px ${teamColor}60, 0 0 90px ${teamColor}40, 0 2px 6px -2px rgba(0,0,0,0.45), 0 0 0 1px ${teamColor}22`
          }
        }
      } : undefined}
    >
      <Box position="absolute" left={0} top={0} bottom={0} w="6px" bg={teamColor} boxShadow={`0 0 0 1px ${teamColor}AA, 0 0 12px ${teamColor}80 inset`} />
      <Text fontWeight="bold" w={{ base: "30px", md: "40px" }} textAlign="center" fontSize={{ base: "md", md: "lg" }}>{position}</Text>
      
      {/* Team Logo - Fixed consistent size */}
      <Box 
        w={{ base: "100px", md: "110px" }} 
        h={{ base: "80px", md: "90px" }} 
        display="flex" 
        alignItems="center" 
        justifyContent="flex-start"
        flexShrink={0}
        p={3}
        pl={constructorName === "Williams" || constructorName === "Williams Racing" ? 1 : 3}
        pr={constructorName === "Williams" || constructorName === "Williams Racing" ? 6 : 3}
      >
        <TeamLogo teamName={constructorName} />
      </Box>
      
      <Flex direction="column" flex={1} minW={0} mr={4} ml={6}>
        <Text fontWeight={700} letterSpacing="wide" noOfLines={1} fontSize={{ base: "sm", md: "md" }} mb={1}>{constructorName}</Text>
        <HStack spacing={2} mt={1}>
          <Badge
            bg={teamColor}
            color="white"
            borderRadius="full"
            px={{ base: 2, md: 3 }}
            py={0.5}
            fontSize={{ base: "0.6rem", md: "0.65rem" }}
            fontWeight="500"
            textTransform="none"
            letterSpacing="wide"
            boxShadow={`0 0 0 1px ${teamColor}99, 0 0 6px ${teamColor}80`}
          >Team</Badge>
        </HStack>
      </Flex>
      
      {/* Car Image - Uses remaining space on the right */}
      <Box 
        flex={1} 
        maxW={{ base: "120px", md: "150px" }}
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        flexShrink={0}
      >
        <Image
          src={teamCarImages[constructorName] || '/assets/logos/F1Car.png'}
          alt={`${constructorName} car`}
          maxH={{ base: '60px', md: '80px' }}
          maxW="100%"
          w="auto"
          h="auto"
          objectFit="contain"
          borderRadius="md"
        />
      </Box>
      <HStack spacing={{ base: 2, md: 4 }} pr={2} flexWrap={{ base: "wrap", md: "nowrap" }}>
        <Stat textAlign="right" minW={{ base: "45px", md: "60px" }}>
          <StatLabel fontSize={{ base: "0.5rem", md: "xs" }} textTransform="uppercase" opacity={0.6}>Points</StatLabel>
          <StatNumber fontSize={{ base: "sm", md: "lg" }} fontWeight="700">{points}</StatNumber>
        </Stat>
        <Stat textAlign="right" minW={{ base: "40px", md: "50px" }}>
          <StatLabel fontSize={{ base: "0.5rem", md: "xs" }} textTransform="uppercase" opacity={0.6}>Wins</StatLabel>
          <StatNumber fontSize={{ base: "sm", md: "lg" }} fontWeight="600">{wins}</StatNumber>
        </Stat>
        <Stat textAlign="right" minW={{ base: "45px", md: "55px" }}>
          <StatLabel fontSize={{ base: "0.5rem", md: "xs" }} textTransform="uppercase" opacity={0.6}>Podiums</StatLabel>
          <StatNumber fontSize={{ base: "sm", md: "lg" }} fontWeight="600">{podiums}</StatNumber>
        </Stat>
      </HStack>
    </Flex>
  );
};

export default ConstructorStandingCard;
