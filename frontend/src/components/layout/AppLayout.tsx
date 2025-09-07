// frontend/src/components/layout/AppLayout.tsx

import { useState } from 'react';
import type { ReactNode } from 'react';
import { Box } from '@chakra-ui/react';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: ReactNode;
}

function AppLayout({ children }: AppLayoutProps) {
  const [sidebarWidth, setSidebarWidth] = useState(80);

  return (
    <Box h="100vh">
      <Sidebar onWidthChange={setSidebarWidth} />
      <Box 
        w="full"
        h="100vh"
        overflow="auto"
        pl={`${sidebarWidth}px`}
        transition="padding-left 0.3s ease"
      >
        {children}
      </Box>
    </Box>
  );
}

export default AppLayout;
