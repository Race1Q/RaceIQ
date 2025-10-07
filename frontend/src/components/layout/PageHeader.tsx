import React from 'react';
import { Box, Heading, Text, HStack, IconButton, VStack } from '@chakra-ui/react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useThemeColor } from '../../context/ThemeColorContext';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backTo?: string;
  rightContent?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  backTo = '/dashboard',
  rightContent
}) => {
  const navigate = useNavigate();
  const { accentColorWithHash } = useThemeColor();

  const handleBack = () => {
    navigate(backTo);
  };

  return (
    <Box 
      position="relative"
      bg="bg-surface-raised" 
      p={{ base: 'md', md: 'lg' }}
      borderBottom="2px solid"
      borderColor="border-subtle"
      overflow="hidden"
      sx={{
        '@keyframes raceIn': {
          'from': { 
            opacity: 0, 
            transform: 'translateX(-40px) skewX(-3deg)',
          },
          'to': { 
            opacity: 1, 
            transform: 'translateX(0) skewX(0deg)',
          },
        },
        '@keyframes expandLine': {
          'from': {
            width: '0%',
            opacity: 0,
          },
          'to': {
            width: '100%',
            opacity: 1,
          },
        },
        '@keyframes shimmer': {
          '0%': {
            backgroundPosition: '-200% center',
          },
          '100%': {
            backgroundPosition: '200% center',
          },
        },
        '@keyframes glowPulse': {
          '0%, 100%': {
            boxShadow: `0 0 8px ${accentColorWithHash}60, 0 0 15px ${accentColorWithHash}30`,
          },
          '50%': {
            boxShadow: `0 0 15px ${accentColorWithHash}90, 0 0 25px ${accentColorWithHash}50`,
          },
        },
        '@keyframes chevronSlide': {
          '0%, 100%': {
            transform: 'translateX(0)',
            opacity: 0.6,
          },
          '50%': {
            transform: 'translateX(5px)',
            opacity: 1,
          },
        },
      }}
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '100%',
        background: `
          radial-gradient(ellipse at top left, ${accentColorWithHash}10 0%, transparent 50%),
          radial-gradient(ellipse at top right, ${accentColorWithHash}08 0%, transparent 50%),
          repeating-linear-gradient(
            45deg,
            transparent,
            transparent 20px,
            ${accentColorWithHash}03 20px,
            ${accentColorWithHash}03 22px
          )
        `,
        pointerEvents: 'none',
        zIndex: 0,
      }}
      _after={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: `linear-gradient(90deg, 
          ${accentColorWithHash} 0%, 
          ${accentColorWithHash}ff 20%,
          ${accentColorWithHash}ff 80%,
          ${accentColorWithHash} 100%)`,
        boxShadow: `0 2px 20px ${accentColorWithHash}70, 0 0 40px ${accentColorWithHash}40`,
        animation: 'expandLine 0.8s ease-out, glowPulse 3s ease-in-out infinite 0.8s',
      }}
    >
      {/* Racing corner brackets - F1 broadcast style */}
      <Box
        position="absolute"
        top="0"
        right="0"
        width="100px"
        height="4px"
        background={`linear-gradient(270deg, ${accentColorWithHash}, transparent)`}
        boxShadow={`0 0 10px ${accentColorWithHash}60`}
        sx={{
          animation: 'expandLine 0.6s ease-out 0.2s backwards',
          transformOrigin: 'right',
        }}
      />
      <Box
        position="absolute"
        top="0"
        right="0"
        width="4px"
        height="40px"
        background={`linear-gradient(180deg, ${accentColorWithHash}, transparent)`}
        boxShadow={`0 0 10px ${accentColorWithHash}60`}
        sx={{
          animation: 'expandLine 0.6s ease-out 0.3s backwards',
          transformOrigin: 'top',
        }}
      />

      {/* Speed chevrons */}
      <Box
        position="absolute"
        left="0"
        top="50%"
        transform="translateY(-50%)"
        display="flex"
        gap="2px"
        opacity="0.15"
        zIndex={0}
      >
        {[0, 1, 2].map((i) => (
          <ChevronRight
            key={i}
            size={40}
            color={accentColorWithHash}
            style={{
              animation: `chevronSlide 1.5s ease-in-out infinite ${i * 0.15}s`,
            }}
          />
        ))}
      </Box>

      <HStack 
        justify="space-between" 
        align="start" 
        flexWrap={{ base: 'wrap', md: 'nowrap' }} 
        spacing={{ base: 4, md: 0 }}
        position="relative"
        zIndex={1}
      >
        <HStack spacing={4} align="start" flex="1" minW={0}>
          {showBackButton && (
            <IconButton
              aria-label="Go back"
              icon={<ArrowLeft size={20} />}
              onClick={handleBack}
              variant="ghost"
              size="md"
              flexShrink={0}
              color={accentColorWithHash}
              borderWidth="2px"
              borderColor="transparent"
              fontWeight="700"
              _hover={{
                bg: `${accentColorWithHash}15`,
                borderColor: accentColorWithHash,
                transform: 'translateX(-4px)',
                boxShadow: `0 0 15px ${accentColorWithHash}40`,
              }}
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            />
          )}
          
          <VStack 
            align="flex-start" 
            spacing={1} 
            flex="1" 
            minW={0}
            sx={{
              animation: 'raceIn 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <HStack spacing={2} width="full" alignItems="center">
              <Heading 
                color="text-primary" 
                size={{ base: 'lg', md: 'xl' }} 
                fontFamily="heading"
                noOfLines={2}
                position="relative"
                paddingBottom="8px"
                fontWeight="800"
                letterSpacing="tight"
                sx={{
                  textShadow: `0 2px 15px ${accentColorWithHash}25`,
                  background: `linear-gradient(135deg, var(--chakra-colors-text-primary) 0%, var(--chakra-colors-text-primary) 70%, ${accentColorWithHash}80 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                }}
                _after={{
                  content: '""',
                  position: 'absolute',
                  bottom: '0',
                  left: 0,
                  width: '60px',
                  height: '3px',
                  background: `linear-gradient(90deg, ${accentColorWithHash} 0%, ${accentColorWithHash}80 70%, transparent 100%)`,
                  boxShadow: `0 0 10px ${accentColorWithHash}80, 0 2px 5px ${accentColorWithHash}40`,
                  borderRadius: '2px',
                }}
              >
                {title}
              </Heading>
            </HStack>
            {subtitle && (
              <Text 
                color="text-secondary"
                fontSize={{ base: 'sm', md: 'md' }}
                noOfLines={2}
                mt={1}
                position="relative"
                pl={1}
                sx={{
                  opacity: 0,
                  animation: 'raceIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.15s forwards',
                }}
                _before={{
                  content: '"▸"',
                  position: 'absolute',
                  left: '-10px',
                  color: accentColorWithHash,
                  fontSize: '0.8em',
                  opacity: 0.7,
                }}
              >
                {subtitle}
              </Text>
            )}
          </VStack>
        </HStack>
        
        {rightContent && (
          <Box 
            flexShrink={0}
            sx={{
              animation: 'raceIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s backwards',
            }}
          >
            {rightContent}
          </Box>
        )}
      </HStack>
    </Box>
  );
};

export default PageHeader;
