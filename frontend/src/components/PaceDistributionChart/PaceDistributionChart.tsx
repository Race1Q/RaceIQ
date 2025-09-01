import React from 'react';
import { Box, Text, VStack, Heading } from '@chakra-ui/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PaceDistributionChartProps {
  data: number[];
}

const PaceDistributionChart: React.FC<PaceDistributionChartProps> = ({ data }) => {
  // Convert pace data to chart format
  const chartData = data.map((time, index) => ({
    lap: index + 1,
    time: time,
    formattedTime: `${Math.floor(time)}:${((time % 1) * 60).toFixed(3).padStart(6, '0')}`
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box bg="bg-surface" p="sm" borderRadius="md" borderWidth="1px" borderColor="border-primary" boxShadow="lg">
          <Text color="text-primary" fontWeight="bold">Lap {label}</Text>
          <Text color="text-secondary">
            Time: {payload[0].payload.formattedTime}
          </Text>
        </Box>
      );
    }
    return null;
  };

  return (
    <VStack spacing="lg" bg="bg-surface" p="lg" borderRadius="lg" borderWidth="1px" borderColor="border-primary" h="100%">
      <Heading as="h3" size="md" fontFamily="heading" color="text-primary">Pace Distribution</Heading>
      
      <Box w="100%" h="200px">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="border-primary" />
            <XAxis 
              dataKey="lap" 
              tick={{ fill: "text-secondary" }}
              fontSize={12}
            />
            <YAxis 
              tick={{ fill: "text-secondary" }}
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="time" 
              fill="brand.red"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </VStack>
  );
};

export default PaceDistributionChart;
