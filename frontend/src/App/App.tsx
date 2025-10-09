// src/App/App.tsx

import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { Box, Flex, HStack, Button, Text, Container, Spinner, IconButton, useDisclosure, Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, VStack } from '@chakra-ui/react';
import { Menu, X } from 'lucide-react';
import LoginButton from '../components/LoginButton/LoginButton';
import LogoutButton from '../components/LogoutButton/LogoutButton';
import ThemeToggleButton from '../components/ThemeToggleButton/ThemeToggleButton';
import AboutUs from '../pages/AboutUs/AboutUs';
import Drivers from '../pages/Drivers/Drivers';
import DriverDetailPage from '../pages/DriverDetailPage/DriverDetailPage';
import RacesPage from '../pages/RacesPage/RacesPage';
import RaceDetailPageLayout from '../pages/RaceDetailPage/RaceDetailPage';
// import Admin from '../pages/Admin/Admin';
import ProfilePage from '../pages/ProfilePage/ProfilePage';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import ProtectedDetailRoute from '../components/ProtectedDetailRoute/ProtectedDetailRoute';
import { useActiveRoute } from '../hooks/useActiveRoute';
import HomePage from '../pages/HomePage/HomePage';
import { RoleProvider } from '../context/RoleContext';
import { ProfileUpdateProvider } from '../context/ProfileUpdateContext';
import { ThemeColorProvider, useThemeColor } from '../context/ThemeColorContext';
import { DynamicThemeProvider } from '../components/DynamicThemeProvider';
import { getLogoFilter } from '../lib/colorUtils';
import useScrollToTop from '../hooks/useScrollToTop';
import BackToTopButton from '../components/BackToTopButton/BackToTopButton';
import UserRegistrationHandler from '../components/UserRegistrationHandler/UserRegistrationHandler';
import Constructors from '../pages/Constructors/Constructors';
import ConstructorsStandings from '../pages/Standings/ConstructorStandings';
import ConstructorDetails from '../pages/ConstructorsDetails/ConstructorsDetails';
import CompareDriversPage from '../pages/CompareDriversPage/CompareDriversPage';
import CompareConstructorsPage from '../pages/CompareConstructorsPage/CompareConstructorsPage';
import ComparisonLoginPrompt from '../pages/ComparisonLoginPrompt/ComparisonLoginPrompt';
import AppLayout from '../components/layout/AppLayout';
import DashboardPage from '../pages/Dashboard/DashboardPage';
import DriverStandings from '../pages/Standings/DriverStandings';
import AnalyticsStandings from '../pages/Standings/AnalyticsStandings';



