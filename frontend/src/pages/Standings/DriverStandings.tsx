// src/pages/DriverStandings.tsx
import React, { useState, useMemo } from 'react';
import { Box, Flex, Text, Button } from '@chakra-ui/react';
import SearchableSelect from '../../components/DropDownSearch/SearchableSelect';
import type { SelectOption } from '../../components/DropDownSearch/SearchableSelect';
import { useNavigate } from 'react-router-dom';
import F1LoadingSpinner from '../../components/F1LoadingSpinner/F1LoadingSpinner';
import { teamColors } from '../../lib/teamColors';
import { teamLogoMap } from '@/lib/teamAssets';
import { useDriverStandings } from '../../hooks/useDriverStandings';

type SeasonOption = SelectOption & { value: number };

const DriverStandingsPage: React.FC = () => {
  const navigate = useNavigate();
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

  if (loading) return <F1LoadingSpinner text="Loading Driver Standings..." />;

  return (
    <Box p={["4", "6", "8"]} fontFamily="var(--font-display)">
      {/* Season Selector + Back Button */}
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
            <Button size="sm" onClick={() => navigate(-1)}>
            ← Back to Standings
            </Button>
            </Flex>

      {/* Show standings only if available */}
      {standings.length > 0 && (
        <>
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
            gridTemplateColumns="60px 1fr 100px 80px 80px 80px"
            columnGap={4}
            mb={2}
          >
            <Text textAlign="center">#</Text>
            <Text>Driver</Text>
            <Text textAlign="right">Points</Text>
            <Text textAlign="right">Wins</Text>
            <Text textAlign="right">Podiums</Text>
            <Text textAlign="right">Team</Text>
          </Flex>

          {/* Driver Rows */}
          <Flex flexDirection="column" gap={3} overflowX="auto">
            {standings
              .sort((a, b) => a.position - b.position)
              .map(driver => {
                const teamColor = `#${teamColors[driver.constructor] || teamColors.Default}`;
                const textColor = '#fff';

                return (
                  <Flex
                    key={driver.id}
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
                    gridTemplateColumns="60px 1fr 100px 80px 80px 80px"
                    columnGap={4}
                    onClick={() => navigate(`/drivers/${driver.id}`)}
                  >
                    <Text textAlign="center">{driver.position}</Text>
                    <Text>
                      {driver.profileImageUrl && (
                        <img
                          src={driver.profileImageUrl}
                          alt={driver.fullName}
                          width={24}
                          style={{ marginRight: 8 }}
                        />
                      )}
                      {driver.fullName}
                    </Text>
                    <Text textAlign="right">{driver.points}</Text>
                    <Text textAlign="right">{driver.wins}</Text>
                    <Text textAlign="right">{driver.podiums}</Text>
                    <Text textAlign="right">{driver.constructor}</Text>
                  </Flex>
                );
              })}
          </Flex>
        </>
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






  

