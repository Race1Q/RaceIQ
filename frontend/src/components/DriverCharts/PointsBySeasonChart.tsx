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

interface PointsBySeasonChartProps {
  data: SeasonStatsData[];
  teamColor: string;
}

const PointsBySeasonChart: React.FC<PointsBySeasonChartProps> = ({ data, teamColor }) => {
  const chartData = data.map(item => ({
    year: item.year,
    points: item.total_points,
  }));

  return (
    <Box w="100%" h="300px" bg="gray.800" p={4} borderRadius="md">
      <Text fontSize="lg" fontWeight="bold" mb={2}>Points by Season</Text>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="gray"/>
          <XAxis dataKey="year" stroke="white"/>
          <YAxis stroke="white"/>
          <Tooltip/>
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
  );
};

export default PointsBySeasonChart;
