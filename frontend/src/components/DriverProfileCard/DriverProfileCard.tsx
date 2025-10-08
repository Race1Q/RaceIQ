import React, { useRef, useState } from 'react';
import { Box, VStack, Heading, Text, Image, Flex } from '@chakra-ui/react';
import ReactCountryFlag from 'react-country-flag';
import userIcon from '../../assets/UserIcon.png';
import { countryCodeMap } from '../../lib/countryCodeUtils';
// Import our new color helpers
import { lightenColor, darkenColor } from '../../lib/colorUtils';

interface Driver {
  id: string;
  name: string;
  number: string;
  team: string;
  nationality: string;
  image: string;
  team_color: string;
}

interface DriverProfileCardProps {
  driver: Driver;
}

const DriverProfileCard: React.FC<DriverProfileCardProps> = ({ driver }) => {
  const teamColor = driver.team_color || '#333333';

  const [firstName, ...lastNameParts] = driver.name.split(' ');
  const lastName = lastNameParts.join(' ');

  const countryCode = countryCodeMap[driver.nationality] || driver.nationality;
  const isNumberAvailable = driver.number && driver.number !== 'N/A';

  // 3D Hover Effect State (ported from RaceProfileCard)
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

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition({ x: 0.5, y: 0.5 });
  };

  return (
    <Box
      ref={cardRef}
      height="100%"
      borderRadius="lg"
      overflow="hidden"
      border="1px solid"
      borderColor="border-primary"
      boxShadow={isHovered
        ? `0 ${20 + Math.abs(tiltX) * 2}px ${40 + Math.abs(tiltY) * 2}px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 255, 255, 0.08)`
        : '0 4px 15px rgba(0, 0, 0, 0.2)'}
      transform={isHovered
        ? `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(16px)`
        : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)'}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      cursor="pointer"
      position="relative"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="group"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: isHovered ? '100%' : '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
        transform: 'skewX(-25deg)',
        transition: 'left 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 2,
        pointerEvents: 'none',
      }}
    >
      <VStack spacing={0} height="100%" align="stretch">
        <Box
          position="relative"
          flexGrow={1}
          p={{ base: 'sm', md: 'lg' }}
          // UPDATED: Changed 25% to 45% for a softer gradient
          bgGradient={`radial(at 70% 30%, ${lightenColor(teamColor, 20)} 0%, ${teamColor} 45%, ${darkenColor(teamColor, 80)} 90%)`}
          minH={{ base: '200px', md: '300px' }}
          overflow="hidden"
          bgPosition={isHovered ? `${50 + tiltY * 0.5}% ${50 + tiltX * 0.5}%` : 'center'}
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          transform={isHovered ? 'translateZ(-10px)' : 'translateZ(0px)'}
        >
          {/* Driver Text Info */}
          <VStack
            align="flex-start"
            spacing={0}
            zIndex={2}
            position="relative"
            w="65%"
            color="white"
            textShadow="0 1px 4px rgba(0, 0, 0, 0.5)"
            transform={isHovered ? 'translateZ(18px)' : 'translateZ(0px)'}
            transition="transform 0.3s ease"
          >
            <Heading
              as="h2"
              fontFamily="signature"
              fontSize={{ base: '2xl', md: '4xl' }}
              fontWeight="normal"
              lineHeight="1"
              textTransform="none"
              mb="-0.2em"
              textShadow={isHovered ? '0 4px 12px rgba(0,0,0,0.8), 0 0 18px rgba(255,255,255,0.25)' : '0 1px 4px rgba(0,0,0,0.5)'}
              transition="text-shadow 0.3s ease"
            >
              {firstName}
            </Heading>
            <Heading
              as="span"
              fontFamily="heading"
              fontSize={{ base: 'xl', md: '3xl' }}
              fontWeight="bold"
              lineHeight="1.1"
              textTransform="uppercase"
              textShadow={isHovered ? '0 4px 12px rgba(0,0,0,0.8), 0 0 18px rgba(255,255,255,0.25)' : '0 1px 4px rgba(0,0,0,0.5)'}
              transition="text-shadow 0.3s ease"
            >
              {lastName}
            </Heading>

            {isNumberAvailable && (
              <Text
                fontFamily="heading"
                fontSize={{ base: 'xl', md: '3xl' }}
                fontWeight="bold"
                pt="sm"
                transform={isHovered ? 'translateZ(16px)' : 'translateZ(0px)'}
                transition="transform 0.3s ease"
              >
                {driver.number}
              </Text>
            )}
          </VStack>

          {/* Driver Nationality Flag */}
          <Flex
            position="absolute"
            left={{ base: 'sm', md: 'lg' }}
            bottom={{ base: 'sm', md: 'lg' }}
            zIndex={2}
            align="center"
            transform={isHovered ? 'translateZ(20px) scale(1.05)' : 'translateZ(0px) scale(1)'}
            transition="transform 0.3s ease"
          >
            <Box
              boxShadow="lg"
              border="1px solid rgba(255, 255, 255, 0.15)"
              lineHeight="0"
            >
              {countryCode && countryCode.length === 2 ? (
                <ReactCountryFlag
                  countryCode={countryCode.toLowerCase()}
                  svg
                  style={{ width: '32px', height: '24px' }}
                  title={driver.nationality}
                />
              ) : null}
            </Box>
          </Flex>

          {/* Driver Image */}
          <Image
            src={driver.image || userIcon}
            alt={driver.name}
            position="absolute"
            right="-10px"
            bottom="0"
            height="95%"
            maxW="100%"
            objectFit="contain"
            objectPosition="bottom right"
            zIndex={1}
            filter="drop-shadow(5px 5px 10px rgba(0,0,0,0.4))"
            transition="transform 0.3s ease"
            transform={isHovered ? 'translateZ(22px) scale(1.03)' : 'translateZ(0px) scale(1)'}
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = userIcon; }}
          />
        </Box>

        <Box
          bg={isHovered ? 'bg-elevated' : 'bg-surface'}
          textAlign="center"
          p={{ base: 'sm', md: 'md' }}
          fontFamily="heading"
          color={isHovered ? 'text-primary' : 'text-muted'}
          fontSize={{ base: 'xs', md: 'sm' }}
          transition="all 0.3s ease"
          borderTop="1px solid"
          borderColor={isHovered ? 'border-accent' : 'border-primary'}
          transform={isHovered ? 'translateZ(10px)' : 'translateZ(0px)'}
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
          <Text>View Profile</Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default DriverProfileCard;
