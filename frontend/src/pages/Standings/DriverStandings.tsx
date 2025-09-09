// src/pages/Standings/DriverStandings.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useToast, Box, Flex, Text, Button } from '@chakra-ui/react';
import { Select } from 'chakra-react-select';
import { Link } from 'react-router-dom';
import F1LoadingSpinner from '../../components/F1LoadingSpinner/F1LoadingSpinner';
import { teamColors } from '../../lib/teamColors';

// Interfaces
export interface ApiDriver {
  id: number;
  driver_number: number | null;
  first_name: string;
  last_name: string;
  name_acronym: string | null;
  country_code: string | null;
  date_of_birth: string;
  full_name?: string;
  team_name: string;
}

export interface DriverStanding {
  id?: number;
  race_id: number;
  driver_id: number;
  points: number;
  position: number;
  season: number;
  wins: number;
  driver?: ApiDriver;
}

type SeasonOption = { value: number; label: string };

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const DriverStandings: React.FC = () => {
  const { getAccessTokenSilently } = useAuth0();
  const toast = useToast();

  const [standings, setStandings] = useState<DriverStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState<number>(new Date().getFullYear());

  const seasonOptions: SeasonOption[] = useMemo(() => {
    const options: SeasonOption[] = [];
    for (let year = 2025; year >= 1950; year--) {
      options.push({ value: year, label: year.toString() });
    }
    return options;
  }, []);

  const authedFetch = useCallback(
    async (url: string) => {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          scope: 'read:driverStandings read:drivers',
        },
      });

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `Failed to fetch data: ${response.status} ${response.statusText} - ${errorBody}`
        );
      }
      return response.json();
    },
    [getAccessTokenSilently]
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const standingsData: DriverStanding[] = await authedFetch(
          `${BACKEND_URL}/api/driver-standings/${selectedSeason}`
        );

        const driversData: ApiDriver[] = await authedFetch(
          `${BACKEND_URL}/api/drivers/by-standings/${selectedSeason}`
        );

        const enriched = standingsData.map((s) => {
          const driver = driversData.find((d) => d.id === s.driver_id);
          return { ...s, driver };
        });

        setStandings(enriched.sort((a, b) => a.position - b.position));
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'An unexpected error occurred.';
        toast({
          title: 'Failed to fetch driver standings',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authedFetch, selectedSeason, toast]);

  if (loading) return <F1LoadingSpinner text="Loading Driver Standings..." />;

  return (
    <Box p={['4', '6', '8']} fontFamily="var(--font-display)">
      {/* Back Button */}
      <Button as={Link} to="/standings" mb={4} colorScheme="gray">
        ← Back to Standings
      </Button>

      {/* Season Selector */}
      <Box mb={4} maxW="200px">
        <Select
          options={seasonOptions}
          value={seasonOptions.find((o) => o.value === selectedSeason) || null}
          onChange={(option) => setSelectedSeason((option as SeasonOption).value)}
          placeholder="Select season"
          isClearable={false}
          chakraStyles={{
            control: (provided) => ({
              ...provided,
              bg: 'gray.700',
              color: 'white',
              borderColor: 'gray.600',
            }),
            menu: (provided) => ({ ...provided, bg: 'gray.700', color: 'white' }),
            option: (provided, state) => ({
              ...provided,
              bg: state.isFocused ? 'gray.600' : 'gray.700',
              color: 'white',
            }),
            singleValue: (provided) => ({ ...provided, color: 'white' }),
          }}
        />
      </Box>

      {/* Header Row */}
      <Flex
        minW="700px"
        px={4}
        py={4}
        bg="gray.800"
        borderRadius="md"
        fontWeight="bold"
        color="#fff"
        display="grid"
        gridTemplateColumns="60px 1fr 100px 80px 1fr"
        columnGap={4}
        mb={2}
      >
        <Text textAlign="center">#</Text>
        <Text>Driver</Text>
        <Text textAlign="right">Points</Text>
        <Text textAlign="right">Wins</Text>
        <Text textAlign="right">Constructor</Text>
      </Flex>

      {/* Driver Standings Rows */}
      <Flex flexDirection="column" gap={3} overflowX="auto">
        {standings.map((standing) => {
          const driverName = standing.driver?.full_name ?? 'Unknown Driver';
          const driverSlug = driverName.toLowerCase().replace(/ /g, '_');
          const constructorName = standing.driver?.team_name ?? 'Unknown';
          const teamColor = `#${teamColors[constructorName] || teamColors.Default}`;

          return (
            <Link
              key={`${standing.season}-${standing.driver_id}`}
              to={`/drivers/${driverSlug}`}
            >
              <Flex
                minW="700px"
                px={4}
                py={4}
                bgGradient={`linear(to-br, ${teamColor} 0%, rgba(0,0,0,0.2) 100%)`}
                borderRadius="xl"
                alignItems="center"
                justifyContent="space-between"
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: 'lg',
                  transition: 'all 0.2s ease-in-out',
                }}
                color="#fff"
                display="grid"
                gridTemplateColumns="60px 1fr 100px 80px 1fr"
                columnGap={4}
              >
                <Text textAlign="center">{standing.position}</Text>
                <Text>{driverName}</Text>
                <Text textAlign="right">{standing.points}</Text>
                <Text textAlign="right">{standing.wins}</Text>
                <Text textAlign="right">{constructorName}</Text>
              </Flex>
            </Link>
          );
        })}
      </Flex>
    </Box>
  );
};

export default DriverStandings;












