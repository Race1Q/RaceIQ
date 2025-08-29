import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './PaceDistributionChart.module.css';

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
        <Box className={styles.tooltip}>
          <Text className={styles.tooltipLabel}>Lap {label}</Text>
          <Text className={styles.tooltipValue}>
            Time: {payload[0].payload.formattedTime}
          </Text>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box className={styles.container}>
      <Text className={styles.title}>Pace Distribution</Text>
      
      <Box className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
            <XAxis 
              dataKey="lap" 
              tick={{ fill: "#A0A0A0" }}
              fontSize={12}
            />
            <YAxis 
              tick={{ fill: "#A0A0A0" }}
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="time" 
              fill="#e10600"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default PaceDistributionChart;
