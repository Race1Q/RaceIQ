import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import {
  LineChart,
  Line,
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

interface WinsBySeasonChartProps {
  data: SeasonStatsData[];
}

const WinsBySeasonChart: React.FC<WinsBySeasonChartProps> = ({ data }) => {
  const chartData = data.map(item => ({
    year: item.year,
    wins: item.wins,
  }));

  return (
    <Box w="100%" h="300px" bg="gray.800" p={4} borderRadius="md">
      <Text fontSize="lg" fontWeight="bold" mb={2}>Wins by Season</Text>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="gray"/>
          <XAxis dataKey="year" stroke="white"/>
          <YAxis stroke="white"/>
          <Tooltip/>
          <Line type="monotone" dataKey="wins" stroke="#F56565" strokeWidth={3}/>
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default WinsBySeasonChart;
