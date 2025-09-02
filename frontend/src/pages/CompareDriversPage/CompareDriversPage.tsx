// frontend/src/pages/CompareDriversPage/CompareDriversPage.tsx

import { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {
  Box,
  Heading,
  Grid,
  Select,
  Text,
  VStack,
  Image,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useToast,
} from '@chakra-ui/react';

// Import project-specific components and helpers
import { buildApiUrl } from '../../lib/api';
import { driverHeadshots } from '../../lib/driverHeadshots';
// We will get team colors from the theme, so the old map is not needed here.
import F1LoadingSpinner from '../../components/F1LoadingSpinner/F1LoadingSpinner';

// Interfaces for our data types
interface DriverListItem {
  id: number;
  full_name: string;
}

interface DriverDetails {
  id: number;
  fullName: string;
  teamName: string;
  wins: number;
  podiums: number;
  points: number;
  championshipStanding: string;
  imageUrl: string;
  teamColorToken: string; // We will store the Chakra theme color token
}

const CompareDriversPage = () => {
  const { getAccessTokenSilently } = useAuth0();
  const toast = useToast();

  // State Management
  const [allDrivers, setAllDrivers] = useState<DriverListItem[]>([]);
  const [driver1, setDriver1] = useState<DriverDetails | null>(null);
  const [driver2, setDriver2] = useState<DriverDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reusable authenticated fetch hook
  const authedFetch = useCallback(async (path: string) => {
    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        scope: "read:drivers",
      },
    });
    const response = await fetch(buildApiUrl(path), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
  }, [getAccessTokenSilently]);

  // Effect 1: Fetch the list of all drivers for the dropdowns
  useEffect(() => {
    const fetchDriverList = async () => {
      setLoading(true);
      try {
        const driversList = await authedFetch('/api/drivers/by-standings/2025');
        setAllDrivers(driversList.map((d: any) => ({ id: d.id, full_name: d.full_name })));
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Could not load drivers list.';
        setError(msg);
        toast({ title: 'Error', description: msg, status: 'error', variant: 'solid' });
      } finally {
        setLoading(false);
      }
    };
    fetchDriverList();
  }, [authedFetch, toast]);
  
  // Helper function to fetch and process data for a single driver
  const fetchAndSetDriverData = async (driverId: string, setDriver: React.Dispatch<React.SetStateAction<DriverDetails | null>>) => {
    if (!driverId) {
      setDriver(null);
      return;
    }
    setLoading(true);
    try {
      const [details, performance] = await Promise.all([
        authedFetch(`/api/drivers/${driverId}/details`),
        authedFetch(`/api/drivers/${driverId}/performance/2025`),
      ]);
      
      // PLEASE NOTE: Replace 'teams.default' with your actual theme token path
      const teamColorToken = `teams.${details.team?.name?.toLowerCase().replace(/ /g, '')}` || 'red.500';

      const hydratedData: DriverDetails = {
        id: details.driverId ?? details.id ?? Number(driverId),
        fullName: details.fullName ?? details.full_name,
        teamName: details.team?.name ?? details.teamName,
        wins: details.careerStats?.wins ?? details.total_wins ?? 0,
        podiums: details.careerStats?.podiums ?? details.total_podiums ?? 0,
        points: details.careerStats?.totalPoints ?? details.total_points ?? 0,
        championshipStanding: `P${performance.championshipStanding ?? performance.position ?? ''}`,
        imageUrl: driverHeadshots[details.fullName ?? details.full_name] || '',
        teamColorToken: teamColorToken,
      };
      setDriver(hydratedData);
    } catch (err) {
      const msg = err instanceof Error ? err.message : `Failed to load data for driver ${driverId}.`;
      setError(msg);
      toast({ title: 'Error', description: msg, status: 'error', variant: 'solid' });
    } finally {
      setLoading(false);
    }
  };

  // Renders a single driver selection panel using Chakra components
  const renderSelectionPanel = (driver: DriverDetails | null, setDriverFunc: (id: string) => void, title: string) => (
    <VStack spacing="md" bg="bg-surface" p="lg" borderRadius="md" w="100%" align="stretch">
      <Heading size="md" borderBottomWidth="2px" borderColor="border-primary" pb="sm">
        {title}
      </Heading>
      <Select
        placeholder="Select a Driver"
        onChange={(e) => setDriverFunc(e.target.value)}
        variant="filled"
      >
        {allDrivers.map(d => (
          <option key={d.id} value={d.id}>{d.full_name}</option>
        ))}
      </Select>
      {driver && (
        <VStack spacing="sm" bg="bg-surface-raised" p="md" borderRadius="md" borderTopWidth="5px" borderColor={driver.teamColorToken}>
          <Image
            src={driver.imageUrl}
            alt={driver.fullName}
            boxSize="150px"
            objectFit="cover"
            borderRadius="full"
            borderWidth="4px"
            borderColor="bg-surface"
          />
          <Heading size="md" color="text-primary">{driver.fullName}</Heading>
          <Text color="text-secondary">{driver.teamName}</Text>
        </VStack>
      )}
    </VStack>
  );

  return (
    <Box p={{ base: 'md', md: 'xl' }}>
      <Heading as="h1" size="2xl" textAlign="center" mb="xl" fontFamily="heading">
        Driver Comparison
      </Heading>
      
      {loading && !driver1 && !driver2 && <F1LoadingSpinner text="Loading driver list..." />}
      {error && <Text color="brand.red" textAlign="center" fontSize="lg" p="xl">{error}</Text>}
      
      <Grid
        templateColumns={{ base: '1fr', lg: '1fr auto 1fr' }}
        gap="lg"
        mb="xl"
        alignItems="flex-start"
      >
        {renderSelectionPanel(driver1, (id) => fetchAndSetDriverData(id, setDriver1), "Driver 1")}
        
        <Flex align="center" justify="center" h="150px" display={{ base: 'none', lg: 'flex' }}>
            <Heading size="3xl" color="brand.red" fontFamily="heading">VS</Heading>
        </Flex>

        {renderSelectionPanel(driver2, (id) => fetchAndSetDriverData(id, setDriver2), "Driver 2")}
      </Grid>

      {loading && (driver1 || driver2) && <F1LoadingSpinner text="Fetching driver data..." />}

      {driver1 && driver2 && (
        <Box bg="bg-surface" p="lg" borderRadius="md">
            <Heading size="xl" textAlign="center" mb="lg">Head-to-Head Comparison</Heading>
            <TableContainer>
                <Table variant="simple">
                    <Thead>
                        <Tr>
                            <Th>Statistic</Th>
                            <Th>{driver1.fullName}</Th>
                            <Th>{driver2.fullName}</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        <Tr>
                            <Td fontWeight="bold">Team</Td>
                            <Td>{driver1.teamName}</Td>
                            <Td>{driver2.teamName}</Td>
                        </Tr>
                         <Tr>
                            <Td fontWeight="bold">Championship Standing</Td>
                            <Td>{driver1.championshipStanding}</Td>
                            <Td>{driver2.championshipStanding}</Td>
                        </Tr>
                        <Tr>
                            <Td fontWeight="bold">Career Wins</Td>
                            <Td>{driver1.wins}</Td>
                            <Td>{driver2.wins}</Td>
                        </Tr>
                        <Tr>
                            <Td fontWeight="bold">Career Podiums</Td>
                            <Td>{driver1.podiums}</Td>
                            <Td>{driver2.podiums}</Td>
                        </Tr>
                        <Tr>
                            <Td fontWeight="bold">Career Points</Td>
                            <Td>{driver1.points}</Td>
                            <Td>{driver2.points}</Td>
                        </Tr>
                    </Tbody>
                </Table>
            </TableContainer>
        </Box>
      )}
    </Box>
  );
};

export default CompareDriversPage;
