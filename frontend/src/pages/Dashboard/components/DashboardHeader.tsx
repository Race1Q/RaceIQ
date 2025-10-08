// frontend/src/pages/Dashboard/components/DashboardHeader.tsx

import { Box, Heading, Text, HStack, Button, Icon } from '@chakra-ui/react';
import { Settings } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';
import { useThemeColor } from '../../../context/ThemeColorContext';
import { useProfile } from '../../../hooks/useProfile';

interface DashboardHeaderProps {
  onCustomizeClick: () => void;
}

function DashboardHeader({ onCustomizeClick }: DashboardHeaderProps) {
  const { user } = useAuth0();
  const { profile } = useProfile();
  const { accentColorWithHash } = useThemeColor();

  // Use username from profile, fallback to Auth0 name, then to 'User'
  const displayName = profile?.username || user?.name || 'User';

  return (
    <Box 
      position="relative"
      overflow="hidden"
      bg="bg-surface-raised"
      p={{ base: 'md', md: 'lg' }}
      sx={{
        '@keyframes slideInSpeed': {
          'from': { 
            opacity: 0, 
            transform: 'translateX(-50px) skewX(-5deg)',
          },
          'to': { 
            opacity: 1, 
            transform: 'translateX(0) skewX(0deg)',
          },
        },
        '@keyframes scanLine': {
          '0%': { 
            left: '-100%',
            opacity: 0,
          },
          '50%': {
            opacity: 1,
          },
          '100%': { 
            left: '100%',
            opacity: 0,
          },
        },
        '@keyframes speedLines': {
          '0%': {
            transform: 'translateX(0) scaleX(1)',
            opacity: 0.3,
          },
          '100%': {
            transform: 'translateX(100px) scaleX(2)',
            opacity: 0,
          },
        },
        '@keyframes pulse': {
          '0%, 100%': {
            opacity: 1,
            boxShadow: `0 0 10px ${accentColorWithHash}60`,
          },
          '50%': {
            opacity: 0.8,
            boxShadow: `0 0 20px ${accentColorWithHash}90`,
          },
        },
        '@keyframes cornerSweep': {
          'from': {
            transform: 'scaleX(0)',
          },
          'to': {
            transform: 'scaleX(1)',
          },
        },
      }}
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          linear-gradient(135deg, 
            ${accentColorWithHash}08 0%, 
            transparent 50%,
            ${accentColorWithHash}12 100%
          ),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 50px,
            ${accentColorWithHash}05 50px,
            ${accentColorWithHash}05 52px
          )
        `,
        pointerEvents: 'none',
      }}
      _after={{
        content: '""',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: `linear-gradient(90deg, 
          ${accentColorWithHash} 0%, 
          ${accentColorWithHash}ff 30%,
          ${accentColorWithHash}ff 70%,
          ${accentColorWithHash} 100%)`,
        boxShadow: `0 0 15px ${accentColorWithHash}80, 0 0 30px ${accentColorWithHash}40`,
        animation: 'scanLine 2.5s ease-in-out',
      }}
    >
      {/* Top corner accents - F1 broadcast style */}
      <Box
        position="absolute"
        top="0"
        left="0"
        width="60px"
        height="60px"
        sx={{
          animation: 'cornerSweep 0.6s ease-out',
          transformOrigin: 'top left',
        }}
      >
        <Box
          position="absolute"
          top="0"
          left="0"
          width="100%"
          height="3px"
          background={accentColorWithHash}
          boxShadow={`0 0 10px ${accentColorWithHash}`}
        />
        <Box
          position="absolute"
          top="0"
          left="0"
          width="3px"
          height="100%"
          background={accentColorWithHash}
          boxShadow={`0 0 10px ${accentColorWithHash}`}
        />
      </Box>

      {/* Speed lines effect */}
      <Box
        position="absolute"
        top="50%"
        left="0"
        width="200px"
        height="2px"
        transform="translateY(-50%)"
        sx={{
          '&::before, &::after': {
            content: '""',
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: `linear-gradient(90deg, transparent, ${accentColorWithHash}40, transparent)`,
            animation: 'speedLines 1.5s ease-out 0.3s',
          },
          '&::after': {
            top: '10px',
            animationDelay: '0.5s',
          },
        }}
      />

      <HStack 
        justify="space-between" 
        align="start" 
        flexWrap={{ base: 'wrap', md: 'nowrap' }} 
        spacing={{ base: 4, md: 0 }}
        position="relative"
        zIndex={1}
      >
        <Box 
          flex="1" 
          minW="0"
          sx={{
            animation: 'slideInSpeed 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <Heading 
            color="text-primary" 
            size={{ base: 'md', md: 'lg' }} 
            mb="sm"
            noOfLines={2}
            position="relative"
            paddingLeft={{ base: '16px', md: '20px' }}
            fontWeight="800"
            letterSpacing="tight"
            sx={{
              textShadow: `0 2px 10px ${accentColorWithHash}30`,
            }}
            _before={{
              content: '""',
              position: 'absolute',
              left: '0',
              top: '0',
              bottom: '0',
              width: '5px',
              background: `linear-gradient(180deg, ${accentColorWithHash} 0%, ${accentColorWithHash}80 100%)`,
              boxShadow: `0 0 15px ${accentColorWithHash}80, inset 0 0 5px ${accentColorWithHash}`,
              animation: 'pulse 2s ease-in-out infinite',
              borderRadius: '0 2px 2px 0',
            }}
            _after={{
              content: '""',
              position: 'absolute',
              left: '5px',
              top: '0',
              width: '2px',
              height: '100%',
              background: `linear-gradient(180deg, ${accentColorWithHash}60 0%, transparent 100%)`,
            }}
          >
            Welcome back, {displayName}!
          </Heading>
          <Text 
            color="text-secondary"
            fontSize={{ base: 'sm', md: 'md' }}
            noOfLines={2}
            paddingLeft={{ base: '16px', md: '20px' }}
            sx={{
              opacity: 0,
              animation: 'slideInSpeed 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.15s forwards',
            }}
          >
            Here's what's happening in the world of F1.
          </Text>
        </Box>
        
        <Button
          leftIcon={<Icon as={Settings} boxSize={4} />}
          variant="outline"
          borderWidth="2px"
          borderColor={accentColorWithHash}
          color={accentColorWithHash}
          fontWeight="700"
          position="relative"
          _hover={{ 
            bg: accentColorWithHash, 
            color: 'white',
            transform: 'translateY(-3px) scale(1.02)',
            boxShadow: `0 8px 25px ${accentColorWithHash}50, 0 0 20px ${accentColorWithHash}30`,
            borderColor: accentColorWithHash,
          }}
          _active={{
            transform: 'translateY(-1px) scale(0.98)',
          }}
          transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
          onClick={onCustomizeClick}
          size={{ base: 'xs', sm: 'sm' }}
          flexShrink={0}
          minW={{ base: 'auto', sm: '120px' }}
          sx={{
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-2px',
              left: '-2px',
              right: '-2px',
              bottom: '-2px',
              background: `linear-gradient(45deg, ${accentColorWithHash}40, transparent)`,
              borderRadius: 'inherit',
              opacity: 0,
              transition: 'opacity 0.3s ease',
              zIndex: -1,
            },
            '&:hover::before': {
              opacity: 1,
            },
          }}
        >
          <Text display={{ base: 'none', sm: 'inline' }}>Customize</Text>
          <Text display={{ base: 'inline', sm: 'none' }}>Settings</Text>
        </Button>
      </HStack>
    </Box>
  );
}

export default DashboardHeader;
