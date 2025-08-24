import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Race } from '../../data/types';
import { teamColors } from '../../lib/assets';
import styles from './LapPositionChart.module.css';

interface LapPositionChartProps {
  race: Race;
}

const LapPositionChart: React.FC<LapPositionChartProps> = ({ race }) => {
  // Get top 5 drivers for the chart
  const topDrivers = race.standings.slice(0, 5);
  const driverAbbreviations = topDrivers.map(driver => driver.driverAbbreviation);

  // Transform lap positions data for Recharts
  const chartData = race.lapPositions.map(lapData => {
    const dataPoint: any = { lap: lapData.lap };
    driverAbbreviations.forEach(abbr => {
      dataPoint[abbr] = lapData.positions[abbr] || null;
    });
    return dataPoint;
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box className={styles.tooltip}>
          <Text className={styles.tooltipLabel}>Lap {label}</Text>
          {payload.map((entry: any, index: number) => (
            <Text key={index} className={styles.tooltipValue} style={{ color: entry.color }}>
              {entry.name}: P{entry.value}
            </Text>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <Box className={styles.container}>
      <Text className={styles.title}>Lap-by-Lap Positions</Text>
      
      <Box className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
            <XAxis 
              dataKey="lap" 
              tick={{ fill: "#A0A0A0" }}
              fontSize={12}
            />
            <YAxis 
              tick={{ fill: "#A0A0A0" }}
              fontSize={12}
              reversed={true}
              domain={[1, 10]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {driverAbbreviations.map((abbr, index) => {
              const driver = topDrivers.find(d => d.driverAbbreviation === abbr);
              const teamColor = driver ? teamColors[driver.team] : '#666666';
              
              return (
                <Line
                  key={abbr}
                  type="monotone"
                  dataKey={abbr}
                  stroke={teamColor}
                  strokeWidth={2}
                  dot={{ fill: teamColor, strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, stroke: teamColor, strokeWidth: 2 }}
                  name={abbr}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default LapPositionChart;
