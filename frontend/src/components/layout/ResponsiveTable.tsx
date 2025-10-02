// frontend/src/components/layout/ResponsiveTable.tsx

import { Box, Table } from '@chakra-ui/react';
import type { TableProps } from '@chakra-ui/react';
import { ReactNode } from 'react';

interface ResponsiveTableProps extends TableProps {
  children: ReactNode;
  enableHorizontalScroll?: boolean;
}

/**
 * Responsive table wrapper that handles overflow on mobile devices
 * with optional horizontal scrolling
 */
const ResponsiveTable = ({ 
  children, 
  enableHorizontalScroll = true,
  ...props 
}: ResponsiveTableProps) => {
  return (
    <Box
      overflowX={enableHorizontalScroll ? 'auto' : 'hidden'}
      overflowY="hidden"
      sx={{
        '&::-webkit-scrollbar': {
          height: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: 'rgba(255, 255, 255, 0.3)',
        },
      }}
    >
      <Table
        size={{ base: 'sm', md: 'md' }}
        variant="simple"
        minW="600px" // Ensure table doesn't get too cramped
        {...props}
      >
        {children}
      </Table>
    </Box>
  );
};

export default ResponsiveTable;
