import React from 'react';
import { Box, Text, useColorModeValue } from '@chakra-ui/react';
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

  // Theme-aware colors
  const backgroundColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const gridColor = useColorModeValue('#E2E8F0', '#4A5568');
  const axisColor = useColorModeValue('gray.800', 'white');

  return (
    <Box w="100%" h="300px" bg={backgroundColor} p={4} borderRadius="md" border="1px solid" borderColor="border-primary">
      <Text fontSize="lg" fontWeight="bold" mb={2} color={textColor}>Poles by Season</Text>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={chartData}>
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
          <Bar dataKey="poles" fill={teamColor} radius={[4, 4, 0, 0]}/>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default PolesBySeasonChart;
