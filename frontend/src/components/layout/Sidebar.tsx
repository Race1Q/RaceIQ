// frontend/src/components/layout/Sidebar.tsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Users, Wrench, GitCompareArrows, Flag, Info, Pin, PinOff, UserCircle, LogOut, Settings
} from 'lucide-react';
import {
  Box, VStack, Button, Text, HStack, Icon, Flex, useToast, Spacer, Image
} from '@chakra-ui/react';
import { useAuth0 } from '@auth0/auth0-react';
import { useActiveRoute } from '../../hooks/useActiveRoute';
import { useRole } from '../../context/RoleContext';
import ThemeToggleButton from '../ThemeToggleButton/ThemeToggleButton';

// --- Sub-component for Navigation Links ---
const SidebarNav = ({ isExpanded }: { isExpanded: boolean }) => {
  const { isAuthenticated } = useAuth0();
  
  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/drivers', label: 'Drivers', icon: Users },
    { path: '/constructors', label: 'Constructors', icon: Wrench },
    { path: '/standings', label: 'Standings', icon: Wrench },
    { path: '/compare', label: 'Compare', icon: GitCompareArrows },
    { path: '/races', label: 'Races', icon: Flag },
    { path: '/about', label: 'About', icon: Info },
    // Add admin link for any authenticated user
    ...(isAuthenticated ? [{ path: '/admin', label: 'Admin', icon: Settings }] : []),
  ];

  return (
    <VStack spacing="sm" align="stretch">
      {navLinks.map(({ path, label, icon: IconComponent }) => (
        <Button
          key={path}
          as={Link}
          to={path}
          variant="ghost"
          color={useActiveRoute(path) ? 'brand.red' : 'text-primary'}
          fontFamily="heading"
          justifyContent={isExpanded ? "flex-start" : "center"}
          h="48px"
          _hover={{ color: 'brand.red', bg: 'bg-surface-raised' }}
          isActive={useActiveRoute(path)}
          _active={{ bg: 'bg-surface-raised', color: 'brand.red' }}
          position="relative"
          _after={{
            content: '""', position: 'absolute',
            width: useActiveRoute(path) ? '3px' : '0',
            height: '100%', left: 0, bgColor: 'brand.red',
            transition: 'width 0.3s ease',
          }}
        >
          <HStack spacing="sm">
            <Icon as={IconComponent} boxSize={5} />
            {isExpanded && <Text>{label}</Text>}
          </HStack>
        </Button>
      ))}
    </VStack>
  );
};

// --- Main Sidebar Component ---
interface SidebarProps {
  onWidthChange?: (width: number) => void;
}

function Sidebar({ onWidthChange }: SidebarProps) {
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { logout } = useAuth0();
  const toast = useToast();

  const isExpanded = isPinned || isHovered;
  const currentWidth = isExpanded ? 250 : 80;

  React.useEffect(() => {
    onWidthChange?.(currentWidth);
  }, [currentWidth, onWidthChange]);

  const handleMouseEnter = () => !isPinned && setIsHovered(true);
  const handleMouseLeave = () => !isPinned && setIsHovered(false);

  const handleLogout = () => {
    // Custom toast logic remains the same, but with semantic tokens
    toast({
      position: 'top',
      render: ({ onClose }) => (
        <Box
          bg="bg-surface-raised" // Token
          backdropFilter="blur(10px)"
          border="1px solid"
          borderColor="brand.red" // Token
          borderRadius="lg" p="4" color="text-primary" // Token
          boxShadow="0 8px 32px rgba(220, 38, 38, 0.3)"
        >
          <HStack spacing="3" align="start">
            <Icon as={LogOut} boxSize={5} color="brand.red" />
            <VStack align="start" spacing="2" flex="1">
              <Text fontWeight="bold" fontSize="md" color="brand.red">Sign Out</Text>
              <Text fontSize="sm" color="text-secondary">Are you sure you want to sign out?</Text>
              <HStack spacing="2" mt="2">
                <Button size="sm" colorScheme="red"
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

  return (
    <Box
      as="aside"
      w={`${currentWidth}px`}
      // Use semi-transparent version of semantic token for glassmorphism
      bg={{ base: 'rgba(15, 15, 15, 0.7)', lg: 'rgba(15, 15, 15, 0.7)' }}
      _light={{ bg: { base: 'rgba(255, 255, 255, 0.7)', lg: 'rgba(255, 255, 255, 0.7)' } }}
      backdropFilter="blur(10px)"
      borderRight="1px solid"
      borderColor="border-primary" // Token
      h="100vh"
      position="fixed"
      left="0" top="0"
      transition="width 0.3s ease"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      zIndex="sticky"
    >
      <Flex direction="column" h="full" p="lg">
        {/* Logo */}
        <Box as={Link} to="/dashboard" mb="md" display="flex" justify="center" w="100%">
          <Image 
            src="/race_IQ_logo.svg" 
            alt="RaceIQ Logo" 
            w={isExpanded ? "60%" : "70%"}
            h="auto"
            // Removed filters to show original colors
          />
        </Box>

        {/* Navigation Links */}
        <SidebarNav isExpanded={isExpanded} />
        
        <Spacer />

        {/* User Controls */}
        <VStack spacing="sm" align="stretch">
          <Button as={Link} to="/profile" variant="ghost" color="text-primary" fontFamily="heading" justifyContent={isExpanded ? "flex-start" : "center"} h="48px" _hover={{ color: 'brand.red', bg: 'bg-surface-raised' }}>
            <HStack spacing="sm">
              <Icon as={UserCircle} boxSize={5} />
              {isExpanded && <Text>My Profile</Text>}
            </HStack>
          </Button>
          <Button variant="ghost" color="text-muted" fontFamily="heading" justifyContent={isExpanded ? "flex-start" : "center"} h="48px" onClick={handleLogout} _hover={{ color: 'brand.red', bg: 'bg-surface-raised' }}>
            <HStack spacing="sm">
              <Icon as={LogOut} boxSize={5} />
              {isExpanded && <Text>Sign Out</Text>}
            </HStack>
          </Button>
        </VStack>

        {/* Pin and Theme Toggle */}
        <HStack mt="md" justify={isExpanded ? "space-between" : "center"} align="center">
          <Button variant="ghost" color="text-muted" size="sm" onClick={() => setIsPinned(!isPinned)} _hover={{ color: 'brand.red', bg: 'bg-surface-raised' }}>
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