function Navbar() {
  const { isAuthenticated } = useAuth0();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { accentColorWithHash } = useThemeColor();

  const navLinks = [
    { path: '/', label: isAuthenticated ? 'Dashboard' : 'Home' },
    { path: '/drivers', label: 'Drivers' },
    { path: '/constructors', label: 'Constructors' },
    ...(isAuthenticated ? [
      { path: '/standings', label: 'Standings' },
      { path: '/standings/constructors', label: 'ConstructorStandings' },
      { path: '/standings/drivers', label: 'DriverStandings' },
      { path: '/standings/analytics', label: 'Analytics' },
      { path: '/compare', label: 'Compare' },
      { path: '/races', label: 'Races' },
      // Admin removed from visible nav
    ] : []),
    { path: '/about', label: 'About' },
  ];

  return (
    <>
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
        <Flex maxW="1200px" mx="auto" px={{ base: 4, md: 6 }} h={{ base: '60px', md: '70px' }} justify="space-between" align="center">
          <HStack as={Link} to="/" spacing="sm" textDecor="none">
            <img 
              src="/race_IQ_logo.svg" 
              alt="RaceIQ Logo" 
              style={{ 
                height: '60px', 
                width: 'auto',
                maxHeight: '100%',
                filter: getLogoFilter(accentColorWithHash)
              }}
            />
          </HStack>
          
          {/* Desktop Navigation */}
          <HStack spacing="lg" display={{ base: 'none', md: 'flex' }}>
            {navLinks.map(({ path, label }) => (
              <Button
                key={path}
                as={Link}
                to={path}
                variant="link"
                color={useActiveRoute(path) ? accentColorWithHash : 'text-primary'}
                fontFamily="heading"
                fontWeight="500"
                _hover={{ color: accentColorWithHash, textDecor: 'none' }}
                position="relative"
                _after={{
                  content: '""',
                  position: 'absolute',
                  width: useActiveRoute(path) ? '100%' : '0',
                  height: '2px',
                  bottom: '-5px',
                  left: 0,
                  bgColor: accentColorWithHash,
                  transition: 'width 0.3s ease',
                }}
              >
                {label}
              </Button>
            ))}
          </HStack>

          {/* Desktop Actions */}
          <HStack spacing="sm" display={{ base: 'none', md: 'flex' }}>
            <ThemeToggleButton />
            {isAuthenticated ? <LogoutButton /> : <LoginButton />}
            {isAuthenticated && (
              <Button
                variant="outline"
                borderColor={accentColorWithHash}
                color={accentColorWithHash}
                _hover={{ bg: accentColorWithHash, color: 'white' }}
                onClick={() => navigate('/profile')}
                isActive={useActiveRoute('/profile')}
              >
                My Profile
              </Button>
            )}
          </HStack>

          {/* Mobile Menu Button */}
          <HStack spacing={2} display={{ base: 'flex', md: 'none' }}>
            <ThemeToggleButton />
            <IconButton
              aria-label="Open menu"
              icon={<Menu size={20} />}
              variant="ghost"
              color="text-primary"
              onClick={onOpen}
            />
          </HStack>
        </Flex>
      </Box>

      {/* Mobile Navigation Drawer */}
      <Drawer isOpen={isOpen} onClose={onClose} placement="right" size="xs">
        <DrawerOverlay />
        <DrawerContent bg="bg-glassmorphism" backdropFilter="blur(10px)">
          <DrawerHeader>
            <HStack justify="space-between" align="center">
              <Text fontFamily="heading" fontSize="lg">Menu</Text>
              <DrawerCloseButton />
            </HStack>
          </DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch">
              {navLinks.map(({ path, label }) => (
                <Button
                  key={path}
                  as={Link}
                  to={path}
                  variant="ghost"
                  color={useActiveRoute(path) ? accentColorWithHash : 'text-primary'}
                  fontFamily="heading"
                  fontWeight="500"
                  justifyContent="flex-start"
                  h="48px"
                  _hover={{ color: accentColorWithHash, bg: 'bg-surface-raised' }}
                  onClick={onClose}
                >
                  {label}
                </Button>
              ))}
              
              <Box pt={4} borderTop="1px solid" borderColor="border-subtle">
                {isAuthenticated ? (
                  <VStack spacing={2} align="stretch">
                    <Button
                      variant="outline"
                      borderColor={accentColorWithHash}
                      color={accentColorWithHash}
                      _hover={{ bg: accentColorWithHash, color: 'white' }}
                      onClick={() => {
                        navigate('/profile');
                        onClose();
                      }}
                    >
                      My Profile
                    </Button>
                    <LogoutButton />
                  </VStack>
                ) : (
                  <LoginButton />
                )}
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

function AppContent() {
  useScrollToTop();
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth0();
  const { accentColorWithHash } = useThemeColor();
  
  // Don't show navbar on driver detail pages (they have their own custom header)
  // But show navbar when login prompt is displayed (user not authenticated)
  const showNavbar = !location.pathname.startsWith('/drivers/') || location.pathname === '/drivers' || !isAuthenticated;

  // Gate route rendering until Auth0 finishes loading to avoid route mismatch races
  if (isLoading) {
    return (
      <Box bg="bg-primary" color="text-primary" minH="100vh" display="flex" flexDirection="column">
        {showNavbar && <Navbar />}
        <Flex flex="1" align="center" justify="center" direction="column" gap={4}>
          <Spinner thickness="3px" speed="0.65s" emptyColor="whiteAlpha.200" color={accentColorWithHash} size="lg" />
          <Text color="text-secondary" fontSize="sm">
            {isAuthenticated ? "Preparing your dashboard..." : "Loading RaceIQ..."}
          </Text>
        </Flex>
      </Box>
    );
  }

  if (isAuthenticated) {
    return (
      <Box bg="bg-primary" color="text-primary" minH="100vh" display="flex" flexDirection="column">
        <AppLayout>
          <Routes>
            {/* Redirect root to dashboard for authenticated users */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* PROTECTED ROUTES */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/drivers" element={<Drivers />} />
            <Route path="/drivers/:driverId" element={<DriverDetailPage />} />
            <Route path="/constructors" element={<Constructors />} />
            {/* Standings: default to drivers; constructors available via tab/deep link */}
            <Route path="/standings" element={<DriverStandings />} />
            <Route path="/standings/constructors" element={<ConstructorsStandings />} />
            <Route path="/standings/analytics" element={<AnalyticsStandings />} />
            <Route path="/constructors/:constructorId" element={<ConstructorDetails />} />
            <Route path="/compare" element={<CompareDriversPage />} />
            <Route path="/compare/constructors" element={<CompareConstructorsPage />} />
            <Route path="/races" element={<RacesPage />} />
            <Route path="/races/:raceId" element={<RaceDetailPageLayout />} />
            <Route path="/about" element={<AboutUs />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            
            {/* ADMIN route disabled */}
          </Routes>
        </AppLayout>

        <BackToTopButton />

        {/* Footer */}
        <Box as="footer" bg="bg-surface-raised" borderTop="2px solid" borderColor={accentColorWithHash} py="xl" mt="auto">
          <Container maxW="1200px">
            <Flex justify="space-between" align="center" wrap="wrap" gap="md">
              <HStack spacing="lg">
                <Link to="https://raceiq-api.azurewebsites.net/docs" target="_blank" rel="noopener noreferrer"><Text color="text-secondary" _hover={{ color: accentColorWithHash }}>API Docs</Text></Link>
                <Link to="/privacy"><Text color="text-secondary" _hover={{ color: accentColorWithHash }}>Privacy Policy</Text></Link>
                <Link to="/contact"><Text color="text-secondary" _hover={{ color: accentColorWithHash }}>Contact</Text></Link>
              </HStack>
              <Text color="text-muted" fontSize="sm">
                ©{new Date().getFullYear()} RaceIQ. All rights reserved.
              </Text>
            </Flex>
          </Container>
        </Box>
      </Box>
    );
  }

  return (
    <Box bg="bg-primary" color="text-primary" minH="100vh" display="flex" flexDirection="column">
      {showNavbar && <Navbar />}
      
      {/* Routes */}
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/drivers" element={<Drivers />} />
        <Route 
          path="/drivers/:driverId" 
          element={
            <ProtectedDetailRoute 
              title="Unlock Driver Insights"
              message="Get access to comprehensive driver statistics, career analysis, performance trends, and detailed race history."
            >
              <DriverDetailPage />
            </ProtectedDetailRoute>
          } 
        />
        <Route path="/races" element={<RacesPage />} />
        <Route path="/races/:raceId" element={<RaceDetailPageLayout />} />
        <Route path="/constructors" element={<Constructors />} />
        <Route 
          path="/constructors/:constructorId" 
          element={
            <ProtectedDetailRoute 
              title="Unlock Team Analytics"
              message="Access detailed constructor performance data, team statistics, championship history, and technical insights."
            >
              <ConstructorDetails />
            </ProtectedDetailRoute>
          } 
        />
        <Route path="/compare" element={<CompareDriversPage />} />
        <Route path="/compare/constructors" element={<CompareConstructorsPage />} />
        <Route path="/compare-login" element={<ComparisonLoginPrompt />} />
      </Routes>

      <BackToTopButton />

      {/* Footer */}
      <Box as="footer" bg="bg-surface-raised" borderTop="2px solid" borderColor={accentColorWithHash} py="xl" mt="auto">
        <Container maxW="1200px">
          <Flex justify="space-between" align="center" wrap="wrap" gap="md">
            <HStack spacing="lg">
              <Link to="https://raceiq-api.azurewebsites.net/docs" target="_blank" rel="noopener noreferrer"><Text color="text-secondary" _hover={{ color: accentColorWithHash }}>API Docs</Text></Link>
              <Link to="/privacy"><Text color="text-secondary" _hover={{ color: accentColorWithHash }}>Privacy Policy</Text></Link>
              <Link to="/contact"><Text color="text-secondary" _hover={{ color: accentColorWithHash }}>Contact</Text></Link>
            </HStack>
            <Text color="text-muted" fontSize="sm">
              ©{new Date().getFullYear()} RaceIQ. All rights reserved.
            </Text>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <RoleProvider>
      <ProfileUpdateProvider>
        <ThemeColorProvider>
          <DynamicThemeProvider>
            <UserRegistrationHandler>
              <AppContent />
            </UserRegistrationHandler>
          </DynamicThemeProvider>
        </ThemeColorProvider>
      </ProfileUpdateProvider>
    </RoleProvider>
  );
}

export default App;
