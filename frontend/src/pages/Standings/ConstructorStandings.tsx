// src/pages/Standings/ConstructorStandings.tsx
import React, { useState, useMemo } from 'react';
import { useToast, Box, Flex, Heading } from '@chakra-ui/react';
import StandingsTabs from '../../components/Standings/StandingsTabs';
import SearchableSelect from '../../components/DropDownSearch/SearchableSelect';
import type { SelectOption } from '../../components/DropDownSearch/SearchableSelect';
// import { useNavigate } from 'react-router-dom';
import F1LoadingSpinner from '../../components/F1LoadingSpinner/F1LoadingSpinner';
// import { teamColors } from '../../lib/teamColors';
import { useConstructorStandings } from '../../hooks/useConstructorStandings';
import ConstructorStandingCard from '../../components/Standings/ConstructorStandingCard';

// Interfaces
interface UiConstructorStanding {
  position: number;
  points: number;
  wins: number;
  constructorId: number;
  constructorName: string;
  nationality?: string; // not present in materialized view currently
}

type GroupedConstructors = { [teamName: string]: UiConstructorStanding[] };
type SeasonOption = SelectOption & { value: number };

// Normalize backend URL to guarantee a trailing slash
// Removed bespoke BACKEND_URL logic; using buildApiUrl for all requests.

const ConstructorStandings: React.FC = () => {
  const toast = useToast();
  // const navigate = useNavigate();

  const [standings, setStandings] = useState<UiConstructorStanding[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number>(new Date().getFullYear());
  const { standings: supaStandings, loading, error } = useConstructorStandings(selectedSeason);

  // Generate season options from 2025 → 1950
  const seasonOptions: SeasonOption[] = useMemo(() => {
    const options: SeasonOption[] = [];
    for (let year = 2025; year >= 1950; year--) {
      options.push({ value: year, label: year.toString() });
    }
    return options;
  }, []);

  React.useEffect(() => {
    if (supaStandings) {
      const mapped: UiConstructorStanding[] = supaStandings.map(row => ({
        position: row.position,
        points: Number(row.seasonPoints) || 0,
        wins: row.seasonWins,
        constructorId: row.constructorId,
        constructorName: row.constructorName,
      }));
      setStandings(mapped);
    }
  }, [supaStandings]);

  React.useEffect(() => {
    if (error) {
      toast({
        title: 'Failed to fetch constructor standings',
        description: error,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [error, toast]);

  const { orderedTeamNames, groupedConstructors } = useMemo(() => {
    const groups: GroupedConstructors = {};
    standings.forEach((standing) => {
      const team = standing.constructorName;
      if (!groups[team]) groups[team] = [];
      groups[team].push(standing);
    });
    const orderedTeams = [...new Set(standings.map((s) => s.constructorName))];
    return { orderedTeamNames: orderedTeams, groupedConstructors: groups };
  }, [standings]);

  const teamsToRender = orderedTeamNames;

  // No internal tab state; navigation handled by component buttons

  if (loading) return <F1LoadingSpinner text="Loading Constructor Standings..." />;

  return (
    <Box p={["4", "6", "8"]} fontFamily="var(--font-display)">
      <Heading mb={6} color="white">Formula 1 Championship Standings</Heading>
      <StandingsTabs active="constructors" />

      <Box mb={4} maxW="220px">
        <SearchableSelect
          label="Select Season"
          options={seasonOptions}
          value={seasonOptions.find(o => o.value === selectedSeason) || null}
          onChange={(option) => setSelectedSeason(Number((option as SeasonOption).value))}
          isClearable={false}
        />
      </Box>

      <Flex flexDirection="column" gap={3} overflowX="auto">
        {teamsToRender.flatMap(teamName => {
          const constructors = groupedConstructors[teamName];
          if (!constructors) return [];
          return constructors
            .sort((a, b) => a.position - b.position)
            .map(standing => (
              <ConstructorStandingCard
                key={standing.constructorId}
                constructorId={standing.constructorId}
                position={standing.position}
                constructorName={standing.constructorName}
                points={standing.points}
                wins={standing.wins}
              />
            ));
        })}
      </Flex>
    </Box>
  );
};

export default ConstructorStandings;






















