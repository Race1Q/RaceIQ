// src/App/App.tsx

import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { Box, Flex, HStack, Button, Text, Container } from '@chakra-ui/react';
import LoginButton from '../components/LoginButton/LoginButton';
import LogoutButton from '../components/LogoutButton/LogoutButton';
import ThemeToggleButton from '../components/ThemeToggleButton/ThemeToggleButton';
import AboutUs from '../pages/AboutUs/AboutUs';
import Drivers from '../pages/Drivers/Drivers';
import DriverDetailPage from '../pages/DriverDetailPage/DriverDetailPage';
import RacesPage from '../pages/RacesPage/RacesPage';
import RaceDetailPage from '../pages/RaceDetailPage/RaceDetailPage';
import Admin from '../pages/Admin/Admin';
import ProfilePage from '../pages/ProfilePage/ProfilePage';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import { useActiveRoute } from '../hooks/useActiveRoute';
import HomePage from '../pages/HomePage/HomePage';
import { RoleProvider } from '../context/RoleContext';
import { ProfileUpdateProvider } from '../context/ProfileUpdateContext';
import useScrollToTop from '../hooks/useScrollToTop';
import BackToTopButton from '../components/BackToTopButton/BackToTopButton';
import UserRegistrationHandler from '../components/UserRegistrationHandler/UserRegistrationHandler';
import ConstructorsStandings from '../pages/Standings/ConstructorStandings';
import ConstructorDetails from '../pages/ConstructorsDetails/ConstructorsDetails';
import CompareDriversPage from '../pages/CompareDriversPage/CompareDriversPage';
import AppLayout from '../components/layout/AppLayout';
import DashboardPage from '../pages/Dashboard/DashboardPage';



function Navbar() {
  const { isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  const navLinks = [
    { path: '/', label: isAuthenticated ? 'Dashboard' : 'Home' },
    { path: '/drivers', label: 'Drivers' },
    { path: '/constructors', label: 'Constructors' },
    ...(isAuthenticated ? [
      { path: '/compare', label: 'Compare' },
      { path: '/races', label: 'Races' },
      { path: '/admin', label: 'Admin' },
    ] : []),
    { path: '/about', label: 'About' },
  ];

  return (
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
      <Flex maxW="1200px" mx="auto" px="md" h="70px" justify="space-between" align="center">
        <HStack as={Link} to="/" spacing="sm" textDecor="none">
          <img 
            src="/race_IQ_logo.svg" 
            alt="RaceIQ Logo" 
            style={{ 
              height: '50px', 
              width: 'auto',
              filter: 'brightness(0) saturate(100%) invert(100%)' // Makes SVG white/transparent
            }}
          />
        </HStack>
        
        <HStack spacing="lg" display={{ base: 'none', md: 'flex' }}>
          {navLinks.map(({ path, label }) => (
            <Button
              key={path}
              as={Link}
              to={path}
              variant="link"
              color={useActiveRoute(path) ? 'brand.red' : 'text-primary'}
              fontFamily="heading"
              fontWeight="500"
              _hover={{ color: 'brand.red', textDecor: 'none' }}
              position="relative"
              _after={{
                content: '""',
                position: 'absolute',
                width: useActiveRoute(path) ? '100%' : '0',
                height: '2px',
                bottom: '-5px',
                left: 0,
                bgColor: 'brand.red',
                transition: 'width 0.3s ease',
              }}
            >
              {label}
            </Button>
          ))}
        </HStack>

        <HStack spacing="sm">
          <ThemeToggleButton />
          {isAuthenticated ? <LogoutButton /> : <LoginButton />}
          {isAuthenticated && (
            <Button
              variant="outline"
              borderColor="brand.red"
              color="brand.red"
              _hover={{ bg: 'brand.red', color: 'white' }}
              onClick={() => navigate('/profile')}
              isActive={useActiveRoute('/profile')}
            >
              My Profile
            </Button>
          )}
        </HStack>
      </Flex>
    </Box>
  );
}

function AppContent() {
  useScrollToTop();
  const location = useLocation();
  const { isAuthenticated } = useAuth0();
  
  // Don't show navbar on driver detail pages (they have their own custom header)
  const showNavbar = !location.pathname.startsWith('/drivers/') || location.pathname === '/drivers';

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
            <Route path="/constructors" element={<ConstructorsStandings />} />
            <Route path="/constructors/:constructorId" element={<ConstructorDetails />} />
            <Route path="/compare" element={<CompareDriversPage />} />
            <Route path="/races" element={<RacesPage />} />
            <Route path="/races/:raceId" element={<RaceDetailPage />} />
            <Route path="/about" element={<AboutUs />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            
            {/* ADMIN */}
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </AppLayout>

        <BackToTopButton />

        {/* Footer */}
        <Box as="footer" bg="bg-surface-raised" borderTop="2px solid" borderColor="brand.red" py="xl" mt="auto">
          <Container maxW="1200px">
            <Flex justify="space-between" align="center" wrap="wrap" gap="md">
              <HStack spacing="lg">
                <Link to="/api-docs"><Text color="text-secondary" _hover={{ color: 'brand.red' }}>API Docs</Text></Link>
                <Link to="/privacy"><Text color="text-secondary" _hover={{ color: 'brand.red' }}>Privacy Policy</Text></Link>
                <Link to="/contact"><Text color="text-secondary" _hover={{ color: 'brand.red' }}>Contact</Text></Link>
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
        <Route path="/drivers/:driverId" element={<DriverDetailPage />} />
        <Route path="/races" element={<RacesPage />} />
        <Route path="/races/:raceId" element={<RaceDetailPage />} />
        <Route path="/constructors" element={<ConstructorsStandings />} />
        <Route path="/constructors/:constructorId" element={<ConstructorDetails />} />
        <Route path="/compare" element={<CompareDriversPage />} />
      </Routes>

      <BackToTopButton />

      {/* Footer */}
      <Box as="footer" bg="bg-surface-raised" borderTop="2px solid" borderColor="brand.red" py="xl" mt="auto">
        <Container maxW="1200px">
          <Flex justify="space-between" align="center" wrap="wrap" gap="md">
            <HStack spacing="lg">
              <Link to="/api-docs"><Text color="text-secondary" _hover={{ color: 'brand.red' }}>API Docs</Text></Link>
              <Link to="/privacy"><Text color="text-secondary" _hover={{ color: 'brand.red' }}>Privacy Policy</Text></Link>
              <Link to="/contact"><Text color="text-secondary" _hover={{ color: 'brand.red' }}>Contact</Text></Link>
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
        <UserRegistrationHandler>
          <AppContent />
        </UserRegistrationHandler>
      </ProfileUpdateProvider>
    </RoleProvider>
  );
}

export default App;
