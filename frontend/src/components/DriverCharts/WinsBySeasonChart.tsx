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

interface WinsBySeasonChartProps {
  data: SeasonStatsData[];
}

const WinsBySeasonChart: React.FC<WinsBySeasonChartProps> = ({ data }) => {
  const chartData = data.map(item => ({
    year: item.year,
    wins: item.wins,
  }));

  // Theme-aware colors
  const backgroundColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const gridColor = useColorModeValue('#E2E8F0', '#4A5568');
  const axisColor = useColorModeValue('gray.800', 'white');
  const tooltipBg = useColorModeValue('white', 'gray.800');
  const tooltipBorder = useColorModeValue('#E2E8F0', '#4A5568');
  const tooltipTextColor = useColorModeValue('gray.800', 'white');

  return (
    <Box w="100%" h="300px" bg={backgroundColor} p={4} borderRadius="md" border="1px solid" borderColor="border-primary">
      <Text fontSize="lg" fontWeight="bold" mb={2} color={textColor}>Wins by Season</Text>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor}/>
          <XAxis dataKey="year" stroke={axisColor}/>
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
  );
};

export default WinsBySeasonChart;
