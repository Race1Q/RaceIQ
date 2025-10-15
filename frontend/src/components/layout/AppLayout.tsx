// frontend/src/components/layout/AppLayout.tsx

import { useState } from 'react';
import type { ReactNode } from 'react';
import { Box, useBreakpointValue, Flex, IconButton, HStack, Image } from '@chakra-ui/react';
import { Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import PageShell from './PageShell';
import { useThemeColor } from '../../context/ThemeColorContext';
import { getLogoFilter } from '../../lib/colorUtils';

interface AppLayoutProps {
  children: ReactNode;
}

function AppLayout({ children }: AppLayoutProps) {
  const [sidebarWidth, setSidebarWidth] = useState(80);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { accentColorWithHash } = useThemeColor();
  
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
          bg="bg-glassmorphism"
          backdropFilter="blur(10px)"
          borderBottom="1px solid"
          borderColor="border-subtle"
          position="sticky"
          top="0"
          zIndex="sticky"
        >
          <Flex maxW="1200px" mx="auto" px={4} h="60px" justify="space-between" align="center">
            <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                <HStack spacing="sm">
                  <Image 
                    src="/race_IQ_logo.svg" 
                    alt="RaceIQ Logo" 
                    h="40px"
                    w="auto"
                    objectFit="contain"
                    filter={getLogoFilter(accentColorWithHash)}
                  />
                </HStack>
              </Link>
            
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
        pl={isDesktop ? `${sidebarWidth}px` : 0}
        transition="padding-left 0.3s ease"
        position="relative"
        css={{
          // Mobile-specific scrolling improvements
          '@media (max-width: 768px)': {
            // Ensure scrollbar is always visible on mobile
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '4px',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.5)',
              },
            },
            // Improve touch scrolling
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
          },
        }}
      >
        {children}
      </Box>
    </PageShell>
  );
}

export default AppLayout;
