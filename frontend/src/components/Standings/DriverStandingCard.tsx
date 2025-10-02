import React from 'react';
import { Box, Flex, Avatar, Text, HStack, Badge, Tooltip, Stat, StatLabel, StatNumber, useColorModeValue } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { teamColors } from '../../lib/teamColors';

interface DriverStandingCardProps {
  id: number;
  position: number;
  fullName: string;
  constructor: string;
  points: number;
  wins: number;
  podiums: number;
  profileImageUrl?: string | null;
}

export const DriverStandingCard: React.FC<DriverStandingCardProps> = ({
  id, position, fullName, constructor, points, wins, podiums, profileImageUrl
}) => {
  const navigate = useNavigate();
  const teamColor = `#${teamColors[constructor] || teamColors.Default}`;
  const subtleBorder = useColorModeValue('blackAlpha.200', 'whiteAlpha.200');
  // Create soft gradient tints using hex with alpha (#RRGGBBAA)
  const baseGradient = useColorModeValue(
    `linear(to-r, ${teamColor}15, ${teamColor}08)`, // light mode - much more subtle
    `linear(to-r, ${teamColor}20, ${teamColor}0A)`  // dark mode - much more subtle
  );
  const hoverGradient = useColorModeValue(
    `linear(to-r, ${teamColor}20, ${teamColor}0F)`,
    `linear(to-r, ${teamColor}30, ${teamColor}15)`
  );

  return (
    <Flex
      role="button"
      aria-label={`Driver ${fullName} position ${position} with ${points} points`}
      onClick={() => navigate(`/drivers/${id}`)}
      cursor="pointer"
      minW={{ base: "100%", md: "660px" }}
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
      {/* Accent Bar */}
      <Box position="absolute" left={0} top={0} bottom={0} w="6px" bg={teamColor} boxShadow={`0 0 0 1px ${teamColor}AA, 0 0 12px ${teamColor}80 inset`} />

      <Text fontWeight="bold" w={{ base: "30px", md: "40px" }} textAlign="center" fontSize={{ base: "md", md: "lg" }}>{position}</Text>
      <Avatar
        name={fullName}
        src={profileImageUrl || undefined}
        size={{ base: "xs", md: "sm" }}
        borderWidth="2px"
        borderColor={teamColor}
        boxShadow={`0 0 0 1px ${teamColor}AA, 0 0 10px -2px ${teamColor}`}
        bg={`${teamColor}22`}
      />
      <Flex direction="column" flex={1} minW={0}>
        <Text fontWeight={700} noOfLines={1} letterSpacing="wide" fontSize={{ base: "sm", md: "md" }}>{fullName}</Text>
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
          >{constructor}</Badge>
        </HStack>
      </Flex>

      <HStack spacing={{ base: 3, md: 6 }} pr={2} flexWrap={{ base: "wrap", md: "nowrap" }}>
        <Tooltip label="Championship Points" hasArrow>
          <Stat textAlign="right" minW={{ base: "50px", md: "70px" }}>
            <StatLabel fontSize={{ base: "0.6rem", md: "xs" }} textTransform="uppercase" opacity={0.6}>Points</StatLabel>
            <StatNumber fontSize={{ base: "md", md: "lg" }} fontWeight="700">{points}</StatNumber>
          </Stat>
        </Tooltip>
        <Tooltip label="Race Wins" hasArrow>
          <Stat textAlign="right" minW={{ base: "45px", md: "60px" }}>
            <StatLabel fontSize={{ base: "0.6rem", md: "xs" }} textTransform="uppercase" opacity={0.6}>Wins</StatLabel>
            <StatNumber fontSize={{ base: "md", md: "lg" }} fontWeight="600">{wins}</StatNumber>
          </Stat>
        </Tooltip>
        <Tooltip label="Podium Finishes" hasArrow>
          <Stat textAlign="right" minW={{ base: "55px", md: "72px" }}>
            <StatLabel fontSize={{ base: "0.6rem", md: "xs" }} textTransform="uppercase" opacity={0.6}>Podiums</StatLabel>
            <StatNumber fontSize={{ base: "md", md: "lg" }} fontWeight="600">{podiums}</StatNumber>
          </Stat>
        </Tooltip>
      </HStack>
    </Flex>
  );
};

export default DriverStandingCard;
