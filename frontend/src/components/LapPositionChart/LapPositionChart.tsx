// frontend/src/components/LapPositionChart/LapPositionChart.tsx

import React from 'react';
import { Box, Text, VStack, Heading } from '@chakra-ui/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Race } from '../../data/types';
import { teamColors } from '../../lib/assets';

interface LapPositionChartProps {
  race: Race;
}

const LapPositionChart: React.FC<LapPositionChartProps> = ({ race }) => {
  // Get top 5 drivers for the chart
  const topDrivers = race.standings.slice(0, 5);
  const driverAbbreviations = topDrivers.map(driver => driver.driverAbbreviation);

  // Transform lap positions data for Recharts
  const chartData = race.lapPositions.map(lapData => {
    const dataPoint: any = { lap: lapData.lap };
    driverAbbreviations.forEach(abbr => {
      dataPoint[abbr] = lapData.positions[abbr] || null;
    });
    return dataPoint;
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box bg="bg-surface" p="sm" borderRadius="md" borderWidth="1px" borderColor="border-primary" boxShadow="lg">
          <Text color="text-primary" fontWeight="bold">Lap {label}</Text>
          {payload.map((entry: any, index: number) => (
            <Text key={index} color="text-secondary">
              {entry.name}: P{entry.value}
            </Text>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <VStack spacing="lg" bg="bg-surface" p="lg" borderRadius="lg" borderWidth="1px" borderColor="border-primary" h="100%">
      <Heading as="h3" size="md" fontFamily="heading" color="text-primary">Lap-by-Lap Positions</Heading>
      
      <Box w="100%" h="300px">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="border-primary" />
            <XAxis 
              dataKey="lap" 
              tick={{ fill: "text-secondary" }}
              fontSize={12}
            />
            <YAxis 
              tick={{ fill: "text-secondary" }}
              fontSize={12}
              reversed={true}
              domain={[1, 10]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {driverAbbreviations.map((abbr, index) => {
              const driver = topDrivers.find(d => d.driverAbbreviation === abbr);
              const teamColor = driver ? teamColors[driver.team] : '#666666';
              
              return (
                <Line
                  key={abbr}
                  type="monotone"
                  dataKey={abbr}
                  stroke={teamColor}
                  strokeWidth={2}
                  dot={{ fill: teamColor, strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, stroke: teamColor, strokeWidth: 2 }}
                  name={abbr}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </VStack>
  );
};

export default LapPositionChart;
