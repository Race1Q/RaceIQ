// frontend/src/components/TireStrategyChart/TireStrategyChart.tsx

import React from 'react';
import { Box, Text, VStack, Heading } from '@chakra-ui/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { TireStrategy } from '../../data/types.ts';

interface TireStrategyChartProps {
  data: TireStrategy[];
}

const TireStrategyChart: React.FC<TireStrategyChartProps> = ({ data }) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box bg="bg-surface" p="sm" borderRadius="md" borderWidth="1px" borderColor="border-primary" boxShadow="lg">
          <Text color="text-primary" fontWeight="bold">Strategy: {label}</Text>
          <Text color="text-secondary">
            Drivers: {payload[0].value}
          </Text>
        </Box>
      );
    }
    return null;
  };

  return (
    <VStack spacing="lg" bg="bg-surface" p="lg" borderRadius="lg" borderWidth="1px" borderColor="border-primary" h="100%">
      <Heading as="h3" size="md" fontFamily="heading" color="text-primary">Tire Strategies</Heading>
      
      <Box w="100%" h="200px">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="border-primary" />
            <XAxis 
              dataKey="strategy" 
              tick={{ fill: "text-secondary" }}
              fontSize={12}
            />
            <YAxis 
              tick={{ fill: "text-secondary" }}
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="count" 
              fill="brand.red"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
      
      <Box w="100%">
        <Text fontSize="sm" color="text-secondary" fontWeight="medium" mb="sm">Strategy Legend:</Text>
        <VStack spacing="xs" align="flex-start">
          <Text fontSize="sm" color="text-secondary">S = Soft</Text>
          <Text fontSize="sm" color="text-secondary">M = Medium</Text>
          <Text fontSize="sm" color="text-secondary">H = Hard</Text>
          <Text fontSize="sm" color="text-secondary">I = Intermediate</Text>
        </VStack>
      </Box>
    </VStack>
  );
};

export default TireStrategyChart;
