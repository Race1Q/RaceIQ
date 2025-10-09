// src/components/TeamCard.tsx
import {
  Box, Flex, Heading, Text, Image, HStack, Badge, Progress, usePrefersReducedMotion
} from "@chakra-ui/react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { TEAM_META } from "../../theme/teamTokens";
import React from "react";

type Props = {
  teamKey: keyof typeof TEAM_META;
  countryName: string;
  countryFlagEmoji?: string; // or use react-country-flag if installed in your project
  points?: number; 
  maxPoints?: number;
  wins?: number; 
  podiums?: number;
  carImage: string; // transparent webp/png
  onClick?: () => void;
};

export function TeamCard({
  teamKey, countryName, countryFlagEmoji, points = 0, maxPoints = 100, wins = 0, podiums = 0, carImage, onClick
}: Props) {
  const meta = TEAM_META[teamKey];
  const reduce = usePrefersReducedMotion();

  // Simple hover state
  const [isHovered, setIsHovered] = React.useState(false);

  const handleEnter = () => {
    setIsHovered(true);
  };

  const handleLeave = () => {
    setIsHovered(false);
  };

  return (
    <Box
      as={motion.div}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`${meta.name} constructor card`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      position="relative"
      overflow="hidden"
      rounded="2xl"
      px={{ base: 4, md: 6 }}
      py={{ base: 5, md: 6 }}
      bgGradient={meta.gradient}
      border="1px solid"
      borderColor={isHovered ? "whiteAlpha.300" : "whiteAlpha.150"}
      boxShadow={isHovered 
        ? `0 12px 40px rgba(0,0,0,0.6), 0 0 20px ${meta.hex}30` 
        : "0 8px 30px rgba(0,0,0,0.45)"
      }
      whileHover={reduce ? {} : { scale: 1.02 }}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
    >
      {/* subtle broadcast scanlines */}
      <Box
        pointerEvents="none"
        position="absolute"
        inset={0}
        bgImage="repeating-linear-gradient(to bottom, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 2px, transparent 4px)"
        opacity={0.25}
      />
      
      {/* Team logo watermark on the right */}
      {meta.logo && (
        <Image
          src={meta.logo}
          alt=""
          aria-hidden
          position="absolute"
          right="2"
          bottom="-2"
          opacity={0.2}
          boxSize={{ base: "160px", md: "200px" }}
          transform="rotate(-8deg)"
          filter="brightness(1.3) contrast(0.9)"
          objectFit="contain"
          onError={(e) => {
            // Hide if logo fails to load
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      )}
      
      {/* diagonal highlight sweep */}
      <Box
        as={motion.div}
        pointerEvents="none"
        position="absolute"
        top="-40%"
        left="-10%"
        w="60%"
        h="180%"
        bgGradient="linear(to-br, whiteAlpha.200, transparent)"
        filter="blur(14px)"
        initial={{ x: "-20%", opacity: 0 }}
        animate={isHovered ? { 
          x: "40%", 
          opacity: [0, 1, 0],
          transition: { duration: 0.8, ease: "easeOut" }
        } : { x: "-20%", opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" } as any}
      />
      
      <Flex gap={4} align="center">
        <Box flex="1" zIndex={1}>
          <HStack spacing={3} mb={1}>
            <Heading 
              size="md" 
              color={meta.textOn} 
              letterSpacing="0.4px"
              textShadow={isHovered ? `0 4px 12px rgba(0,0,0,0.8), 0 0 20px ${meta.hex}30` : "0 2px 8px rgba(0,0,0,0.9)"}
              transition="text-shadow 0.3s ease"
            >
              {meta.name}
            </Heading>
            <Badge 
              bg={`${meta.hex}20`} 
              color={meta.textOn} 
              border="1px solid" 
              borderColor={`${meta.hex}40`}
              textTransform="uppercase"
              fontSize="xs"
              fontWeight="bold"
            >
              {countryFlagEmoji ?? "🏳️"} {countryName}
            </Badge>
          </HStack>
          
          <HStack 
            spacing={4} 
            color={meta.textOn} 
            opacity={0.9} 
            fontSize="sm" 
            mt={2}
          >
            <Text>Wins: <b style={{ color: meta.hex }}>{wins}</b></Text>
            <Text>Podiums: <b style={{ color: meta.hex }}>{podiums}</b></Text>
            <Text>Pts: <b style={{ color: meta.hex }}>{points}</b></Text>
          </HStack>

          {/* mini leaderboard strip */}
          <Box mt={3}>
            <Progress
              value={(points / Math.max(1, maxPoints)) * 100}
              size="sm"
              rounded="full"
              sx={{
                ".chakra-progress__filled-track": {
                  background: `linear-gradient(90deg, ${meta.hex}, ${meta.hex}CC)`,
                  boxShadow: isHovered ? `0 0 12px ${meta.hex}60` : `0 0 8px ${meta.hex}40`,
                },
                bg: "whiteAlpha.200",
                border: `1px solid ${meta.hex}20`,
              }}
              aria-label={`${meta.name} points ${points} out of ${maxPoints}`}
            />
          </Box>
        </Box>

        {/* Team logo and car visual with parallax */}
        <Box flexShrink={0} position="relative" w={{ base: "42%", md: "34%" }} h="100px">
          {/* Car visual with parallax */}
          <Image
            src={carImage}
            alt={`${meta.name} car`}
            position="absolute"
            right="0"
            bottom="-6"
            maxH="120px"
            objectFit="contain"
            filter="drop-shadow(0 20px 18px rgba(0,0,0,0.45))"
            draggable={false}
          />
        </Box>
      </Flex>

      {/* stats reveal on hover */}
      <HStack
        as={motion.div}
        justify="space-between"
        spacing={6}
        position="absolute"
        left="4"
        right="4"
        bottom="3"
        color={meta.textOn}
        opacity={0.95}
        pointerEvents="none"
        initial={{ y: 16, opacity: 0 }}
        whileHover={reduce ? {} : { y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 20 } as any}
      >
        <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.2em" opacity={0.8}>
          Telemetry · Sector Pace · Pit Stops
        </Text>
        <Box h="1px" flex="1" bg={`${meta.hex}40`} mx="3" />
        <Text fontSize="xs" opacity={0.8} color={meta.hex} fontWeight="bold">
          View Team →
        </Text>
      </HStack>
    </Box>
  );
}