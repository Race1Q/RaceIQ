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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box
          bg="rgba(0, 0, 0, 0.8)"
          border="1px solid #333"
          borderRadius="6px"
          p={3}
          color="white"
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
    <Box w="100%" h="400px" bg="gray.800" p={4} borderRadius="md">
      <Text fontSize="lg" fontWeight="bold" mb={2}>Cumulative Points Progression ({season})</Text>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="gray" />
          <XAxis dataKey="round" stroke="white" />
          <YAxis stroke="white" />
          <Tooltip />
          <Line type="monotone" dataKey="cumulative" stroke={teamColor} strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default CumulativeProgressionChart;
