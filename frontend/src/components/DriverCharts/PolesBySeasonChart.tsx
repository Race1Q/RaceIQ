import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface SeasonStatsData {
  year: number;
  total_points: number;
  wins: number;
  podiums: number;
  poles: number;
}

interface PolesBySeasonChartProps {
  data: SeasonStatsData[];
  teamColor?: string;
}

const PolesBySeasonChart: React.FC<PolesBySeasonChartProps> = ({ data, teamColor = "#9F7AEA" }) => {
  const chartData = data.map(item => ({
    year: item.year,
    poles: item.poles,
  }));

  return (
    <Box w="100%" h="300px" bg="gray.800" p={4} borderRadius="md">
      <Text fontSize="lg" fontWeight="bold" mb={2}>Poles by Season</Text>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="gray"/>
          <XAxis dataKey="year" stroke="white"/>
          <YAxis stroke="white"/>
          <Tooltip/>
          <Bar dataKey="poles" fill={teamColor} radius={[4, 4, 0, 0]}/>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default PolesBySeasonChart;
