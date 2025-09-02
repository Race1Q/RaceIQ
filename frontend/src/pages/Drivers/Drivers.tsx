import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useToast, Button, Box, Flex, Text, Container, SimpleGrid, VStack, HStack } from '@chakra-ui/react';
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
  const { getAccessTokenSilently, isAuthenticated, loginWithRedirect } = useAuth0();
  const toast = useToast();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string>("All");

  const authedFetch = useCallback(async (url: string) => {
      const token = await getAccessTokenSilently({
          authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE, scope: "read:drivers" },
      });
      const headers = new Headers();
      headers.set('Authorization', `Bearer ${token}`);
      const response = await fetch(url, { headers });
      if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`Failed to fetch data: ${response.status} ${response.statusText} - ${errorBody}`);
      }
      return response.json();
  }, [getAccessTokenSilently]);

  useEffect(() => {
    const fetchAndProcessDrivers = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        setError(null);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const apiDrivers: ApiDriver[] = await authedFetch(buildApiUrl('/api/drivers/by-standings/2025'));
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
  }, [authedFetch, toast, isAuthenticated]);

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

  if (!isAuthenticated) {
    return (
      <Box p={{ base: 'md', md: 'xl' }}>
        <Flex direction="column" align="center" justify="center" minH="40vh" gap={4}>
          <Text fontSize="xl" color="text-primary">Please signup / login to view drivers.</Text>
          <Button bg="brand.red" _hover={{ bg: 'brand.redDark' }} color="white" onClick={() => loginWithRedirect()}>Login</Button>
        </Flex>
      </Box>
    );
  }

  return (
    <Box bg="bg-primary" color="text-primary" minH="100vh" py="lg">
      <Container maxW="1600px">
        {loading && <F1LoadingSpinner text="Loading Drivers..." />}
        {error && <Text color="brand.redLight" textAlign="center" fontSize="1.2rem" p="xl">{error}</Text>}
        
        {!loading && !error && (
          <>
            <HStack
              spacing="lg"
              borderBottom="1px solid"
              borderColor="border-primary"
              mb="xl"
              overflowX="auto"
              pb={2}
              sx={{ '&::-webkit-scrollbar': { display: 'none' }, 'scrollbarWidth': 'none' }}
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
                  pb="sm"
                  borderRadius={0}
                  borderBottom="3px solid"
                  borderColor={selectedTeam === team ? 'brand.red' : 'transparent'}
                  _active={{ color: 'text-primary' }}
                  _hover={{ color: 'text-primary', bg: 'transparent' }}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  {team}
                </Button>
              ))}
            </HStack>

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