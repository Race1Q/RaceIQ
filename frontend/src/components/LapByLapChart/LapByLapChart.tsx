import React from 'react';
import { Card, CardHeader, CardBody, Heading } from '@chakra-ui/react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './LapByLapChart.module.css';

interface LapByLapData {
  lap: number;
  position: number;
}

interface LapByLapChartProps {
  data: LapByLapData[];
  teamColor?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.tooltip}>
        <p className={styles.tooltipLabel}>{`Lap: ${label}`}</p>
        <p className={styles.tooltipValue}>{`Position: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const LapByLapChart: React.FC<LapByLapChartProps> = ({ data, teamColor }) => {
  return (
    <Card className={styles.card}>
      <CardHeader className={styles.cardHeader}>
        <Heading className={styles.heading}>Race Position</Heading>
      </CardHeader>
      <CardBody className={styles.cardBody}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} className={styles.chart}>
            <XAxis
              dataKey="lap"
              className={styles.xAxis}
              tick={{ fill: 'var(--color-text-medium)', fontSize: 12 }}
            />
            <YAxis
              className={styles.yAxis}
              tick={{ fill: 'var(--color-text-medium)', fontSize: 12 }}
              reversed={true}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="position"
              stroke={teamColor || 'var(--color-primary-red)'}
              strokeWidth={3}
              dot={{ fill: teamColor || 'var(--color-primary-red)', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: teamColor || 'var(--color-primary-red)', strokeWidth: 2 }}
              className={styles.line}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
};

export default LapByLapChart;
