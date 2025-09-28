// src/pages/Standings/Standings.tsx
import React, { useEffect, useState } from 'react';
import { Box, Flex, Heading, Text, Button } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { teamColors } from '../../lib/teamColors';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

interface ConstructorProgressionEntry {
  round: number;
  raceName: string;
  racePoints: number;
  cumulativePoints: number;
}

interface ConstructorProgression {
  constructorId: number;
  constructorName: string;
  progression: ConstructorProgressionEntry[];
}

const Standings: React.FC = () => {
  const [constructorsProgression, setConstructorsProgression] = useState<ConstructorProgression[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConstructorsProgression = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/race-results/constructors/progression`);
        if (!response.ok) throw new Error('Failed to fetch constructors progression');
        const data: ConstructorProgression[] = await response.json();
        setConstructorsProgression(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchConstructorsProgression();
  }, []);

  // Flatten progression for Recharts
  const chartData: any[] = [];
  constructorsProgression.forEach((c) => {
    c.progression.forEach((p) => {
      let entry = chartData.find((d) => d.round === p.round);
      if (!entry) {
        entry = { round: p.round, raceName: p.raceName };
        chartData.push(entry);
      }
      entry[c.constructorName] = p.cumulativePoints;
    });
  });
  chartData.sort((a, b) => a.round - b.round);

  // Map constructorName → color
  const constructorColors: Record<string, string> = {};
  constructorsProgression.forEach((c) => {
    constructorColors[c.constructorName] =
      teamColors[c.constructorName] || `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  });

  return (
    <Box p={['4', '6', '8']} fontFamily="var(--font-display)">
      <Heading mb={6} color="white">
        F1 Standings
      </Heading>

      <Flex gap={6} flexDirection={['column', 'row']}>
        {/* Drivers Standings Card */}
        <Box
          flex={1}
          p={6}
          borderRadius="2xl"
          bg="gray.800"
          color="white"
          boxShadow="xl"
          _hover={{ transform: 'translateY(-4px)', boxShadow: '2xl', transition: 'all 0.2s ease-in-out' }}
        >
          <Heading size="md" mb={3}>
            Drivers Standings
          </Heading>
          <Text mb={4} color="gray.300">
            View all drivers ranked by points, wins, and positions for each season.
          </Text>
          <Button as={Link} to="/standings/drivers" colorScheme="red">
            View Drivers
          </Button>
        </Box>

        {/* Constructors Standings Card */}
        <Box
          flex={1}
          p={6}
          borderRadius="2xl"
          bg="gray.800"
          color="white"
          boxShadow="xl"
          _hover={{ transform: 'translateY(-4px)', boxShadow: '2xl', transition: 'all 0.2s ease-in-out' }}
        >
          <Heading size="md" mb={3}>
            Constructors Standings
          </Heading>
          <Text mb={4} color="gray.300">
            Explore constructor rankings, team performance, and championship points.
          </Text>
          <Button as={Link} to="/standings/constructors" colorScheme="blue">
            View Constructors
          </Button>
        </Box>
      </Flex>

      {/* Points Progression Chart (outside the card but inline) */}
      {!loading && constructorsProgression.length > 0 && (
        <Box w="100%" h="400px" mt={8} bg="gray.700" p={4} borderRadius="md">
          <Text fontSize="lg" fontWeight="bold" mb={4} color="white">
            2025 Constructors Points Progression
          </Text>
          <ResponsiveContainer width="100%" height="90%">
  <LineChart data={chartData}>
    <CartesianGrid strokeDasharray="3 3" stroke="gray" />
    <XAxis dataKey="round" stroke="white" />
    <YAxis stroke="white" />
    <Tooltip
      content={({ active, payload, label }) => {
        if (!active || !payload || !payload.length) return null;

        // Sort by cumulative points descending
        const sortedPayload = [...payload].sort((a, b) => (b.value || 0) - (a.value || 0));

        return (
          <Box bg="gray.800" p={2} borderRadius="md" color="white">
            <Text fontWeight="bold">Round {label}</Text>
            {sortedPayload.map((entry, index) => (
              <Flex key={index} justify="space-between" fontSize="sm" color={entry.color}>
                <Text>{entry.name}</Text>
                <Text>{entry.value}</Text>
              </Flex>
            ))}
          </Box>
        );
      }}
    />
    {[...new Set(constructorsProgression.map((c) => c.constructorName))].map((name) => (
      <Line
        key={name}
        type="monotone"
        dataKey={name}
        stroke={`#${constructorColors[name]}`}
        strokeWidth={2}
        dot={false}
        isAnimationActive={false}
        name={name}
        connectNulls
      />
    ))}
  </LineChart>
</ResponsiveContainer>

        </Box>
      )}
    </Box>
  );
};

export default Standings;


