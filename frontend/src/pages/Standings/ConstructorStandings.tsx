// src/pages/Standings/ConstructorStandings.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast, Box, Flex, Text, Heading, Button } from '@chakra-ui/react';
import SearchableSelect from '../../components/DropDownSearch/SearchableSelect';
import type { SelectOption } from '../../components/DropDownSearch/SearchableSelect';
import { useNavigate } from 'react-router-dom';
import F1LoadingSpinner from '../../components/F1LoadingSpinner/F1LoadingSpinner';
import { teamColors } from '../../lib/teamColors';
import { useAuth0 } from '@auth0/auth0-react';

// Interfaces
interface ApiConstructor {
  id: number;
  constructor_id: string; // for navigation
  name: string;
  nationality: string;
}

interface ConstructorStanding {
  position: number;
  points: number;
  wins: number;
  constructor: ApiConstructor;
}

type GroupedConstructors = { [teamName: string]: ConstructorStanding[] };
type SeasonOption = SelectOption & { value: number };

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const ConstructorStandings: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { getAccessTokenSilently } = useAuth0();

  const [standings, setStandings] = useState<ConstructorStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState<number>(new Date().getFullYear());

  // Generate season options from 2025 → 1950
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
          scope: 'read:standings',
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
    const fetchStandings = async () => {
      setLoading(true);
      try {
        const data = await authedFetch(
          `${BACKEND_URL}api/standings/constructors/season/${selectedSeason}`
        );

        // Map backend `team` → frontend `constructor`
        const mappedData: ConstructorStanding[] = (data || []).map((s: any) => ({
          position: s.position,
          points: s.points,
          wins: s.wins,
          constructor: {
            id: s.team.id,
            constructor_id: s.team.id.toString(), // for navigation
            name: s.team.name,
            nationality: s.team.nationality,
          },
        }));

        setStandings(mappedData);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
        toast({
          title: 'Failed to fetch constructor standings',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStandings();
  }, [authedFetch, selectedSeason, toast]);

  const { orderedTeamNames, groupedConstructors } = useMemo(() => {
    const groups: GroupedConstructors = {};
    standings.forEach((standing) => {
      const team = standing.constructor.name;
      if (!groups[team]) groups[team] = [];
      groups[team].push(standing);
    });
    const orderedTeams = [...new Set(standings.map((s) => s.constructor.name))];
    return { orderedTeamNames: orderedTeams, groupedConstructors: groups };
  }, [standings]);

  const teamsToRender = orderedTeamNames;

  if (loading) return <F1LoadingSpinner text="Loading Constructor Standings..." />;

  return (
    <Box p={['4', '6', '8']} fontFamily="var(--font-display)">
      {/* Season Selector */}
      <Flex mb={4} alignItems="center" justifyContent="space-between">
        <Box mb={4} maxW="220px">
        <SearchableSelect
          label="Select Season"
          options={seasonOptions}
          value={seasonOptions.find((o) => o.value === selectedSeason) || null}
          onChange={(option) => {
            if (option && (option as SeasonOption).value) {
              setSelectedSeason(Number((option as SeasonOption).value));
            }
          }}
          isClearable={false}
        />
      </Box>

      <Heading mb={6} color="white" textAlign="center">
        Formula 1 Constructor Championship Standings
      </Heading>
            <Button size="sm" onClick={() => navigate(-1)}>
            ← Back to Standings
      </Button>
      </Flex>
    
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
        <Text>Constructor</Text>
        <Text textAlign="right">Points</Text>
        <Text textAlign="right">Wins</Text>
        <Text textAlign="right">Nationality</Text>
      </Flex>

      {/* Constructor Bars */}
      <Flex flexDirection="column" gap={3} overflowX="auto">
        {teamsToRender.map((teamName) => {
          const constructors = groupedConstructors[teamName];
          if (!constructors || constructors.length === 0) return null;

          const teamColor = `#${teamColors[teamName] || teamColors.Default}`;
          const textColor = '#fff';

          return constructors
            .sort((a, b) => a.position - b.position)
            .map((standing) => (
              <Flex
                key={standing.constructor.constructor_id}
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
                  cursor: 'pointer',
                }}
                color={textColor}
                display="grid"
                gridTemplateColumns="60px 1fr 100px 80px 1fr"
                columnGap={4}
                onClick={() => navigate(`/constructors/${standing.constructor.constructor_id}`)}
              >
                <Text textAlign="center">{standing.position}</Text>
                <Text>{standing.constructor.name}</Text>
                <Text textAlign="right">{standing.points}</Text>
                <Text textAlign="right">{standing.wins}</Text>
                <Text textAlign="right">{standing.constructor.nationality}</Text>
              </Flex>
            ));
        })}
      </Flex>
    </Box>
  );
};

export default ConstructorStandings;

























