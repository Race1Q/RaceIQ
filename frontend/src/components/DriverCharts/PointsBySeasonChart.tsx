import React from 'react';
import { Box, Text, useColorModeValue } from '@chakra-ui/react';
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

  // Theme-aware colors
  const backgroundColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const gridColor = useColorModeValue('#E2E8F0', '#4A5568');
  const axisColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('#E2E8F0', '#4A5568');

  return (
    <Box w="100%" h="300px" bg={backgroundColor} p={4} borderRadius="md" border="1px solid" borderColor={borderColor}>
      <Text fontSize="lg" fontWeight="bold" mb={2} color={textColor}>Points by Season</Text>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor}/>
          <XAxis dataKey="year" stroke={axisColor}/>
          <YAxis stroke={axisColor}/>
          <Tooltip 
            contentStyle={{
              backgroundColor: useColorModeValue('white', 'gray.800'),
              border: `1px solid ${useColorModeValue('#E2E8F0', '#4A5568')}`,
              borderRadius: '8px',
              color: useColorModeValue('black', 'white')
            }}
          />
          <Line 
            type="monotone" 
            dataKey="points" 
            stroke={teamColor} 
            strokeWidth={3}
            dot={{ fill: teamColor, strokeWidth: 2, r: 4, stroke: teamColor }}
            activeDot={{ r: 6, stroke: teamColor, strokeWidth: 2, fill: teamColor }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default PointsBySeasonChart;
