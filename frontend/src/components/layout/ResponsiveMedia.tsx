// frontend/src/components/layout/ResponsiveMedia.tsx

import { Box, BoxProps, Image, ImageProps } from '@chakra-ui/react';
import { ReactNode } from 'react';

interface ResponsiveMediaProps extends BoxProps {
  children?: ReactNode;
  src?: string;
  alt?: string;
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  borderRadius?: string | object;
}

/**
 * Responsive media component for images, videos, and other media
 * with consistent aspect ratios and responsive sizing
 */
const ResponsiveMedia = ({ 
  children,
  src,
  alt = '',
  aspectRatio = '16/9',
  objectFit = 'cover',
  borderRadius = { base: 'md', md: 'lg' },
  ...props 
}: ResponsiveMediaProps) => {
  if (src) {
    return (
      <Box
        position="relative"
        w="full"
        borderRadius={borderRadius}
        overflow="hidden"
        {...props}
      >
        <Image
          src={src}
          alt={alt}
          w="full"
          h="auto"
          objectFit={objectFit}
          loading="lazy"
          style={{ aspectRatio }}
        />
      </Box>
    );
  }

  return (
    <Box
      position="relative"
      w="full"
      borderRadius={borderRadius}
      overflow="hidden"
      style={{ aspectRatio }}
      {...props}
    >
      {children}
    </Box>
  );
};

export default ResponsiveMedia;
