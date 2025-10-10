// src/pages/Standings/AnalyticsStandings.tsx
import React, { useEffect, useState } from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { teamColors } from '../../lib/teamColors';
import { buildApiUrl } from '../../lib/api';
import AnalyticsStandingsSkeleton from './AnalyticsStandingsSkeleton';
import StandingsTabs from '../../components/Standings/StandingsTabs';
import LayoutContainer from '../../components/layout/LayoutContainer';
import PageHeader from '../../components/layout/PageHeader';
import StandingsAnalysisCard from '../../components/StandingsAnalysisCard/StandingsAnalysisCard';

// Interfaces from the original Standings.tsx
interface ProgressionEntry {
  round: number;
  raceName: string;
  racePoints: number;
  cumulativePoints: number;
}

interface ConstructorProgression {
  constructorId: number;
  constructorName: string;
  progression: ProgressionEntry[];
}

interface DriverProgression {
  driverId: number;
  driverName: string;
  driverTeam: string;
  progression: ProgressionEntry[];
}

const AnalyticsStandings: React.FC = () => {
  const [constructorsProgression, setConstructorsProgression] = useState<ConstructorProgression[]>([]);
  const [driversProgression, setDriversProgression] = useState<DriverProgression[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgressions = async () => {
      try {
        const [constructorsRes, driversRes] = await Promise.all([
          fetch(buildApiUrl(`/api/race-results/constructors/26/progression`)),
          fetch(buildApiUrl(`/api/race-results/drivers/progression`)),
        ]);
        if (!constructorsRes.ok || !driversRes.ok) throw new Error('Failed to fetch progressions');

        const constructorsData: ConstructorProgression[] = await constructorsRes.json();
        const driversData: DriverProgression[] = await driversRes.json();

        setConstructorsProgression(constructorsData);
        setDriversProgression(driversData);
        //console.log(constructorsData);
        console.log(driversData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgressions();
  }, []);

  // Chart data processing (same logic from original Standings.tsx)
  const constructorsChartData: any[] = [];
  constructorsProgression.forEach((c) =>
    c.progression.forEach((p) => {
      let entry = constructorsChartData.find((d) => d.round === p.round);
      if (!entry) {
        entry = { round: p.round, raceName: p.raceName };
        constructorsChartData.push(entry);
      }
      entry[c.constructorName] = p.cumulativePoints;
    })
  );
  constructorsChartData.sort((a, b) => a.round - b.round);

  const driversChartData: any[] = [];
  driversProgression.forEach((d) =>
    d.progression.forEach((p) => {
      let entry = driversChartData.find((e) => e.round === p.round);
      if (!entry) {
        entry = { round: p.round, raceName: p.raceName };
        driversChartData.push(entry);
      }
      entry[d.driverName] = p.cumulativePoints;
    })
  );
  driversChartData.sort((a, b) => a.round - b.round);

  // Color mapping (same logic from original Standings.tsx)
  const constructorColors: Record<string, string> = {};
  constructorsProgression.forEach((c) => {
    constructorColors[c.constructorName] =
      teamColors[c.constructorName] || `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  });

  const driverColorsMap: Record<string, string> = {};
  driversProgression.forEach((driver) => {
    driverColorsMap[driver.driverName] = teamColors[driver.driverTeam] || '#ff0000';
  });

  // Find the leading driver (highest cumulative points in the last race)
  const getLeadingDriver = () => {
    if (driversChartData.length === 0) return null;
    const lastRace = driversChartData[driversChartData.length - 1];
    let leadingDriver = '';
    let maxPoints = 0;
    
    Object.keys(lastRace).forEach(key => {
      if (key !== 'round' && key !== 'raceName' && lastRace[key] > maxPoints) {
        maxPoints = lastRace[key];
        leadingDriver = key;
      }
    });
    
    return leadingDriver;
  };

  const leadingDriver = getLeadingDriver();

  // Find the leading constructor (highest cumulative points in the last race)
  const getLeadingConstructor = () => {
    if (constructorsChartData.length === 0) return null;
    const lastRace = constructorsChartData[constructorsChartData.length - 1];
    let leadingConstructor = '';
    let maxPoints = 0;
    
    Object.keys(lastRace).forEach(key => {
      if (key !== 'round' && key !== 'raceName' && lastRace[key] > maxPoints) {
        maxPoints = lastRace[key];
        leadingConstructor = key;
      }
    });
    
    return leadingConstructor;
  };

  const leadingConstructor = getLeadingConstructor();

  return (
    <Box>
      <PageHeader 
        title="Formula 1 Championship Analytics" 
        subtitle="Points progression and championship trends"
      />
      <LayoutContainer>
        <StandingsTabs active="analytics" />

        {loading ? (
          <AnalyticsStandingsSkeleton />
        ) : (
          <Flex gap={6} flexDirection="column" mt={8}>
            {/* Drivers Chart */}
            {driversProgression.length > 0 && (
              <Box h="400px" bg="gray.900" p={4} borderRadius="md">
                <Text fontSize="lg" fontWeight="bold" mb={4} color="white">
                  2025 Drivers Points Progression
                </Text>
                <ResponsiveContainer width="100%" height="90%">
                  <LineChart data={driversChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="gray" />
                    <XAxis dataKey="round" stroke="white" />
                    <YAxis stroke="white" />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload || !payload.length) return null;

                        const raceEntry = driversChartData.find((d) => d.round === label);
                        const raceName = raceEntry ? raceEntry.raceName : '';

                        const sortedPayload = [...payload].sort((a, b) => (b.value || 0) - (a.value || 0));

                        return (
                          <Box bg="gray.800" p={2} borderRadius="md" color="white">
                            <Text fontWeight="bold">Round {label}: {raceName}</Text>
                            {sortedPayload.map((entry, index) => (
                              <Flex key={index} justify="space-between" fontSize="sm" color={entry.color}>
                                <Text>{entry.name}</Text>
                                <Text>{entry.value}</Text>
                              </Flex>
                            ))}
                          </Box>
                        );
                      }}
                    />
                    {[...new Set(driversProgression.map((d) => d.driverName))].map((name) => {
                      const isLeading = name === leadingDriver;
                      const teamColor = `#${driverColorsMap[name]}` || '#ff0000';
                      
                      return (
                        <Line
                          key={name}
                          type="monotone"
                          dataKey={name}
                          stroke={teamColor}
                          strokeWidth={isLeading ? 4 : 2}
                          dot={false}
                          isAnimationActive={true}
                          name={name}
                          connectNulls
                          style={isLeading ? {
                            filter: `drop-shadow(0 0 8px ${teamColor}80) drop-shadow(0 0 16px ${teamColor}40) drop-shadow(0 0 24px ${teamColor}20)`,
                            strokeLinecap: 'round',
                            strokeLinejoin: 'round'
                          } : {}}
                        />
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            )}

            {/* Constructors Chart */}
            {constructorsProgression.length > 0 && (
              <Box h="400px" bg="gray.900" p={4} borderRadius="md">
                <Text fontSize="lg" fontWeight="bold" mb={4} color="white">
                  2025 Constructors Points Progression
                </Text>
                <ResponsiveContainer width="100%" height="90%">
                  <LineChart data={constructorsChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="gray" />
                    <XAxis dataKey="round" stroke="white" />
                    <YAxis stroke="white" />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload || !payload.length) return null;

                        const raceEntry = constructorsChartData.find((d) => d.round === label);
                        const raceName = raceEntry ? raceEntry.raceName : '';

                        const sortedPayload = [...payload].sort((a, b) => (b.value || 0) - (a.value || 0));

                        return (
                          <Box bg="gray.800" p={2} borderRadius="md" color="white">
                            <Text fontWeight="bold">Round {label}: {raceName}</Text>
                            {sortedPayload.map((entry, index) => (
                              <Flex key={index} justify="space-between" fontSize="sm" color={entry.color}>
                                <Text>{entry.name}</Text>
                                <Text>{entry.value}</Text>
                              </Flex>
                            ))}
                          </Box>
                        );
                      }}
                    />
                    {[...new Set(constructorsProgression.map((c) => c.constructorName))].map((name) => {
                      const isLeading = name === leadingConstructor;
                      const teamColor = `#${constructorColors[name]}` || '#ff0000';
                      
                      return (
                        <Line
                          key={name}
                          type="monotone"
                          dataKey={name}
                          stroke={teamColor}
                          strokeWidth={isLeading ? 4 : 2}
                          dot={false}
                          isAnimationActive={true}
                          name={name}
                          connectNulls
                          style={isLeading ? {
                            filter: `drop-shadow(0 0 8px ${teamColor}80) drop-shadow(0 0 16px ${teamColor}40) drop-shadow(0 0 24px ${teamColor}20)`,
                            strokeLinecap: 'round',
                            strokeLinejoin: 'round'
                          } : {}}
                        />
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            )}

            {/* AI Championship Analysis */}
            <StandingsAnalysisCard season={2025} />
          </Flex>
        )}
      </LayoutContainer>
    </Box>
  );
};

export default AnalyticsStandings;
