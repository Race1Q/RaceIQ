import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { TireStrategy } from '../../data/types.ts';
import styles from './TireStrategyChart.module.css';

interface TireStrategyChartProps {
  data: TireStrategy[];
}

const TireStrategyChart: React.FC<TireStrategyChartProps> = ({ data }) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box className={styles.tooltip}>
          <Text className={styles.tooltipLabel}>Strategy: {label}</Text>
          <Text className={styles.tooltipValue}>
            Drivers: {payload[0].value}
          </Text>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box className={styles.container}>
      <Text className={styles.title}>Tire Strategies</Text>
      
      <Box className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
            <XAxis 
              dataKey="strategy" 
              tick={{ fill: "#A0A0A0" }}
              fontSize={12}
            />
            <YAxis 
              tick={{ fill: "#A0A0A0" }}
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="count" 
              fill="#e10600"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
      
      <Box className={styles.legend}>
        <Text className={styles.legendTitle}>Strategy Legend:</Text>
        <Box className={styles.legendItems}>
          <Text className={styles.legendItem}>S = Soft</Text>
          <Text className={styles.legendItem}>M = Medium</Text>
          <Text className={styles.legendItem}>H = Hard</Text>
          <Text className={styles.legendItem}>I = Intermediate</Text>
        </Box>
      </Box>
    </Box>
  );
};

export default TireStrategyChart;
