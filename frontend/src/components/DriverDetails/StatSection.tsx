// frontend/src/components/DriverDetails/StatSection.tsx
import React from 'react';
import { Grid, Heading, VStack } from '@chakra-ui/react';
import StatCard from './StatCard';
import type { Stat } from '../../types';

interface StatSectionProps {
  title: string;
  stats: Stat[];
}

const StatSection: React.FC<StatSectionProps> = ({ title, stats }) => {
  return (
    <VStack align="stretch" spacing={4}>
      <Heading size="md" fontFamily="heading">{title}</Heading>
      <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }} gap="md">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </Grid>
    </VStack>
  );
};

export default StatSection;
