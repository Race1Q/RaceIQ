// frontend/src/components/layout/Sidebar.tsx

import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Users, Wrench, GitCompareArrows, Flag, Info, Pin, PinOff, UserCircle, LogOut
} from 'lucide-react';
import {
  Box, VStack, Button, Text, HStack, Icon, Flex, useToast, Spacer, Image, Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton
} from '@chakra-ui/react';
import { useAuth0 } from '@auth0/auth0-react';
import { useActiveRoute } from '../../hooks/useActiveRoute';
import { useThemeColor } from '../../context/ThemeColorContext';
import { getLogoFilter } from '../../lib/colorUtils';
import ThemeToggleButton from '../ThemeToggleButton/ThemeToggleButton';

// --- Sub-component for Navigation Links ---
const SidebarNav = ({ isExpanded, onClose }: { isExpanded: boolean; onClose?: () => void }) => {
  const { accentColorWithHash } = useThemeColor();
  
  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/drivers', label: 'Drivers', icon: Users },
    { path: '/constructors', label: 'Constructors', icon: Wrench },
    // Unified Standings entry now defaults to Driver Standings view with in-page tabs
    { path: '/standings', label: 'Standings', icon: Users },
    { path: '/compare', label: 'Compare', icon: GitCompareArrows },
    { path: '/races', label: 'Races', icon: Flag },
    { path: '/about', label: 'About', icon: Info },
    // Admin link removed from sidebar
  ];

  return (
    <VStack spacing="sm" align="stretch">
      {navLinks.map(({ path, label, icon: IconComponent }) => {
        // Optimize: Call useActiveRoute once per link instead of 3 times
        const isActive = useActiveRoute(path);
        
        return (
          <Button
            key={path}
            as={Link}
            to={path}
            variant="ghost"
            color={isActive ? accentColorWithHash : 'text-primary'}
            fontFamily="heading"
            justifyContent={isExpanded ? "flex-start" : "center"}
            h="48px"
            minH="48px"
            _hover={{ color: accentColorWithHash, bg: 'bg-surface-raised' }}
            isActive={isActive}
            _active={{ bg: 'bg-surface-raised', color: accentColorWithHash }}
            position="relative"
            onClick={onClose}
            _after={{
              content: '""', position: 'absolute',
              width: isActive ? '3px' : '0',
              height: '100%', left: 0, bgColor: accentColorWithHash,
              transition: 'width 0.3s ease',
            }}
          >
            <HStack spacing="sm">
              <Icon as={IconComponent} boxSize={5} />
              {isExpanded && <Text whiteSpace="nowrap">{label}</Text>}
            </HStack>
          </Button>
        );
      })}
    </VStack>
  );
};

// --- Main Sidebar Component ---
interface SidebarProps {
  onWidthChange?: (width: number) => void;
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

function Sidebar({ onWidthChange, isMobile = false, isOpen = false, onClose }: SidebarProps) {
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimerRef = useRef<number | null>(null);
  const { logout } = useAuth0();
  const { accentColorWithHash } = useThemeColor();
  const toast = useToast();

  const isExpanded = isPinned || isHovered;
  const currentWidth = isExpanded ? 250 : 80;

  React.useEffect(() => {
    onWidthChange?.(currentWidth);
  }, [currentWidth, onWidthChange]);

  const handleMouseEnter = () => {
    if (isPinned || isHovered) return;
    if (hoverTimerRef.current) window.clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = window.setTimeout(() => {
      setIsHovered(true);
      hoverTimerRef.current = null;
    }, 200); // slight delay before expanding on hover
  };
  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    if (!isPinned) setIsHovered(false); // collapse immediately on leave
  };

