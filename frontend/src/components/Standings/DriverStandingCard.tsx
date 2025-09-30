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
    `linear(to-r, ${teamColor}26, ${teamColor}0D)`, // light mode
    `linear(to-r, ${teamColor}40, ${teamColor}14)`  // dark mode
  );
  const hoverGradient = useColorModeValue(
    `linear(to-r, ${teamColor}33, ${teamColor}12)`,
    `linear(to-r, ${teamColor}55, ${teamColor}20)`
  );

  return (
    <Flex
      role="button"
      aria-label={`Driver ${fullName} position ${position} with ${points} points`}
      onClick={() => navigate(`/drivers/${id}`)}
      cursor="pointer"
      minW="660px"
      px={4}
      py={3}
      align="center"
      gap={4}
      position="relative"
      bgGradient={baseGradient}
      _hover={{ bgGradient: hoverGradient, transform: 'translateY(-4px)', boxShadow: `0 6px 18px -4px ${teamColor}80, 0 2px 4px -1px rgba(0,0,0,0.4)` }}
      transition="all .25s ease"
      borderRadius="lg"
      border="1px solid"
      borderColor={subtleBorder}
      boxShadow={`0 2px 6px -2px rgba(0,0,0,0.45), 0 0 0 1px ${teamColor}22`}
      overflow="hidden"
    >
      {/* Accent Bar */}
      <Box position="absolute" left={0} top={0} bottom={0} w="6px" bg={teamColor} boxShadow={`0 0 0 1px ${teamColor}AA, 0 0 12px ${teamColor}80 inset`} />

      <Text fontWeight="bold" w="40px" textAlign="center" fontSize="lg">{position}</Text>
      <Avatar
        name={fullName}
        src={profileImageUrl || undefined}
        size="sm"
        borderWidth="2px"
        borderColor={teamColor}
        boxShadow={`0 0 0 1px ${teamColor}AA, 0 0 10px -2px ${teamColor}`}
        bg={`${teamColor}22`}
      />
      <Flex direction="column" flex={1} minW={0}>
        <Text fontWeight={700} noOfLines={1} letterSpacing="wide">{fullName}</Text>
        <HStack spacing={2} mt={1}>
          <Badge
            bg={teamColor}
            color="white"
            borderRadius="full"
            px={3}
            py={0.5}
            fontSize="0.65rem"
            fontWeight="500"
            textTransform="none"
            letterSpacing="wide"
            boxShadow={`0 0 0 1px ${teamColor}99, 0 0 6px ${teamColor}80`}
          >{constructor}</Badge>
        </HStack>
      </Flex>

      <HStack spacing={6} pr={2}>
        <Tooltip label="Championship Points" hasArrow>
          <Stat textAlign="right" minW="70px">
            <StatLabel fontSize="xs" textTransform="uppercase" opacity={0.6}>Points</StatLabel>
            <StatNumber fontSize="lg" fontWeight="700">{points}</StatNumber>
          </Stat>
        </Tooltip>
        <Tooltip label="Race Wins" hasArrow>
          <Stat textAlign="right" minW="60px">
            <StatLabel fontSize="xs" textTransform="uppercase" opacity={0.6}>Wins</StatLabel>
            <StatNumber fontSize="lg" fontWeight="600">{wins}</StatNumber>
          </Stat>
        </Tooltip>
        <Tooltip label="Podium Finishes" hasArrow>
          <Stat textAlign="right" minW="72px">
            <StatLabel fontSize="xs" textTransform="uppercase" opacity={0.6}>Podiums</StatLabel>
            <StatNumber fontSize="lg" fontWeight="600">{podiums}</StatNumber>
          </Stat>
        </Tooltip>
      </HStack>
    </Flex>
  );
};

export default DriverStandingCard;
