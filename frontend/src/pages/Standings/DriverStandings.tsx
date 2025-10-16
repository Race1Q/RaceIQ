// src/pages/DriverStandings.tsx
import React, { useState, useMemo } from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import StandingsTabs from '../../components/Standings/StandingsTabs';
import SearchableSelect from '../../components/DropDownSearch/SearchableSelect';
import type { SelectOption } from '../../components/DropDownSearch/SearchableSelect';
// import { useNavigate } from 'react-router-dom';
import StandingsSkeleton from './StandingsSkeleton';
// import { teamColors } from '../../lib/teamColors';
import DriverStandingCard from '../../components/Standings/DriverStandingCard';
import { useDriverStandings } from '../../hooks/useDriverStandings';
import LayoutContainer from '../../components/layout/LayoutContainer';
import PageHeader from '../../components/layout/PageHeader';

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
        subtitle="Driver standings and statistics"
      />
      <LayoutContainer>
        <Flex mb={12} alignItems="flex-end" justifyContent="space-between" flexDirection={{ base: 'column', md: 'row' }} gap={4}>
          <StandingsTabs active="drivers" />
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

  {loading && <StandingsSkeleton type="drivers" text="Loading Driver Standings..." />}

      {!loading && standings.length > 0 && (
        <Box>
          {/* Mobile scroll indicator */}
          <Box 
            display={{ base: "block", md: "none" }}
            textAlign="center" 
            mb={2}
            color="text-muted"
            fontSize="xs"
          >
            👆 Scroll to see more drivers
          </Box>
          <Flex 
            flexDirection="column" 
            gap={{ base: 2, md: 3 }}
            pb={{ base: 4, md: 0 }} // Extra padding on mobile for better scroll
          >
            {[...standings]
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

export default DriverStandingsPage;






  

