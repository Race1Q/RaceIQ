import React from 'react';
import { Box, Text, HStack, VStack, Heading, useTheme } from '@chakra-ui/react';
import type { Race } from '../../data/types';

interface TrackMapProps {
  coords: string;
  trackName: string;
  race: Race;
}

const TrackMap: React.FC<TrackMapProps> = ({ coords, trackName, race }) => {
  const theme = useTheme(); // Access the theme for colors

  // Split coordinates into sectors
  const coordArray = coords.split(' ').map(coord => coord.split(',').map(Number));
  const totalPoints = coordArray.length;
  const sector1End = Math.floor(totalPoints / 3);
  const sector2End = Math.floor((totalPoints * 2) / 3);
  
  const sector1Coords = coordArray.slice(0, sector1End).map(([x, y]) => `${x},${y}`).join(' ');
  const sector2Coords = coordArray.slice(sector1End, sector2End).map(([x, y]) => `${x},${y}`).join(' ');
  const sector3Coords = coordArray.slice(sector2End).map(([x, y]) => `${x},${y}`).join(' ');

  const LegendItem = ({ color, label }: { color: string; label: string }) => (
    <HStack align="center" spacing="sm">
      <Box w="20px" h="4px" bg={color} borderRadius="full" />
      <Text fontSize="sm" color="text-secondary">{label}</Text>
    </HStack>
  );

  return (
    <VStack w="100%" h="100%" spacing="md" bg="bg-surface" p="lg" borderRadius="lg" borderWidth="1px" borderColor="border-primary">
      <Heading as="h3" size="md" fontFamily="heading" color="text-primary">Track Layout</Heading>
      <Box w="100%" flex="1">
        <svg viewBox="0 0 400 100" width="100%" height="100%">
          <polyline points={sector1Coords} fill="none" stroke={theme.colors.red[500]} strokeWidth="3" />
          <polyline points={sector2Coords} fill="none" stroke={theme.colors.blue[500]} strokeWidth="3" />
          <polyline points={sector3Coords} fill="none" stroke={theme.colors.yellow[400]} strokeWidth="3" />
          <line x1="10" y1="50" x2="30" y2="50" stroke="text-primary" strokeWidth="4" />
          <text x="200" y="95" fill="text-secondary" fontSize="12px" textAnchor="middle" fontFamily={theme.fonts.body}>
            {trackName}
          </text>
        </svg>
      </Box>
      <HStack spacing="md" justify="center" wrap="wrap">
        <LegendItem color="red.500" label="Sector 1" />
        <LegendItem color="blue.500" label="Sector 2" />
        <LegendItem color="yellow.400" label="Sector 3" />
        <LegendItem color="text-primary" label="Start/Finish" />
      </HStack>
    </VStack>
  );
};

export default TrackMap;
