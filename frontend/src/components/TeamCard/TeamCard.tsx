// src/components/TeamCard.tsx
import {
  Box, Flex, Heading, Text, Image, HStack, Badge, Progress, usePrefersReducedMotion
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { TEAM_META, COUNTRY_COLORS } from "../../theme/teamTokens";
import React, { useRef, useState } from "react";

type Props = {
  teamKey: keyof typeof TEAM_META;
  teamName?: string; // Optional override for historical teams
  countryName: string;
  countryFlagEmoji?: string; // or use react-country-flag if installed in your project
  points?: number; 
  maxPoints?: number;
  wins?: number; 
  podiums?: number;
  carImage: string; // transparent webp/png
  onClick?: () => void;
  isHistorical?: boolean; // Flag to indicate if showing career stats
};

export function TeamCard({
  teamKey, teamName, countryName, countryFlagEmoji, points = 0, maxPoints = 100, wins = 0, podiums = 0, carImage, onClick, isHistorical: isHistoricalProp
}: Props) {
  const meta = TEAM_META[teamKey];
  const displayName = teamName || meta.name; // Use override name if provided
  
  // Use country colors for historical teams
  const isHistorical = isHistoricalProp ?? teamKey === 'historical';
  const countryTheme = isHistorical ? (COUNTRY_COLORS[countryName] || COUNTRY_COLORS['default']) : null;
  const colors = countryTheme || meta;
  
  const reduce = usePrefersReducedMotion();

  // 3D Hover Effect State (matching DriverProfileCard)
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const tiltX = (mousePosition.y - 0.5) * -15; // -7.5 to +7.5 degrees
  const tiltY = (mousePosition.x - 0.5) * 15;  // -7.5 to +7.5 degrees

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePosition({ x, y });
  };

  const handleEnter = () => {
    setIsHovered(true);
  };

  const handleLeave = () => {
    setIsHovered(false);
    setMousePosition({ x: 0.5, y: 0.5 });
  };

  return (
    <Box
      ref={cardRef}
      as={motion.div}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`${displayName} constructor card`}
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
      bgGradient={colors.gradient}
      border="1px solid"
      borderColor={isHovered ? "whiteAlpha.300" : "whiteAlpha.150"}
      boxShadow={isHovered 
        ? `0 12px 40px rgba(0,0,0,0.6), 0 0 20px ${colors.hex}30` 
        : "0 8px 30px rgba(0,0,0,0.45)"
      }
      transform={`perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`}
      _hover={{
        transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-5px)`,
        boxShadow: `0 20px 50px rgba(0,0,0,0.7), 0 0 30px ${colors.hex}40`,
      }}
      transition="transform 0.3s ease, box-shadow 0.3s ease"
      sx={{
        willChange: isHovered ? 'transform, box-shadow' : 'auto',
        contentVisibility: 'auto',
      }}
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
          right={isHistorical ? "-10" : "2"}
          bottom={isHistorical ? "-45" : "-2"}
          opacity={0.2}
          boxSize={isHistorical ? { base: "200px", md: "280px" } : { base: "160px", md: "200px" }}
          transform="rotate(-8deg)"
          filter="brightness(1.3) contrast(0.9)"
          style={{
            mixBlendMode: 'multiply',
          }}
          objectFit="contain"
          loading="lazy"
          decoding="async"
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
              color={colors.textOn} 
              letterSpacing="0.4px"
              textShadow={isHovered ? `0 4px 12px rgba(0,0,0,0.8), 0 0 20px ${colors.hex}30` : "0 2px 8px rgba(0,0,0,0.9)"}
              transition="text-shadow 0.3s ease"
            >
              {displayName}
            </Heading>
            <Badge 
              bg={`${colors.hex}20`} 
              color={colors.textOn} 
              border="1px solid" 
              borderColor={`${colors.hex}40`}
              textTransform="uppercase"
              fontSize="xs"
              fontWeight="bold"
            >
              {countryFlagEmoji ?? "🏳️"} {countryName}
            </Badge>
          </HStack>
          
          <HStack 
            spacing={4} 
            color={colors.textOn} 
            opacity={0.9} 
            fontSize="sm" 
            mt={2}
          >
            <Text>{isHistorical ? 'Career Wins' : 'Wins'}: <b style={{ color: colors.hex }}>{wins}</b></Text>
            <Text>{isHistorical ? 'Career Podiums' : 'Podiums'}: <b style={{ color: colors.hex }}>{podiums}</b></Text>
            <Text>{isHistorical ? 'Career Pts' : 'Pts'}: <b style={{ color: colors.hex }}>{points}</b></Text>
          </HStack>

          {/* mini leaderboard strip */}
          <Box mt={3}>
            <Progress
              value={(points / Math.max(1, maxPoints)) * 100}
              size="sm"
              rounded="full"
              sx={{
                ".chakra-progress__filled-track": {
                  background: `linear-gradient(90deg, ${colors.hex}, ${colors.hex}CC)`,
                  boxShadow: isHovered ? `0 0 12px ${colors.hex}60` : `0 0 8px ${colors.hex}40`,
                },
                bg: "whiteAlpha.200",
                border: `1px solid ${colors.hex}20`,
              }}
              aria-label={`${displayName} points ${points} out of ${maxPoints}`}
            />
          </Box>
        </Box>

        {/* Team logo and car visual with parallax */}
        <Box flexShrink={0} position="relative" w={{ base: "42%", md: "34%" }} h="100px">
          {/* Car visual with parallax */}
          <Image
            src={carImage}
            alt={`${displayName} car`}
            position="absolute"
            right="0"
            bottom="-6"
            maxH="120px"
            width="auto"
            height="120px"
            objectFit="contain"
            filter="drop-shadow(0 20px 18px rgba(0,0,0,0.45))"
            draggable={false}
            loading="eager"
            fetchPriority="high"
            decoding="async"
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
        color={colors.textOn}
        opacity={0.95}
        pointerEvents="none"
        initial={{ y: 16, opacity: 0 }}
        whileHover={reduce ? {} : { y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 20 } as any}
      >
        <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.2em" opacity={0.8}>
          Telemetry · Sector Pace · Pit Stops
        </Text>
        <Box h="1px" flex="1" bg={`${colors.hex}40`} mx="3" />
        <Text fontSize="xs" opacity={0.8} color={colors.hex} fontWeight="bold">
          View Team →
        </Text>
      </HStack>
    </Box>
  );
}