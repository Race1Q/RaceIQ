// frontend/src/pages/Drivers/Drivers.tsx

import { useState, useCallback, useEffect, useRef } from 'react';
import { Box, Text, Container, SimpleGrid, VStack, HStack, Button, Icon, Alert, AlertIcon, AlertTitle } from '@chakra-ui/react';
import { ChevronRight, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import F1LoadingSpinner from '../../components/F1LoadingSpinner/F1LoadingSpinner';
import DriverProfileCard from '../../components/DriverProfileCard/DriverProfileCard';
import TeamBanner from '../../components/TeamBanner/TeamBanner';
import { teamColors } from '../../lib/teamColors';
import { useDriversData } from '../../hooks/useDriversData';

// New component for the fallback banner
const FallbackBanner = () => (
  <Alert
    status="warning"
    variant="solid"
    bg="brand.red"
    color="white"
    borderRadius="md"
    mb="lg"
  >
    <AlertIcon as={AlertTriangle} color="white" />
    <AlertTitle fontFamily="heading" fontSize="md">Live Data Unavailable. Showing cached standings.</AlertTitle>
  </Alert>
);

const Drivers = () => {
  const { loading, error, isFallback, orderedTeamNames, groupedDrivers } = useDriversData(2025);
  const [selectedTeam, setSelectedTeam] = useState<string>('All');
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const teamsToRender = selectedTeam === 'All' ? orderedTeamNames : [selectedTeam];
  const filterTabs = ['All', ...orderedTeamNames];

  const checkScrollability = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollWidth, clientWidth, scrollLeft } = scrollContainerRef.current;
      // Show arrow if there's more content to the right
      setCanScrollRight(scrollWidth > clientWidth && scrollLeft < scrollWidth - clientWidth - 1);
    }
  }, []);

  const scrollRight = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  }, []);
  
  useEffect(() => {
    const handleResizeAndScroll = () => checkScrollability();
    const scrollContainer = scrollContainerRef.current;
    
    window.addEventListener('resize', handleResizeAndScroll);
    scrollContainer?.addEventListener('scroll', handleResizeAndScroll);

    const timer = setTimeout(checkScrollability, 100); // Initial check

    return () => {
      window.removeEventListener('resize', handleResizeAndScroll);
      scrollContainer?.removeEventListener('scroll', handleResizeAndScroll);
      clearTimeout(timer);
    };
  }, [orderedTeamNames, checkScrollability]);


  return (
    <Box bg="bg-primary" color="text-primary" minH="100vh" py="lg">
      <Container maxW="1600px">
        {isFallback && <FallbackBanner />}
        {loading && <F1LoadingSpinner text="Loading Drivers..." />}
        {!loading && error && !isFallback && (
          <Text color="brand.redLight" textAlign="center" fontSize="1.2rem" p="xl">{error}</Text>
        )}
        {!loading && (!error || isFallback) && (
          <>
            <Box position="relative" borderBottom="1px solid" borderColor="border-primary" mb="xl" pb={2}>
              <Box ref={scrollContainerRef} overflowX="auto" sx={{ '&::-webkit-scrollbar': { display: 'none' }, 'scrollbarWidth': 'none' }}>
                <HStack spacing="4" minW="max-content" w="max-content">
                  {filterTabs.map(team => (
                    <Button
                      key={team}
                      variant="ghost"
                      onClick={() => setSelectedTeam(team)}
                      isActive={selectedTeam === team}
                      fontFamily="heading"
                      fontWeight="bold"
                      color="text-muted"
                      px="4"
                      py="sm"
                      borderRadius={0}
                      borderBottom="3px solid"
                      borderColor={selectedTeam === team ? 'brand.red' : 'transparent'}
                      _active={{ color: 'text-primary' }}
                      _hover={{ color: 'text-primary', bg: 'transparent' }}
                      sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                      isDisabled={isFallback}
                    >
                      {team}
                    </Button>
                  ))}
                </HStack>
              </Box>
              
              {canScrollRight && !isFallback && (
                 <Box
                    position="absolute"
                    right="-16px"
                    top="50%"
                    transform="translateY(-50%)"
                    w="50px"
                    display="flex"
                    alignItems="center"
                    justifyContent="flex-end"
                    pointerEvents="none"
                  >
                  <Button
                    pointerEvents="auto"
                    minW="auto"
                    h="auto"
                    p="1"
                    borderRadius="full"
                    bg="bg-primary"
                    border="1px solid"
                    borderColor="border-primary"
                    boxShadow="md"
                    onClick={scrollRight}
                    _hover={{ transform: 'scale(1.1)' }}
                  >
                    <Icon as={ChevronRight} boxSize={5} color="text-muted" />
                  </Button>
                </Box>
              )}
            </Box>

            <VStack spacing="xl" align="stretch">
              {teamsToRender.length > 0 ? (
                teamsToRender.map(teamName => {
                  const driversInTeam = groupedDrivers[teamName];
                  if (!driversInTeam || driversInTeam.length === 0) return null;

                  return (
                    <VStack key={teamName} align="stretch">
                      <TeamBanner 
                        teamName={teamName}
                        teamColor={teamColors[teamName] || teamColors['Default']}
                      />
                      <SimpleGrid columns={{ base: 1, md: 2 }} gap="lg">
                        {driversInTeam.map(driver => {
                          const driverCardData = {
                            id: driver.id.toString(),
                            name: driver.fullName,
                            number: driver.driverNumber ? String(driver.driverNumber) : 'N/A',
                            team: driver.teamName,
                            nationality: driver.countryCode || 'N/A',
                            image: driver.headshotUrl,
                            team_color: driver.teamColor,
                          };
                          
                          return (
                            <Link 
                              key={driver.id}
                              // ENSURE THIS USES THE NUMERIC ID, NOT A SLUG
                              to={`/drivers/${driver.id}`} 
                            >
                              <DriverProfileCard driver={driverCardData} />
                            </Link>
                          );
                        })}
                      </SimpleGrid>
                    </VStack>
                  );
                })
              ) : (
                  <Text textAlign="center">No drivers found for the selected team.</Text>
              )}
            </VStack>
          </>
        )}
      </Container>
    </Box>
  );
};

export default Drivers;