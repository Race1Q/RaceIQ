// frontend/src/components/SectionConnector/SectionConnector.tsx
import { Box, useTheme } from '@chakra-ui/react';

const SectionConnector = () => {
  const theme = useTheme();
  const brandRed = theme.colors.brand.red; // Accessing theme color

  return (
    <Box
      position="absolute"
      left="0"
      right="0"
      bottom="-75px" // This may need slight tweaking for perfect alignment
      height="150px"
      zIndex={10}
      pointerEvents="none"
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1440 150"
        preserveAspectRatio="none"
      >
        {/* Define the fade effect. A mask uses a gradient to control opacity.
          Black areas of the gradient become transparent, white areas remain opaque.
        */}
        <defs>
          <linearGradient id="fadeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: 'black' }} />
            <stop offset="15%" style={{ stopColor: 'white' }} />
            <stop offset="85%" style={{ stopColor: 'white' }} />
            <stop offset="100%" style={{ stopColor: 'black' }} />
          </linearGradient>
          <mask id="fadeMask">
            <rect x="0" y="0" width="100%" height="100%" fill="url(#fadeGradient)" />
          </mask>
        </defs>

        {/* Apply the mask to this group, making all paths inside it fade */}
        <g mask="url(#fadeMask)">
          {/* Path 1: Top Track Edge (Solid White) */}
          <path
            d="M -5 75 Q 360 150, 720 75 T 1445 75"
            fill="none"
            stroke="white"
            strokeWidth="2"
          />
          {/* Path 2: Bottom Track Edge (Solid White) */}
          <path
            d="M -5 82 Q 360 157, 720 82 T 1445 82"
            fill="none"
            stroke="white"
            strokeWidth="2"
          />

          {/* --- Apex Kerb (Corrected) --- */}
          {/* Path 3: Kerb Base (Solid White, thicker, but only visible in the middle) */}
          <path
            d="M -5 78.5 Q 360 153.5, 720 78.5 T 1445 78.5"
            fill="none"
            stroke="white"
            strokeWidth="6"
            strokeDasharray="0 600 400 1000" // A long gap, a visible part, another long gap
          />
          {/* Path 4: Kerb Top (Dashed Red) - Also only visible in the middle */}
          <path
            d="M -5 78.5 Q 360 153.5, 720 78.5 T 1445 78.5"
            fill="none"
            stroke={brandRed}
            strokeWidth="6"
            strokeDasharray="15 15 0 2000" // Standard red/white dash, but confined to the start of the path
            strokeDashoffset="-593" // Nudge it into the correct starting position
          />
        </g>
      </svg>
    </Box>
  );
};

export default SectionConnector;
