// src/pages/Standings/Standings.tsx
import React, { useEffect, useState } from 'react';
import { Box, Flex, Heading, Text, Button } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
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

// Normalize backend URL to guarantee a trailing slash
// Removed bespoke BACKEND_URL logic; using buildApiUrl for all requests.

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

const Standings: React.FC = () => {
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
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgressions();
  }, []);

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

  const constructorColors: Record<string, string> = {};
  constructorsProgression.forEach((c) => {
    constructorColors[c.constructorName] =
      teamColors[c.constructorName] || `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  });

  const driverColorsMap: Record<string, string> = {};
  driversProgression.forEach((driver) => {
    driverColorsMap[driver.driverName] = teamColors[driver.driverTeam] || '#ff0000';
  });

  return (
    <Box p={['4', '6', '8']} fontFamily="var(--font-display)">
      <Heading mb={6} color="white">
        Formula 1 Championship Standings
      </Heading>

      {loading ? (
        <StandingsSkeleton />
      ) : (
        <Flex gap={6} flexDirection={['column', 'row']}>

          {/* Left Side: Boxes stacked vertically */}
          <Box flex={1} display="flex" flexDirection="column" gap={6}>
            <Box
              flex={1}
              p={6}
              borderRadius="2xl"
              bg="gray.800"
              color="white"
              boxShadow="xl"
              _hover={{ transform: 'translateY(-4px)', boxShadow: '2xl', transition: 'all 0.2s ease-in-out' }}
            >
              <Heading size="md" mb={3}>
                Drivers Standings
              </Heading>
              <Text mb={4} color="gray.300">
                View all drivers ranked by points, wins, and positions for each season.
              </Text>
              <Button as={Link} to="/standings/drivers" colorScheme="red">
                View Drivers
              </Button>
            </Box>

            <Box
              flex={1}
              p={6}
              borderRadius="2xl"
              bg="gray.800"
              color="white"
              boxShadow="xl"
              _hover={{ transform: 'translateY(-4px)', boxShadow: '2xl', transition: 'all 0.2s ease-in-out' }}
            >
              <Heading size="md" mb={3}>
                Constructors Standings
              </Heading>
              <Text mb={4} color="gray.300">
                Explore constructor rankings, team performance, and championship points.
              </Text>
              <Button as={Link} to="/standings/constructors" colorScheme="blue">
                View Constructors
              </Button>
            </Box>
          </Box>

          {/* Right Side: Charts stacked vertically */}
          <Box flex={3} display="flex" flexDirection="column" gap={6}>
            {/* Drivers Chart */}
            {driversProgression.length > 0 && (
              <Box h="400px" bg="gray.700" p={4} borderRadius="md">
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
                    {[...new Set(driversProgression.map((d) => d.driverName))].map((name) => (
                      <Line
                        key={name}
                        type="monotone"
                        dataKey={name}
                        stroke={`#${driverColorsMap[name]}` || '#ff0000'}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={true}
                        name={name}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            )}

            {/* Constructors Chart */}
            {constructorsProgression.length > 0 && (
              <Box h="400px" bg="gray.700" p={4} borderRadius="md">
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
                    {[...new Set(constructorsProgression.map((c) => c.constructorName))].map((name) => (
                      <Line
                        key={name}
                        type="monotone"
                        dataKey={name}
                        stroke={`#${constructorColors[name]}` || '#ff0000'}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={true}
                        name={name}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Box>
        </Flex>
      )}
    </Box>
  );
};

export default Standings;







