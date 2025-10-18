// frontend/src/components/RaceProfileCard/RaceProfileCard.tsx

import React, { useState } from 'react';
import { Box, VStack, HStack, Heading, Text, Flex } from '@chakra-ui/react';
import ReactCountryFlag from 'react-country-flag';
import { useInView } from 'react-intersection-observer';
import { countryCodeMap } from '../../lib/countryCodeUtils';
import { getCircuitImage } from '../../lib/circuitImages';
import type { Race } from '../../types/races';

interface RaceProfileCardProps {
  race: Race;
}

const RaceProfileCard: React.FC<RaceProfileCardProps> = ({ race }) => {
  // Simple gradient based on round number
  const gradientStart = `hsl(${(race.round * 20) % 360}, 70%, 50%)`;
  const gradientEnd = `hsl(${(race.round * 20 + 40) % 360}, 70%, 30%)`;

  // Intersection Observer - only load background image when card is near viewport
  const { ref: imageLoadRef, inView } = useInView({
    triggerOnce: true,
    rootMargin: '400px', // Start loading 400px before visible
  });

  // Get circuit image if available - but only use it if card is in view
  const circuitImage = inView ? getCircuitImage(race.circuit_id) : null;

  const twoLetter = countryCodeMap[(race as any)?.circuit?.country_code?.toUpperCase?.() ?? ''] ?? '';
  const flagAccentMap: Record<string, string> = {
    // Europe
    GB: 'rgba(12, 36, 125, 0.45)', // UK blue
    FR: 'rgba(0, 85, 164, 0.45)',  // France blue
    IT: 'rgba(0, 146, 70, 0.45)',  // Italy green
    ES: 'rgba(255, 204, 0, 0.45)', // Spain yellow
    DE: 'rgba(255, 206, 0, 0.45)', // Germany yellow
    NL: 'rgba(192, 116, 16, 0.45)', // Netherlands blue
    BE: 'rgba(253, 218, 36, 0.45)',// Belgium yellow
    AT: 'rgba(237, 41, 57, 0.45)', // Austria red
    MC: 'rgba(234, 40, 57, 0.45)', // Monaco red
    DK: 'rgba(198, 12, 48, 0.45)', // Denmark red
    FI: 'rgba(0, 53, 128, 0.45)',  // Finland blue
    PT: 'rgba(0, 102, 0, 0.45)',   // Portugal green
    GR: 'rgba(13, 94, 175, 0.45)', // Greece blue
    HU: 'rgba(0, 166, 81, 0.45)',  // Hungary green

    // Americas
    US: 'rgba(10, 49, 97, 0.45)',  // USA blue
    CA: 'rgba(255, 0, 0, 0.45)',   // Canada red
    BR: 'rgba(199, 202, 31, 0.37)',  // Brazil green
    MX: 'rgba(0, 104, 71, 0.45)',  // Mexico green

    // Middle East / Asia-Pacific
    AE: 'rgba(1, 167, 167, 0.45)',  // UAE green
    QA: 'rgba(128, 0, 64, 0.45)',  // Qatar maroon
    SA: 'rgba(0, 106, 78, 0.45)',  // Saudi green
    BH: 'rgba(187, 0, 0, 0.45)',   // Bahrain red
    SG: 'rgba(237, 41, 57, 0.45)', // Singapore red
    AZ: 'rgba(0, 163, 224, 0.45)', // Azerbaijan blue
    JP: 'rgba(188, 0, 45, 0.45)',  // Japan red
    AU: 'rgba(0, 39, 104, 0.45)',  // Australia blue
  };
  const glossAccent = flagAccentMap[(twoLetter || '').toUpperCase()] || 'rgba(255, 255, 255, 0.4)';

  const shortName = race.name.replace(/Grand Prix|GP/g, '').trim();

  const formattedDate = new Date(race.date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  // 3D Hover Effect State
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [isHovered, setIsHovered] = useState(false);
  const [cardElement, setCardElement] = useState<HTMLDivElement | null>(null);

  // Calculate 3D tilt based on mouse position - enhanced range
  const tiltX = (mousePosition.y - 0.5) * -20; // -10 to +10 degrees
  const tiltY = (mousePosition.x - 0.5) * 20;  // -10 to +10 degrees

  // Mouse tracking handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardElement) return;
    
    const rect = cardElement.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    setMousePosition({ x, y });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition({ x: 0.5, y: 0.5 });
  };

  // Callback ref to handle both intersection observer and mouse tracking
  const setRefs = React.useCallback((node: HTMLDivElement | null) => {
    setCardElement(node);
    imageLoadRef(node);
  }, [imageLoadRef]);

  return (
    <Flex
      ref={setRefs}
      direction="column"
      h="100%"
      minH={{ base: '220px', md: '350px' }}
      bg="bg-surface"
      borderRadius="lg"
      borderWidth="1px"
      borderColor="border-primary"
      boxShadow={isHovered 
        ? `0 ${20 + Math.abs(tiltX) * 2}px ${40 + Math.abs(tiltY) * 2}px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 255, 255, 0.1)` 
        : "0 4px 15px rgba(0, 0, 0, 0.2)"
      }
      transform={isHovered 
        ? `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(30px)` 
        : "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)"
      }
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      overflow="hidden"
      cursor="pointer"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      position="relative"
      // Gloss light sweep effect
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: isHovered ? '100%' : '-100%',
        width: '100%',
        height: '100%',
        background: `linear-gradient(90deg, transparent, ${glossAccent}, transparent)`,
        transform: 'skewX(-25deg)',
        transition: 'left 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 2,
        pointerEvents: 'none',
      }}
    >
      {/* Top section with image or dynamic gradient fallback */}
      <VStack
        flexGrow={1}
        align="flex-start"
        p={{ base: 'md', md: 'xl' }}
        minH={{ base: '180px', md: '300px' }}
        bgImage={circuitImage ? circuitImage : undefined}
        bgGradient={!circuitImage ? `linear(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)` : undefined}
        bgSize="cover"
        bgPosition={isHovered 
          ? `${50 + tiltY * 1.5}% ${50 + tiltX * 1.5}%` 
          : "center"
        }
        color="white"
        textShadow={circuitImage ? "0 2px 8px rgba(0, 0, 0, 0.9)" : "0 1px 4px rgba(0, 0, 0, 0.5)"}
        position="relative"
        spacing={{ base: 2, md: 4 }}
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        transform={isHovered ? `translateZ(-10px)` : "translateZ(0px)"}
        _before={circuitImage ? {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bg: isHovered ? 'blackAlpha.400' : 'blackAlpha.500',
          zIndex: 0,
          transition: 'background-color 0.3s ease',
        } : undefined}
        sx={circuitImage ? {
          '& > *': { position: 'relative', zIndex: 1 }
        } : undefined}
      >
        <Heading
          as="h2"
          w="100%"
          lineHeight={1}
          position="relative"
          pb={{ base: 'xs', md: 'sm' }}
          mb={{ base: 'sm', md: 'md' }}
          transform={isHovered ? `translateZ(30px) rotateX(${tiltX * 0.3}deg) rotateY(${tiltY * 0.3}deg)` : "translateZ(0px)"}
          transition="transform 0.3s ease"
          _after={{ // Enhanced gradient underline with glow
            content: '""', position: 'absolute', bottom: 0, left: 0,
            h: '2px', w: '100%',
            bgGradient: 'linear(to-right, rgba(255, 255, 255, 0.7) 50%, transparent 100%)',
            boxShadow: isHovered ? '0 0 10px rgba(255, 255, 255, 0.5)' : 'none',
            transition: 'box-shadow 0.3s ease',
          }}
        >
          <Text as="span" display="block" mb="-0.5rem"
            fontFamily="signature" fontWeight="400" textTransform="none"
            fontSize={{ base: 'clamp(1.2rem, 4vw, 1.8rem)', md: 'clamp(2.2rem, 6vw, 3rem)' }}
            textShadow={isHovered ? "0 4px 12px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 255, 255, 0.3)" : "0 2px 8px rgba(0, 0, 0, 0.9)"}
            transition="text-shadow 0.3s ease"
          >
            {shortName}
          </Text>
          <Text as="span" display="block" opacity={0.9}
            fontFamily="heading" fontWeight="bold" textTransform="uppercase"
            fontSize={{ base: 'clamp(0.8rem, 2.5vw, 1rem)', md: 'clamp(1.2rem, 4vw, 1.5rem)' }}
            mt="xs"
            textShadow={isHovered ? "0 4px 12px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 255, 255, 0.3)" : "0 2px 8px rgba(0, 0, 0, 0.9)"}
            transition="text-shadow 0.3s ease"
          >
            Grand Prix
          </Text>
        </Heading>
        <Text
          fontFamily="heading" fontWeight="bold"
          fontSize={{ base: '1rem', md: '1.5rem' }}
          transform={isHovered ? `translateZ(25px) rotateX(${tiltX * 0.2}deg) rotateY(${tiltY * 0.2}deg)` : "translateZ(0px)"}
          transition="transform 0.3s ease"
          textShadow={isHovered ? "0 4px 12px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 255, 255, 0.3)" : "0 2px 8px rgba(0, 0, 0, 0.9)"}
        >
          Round {race.round}
        </Text>

        {/* Flag with 3D effects */}
        <Box 
          position="absolute" 
          top={{ base: 'sm', md: 'lg' }} 
          right={{ base: 'sm', md: 'lg' }}
          transform={isHovered ? `translateZ(35px) scale(1.15) rotateX(${tiltX * 0.4}deg) rotateY(${tiltY * 0.4}deg)` : "translateZ(0px) scale(1)"}
          transition="transform 0.3s ease"
          borderRadius="sm"
          overflow="hidden"
          boxShadow={isHovered ? "0 4px 12px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 255, 255, 0.2)" : "0 2px 8px rgba(0, 0, 0, 0.3)"}
        >
          {twoLetter ? (
            <ReactCountryFlag
              countryCode={twoLetter.toLowerCase()}
              svg
              style={{ width: '28px', height: '20px' }}
              title={(race as any)?.circuit?.country || (race as any)?.circuit?.country_code}
            />
          ) : null}
        </Box>
      </VStack>

      {/* Bottom section with 3D effects */}
      <HStack
        p={{ base: 'sm', md: 'lg' }}
        bg={isHovered ? "bg-elevated" : "bg-surface"}
        borderTopWidth="1px"
        borderColor={isHovered ? "border-accent" : "border-primary"}
        justify="space-between"
        align="center"
        minH={{ base: '32px', md: '40px' }}
        wrap="wrap"
        transform={isHovered ? `translateZ(20px) rotateX(${tiltX * 0.1}deg) rotateY(${tiltY * 0.1}deg)` : "translateZ(0px)"}
        transition="all 0.3s ease"
        position="relative"
        _before={isHovered ? {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          bgGradient: 'linear(to-right, transparent, rgba(255, 255, 255, 0.3), transparent)',
          zIndex: 1,
        } : undefined}
      >
        <Text 
          fontSize={{ base: 'xs', md: 'sm' }} 
          color={isHovered ? "text-primary" : "text-muted"}
          fontWeight="500"
          flex="1"
          minW="0"
          transition="color 0.3s ease"
        >
          {formattedDate}
        </Text>
        <Text 
          fontSize={{ base: 'xs', md: 'sm' }} 
          color={isHovered ? "accent" : "text-secondary"}
          fontWeight="600" 
          textTransform="uppercase" 
          letterSpacing="0.5px"
          flexShrink={0}
          ml={2}
          transition="color 0.3s ease"
          textShadow={isHovered ? "0 0 10px currentColor" : "none"}
        >
          View Details
        </Text>
      </HStack>
    </Flex>
  );
};

export default RaceProfileCard;