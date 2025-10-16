// frontend/src/pages/ConstructorsDetails/ConstructorChartsLazy.tsx
// Lazy-loaded charts component to reduce initial bundle size

import React from 'react';
import { Box, Text, SimpleGrid } from '@chakra-ui/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface MappedPointsPerSeason {
  seasonLabel: string;
  points: number;
  wins: number;
  podiums: number;
}

interface MappedPolesPerSeason {
  seasonYear: number;
  poleCount: number;
}

interface CumulativeProgression {
  round: number;
  raceName: string;
  racePoints: number;
  cumulativePoints: number;
}

interface Season {
  id: number;
  year: number;
}

interface LatestSeason {
  season: number;
}

interface ConstructorChartsProps {
  mappedPointsPerSeason: MappedPointsPerSeason[];
  mappedPolesPerSeason: MappedPolesPerSeason[];
  cumulativeProgression: CumulativeProgression[];
  teamColor: string;
  chartBgColor: string;
  chartTextColor: string;
  gridColor: string;
  axisColor: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipTextColor: string;
  seasons: Season[];
  latestSeason: LatestSeason | null;
  topRace: { round: number; raceName: string; points: number } | null;
  bestRaceBg: string;
}

const ConstructorChartsLazy: React.FC<ConstructorChartsProps> = ({
  mappedPointsPerSeason,
  mappedPolesPerSeason,
  cumulativeProgression,
  teamColor,
  chartBgColor,
  chartTextColor,
  gridColor,
  axisColor,
  tooltipBg,
  tooltipBorder,
  tooltipTextColor,
  seasons,
  latestSeason,
  topRace,
  bestRaceBg,
}) => {
  // Memoize sorted data to prevent unnecessary re-sorting on every render
  const sortedPointsData = React.useMemo(() => 
    [...mappedPointsPerSeason].sort((a, b) => Number(a.seasonLabel) - Number(b.seasonLabel)),
    [mappedPointsPerSeason]
  );

  const sortedPolesData = React.useMemo(() => 
    [...mappedPolesPerSeason].sort((a, b) => a.seasonYear - b.seasonYear),
    [mappedPolesPerSeason]
  );
  return (
    <>
      {/* Graphs Grid - 2 per row on desktop, 1 per row on mobile */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6} mb={6}>
        {/* Points by Season */}
        <Box w="100%" h="300px" bg={chartBgColor} p={4} borderRadius="md" border="1px solid" borderColor="border-primary">
          <Text fontSize="lg" fontWeight="bold" mb={2} color={chartTextColor}>Points by Season</Text>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={sortedPointsData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor}/>
              <XAxis dataKey="seasonLabel" stroke={axisColor}/>
              <YAxis stroke={axisColor}/>
              <Tooltip 
                contentStyle={{
                  backgroundColor: tooltipBg,
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: '8px',
                  color: tooltipTextColor
                }}
              />
              <Line 
                type="monotone" 
                dataKey="points" 
                stroke={teamColor} 
                strokeWidth={3}
                dot={{ fill: teamColor, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: teamColor, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        {/* Wins by Season */}
        <Box w="100%" h="300px" bg={chartBgColor} p={4} borderRadius="md" border="1px solid" borderColor="border-primary">
          <Text fontSize="lg" fontWeight="bold" mb={2} color={chartTextColor}>Wins by Season</Text>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={sortedPointsData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor}/>
              <XAxis dataKey="seasonLabel" stroke={axisColor}/>
              <YAxis stroke={axisColor}/>
              <Tooltip 
                contentStyle={{
                  backgroundColor: tooltipBg,
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: '8px',
                  color: tooltipTextColor
                }}
              />
              <Line 
                type="monotone" 
                dataKey="wins" 
                stroke="#F56565" 
                strokeWidth={3}
                dot={{ fill: '#F56565', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#F56565', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        {/* Podiums by Season */}
        <Box w="100%" h="300px" bg={chartBgColor} p={4} borderRadius="md" border="1px solid" borderColor="border-primary">
          <Text fontSize="lg" fontWeight="bold" mb={2} color={chartTextColor}>Podiums by Season</Text>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={sortedPointsData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor}/>
              <XAxis dataKey="seasonLabel" stroke={axisColor}/>
              <YAxis stroke={axisColor}/>
              <Tooltip 
                contentStyle={{
                  backgroundColor: tooltipBg,
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: '8px',
                  color: tooltipTextColor
                }}
              />
              <Line 
                type="monotone" 
                dataKey="podiums" 
                stroke="#ECC94B" 
                strokeWidth={3}
                dot={{ fill: '#ECC94B', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#ECC94B', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        {/* Poles by Season */}
        <Box w="100%" h="300px" bg={chartBgColor} p={4} borderRadius="md" border="1px solid" borderColor="border-primary">
          <Text fontSize="lg" fontWeight="bold" mb={2} color={chartTextColor}>Poles by Season</Text>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={sortedPolesData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor}/>
              <XAxis dataKey="seasonYear" stroke={axisColor}/>
              <YAxis stroke={axisColor}/>
              <Tooltip 
                contentStyle={{
                  backgroundColor: tooltipBg,
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: '8px',
                  color: tooltipTextColor
                }}
              />
              <Bar dataKey="poleCount" fill={teamColor} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </SimpleGrid>

      {/* Cumulative Progression - Full Width */}
      {cumulativeProgression.length > 0 && (
        <Box w="100%" h="400px" bg={chartBgColor} p={4} borderRadius="md" border="1px solid" borderColor="border-primary" mb={6}>
          <Text fontSize="lg" fontWeight="bold" mb={2} color={chartTextColor}>
            Cumulative Points Progression ({seasons.find(s => s.id === latestSeason?.season)?.year || 'Latest'})
          </Text>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={cumulativeProgression}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="round" stroke={axisColor} />
              <YAxis stroke={axisColor} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: tooltipBg,
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: '8px',
                  color: tooltipTextColor
                }}
              />
              <Line 
                type="monotone" 
                dataKey="cumulativePoints" 
                stroke={teamColor} 
                strokeWidth={3}
                dot={{ fill: teamColor, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: teamColor, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}

      {/* Best Race */}
      {topRace && (
        <Box p={4} bg={bestRaceBg} borderRadius="md" minW="200px" border="1px solid" borderColor="border-primary">
          <Text fontSize="lg" fontWeight="bold" textAlign="left" color={chartTextColor}>
            Best Race ({seasons.find(s => s.id === latestSeason?.season)?.year || 'Latest'}):
          </Text>
          <Text fontSize="lg" fontWeight="bold" textAlign="left" color={chartTextColor}>
            Round {topRace.round}: {topRace.raceName}
          </Text>
          <Text fontSize="xl" mt={2} textAlign="left" color={chartTextColor}>Points: {topRace.points}</Text>
        </Box>
      )}
    </>
  );
};

export default ConstructorChartsLazy;

