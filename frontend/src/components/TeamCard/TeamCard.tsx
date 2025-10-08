// frontend/src/components/TeamCard/TeamCard.tsx
import {
  Box, Flex, Heading, Text, Image, HStack, Badge, Progress, usePrefersReducedMotion
} from "@chakra-ui/react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { TEAM_META } from "../../theme/teamTokens";
import React from "react";

type Props = {
  teamKey: keyof typeof TEAM_META;
  countryName: string;
  points?: number;
  maxPoints?: number;
  wins?: number;
  podiums?: number;
  carImage: string;
  onClick?: () => void;
};

// Hardcoded team-to-flag mapping using simple symbols
const getTeamFlag = (teamKey: keyof typeof TEAM_META): string => {
  const teamFlags: Record<keyof typeof TEAM_META, string> = {
    red_bull: '🏎️',      // F1 car for Red Bull
    ferrari: '🏎️',        // F1 car for Ferrari
    mercedes: '🏎️',       // F1 car for Mercedes
    mclaren: '🏎️',        // F1 car for McLaren
    aston_martin: '🏎️',   // F1 car for Aston Martin
    alpine: '🏎️',         // F1 car for Alpine
    rb: '🏎️',             // F1 car for RB
    sauber: '🏎️',         // F1 car for Sauber
    williams: '🏎️',       // F1 car for Williams
    haas: '🏎️',           // F1 car for Haas
  };
  return teamFlags[teamKey] || '🏁';
};

export function TeamCard({
  teamKey, countryName, points = 0, maxPoints = 100, wins = 0, podiums = 0, carImage, onClick
}: Props) {
  const meta = TEAM_META[teamKey];
  const reduce = usePrefersReducedMotion();
  

  // cursor parallax for car - reduced intensity
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotX = useTransform(my, [-40, 40], [2, -2]);
  const rotY = useTransform(mx, [-120, 120], [-3, 3]);
  const carX = useTransform(mx, [-120, 120], [3, -3]);

  const handleMove = (e: React.MouseEvent) => {
    if (reduce) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    mx.set(e.clientX - rect.left - rect.width / 2);
    my.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <Box
      as={motion.div}
      onMouseMove={handleMove}
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
      borderColor="whiteAlpha.150"
      boxShadow="0 8px 30px rgba(0,0,0,0.45)"
      _hover={{ borderColor: "whiteAlpha.300" }}
      whileHover={reduce ? {} : { scale: 1.015 }}
      transition="border-color 0.2s ease"
      style={
        reduce
          ? undefined
          : ({
              perspective: 800,
              rotateX: rotX,
              rotateY: rotY,
            } as any)
      }
    >
      {/* subtle broadcast scanlines */}
      <Box
        pointerEvents="none"
        position="absolute"
        inset={0}
        bgImage="repeating-linear-gradient(to bottom, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 2px, transparent 4px)"
        opacity={0.25}
      />
      
      {/* team logo watermark */}
      {meta.logo && (
        <Image
          src={meta.logo}
          alt=""
          aria-hidden
          position="absolute"
          right={teamKey === 'alpine' ? "1" : teamKey === 'aston_martin' ? "0" : "2"}
          bottom={teamKey === 'alpine' ? "0" : teamKey === 'aston_martin' ? "-2" : "-1"}
          opacity={teamKey === 'alpine' ? 0.2 : teamKey === 'aston_martin' ? 0.18 : 0.15}
          boxSize={{ 
            base: teamKey === 'alpine' ? "160px" : teamKey === 'aston_martin' ? "150px" : "140px", 
            md: teamKey === 'alpine' ? "200px" : teamKey === 'aston_martin' ? "190px" : "180px" 
          }}
          transform={teamKey === 'alpine' ? "rotate(-4deg)" : teamKey === 'aston_martin' ? "rotate(-5deg)" : "rotate(-6deg)"}
          filter={teamKey === 'alpine' ? "brightness(1.4) contrast(0.9)" : teamKey === 'aston_martin' ? "brightness(1.3) contrast(0.85)" : "brightness(1.2) contrast(0.8)"}
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
        initial={{ x: "-20%" }}
        whileHover={reduce ? {} : { x: "40%" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      
      <Flex gap={4} align="center">
        <Box flex="1" zIndex={1}>
          <HStack spacing={3} mb={1} flexWrap="wrap">
            <Heading size="md" color={meta.textOn} letterSpacing="0.4px">
              {meta.name}
            </Heading>
          </HStack>
          
          <HStack spacing={4} color={meta.textOn} opacity={0.9} fontSize="sm" mt={2}>
            <Text>Wins: <b>{wins}</b></Text>
            <Text>Podiums: <b>{podiums}</b></Text>
            <Text>Pts: <b>{points}</b></Text>
          </HStack>

          {/* mini leaderboard strip */}
          <Box mt={3}>
            <Progress
              value={(points / Math.max(1, maxPoints)) * 100}
              size="sm"
              rounded="full"
              sx={{
                ".chakra-progress__filled-track": {
                  background: `linear-gradient(90deg, ${meta.hex}, #ffffff)`,
                },
                bg: "whiteAlpha.200",
              }}
              aria-label={`${meta.name} points ${points} out of ${maxPoints}`}
            />
          </Box>
        </Box>

        {/* car visual with parallax */}
        <Box flexShrink={0} position="relative" w={{ base: "42%", md: "34%" }} h="100px">
          <Image
            as={motion.img}
            src={carImage}
            alt={`${meta.name} car`}
            position="absolute"
            right="0"
            bottom="-6"
            style={reduce ? undefined : ({ x: carX } as any)}
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
        transition={{ type: "spring", stiffness: 220, damping: 20 }}
      >
        <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.2em" opacity={0.8}>
          Telemetry · Sector Pace · Pit Stops
        </Text>
        <Box h="1px" flex="1" bg="whiteAlpha.300" mx="3" />
        <Text fontSize="xs" opacity={0.8}>View Team →</Text>
      </HStack>
    </Box>
  );
}

