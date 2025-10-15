// src/pages/Standings/AnalyticsStandings.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react';
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
import StandingsSkeleton from './StandingsSkeleton';
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

  // Theme-aware colors
  const chartBgColor = useColorModeValue('white', 'gray.900');
  const chartTextColor = useColorModeValue('gray.800', 'white');
  const gridColor = useColorModeValue('#E2E8F0', '#4A5568');
  const axisColor = useColorModeValue('gray.800', 'white');
  const tooltipBg = useColorModeValue('white', 'gray.800');
  const tooltipBorder = useColorModeValue('#E2E8F0', '#4A5568');
  const tooltipTextColor = useColorModeValue('gray.800', 'white');

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

  // Memoized chart data processing for better performance
  const constructorsChartData = useMemo(() => {
    const chartData: any[] = [];
    constructorsProgression.forEach((c) =>
      c.progression.forEach((p) => {
        let entry = chartData.find((d) => d.round === p.round);
        if (!entry) {
          entry = { round: p.round, raceName: p.raceName };
          chartData.push(entry);
        }
        entry[c.constructorName] = p.cumulativePoints;
      })
    );
    return chartData.sort((a, b) => a.round - b.round);
  }, [constructorsProgression]);

  const driversChartData = useMemo(() => {
    const chartData: any[] = [];
    driversProgression.forEach((d) =>
      d.progression.forEach((p) => {
        let entry = chartData.find((e) => e.round === p.round);
        if (!entry) {
          entry = { round: p.round, raceName: p.raceName };
          chartData.push(entry);
        }
        entry[d.driverName] = p.cumulativePoints;
      })
    );
    return chartData.sort((a, b) => a.round - b.round);
  }, [driversProgression]);

  // Memoized color mappings for better performance
  const constructorColors = useMemo(() => {
    const colors: Record<string, string> = {};
    constructorsProgression.forEach((c) => {
      colors[c.constructorName] =
        teamColors[c.constructorName] || `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    });
    return colors;
  }, [constructorsProgression]);

  const driverColorsMap = useMemo(() => {
    const colors: Record<string, string> = {};
    driversProgression.forEach((driver) => {
      colors[driver.driverName] = teamColors[driver.driverTeam] || '#ff0000';
    });
    return colors;
  }, [driversProgression]);

  // Memoized leading driver calculation
  const leadingDriver = useMemo(() => {
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
  }, [driversChartData]);

  // Memoized leading constructor calculation
  const leadingConstructor = useMemo(() => {
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
  }, [constructorsChartData]);

  // Memoized unique names for chart rendering
  const uniqueDriverNames = useMemo(() => 
    [...new Set(driversProgression.map((d) => d.driverName))], 
    [driversProgression]
  );

  const uniqueConstructorNames = useMemo(() => 
    [...new Set(constructorsProgression.map((c) => c.constructorName))], 
    [constructorsProgression]
  );

  // Memoized tooltip content for better performance
  const driversTooltipContent = useMemo(() => 
    ({ active, payload, label }: any) => {
      if (!active || !payload || !payload.length) return null;

      const raceEntry = driversChartData.find((d) => d.round === label);
      const raceName = raceEntry ? raceEntry.raceName : '';

      const sortedPayload = [...payload].sort((a, b) => (b.value || 0) - (a.value || 0));

      return (
        <Box bg={tooltipBg} p={2} borderRadius="md" border={`1px solid ${tooltipBorder}`} color={tooltipTextColor}>
          <Text fontWeight="bold">Round {label}: {raceName}</Text>
          {sortedPayload.map((entry, index) => (
            <Flex key={index} justify="space-between" fontSize="sm" color={entry.color}>
              <Text>{entry.name}</Text>
              <Text>{entry.value}</Text>
            </Flex>
          ))}
        </Box>
      );
    }, [driversChartData, tooltipBg, tooltipBorder, tooltipTextColor]
  );

  const constructorsTooltipContent = useMemo(() => 
    ({ active, payload, label }: any) => {
      if (!active || !payload || !payload.length) return null;

      const raceEntry = constructorsChartData.find((d) => d.round === label);
      const raceName = raceEntry ? raceEntry.raceName : '';

      const sortedPayload = [...payload].sort((a, b) => (b.value || 0) - (a.value || 0));

      return (
        <Box bg={tooltipBg} p={2} borderRadius="md" border={`1px solid ${tooltipBorder}`} color={tooltipTextColor}>
          <Text fontWeight="bold">Round {label}: {raceName}</Text>
          {sortedPayload.map((entry, index) => (
            <Flex key={index} justify="space-between" fontSize="sm" color={entry.color}>
              <Text>{entry.name}</Text>
              <Text>{entry.value}</Text>
            </Flex>
          ))}
        </Box>
      );
    }, [constructorsChartData, tooltipBg, tooltipBorder, tooltipTextColor]
  );

  return (
    <Box>
      <PageHeader 
        title="Formula 1 Championship Analytics" 
        subtitle="Points progression and championship trends"
      />
      <LayoutContainer>
        <StandingsTabs active="analytics" />

        {loading ? (
          <StandingsSkeleton text="Loading Standings Analytics" />
        ) : (
          <Flex gap={6} flexDirection="column" mt={4}>
            {/* Drivers Chart */}
            {driversProgression.length > 0 && (
              <Box h="400px" bg={chartBgColor} p={4} borderRadius="md">
                <Text fontSize="lg" fontWeight="bold" mb={4} color={chartTextColor}>
                  2025 Drivers Points Progression
                </Text>
                <ResponsiveContainer width="100%" height="90%">
                  <LineChart data={driversChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="round" stroke={axisColor} />
                    <YAxis stroke={axisColor} />
                    <Tooltip content={driversTooltipContent} />
                    {uniqueDriverNames.map((name) => {
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
                          isAnimationActive={false}
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
              <Box h="400px" bg={chartBgColor} p={4} borderRadius="md">
                <Text fontSize="lg" fontWeight="bold" mb={4} color={chartTextColor}>
                  2025 Constructors Points Progression
                </Text>
                <ResponsiveContainer width="100%" height="90%">
                  <LineChart data={constructorsChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="round" stroke={axisColor} />
                    <YAxis stroke={axisColor} />
                    <Tooltip content={constructorsTooltipContent} />
                    {uniqueConstructorNames.map((name) => {
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
                          isAnimationActive={false}
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
