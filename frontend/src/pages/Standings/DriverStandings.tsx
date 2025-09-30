// src/pages/DriverStandings.tsx
import React, { useState, useMemo } from 'react';
import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import StandingsTabs from '../../components/Standings/StandingsTabs';
import SearchableSelect from '../../components/DropDownSearch/SearchableSelect';
import type { SelectOption } from '../../components/DropDownSearch/SearchableSelect';
// import { useNavigate } from 'react-router-dom';
import F1LoadingSpinner from '../../components/F1LoadingSpinner/F1LoadingSpinner';
// import { teamColors } from '../../lib/teamColors';
import DriverStandingCard from '../../components/Standings/DriverStandingCard';
import { useDriverStandings } from '../../hooks/useDriverStandings';

type SeasonOption = SelectOption & { value: number };

const DriverStandingsPage: React.FC = () => {
  // const navigate = useNavigate();
  const [selectedSeason, setSelectedSeason] = useState<number>(new Date().getFullYear());

  const { standings: rawStandings, loading, error } = useDriverStandings(selectedSeason);

  const standings = useMemo(() => {
    return rawStandings.map(d => ({
      id: d.id,
      fullName: d.fullName,
      number: d.number,
      country: d.country,
      profileImageUrl: d.profileImageUrl,
      constructor: d.constructor,
      points: d.points,
      wins: d.wins,
      podiums: d.podiums,
      position: d.position,
      seasonYear: d.seasonYear
    }));
  }, [rawStandings]);

  const seasonOptions: SeasonOption[] = useMemo(() => {
    const options: SeasonOption[] = [];
    for (let year = 2025; year >= 1950; year--) {
      options.push({ value: year, label: year.toString() });
    }
    return options;
  }, []);

  // Determine active tab based on current path (deep link support)
  // no internal tab state; we navigate to constructors page for second view

  return (
    <Box p={["4", "6", "8"]} fontFamily="var(--font-display)">
      <Heading mb={6} color="white" textAlign="left">
        Formula 1 Championship Standings
      </Heading>

      <StandingsTabs active="drivers" />

      <Flex mb={4} alignItems="center" justifyContent="space-between">
        <Box maxW="220px">
          <SearchableSelect
            label="Select Season"
            options={seasonOptions}
            value={seasonOptions.find(o => o.value === selectedSeason) || null}
            onChange={(option) => setSelectedSeason(Number((option as SeasonOption).value))}
            isClearable={false}
          />
        </Box>
      </Flex>

      {loading && <F1LoadingSpinner text="Loading Driver Standings..." />}

      {!loading && standings.length > 0 && (
        <Flex flexDirection="column" gap={3} overflowX="auto">
          {standings
            .sort((a, b) => a.position - b.position)
            .map(driver => (
              <DriverStandingCard
                key={driver.id}
                id={driver.id}
                position={driver.position}
                fullName={driver.fullName}
                constructor={driver.constructor}
                points={driver.points}
                wins={driver.wins}
                podiums={driver.podiums}
                profileImageUrl={driver.profileImageUrl}
              />
            ))}
        </Flex>
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
    </Box>
  );
};

export default DriverStandingsPage;






  

