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

interface PodiumsBySeasonChartProps {
  data: SeasonStatsData[];
}

const PodiumsBySeasonChart: React.FC<PodiumsBySeasonChartProps> = ({ data }) => {
  const chartData = data.map(item => ({
    year: item.year,
    podiums: item.podiums,
  }));

  // Theme-aware colors
  const backgroundColor = useColorModeValue('bg-surface', 'gray.800');
  const textColor = useColorModeValue('text-primary', 'white');
  const gridColor = useColorModeValue('black', 'gray');
  const axisColor = useColorModeValue('black', 'white');

  return (
    <Box w="100%" h="300px" bg={backgroundColor} p={4} borderRadius="md" border="1px solid" borderColor="border-primary">
      <Text fontSize="lg" fontWeight="bold" mb={2} color={textColor}>Podiums by Season</Text>
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
          <Line type="monotone" dataKey="podiums" stroke="#48BB78" strokeWidth={3}/>
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default PodiumsBySeasonChart;
