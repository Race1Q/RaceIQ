import React from 'react';
import { Box, Flex, Text, HStack, Stat, StatLabel, StatNumber, Badge, useColorModeValue } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { teamColors } from '../../lib/teamColors';

interface ConstructorStandingCardProps {
  constructorId: number;
  position: number;
  constructorName: string;
  points: number;
  wins: number;
}

export const ConstructorStandingCard: React.FC<ConstructorStandingCardProps> = ({
  constructorId, position, constructorName, points, wins
}) => {
  const navigate = useNavigate();
  const teamColor = `#${teamColors[constructorName] || teamColors.Default}`;
  const subtleBorder = useColorModeValue('blackAlpha.200', 'whiteAlpha.200');
  const baseGradient = useColorModeValue(
    `linear(to-r, ${teamColor}26, ${teamColor}0D)`,
    `linear(to-r, ${teamColor}40, ${teamColor}14)`
  );
  const hoverGradient = useColorModeValue(
    `linear(to-r, ${teamColor}33, ${teamColor}12)`,
    `linear(to-r, ${teamColor}55, ${teamColor}20)`
  );

  return (
    <Flex
      role="button"
      aria-label={`Constructor ${constructorName} position ${position} with ${points} points`}
      onClick={() => navigate(`/constructors/${constructorId}`)}
      cursor="pointer"
      minW="600px"
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
      <Box position="absolute" left={0} top={0} bottom={0} w="6px" bg={teamColor} boxShadow={`0 0 0 1px ${teamColor}AA, 0 0 12px ${teamColor}80 inset`} />
      <Text fontWeight="bold" w="40px" textAlign="center" fontSize="lg">{position}</Text>
      <Flex direction="column" flex={1} minW={0}>
        <Text fontWeight={700} letterSpacing="wide" noOfLines={1}>{constructorName}</Text>
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
          >Team</Badge>
        </HStack>
      </Flex>
      <HStack spacing={6} pr={2}>
        <Stat textAlign="right" minW="70px">
          <StatLabel fontSize="xs" textTransform="uppercase" opacity={0.6}>Points</StatLabel>
          <StatNumber fontSize="lg" fontWeight="700">{points}</StatNumber>
        </Stat>
        <Stat textAlign="right" minW="60px">
          <StatLabel fontSize="xs" textTransform="uppercase" opacity={0.6}>Wins</StatLabel>
          <StatNumber fontSize="lg" fontWeight="600">{wins}</StatNumber>
        </Stat>
      </HStack>
    </Flex>
  );
};

export default ConstructorStandingCard;
