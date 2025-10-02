// frontend/src/components/layout/AppLayout.tsx

import { useState } from 'react';
import type { ReactNode } from 'react';
import { Box, useBreakpointValue, Flex, IconButton, HStack, Image, Link } from '@chakra-ui/react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import PageShell from './PageShell';

interface AppLayoutProps {
  children: ReactNode;
}

function AppLayout({ children }: AppLayoutProps) {
  const [sidebarWidth, setSidebarWidth] = useState(80);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Responsive behavior: show sidebar on desktop, hide on mobile
  const isDesktop = useBreakpointValue({ base: false, lg: true });

  return (
    <PageShell>
      {/* Desktop Sidebar */}
      {isDesktop && (
        <Sidebar 
          onWidthChange={setSidebarWidth}
          isMobile={false}
        />
      )}
      
      {/* Mobile Navigation Header */}
      {!isDesktop && (
        <Box
          as="nav"
          bg="blackAlpha.700"
          backdropFilter="blur(10px)"
          borderBottom="1px solid"
          borderColor="whiteAlpha.200"
          position="sticky"
          top="0"
          zIndex="sticky"
        >
          <Flex maxW="1200px" mx="auto" px={4} h="60px" justify="space-between" align="center">
            <HStack as={Link} to="/dashboard" spacing="sm" textDecor="none">
              <Image 
                src="/race_IQ_logo.svg" 
                alt="RaceIQ Logo" 
                h="40px"
                w="auto"
                objectFit="contain"
              />
            </HStack>
            
            <IconButton
              aria-label="Open menu"
              icon={<Menu size={20} />}
              variant="ghost"
              color="text-primary"
              onClick={() => setIsMobileMenuOpen(true)}
            />
          </Flex>
        </Box>
      )}
      
      {/* Mobile Drawer - handled by Sidebar component */}
      {!isDesktop && (
        <Sidebar 
          onWidthChange={setSidebarWidth}
          isMobile={true}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Main Content Area */}
      <Box 
        w="full"
        minH="100svh"
        overflow="auto"
        pl={isDesktop ? `${sidebarWidth}px` : 0}
        transition="padding-left 0.3s ease"
        position="relative"
      >
        {children}
      </Box>
    </PageShell>
  );
}

export default AppLayout;
