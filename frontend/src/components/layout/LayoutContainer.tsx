// frontend/src/components/layout/LayoutContainer.tsx

import { Box } from '@chakra-ui/react';
import type { BoxProps } from '@chakra-ui/react';
import { ReactNode } from 'react';

interface LayoutContainerProps extends BoxProps {
  children: ReactNode;
  maxW?: string | object;
  px?: string | object;
  py?: string | object;
}

/**
 * Responsive container component that provides consistent max-width and padding
 * across different screen sizes
 */
const LayoutContainer = ({ 
  children, 
  maxW = { base: 'full', sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1400px' },
  px = { base: 4, sm: 6, md: 8, lg: 12 },
  py = { base: 4, sm: 6, md: 8, lg: 12 },
  ...props 
}: LayoutContainerProps) => {
  return (
    <Box
      maxW={maxW}
      mx="auto"
      px={px}
      py={py}
      w="full"
      {...props}
    >
      {children}
    </Box>
  );
};

export default LayoutContainer;
