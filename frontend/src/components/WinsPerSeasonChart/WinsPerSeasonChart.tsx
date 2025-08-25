import React from 'react';
import { Card, CardHeader, CardBody, Heading } from '@chakra-ui/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './WinsPerSeasonChart.module.css';

interface WinsPerSeasonData {
  season: string;
  wins: number;
}

interface WinsPerSeasonChartProps {
  data: WinsPerSeasonData[];
  teamColor?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.tooltip}>
        <p className={styles.tooltipLabel}>{`Season: ${label}`}</p>
        <p className={styles.tooltipValue}>{`Wins: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const WinsPerSeasonChart: React.FC<WinsPerSeasonChartProps> = ({ data, teamColor }) => {
  return (
    <Card className={styles.card}>
      <CardHeader className={styles.cardHeader}>
        <Heading className={styles.heading}>Wins per Season</Heading>
      </CardHeader>
      <CardBody className={styles.cardBody}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} className={styles.chart}>
            <XAxis
              dataKey="season"
              className={styles.xAxis}
              tick={{ fill: 'var(--color-text-medium)', fontSize: 12 }}
            />
            <YAxis
              className={styles.yAxis}
              tick={{ fill: 'var(--color-text-medium)', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="wins"
              fill={teamColor || 'var(--color-primary-red)'}
              radius={[4, 4, 0, 0]}
              className={styles.bar}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
};

export default WinsPerSeasonChart;
