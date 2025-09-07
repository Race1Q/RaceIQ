// frontend/src/pages/Drivers/Drivers.tsx

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useToast, Box, Text, Container, SimpleGrid, VStack, HStack, Button, Icon } from '@chakra-ui/react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import F1LoadingSpinner from '../../components/F1LoadingSpinner/F1LoadingSpinner';
import DriverProfileCard from '../../components/DriverProfileCard/DriverProfileCard';
import TeamBanner from '../../components/TeamBanner/TeamBanner';
import { teamColors } from '../../lib/teamColors';
import { driverHeadshots } from '../../lib/driverHeadshots';
import { teamLogoMap } from '../../lib/teamAssets';
import { buildApiUrl } from '../../lib/api';

// Interfaces
interface ApiDriver { id: number; full_name: string; driver_number: number | null; country_code: string | null; team_name: string; }
interface Driver extends ApiDriver { headshot_url: string; team_color: string; }
type GroupedDrivers = { [teamName: string]: Driver[] };

const Drivers = () => {
  const toast = useToast();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string>("All");
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const publicFetch = useCallback(async (url: string) => {
      const response = await fetch(url);
      if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`Failed to fetch data: ${response.status} ${response.statusText} - ${errorBody}`);
      }
      return response.json();
  }, []);

  useEffect(() => {
    const fetchAndProcessDrivers = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiDrivers: ApiDriver[] = await publicFetch(buildApiUrl('/api/drivers/by-standings/2025'));
        const hydratedDrivers = apiDrivers.map(driver => ({
          ...driver,
          headshot_url: driverHeadshots[driver.full_name] || "",
          team_color: teamColors[driver.team_name] || teamColors["Default"],
        }));
        setDrivers(hydratedDrivers);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
        setError(errorMessage);
        toast({
          title: 'Error fetching drivers', description: errorMessage,
          status: 'error', duration: 5000, isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAndProcessDrivers();
  }, [publicFetch, toast]);

  const { orderedTeamNames, groupedDrivers } = useMemo(() => {
    const groups = drivers.reduce<GroupedDrivers>((acc, driver) => {
      const team = driver.team_name;
      if (!acc[team]) acc[team] = [];
      acc[team].push(driver);
      return acc;
    }, {});
    const orderedTeams = [...new Set(drivers.map(d => d.team_name))];
    return { orderedTeamNames: orderedTeams, groupedDrivers: groups };
  }, [drivers]);

  const teamsToRender = selectedTeam === 'All' ? orderedTeamNames : [selectedTeam];
  const filterTabs = ["All", ...orderedTeamNames];

  // Check if there's more content to scroll
  const checkScrollability = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollRight(scrollWidth > clientWidth);
    }
  }, []);

  // Scroll to the right
  const scrollRight = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 200,
        behavior: 'smooth'
      });
    }
  }, []);

  // Check scrollability when teams change
  useEffect(() => {
    // Add a small delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      checkScrollability();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [filterTabs, checkScrollability]);

  // Check scrollability on window resize
  useEffect(() => {
    const handleResize = () => {
      checkScrollability();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [checkScrollability]);

  return (
    <Box bg="bg-primary" color="text-primary" minH="100vh" py="lg">
      <Container maxW="1600px">
        {loading && <F1LoadingSpinner text="Loading Drivers..." />}
        {error && <Text color="brand.redLight" textAlign="center" fontSize="1.2rem" p="xl">{error}</Text>}
        
        {!loading && !error && (
          <>
            <Box
              position="relative"
              borderBottom="1px solid"
              borderColor="border-primary"
              mb="xl"
              pb={2}
            >
              <Box
                ref={scrollContainerRef}
                overflowX="auto"
                sx={{ '&::-webkit-scrollbar': { display: 'none' }, 'scrollbarWidth': 'none' }}
                onScroll={checkScrollability}
              >
              <HStack
                spacing="4"
                minW="max-content"
                w="max-content"
              >
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
                >
                  {team}
                </Button>
              ))}
              </HStack>
              </Box>
              
              {/* Scroll indicator */}
              {canScrollRight && (
                <Box
                  position="absolute"
                  right="0"
                  top="50%"
                  transform="translateY(-50%)"
                  w="50px"
                  bgGradient="linear(to-r, transparent, bg-primary)"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  zIndex="1"
                >
                  <Button
                    bg="bg-primary"
                    borderRadius="full"
                    p="2"
                    boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
                    border="1px solid"
                    borderColor="border-primary"
                    onClick={scrollRight}
                    _hover={{
                      bg: "whiteAlpha.100",
                      transform: "scale(1.05)"
                    }}
                    _active={{
                      transform: "scale(0.95)"
                    }}
                    transition="all 0.2s ease"
                    minW="auto"
                    h="auto"
                  >
                    <Icon
                      as={ChevronRight}
                      boxSize={4}
                      color="text-muted"
                      opacity="0.8"
                    />
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
                        logoUrl={teamLogoMap[teamName] || ''}
                        teamColor={teamColors[teamName] || teamColors['Default']}
                      />
                      <SimpleGrid columns={{ base: 1, md: 2 }} gap="lg">
                        {driversInTeam.map(driver => {
                          const driverSlug = driver.full_name.toLowerCase().replace(/ /g, '_');
                          
                          const driverCardData = {
                            id: driver.full_name.toLowerCase().replace(/ /g, '_'),
                            name: driver.full_name,
                            number: driver.driver_number ? String(driver.driver_number) : 'N/A',
                            team: driver.team_name,
                            nationality: driver.country_code || 'N/A',
                            image: driver.headshot_url,
                            team_color: driver.team_color,
                          };
                          
                          return (
                            <Link 
                              key={driver.id}
                              to={`/drivers/${driverSlug}`} 
                              state={{ driverId: driver.id }}
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
                  <Text textAlign="center">No drivers found.</Text>
              )}
            </VStack>
          </>
        )}
      </Container>
    </Box>
  );
};

export default Drivers;