  React.useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        window.clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = null;
      }
    };
  }, []);

  const handleLogout = () => {
    // Custom toast logic with semantic tokens
    toast({
      position: 'top',
      render: ({ onClose }) => (
        <Box
          bg="bg-modal"
          backdropFilter="blur(10px)"
          border="1px solid"
          borderColor="border-accent"
          borderRadius="lg" p="4" color="text-primary"
          boxShadow="0 8px 32px var(--chakra-colors-shadow-color-lg)"
        >
          <HStack spacing="3" align="start">
            <Icon as={LogOut} boxSize={5} color={accentColorWithHash} />
            <VStack align="start" spacing="2" flex="1">
              <Text fontWeight="bold" fontSize="md" color={accentColorWithHash}>Sign Out</Text>
              <Text fontSize="sm" color="text-secondary">Are you sure you want to sign out?</Text>
              <HStack spacing="2" mt="2">
                <Button size="sm" bg={accentColorWithHash} color="text-on-accent" _hover={{ opacity: 0.9 }}
                  onClick={() => {
                    logout({ logoutParams: { returnTo: window.location.origin } });
                    onClose();
                  }}
                >
                  Yes, Sign Out
                </Button>
                <Button size="sm" variant="ghost" onClick={onClose}>Cancel</Button>
              </HStack>
            </VStack>
          </HStack>
        </Box>
      ),
    });
  };

  // Mobile Drawer
  if (isMobile) {
    return (
      <Drawer isOpen={isOpen} onClose={onClose || (() => {})} placement="left" size="xs">
        <DrawerOverlay />
        <DrawerContent bg="bg-glassmorphism" backdropFilter="blur(10px)">
          <DrawerHeader>
            <HStack justify="space-between" align="center">
              <Image 
                src="/race_IQ_logo.svg" 
                alt="RaceIQ Logo" 
                width="40px"
                height="40px"
                h="40px"
                w="auto"
                objectFit="contain"
                loading="eager"
                decoding="async"
                filter={getLogoFilter(accentColorWithHash)}
              />
              <DrawerCloseButton />
            </HStack>
          </DrawerHeader>
          <DrawerBody p={0}>
            <Flex direction="column" h="full" p={6}>
              {/* Navigation Links */}
              <SidebarNav isExpanded={true} onClose={onClose} />
              
              <Spacer />

              {/* User Controls */}
              <VStack spacing="sm" align="stretch">
                <Button as={Link} to="/profile" variant="ghost" color="text-primary" fontFamily="heading" justifyContent="flex-start" h="48px" _hover={{ color: accentColorWithHash, bg: 'bg-surface-raised' }} onClick={onClose}>
                  <HStack spacing="sm">
                    <Icon as={UserCircle} boxSize={5} />
                    <Text>My Profile</Text>
                  </HStack>
                </Button>
                <Button variant="ghost" color="text-muted" fontFamily="heading" justifyContent="flex-start" h="48px" onClick={handleLogout} _hover={{ color: accentColorWithHash, bg: 'bg-surface-raised' }}>
                  <HStack spacing="sm">
                    <Icon as={LogOut} boxSize={5} />
                    <Text>Sign Out</Text>
                  </HStack>
                </Button>
              </VStack>

              {/* Theme Toggle */}
              <Box mt={6}>
                <ThemeToggleButton />
              </Box>
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop Sidebar
  return (
    <Box
      as="aside"
      w={`${currentWidth}px`}
      bg="bg-glassmorphism"
      backdropFilter="blur(10px)"
      borderRight="1px solid"
      borderColor="border-subtle"
      h="100vh"
      position="fixed"
      left="0" top="0"
      transition="width 0.3s ease"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      zIndex="sticky"
    >
      <Flex direction="column" h="full" p="lg">
        {/* Logo (fixed-height container to avoid reflow) */}
        <Box as={Link} to="/dashboard" mb="md" display="flex" justifyContent="center" w="100%" h="64px" flexShrink={0}>
          <Image 
            src="/race_IQ_logo.svg" 
            alt="RaceIQ Logo" 
            width="64px"
            height="64px"
            h="full"
            w="auto"
            maxW={isExpanded ? "70%" : "70%"}
            objectFit="contain"
            loading="eager"
            decoding="async"
            filter={getLogoFilter(accentColorWithHash)}
          />
        </Box>

        {/* Navigation Links */}
        <SidebarNav isExpanded={isExpanded} onClose={onClose} />
        
        <Spacer />

        {/* User Controls */}
        <VStack spacing="sm" align="stretch">
          <Button as={Link} to="/profile" variant="ghost" color="text-primary" fontFamily="heading" justifyContent={isExpanded ? "flex-start" : "center"} h="48px" _hover={{ color: accentColorWithHash, bg: 'bg-surface-raised' }}>
            <HStack spacing="sm">
              <Icon as={UserCircle} boxSize={5} />
              {isExpanded && <Text>My Profile</Text>}
            </HStack>
          </Button>
          <Button variant="ghost" color="text-muted" fontFamily="heading" justifyContent={isExpanded ? "flex-start" : "center"} h="48px" onClick={handleLogout} _hover={{ color: accentColorWithHash, bg: 'bg-surface-raised' }}>
            <HStack spacing="sm">
              <Icon as={LogOut} boxSize={5} />
              {isExpanded && <Text>Sign Out</Text>}
            </HStack>
          </Button>
        </VStack>

        {/* Pin and Theme Toggle */}
        <HStack mt="md" justify={isExpanded ? "space-between" : "center"} align="center">
          <Button variant="ghost" color="text-muted" size="sm" onClick={() => setIsPinned(!isPinned)} _hover={{ color: accentColorWithHash, bg: 'bg-surface-raised' }}>
            <HStack spacing="sm">
              <Icon as={isPinned ? Pin : PinOff} boxSize={4} />
              {isExpanded && <Text fontSize="sm">{isPinned ? 'Unpin' : 'Pin'}</Text>}
            </HStack>
          </Button>
          {isExpanded && <ThemeToggleButton />}
        </HStack>
        {!isExpanded && <VStack mt="md"><ThemeToggleButton /></VStack>}
      </Flex>
    </Box>
  );
}

export default Sidebar;