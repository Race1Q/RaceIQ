import React from 'react';
import { Badge, HStack, Box } from '@chakra-ui/react';
import { keyframes, css } from '@emotion/react';

// Gemini logo SVG - Single star icon with rainbow shimmer
const GeminiIcon = ({ animate = true }) => (
  <Box
    as="span"
    display="inline-block"
    width="16px"
    height="16px"
    position="relative"
    overflow="hidden"
  >
    <Box
      position="absolute"
      top="0"
      left="0"
      width="100%"
      height="100%"
      bg="linear-gradient(45deg, #FF0000, #FF8000, #FFFF00, #00FF00, #0080FF, #8000FF, #FF0080, #FF0000)"
      backgroundSize="200% 200%"
      css={animate ? css`
        animation: ${shimmer} 3s ease-in-out infinite;
        mask-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwxOSA5TDEzLjA5IDkuNzRMMTIgMTZMMTAuOTEgOS43NEw1IDlMMTAuOTEgOC4yNkwxMiAyWiIgZmlsbD0id2hpdGUiLz4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+');
        mask-repeat: no-repeat;
        mask-size: contain;
        mask-position: center;
        -webkit-mask-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwxOSA5TDEzLjA5IDkuNzRMMTIgMTZMMTAuOTEgOS43NEw1IDlMMTAuOTEgOC4yNkwxMiAyWiIgZmlsbD0id2hpdGUiLz4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+');
        -webkit-mask-repeat: no-repeat;
        -webkit-mask-size: contain;
        -webkit-mask-position: center;
      ` : css`
        mask-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwxOSA5TDEzLjA5IDkuNzRMMTIgMTZMMTAuOTEgOS43NEw1IDlMMTAuOTEgOC4yNkwxMiAyWiIgZmlsbD0id2hpdGUiLz4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+');
        mask-repeat: no-repeat;
        mask-size: contain;
        mask-position: center;
        -webkit-mask-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwxOSA5TDEzLjA5IDkuNzRMMTIgMTZMMTAuOTEgOS43NEw1IDlMMTAuOTEgOC4yNkwxMiAyWiIgZmlsbD0id2hpdGUiLz4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+');
        -webkit-mask-repeat: no-repeat;
        -webkit-mask-size: contain;
        -webkit-mask-position: center;
      `}
    />
  </Box>
);

// Rainbow shimmer animation
const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

interface GeminiBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'subtle' | 'outline';
}

const GeminiBadge: React.FC<GeminiBadgeProps> = ({ 
  size = 'sm', 
  variant = 'subtle' 
}) => {
  const baseStyles = {
    fontSize: size === 'sm' ? 'xs' : size === 'md' ? 'sm' : 'md',
    fontWeight: '600',
    borderRadius: 'full',
    px: size === 'sm' ? 2 : 3,
    py: size === 'sm' ? 1 : 1.5,
    border: '1px solid',
    borderColor: 'whiteAlpha.300',
    backdropFilter: 'blur(8px)',
    transition: 'all 0.3s ease',
    _hover: {
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    },
  };

  if (variant === 'solid') {
    return (
      <Badge
        {...baseStyles}
        bg="linear-gradient(45deg, #FF0000, #FF8000, #FFFF00, #00FF00, #0080FF, #8000FF, #FF0080, #FF0000)"
        backgroundSize="200% 200%"
        animation={`${shimmer} 3s ease-in-out infinite`}
        color="white"
        borderColor="whiteAlpha.400"
      >
        <HStack spacing={1}>
          <GeminiIcon animate={false} />
          <span>Powered by Gemini AI</span>
        </HStack>
      </Badge>
    );
  }

  return (
    <Badge
      {...baseStyles}
      bg="blackAlpha.200"
      color="white"
      position="relative"
      overflow="hidden"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
        backgroundSize: '200% 100%',
        animation: `${shimmer} 3s ease-in-out infinite`,
        borderRadius: 'inherit',
      }}
    >
      <HStack spacing={1} position="relative" zIndex={1}>
        <GeminiIcon animate={true} />
        <span>Powered by Gemini AI</span>
      </HStack>
    </Badge>
  );
};

export default GeminiBadge;
