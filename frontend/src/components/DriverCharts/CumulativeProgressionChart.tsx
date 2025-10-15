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

interface ProgressionData {
  year: number;
  round: number;
  race_name: string;
  driver_id: number;
  points: number;
  cumulative_points: number;
}

interface CumulativeProgressionChartProps {
  data: ProgressionData[];
  teamColor: string;
  season: number;
}

const CumulativeProgressionChart: React.FC<CumulativeProgressionChartProps> = ({ 
  data, 
  teamColor, 
  season 
}) => {
  const chartData = data.map(item => ({
    round: item.round,
    race: item.race_name,
    points: item.points,
    cumulative: item.cumulative_points,
  }));

  // Theme-aware colors
  const backgroundColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const gridColor = useColorModeValue('#E2E8F0', '#4A5568');
  const axisColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('#E2E8F0', '#4A5568');
  const tooltipBg = useColorModeValue('white', 'rgba(0, 0, 0, 0.8)');
  const tooltipBorder = useColorModeValue('#E2E8F0', '#333');
  const tooltipText = useColorModeValue('gray.800', 'white');

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box
          bg={tooltipBg}
          border={`1px solid ${tooltipBorder}`}
          borderRadius="6px"
          p={3}
          color={tooltipText}
        >
          <Text fontWeight="bold">Round {label}</Text>
          <Text>{payload[0].payload.race}</Text>
          <Text>Points this race: {payload[0].payload.points}</Text>
          <Text>Cumulative: {payload[0].value}</Text>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box w="100%" h="400px" bg={backgroundColor} p={4} borderRadius="md" border="1px solid" borderColor={borderColor}>
      <Text fontSize="lg" fontWeight="bold" mb={2} color={textColor}>Cumulative Points Progression ({season})</Text>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="round" stroke={axisColor} />
          <YAxis stroke={axisColor} />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="cumulative" 
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

export default CumulativeProgressionChart;
