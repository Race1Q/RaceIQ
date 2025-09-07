// frontend/src/components/layout/Sidebar.tsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Gauge, LayoutDashboard, Users, Wrench, GitCompareArrows, Flag, Info, Pin, PinOff, UserCircle, LogOut } from 'lucide-react';
import { Box, VStack, Button, Text, HStack, Icon, useColorModeValue, Flex, useToast } from '@chakra-ui/react';
import { useAuth0 } from '@auth0/auth0-react';
import { useActiveRoute } from '../../hooks/useActiveRoute';
import ThemeToggleButton from '../ThemeToggleButton/ThemeToggleButton';

interface SidebarProps {
  onWidthChange?: (width: number) => void;
}

function Sidebar({ onWidthChange }: SidebarProps) {
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const { logout } = useAuth0();
  const toast = useToast();

  const isExpanded = isPinned || isHovered;
  const currentWidth = isExpanded ? 250 : 80;
  const sidebarBg = useColorModeValue('whiteAlpha.800', 'blackAlpha.700');

  // Notify parent of width changes
  React.useEffect(() => {
    onWidthChange?.(currentWidth);
  }, [currentWidth, onWidthChange]);

  // Handle mouse enter with delay
  const handleMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    const timeout = setTimeout(() => {
      setIsHovered(true);
    }, 200);
    setHoverTimeout(timeout);
  };

  // Handle mouse leave with immediate collapse
  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setIsHovered(false);
  };

  // Handle logout with confirmation
  const handleLogout = () => {
    toast({
      title: '🏁 Sign Out',
      description: 'Are you sure you want to sign out?',
      status: 'warning',
      duration: 6000,
      isClosable: true,
      position: 'top',
      render: ({ title, description, onClose }) => (
        <Box
          bg="blackAlpha.800"
          backdropFilter="blur(10px)"
          border="1px solid"
          borderColor="brand.red"
          borderRadius="lg"
          p="4"
          color="white"
          boxShadow="0 8px 32px rgba(220, 38, 38, 0.3)"
        >
          <HStack spacing="3" align="start">
            <Icon as={LogOut} boxSize={5} color="brand.red" />
            <VStack align="start" spacing="2" flex="1">
              <Text fontWeight="bold" fontSize="md" color="brand.red">
                {title}
              </Text>
              <Text fontSize="sm" color="whiteAlpha.800">
                {description}
              </Text>
              <HStack spacing="2" mt="2">
                <Button
                  size="sm"
                  colorScheme="red"
                  onClick={() => {
                    logout({ logoutParams: { returnTo: window.location.origin } });
                    onClose();
                  }}
                  _hover={{
                    bg: 'red.600',
                    transform: 'scale(1.05)'
                  }}
                  transition="all 0.2s ease"
                >
                  Yes, Sign Out
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  color="whiteAlpha.700"
                  onClick={onClose}
                  _hover={{
                    bg: 'whiteAlpha.100',
                    color: 'white'
                  }}
                >
                  Cancel
                </Button>
              </HStack>
            </VStack>
          </HStack>
        </Box>
      ),
    });
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/drivers', label: 'Drivers', icon: Users },
    { path: '/constructors', label: 'Constructors', icon: Wrench },
    { path: '/compare', label: 'Compare', icon: GitCompareArrows },
    { path: '/races', label: 'Races', icon: Flag },
    { path: '/about', label: 'About', icon: Info },
  ];

  return (
    <Box
      w={isExpanded ? '250px' : '80px'}
      bg={sidebarBg}
      backdropFilter="blur(10px)"
      borderRight="1px solid"
      borderColor="whiteAlpha.200"
      h="100vh"
      position="fixed"
      left="0"
      top="0"
      transition="width 0.3s ease"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      zIndex="sticky"
    >
      <VStack spacing="lg" p="lg" align="stretch" h="full">
        {/* Logo */}
        <HStack 
          as={Link} 
          to="/dashboard" 
          spacing="sm" 
          textDecor="none" 
          mb="md"
          justify={isExpanded ? "flex-start" : "center"}
        >
          <Gauge size={24} color="var(--chakra-colors-brand-red)" />
          {isExpanded && (
            <Text as="h2" color="brand.red" fontFamily="heading" fontSize="1.8rem" fontWeight="bold" letterSpacing="1px">
              RaceIQ
            </Text>
          )}
        </HStack>

        {/* Navigation Links */}
        <VStack spacing="sm" align="stretch" flex="1">
          {navLinks.map(({ path, label, icon: IconComponent }) => (
            <Button
              key={path}
              as={Link}
              to={path}
              variant="ghost"
              color={useActiveRoute(path) ? 'brand.red' : 'text-primary'}
              fontFamily="heading"
              fontWeight="500"
              justifyContent={isExpanded ? "flex-start" : "center"}
              h="48px"
              _hover={{ 
                color: 'brand.red', 
                bg: 'whiteAlpha.100',
                textDecor: 'none' 
              }}
              isActive={useActiveRoute(path)}
              _active={{
                bg: 'whiteAlpha.100',
                color: 'brand.red'
              }}
              position="relative"
              _after={{
                content: '""',
                position: 'absolute',
                width: useActiveRoute(path) ? '3px' : '0',
                height: '100%',
                left: 0,
                bgColor: 'brand.red',
                transition: 'width 0.3s ease',
              }}
            >
              <HStack spacing="sm" justify={isExpanded ? "flex-start" : "center"}>
                <Icon as={IconComponent} boxSize={5} />
                {isExpanded && <Text>{label}</Text>}
              </HStack>
            </Button>
          ))}
        </VStack>

                {/* User Controls */}
                <VStack spacing="sm" align="stretch">
                  {/* Logout Button */}
                  <Button
                    variant="ghost"
                    color="text-muted"
                    fontFamily="heading"
                    fontWeight="500"
                    justifyContent={isExpanded ? "flex-start" : "center"}
                    h="48px"
                    onClick={handleLogout}
                    _hover={{ 
                      color: 'red.400', 
                      bg: 'whiteAlpha.100'
                    }}
                    _active={{
                      bg: 'whiteAlpha.100',
                      color: 'red.400'
                    }}
                  >
                    <HStack spacing="sm" justify={isExpanded ? "flex-start" : "center"}>
                      <Icon as={LogOut} boxSize={5} />
                      {isExpanded && <Text>Sign Out</Text>}
                    </HStack>
                  </Button>

                  {/* My Profile Button */}
                  <Button
                    as={Link}
                    to="/profile"
                    variant="ghost"
                    color={useActiveRoute('/profile') ? 'brand.red' : 'text-primary'}
                    fontFamily="heading"
                    fontWeight="500"
                    justifyContent={isExpanded ? "flex-start" : "center"}
                    h="48px"
                    _hover={{ 
                      color: 'brand.red', 
                      bg: 'whiteAlpha.100',
                      textDecor: 'none' 
                    }}
                    isActive={useActiveRoute('/profile')}
                    _active={{
                      bg: 'whiteAlpha.100',
                      color: 'brand.red'
                    }}
                    position="relative"
                    _after={{
                      content: '""',
                      position: 'absolute',
                      width: useActiveRoute('/profile') ? '3px' : '0',
                      height: '100%',
                      left: 0,
                      bgColor: 'brand.red',
                      transition: 'width 0.3s ease',
                    }}
                  >
                    <HStack spacing="sm" justify={isExpanded ? "flex-start" : "center"}>
                      <Icon as={UserCircle} boxSize={5} />
                      {isExpanded && <Text>My Profile</Text>}
                    </HStack>
                  </Button>

          {/* Theme Toggle */}
          <Flex justifyContent={isExpanded ? "flex-start" : "center"}>
            <ThemeToggleButton />
          </Flex>
        </VStack>

        {/* Pin Button */}
        <Button
          variant="ghost"
          color="text-muted"
          size="sm"
          onClick={() => setIsPinned(!isPinned)}
          justifyContent={isExpanded ? "flex-start" : "center"}
          _hover={{ 
            color: 'brand.red', 
            bg: 'whiteAlpha.100'
          }}
        >
          <HStack spacing="sm" justify={isExpanded ? "flex-start" : "center"}>
            <Icon as={isPinned ? Pin : PinOff} boxSize={4} />
            {isExpanded && <Text fontSize="sm">{isPinned ? 'Unpin' : 'Pin'}</Text>}
          </HStack>
        </Button>
      </VStack>
    </Box>
  );
}

export default Sidebar;
