// frontend/src/components/layout/ResponsiveTable.tsx

import { Box, Table, useColorModeValue } from '@chakra-ui/react';
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
  // Theme-aware border colors for table rows
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.300');
  const scrollbarThumb = useColorModeValue('rgba(0, 0, 0, 0.2)', 'rgba(255, 255, 255, 0.2)');
  const scrollbarThumbHover = useColorModeValue('rgba(0, 0, 0, 0.3)', 'rgba(255, 255, 255, 0.3)');
  
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
          background: scrollbarThumb,
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: scrollbarThumbHover,
        },
        // Ensure table row borders are visible
        'tbody tr': {
          borderBottom: `1px solid ${borderColor}`,
        },
        'thead tr': {
          borderBottom: `2px solid ${borderColor}`,
        },
        // Also style th and td borders
        'th, td': {
          borderColor: borderColor,
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
