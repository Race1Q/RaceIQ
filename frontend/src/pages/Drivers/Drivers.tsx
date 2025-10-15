// frontend/src/pages/Drivers/Drivers.tsx

import { useState, useCallback, useEffect, useRef } from 'react';
import { Box, Text, SimpleGrid, VStack, HStack, Button, Icon, Alert, AlertIcon, AlertTitle } from '@chakra-ui/react';
import { ChevronRight, ChevronLeft, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import DriversSkeleton from './DriversSkeleton';
import DriverProfileCard from '../../components/DriverProfileCard/DriverProfileCard';
import TeamBanner from '../../components/TeamBanner/TeamBanner';
import { teamColors } from '../../lib/teamColors';
import { useDriversData } from '../../hooks/useDriversData';
import { useThemeColor } from '../../context/ThemeColorContext';
import LayoutContainer from '../../components/layout/LayoutContainer';
import PageHeader from '../../components/layout/PageHeader';

// New component for the fallback banner
const FallbackBanner = ({ accentColor }: { accentColor: string }) => (
  <Alert
    status="warning"
    variant="solid"
    bg={`#${accentColor}`}
    color="text-on-accent"
    borderRadius="md"
    mb="lg"
  >
    <AlertIcon as={AlertTriangle} color="text-on-accent" />
    <AlertTitle fontFamily="heading" fontSize="md">Live Data Unavailable. Showing cached standings.</AlertTitle>
  </Alert>
);

const Drivers = () => {
  const { loading, error, isFallback, orderedTeamNames, groupedDrivers } = useDriversData(2025);
  const { accentColor, accentColorLight, accentColorRgba } = useThemeColor();
  const [selectedTeam, setSelectedTeam] = useState<string>('All');
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const teamsToRender = selectedTeam === 'All' ? orderedTeamNames : [selectedTeam];
  const filterTabs = ['All', ...orderedTeamNames];

  const checkScrollability = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollWidth, clientWidth, scrollLeft } = scrollContainerRef.current;
      // Show arrows if there is overflow content
      setCanScrollRight(scrollWidth > clientWidth && scrollLeft < scrollWidth - clientWidth - 1);
      setCanScrollLeft(scrollLeft > 1);
    }
  }, []);

  const scrollRight = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  }, []);
  const scrollLeft = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
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
    <Box>
      <PageHeader 
        title="Drivers" 
        subtitle="Explore F1 drivers and their teams"
      />
      <LayoutContainer maxW="1600px">
        {isFallback && <FallbackBanner accentColor={accentColor} />}
  {loading && <DriversSkeleton />}
        {!loading && error && !isFallback && (
          <Text color={`#${accentColorLight}`} textAlign="center" fontSize="1.2rem" p="xl">{error}</Text>
        )}
        {!loading && (!error || isFallback) && (
          <>
            <Box position="relative" mb="xl">
              <Box ref={scrollContainerRef} overflowX="auto" sx={{ '&::-webkit-scrollbar': { display: 'none' }, 'scrollbarWidth': 'none' }}>
                <Box minW="max-content" w="max-content">
                  <HStack
                    role="tablist"
                    aria-label="Team filter"
                    bg="bg-surface"
                    border="1px solid"
                    borderColor="border-primary"
                    borderRadius="full"
                    p="6px"
                    gap={2}
                    boxShadow="shadow-md"
                  >
                    {filterTabs.map(team => {
                      const isActive = selectedTeam === team;
                      return (
                        <Button
                          key={team}
                          role="tab"
                          aria-selected={isActive}
                          variant="ghost"
                          onClick={() => setSelectedTeam(team)}
                          px={6}
                          h="44px"
                          fontWeight={600}
                          fontFamily="heading"
                          position="relative"
                          color={isActive ? 'text-on-accent' : 'text-secondary'}
                          _hover={{ color: isActive ? 'text-on-accent' : 'text-primary' }}
                          _active={{}}
                          transition="color .25s ease"
                          bg={isActive ? `#${accentColor}` : 'transparent'}
                          borderRadius="full"
                          boxShadow={isActive ? `0 6px 24px ${accentColorRgba(0.35)}, 0 0 0 1px ${accentColorRgba(0.35)} inset` : 'none'}
                          sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                          isDisabled={isFallback}
                        >
                          <Text>{team}</Text>
                        </Button>
                      );
                    })}
                  </HStack>
                </Box>
              </Box>
              {canScrollLeft && !isFallback && (
                <Box
                  position="absolute"
                  left="-16px"
                  top="50%"
                  transform="translateY(-50%)"
                  w="50px"
                  display="flex"
                  alignItems="center"
                  justifyContent="flex-start"
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
                    onClick={scrollLeft}
                    _hover={{ transform: 'scale(1.1)' }}
                  >
                    <Icon as={ChevronLeft} boxSize={5} color="text-muted" />
                  </Button>
                </Box>
              )}
              
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
                      <SimpleGrid columns={{ base: 2, sm: 2, md: 2 }} gap={{ base: 3, md: 6 }}>
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
      </LayoutContainer>
    </Box>
  );
};

export default Drivers;