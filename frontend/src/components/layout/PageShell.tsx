// frontend/src/components/layout/PageShell.tsx

import { Box } from '@chakra-ui/react';
import type { BoxProps } from '@chakra-ui/react';
import { ReactNode } from 'react';

interface PageShellProps extends BoxProps {
  children: ReactNode;
  minH?: string;
  bg?: string;
  color?: string;
}

/**
 * Page shell component that provides consistent page-level styling
 * with safe area support and mobile viewport handling
 */
const PageShell = ({ 
  children, 
  minH = '100svh',
  bg = 'bg-primary',
  color = 'text-primary',
  ...props 
}: PageShellProps) => {
  return (
    <Box
      minH={minH}
      bg={bg}
      color={color}
      className="mobile-full-height"
      style={{
        paddingTop: 'var(--safe-area-inset-top)',
        paddingRight: 'var(--safe-area-inset-right)',
        paddingBottom: 'var(--safe-area-inset-bottom)',
        paddingLeft: 'var(--safe-area-inset-left)',
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export default PageShell;
