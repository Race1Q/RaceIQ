// src/pages/Standings/ConstructorStandings.tsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useToast, Box, Flex, Text } from '@chakra-ui/react';
import StandingsTabs from '../../components/Standings/StandingsTabs';
import SearchableSelect from '../../components/DropDownSearch/SearchableSelect';
import type { SelectOption } from '../../components/DropDownSearch/SearchableSelect';
// import { useNavigate } from 'react-router-dom';
import StandingsSkeleton from './StandingsSkeleton';
// import { teamColors } from '../../lib/teamColors';
import { useConstructorStandings } from '../../hooks/useConstructorStandings';
import { useResolvedDefaultSeasonYear } from '../../hooks/useResolvedDefaultSeasonYear';
import { getCalendarSeasonYear } from '../../lib/seasonYear';
import ConstructorStandingCard from '../../components/Standings/ConstructorStandingCard';
import LayoutContainer from '../../components/layout/LayoutContainer';
import PageHeader from '../../components/layout/PageHeader';
import PendingSeasonDataBanner from '../../components/PendingSeasonDataBanner/PendingSeasonDataBanner';

// Interfaces
interface UiConstructorStanding {
  position: number;
  points: number;
  wins: number;
  podiums: number;
  constructorId: number;
  constructorName: string;
  nationality: string;
}

type GroupedConstructors = { [teamName: string]: UiConstructorStanding[] };
type SeasonOption = SelectOption & { value: number };

// Normalize backend URL to guarantee a trailing slash
// Removed bespoke BACKEND_URL logic; using buildApiUrl for all requests.

const ConstructorStandings: React.FC = () => {
  const toast = useToast();
  // const navigate = useNavigate();

  const [standings, setStandings] = useState<UiConstructorStanding[]>([]);
  const { defaultSeasonYear, loading: resolvingDefaultSeason } = useResolvedDefaultSeasonYear();
  const [selectedSeason, setSelectedSeason] = useState<number>(getCalendarSeasonYear());
  const appliedDefaultSeason = useRef(false);

  useEffect(() => {
    if (!resolvingDefaultSeason && !appliedDefaultSeason.current) {
      appliedDefaultSeason.current = true;
      setSelectedSeason(defaultSeasonYear);
    }
  }, [resolvingDefaultSeason, defaultSeasonYear]);

  const { standings: supaStandings, loading, error } = useConstructorStandings(selectedSeason);

  // Generate season options (include current calendar year when ahead of 2025)
  const seasonOptions: SeasonOption[] = useMemo(() => {
    const options: SeasonOption[] = [];
    const cal = getCalendarSeasonYear();
    for (let year = Math.max(2025, cal); year >= 2000; year--) {
      options.push({ value: year, label: year.toString() });
    }
    return options;
  }, []);

  useEffect(() => {
    if (supaStandings) {
      const mapped: UiConstructorStanding[] = supaStandings.map(row => ({
        position: row.position,
        points: Number(row.seasonPoints) || 0,
        wins: row.seasonWins,
        podiums: row.seasonPodiums || 0,
        constructorId: row.constructorId,
        constructorName: row.constructorName,
        nationality: row.nationality || '',
      }));
      setStandings(mapped);
    }
  }, [supaStandings]);

  useEffect(() => {
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

  return (
    <Box
      sx={{
        background: `
          radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0),
          linear-gradient(45deg, #0a0a0a 25%, transparent 25%, transparent 75%, #0a0a0a 75%),
          linear-gradient(-45deg, #0a0a0a 25%, transparent 25%, transparent 75%, #0a0a0a 75%)
        `,
        backgroundSize: '20px 20px, 20px 20px, 20px 20px',
        backgroundColor: '#0a0a0a',
        _light: {
          background: `
            radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 0),
            linear-gradient(45deg, #f8f9fa 25%, transparent 25%, transparent 75%, #f8f9fa 75%),
            linear-gradient(-45deg, #f8f9fa 25%, transparent 25%, transparent 75%, #f8f9fa 75%)
          `,
          backgroundSize: '20px 20px, 20px 20px, 20px 20px',
          backgroundColor: '#f8f9fa',
        }
      }}
    >
      <PageHeader 
        title="Formula 1 Championship Standings" 
        subtitle="Explore F1 Constructor Standings and statistics"
      />
      <LayoutContainer>
        <PendingSeasonDataBanner
          defaultSeasonYear={defaultSeasonYear}
          loading={resolvingDefaultSeason}
        />
        <Flex 
          mb={12} 
          alignItems="flex-end" 
          justifyContent="space-between" 
          flexDirection={{ base: 'column', md: 'row' }} 
          gap={4}
          wrap="wrap"
        >
          <StandingsTabs active="constructors" />
          <Box maxW={{ base: 'full', md: '220px' }} w="full">
            <SearchableSelect
              label="Select Season"
              options={seasonOptions}
              value={seasonOptions.find(o => o.value === selectedSeason) || null}
              onChange={(option) => setSelectedSeason(Number((option as SeasonOption).value))}
              isClearable={false}
            />
          </Box>
        </Flex>

  {loading && <StandingsSkeleton type="constructors" text="Loading Constructor Standings..." />}

      {!loading && (
        <Box>
          {/* Mobile scroll indicator */}
          <Box 
            display={{ base: "block", md: "none" }}
            textAlign="center" 
            mb={2}
            color="text-muted"
            fontSize="xs"
          >
            👆 Scroll to see more teams
          </Box>
          <Flex 
            flexDirection="column" 
            gap={{ base: 2, md: 3 }}
            pb={{ base: 4, md: 0 }} // Extra padding on mobile for better scroll
          >
            {teamsToRender.flatMap(teamName => {
              const constructors = groupedConstructors[teamName];
              if (!constructors) return [];
              return [...constructors]
                .sort((a, b) => a.position - b.position)
                .map(standing => (
                    <ConstructorStandingCard
                      key={standing.constructorId}
                      constructorId={standing.constructorId}
                      position={standing.position}
                      constructorName={standing.constructorName}
                      nationality={standing.nationality}
                      points={standing.points}
                      wins={standing.wins}
                      podiums={standing.podiums}
                    />
                ));
            })}
          </Flex>
        </Box>
      )}


      {/* Show non-fatal error message */}
      {error && error.includes("No constructor data found") && (
        <Text
          mt={4}
          textAlign="center"
          color="red.500"
          fontWeight="bold"
          position="fixed"
          bottom="20px"
          left="50%"
          transform="translateX(-50%)"
        >
          {error}
        </Text>
      )}

      {/* Show other errors (fatal) */}
      {error && !error.includes("No constructor data found") && (
        <Text mt={4} textAlign="center" color="red.500" fontWeight="bold">
          {error}
        </Text>
      )}
      </LayoutContainer>
    </Box>
  );
};

export default ConstructorStandings;






















