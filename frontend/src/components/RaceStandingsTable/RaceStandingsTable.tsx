// frontend/src/components/RaceStandingsTable/RaceStandingsTable.tsx

import React, { useMemo, useState } from 'react';
import { Box, HStack, VStack, Heading, Select, Button, Table, Thead, Tbody, Tr, Th, Td, Text, Badge } from '@chakra-ui/react';
import type { Race, RaceStanding } from '../../data/types';
import { driverAbbreviations, teamColors } from '../../lib/assets';

interface RaceStandingsTableProps {
  race: Race;
  allRaces: Race[];
  onSelectRace?: (raceId: string) => void;
}

const RaceStandingsTable: React.FC<RaceStandingsTableProps> = ({ race, allRaces, onSelectRace }) => {
  const [showAll, setShowAll] = useState(false);

  const rows = useMemo(() => (showAll ? race.standings.slice(0, 10) : race.standings.slice(0, 5)), [showAll, race.standings]);

  return (
    <VStack spacing="lg" align="stretch" bg="bg-surface" p="lg" borderRadius="lg" borderWidth="1px" borderColor="border-primary">
      {/* Header */}
      <HStack justify="space-between" w="100%">
        <Heading as="h3" fontFamily="heading" color="text-primary">Race Results</Heading>
        <HStack gap={3}>
          <Select value={race.id} onChange={(e) => onSelectRace?.(e.target.value)} size="sm" bg="bg-surface-raised" borderColor="border-primary">
            {allRaces.map(r => (
              <option key={r.id} value={r.id}>{r.trackName}</option>
            ))}
          </Select>
          <Select defaultValue="interval" size="sm" bg="bg-surface-raised" borderColor="border-primary">
            <option value="interval">Interval</option>
            <option value="time">Time</option>
          </Select>
        </HStack>
      </HStack>

      {/* Table */}
      <Box w="100%" overflowX="auto">
        <Table size="md" variant="simple">
          <Thead>
            <Tr>
              <Th color="text-secondary" borderColor="border-primary">Pos</Th>
              <Th color="text-secondary" borderColor="border-primary">Driver</Th>
              <Th color="text-secondary" borderColor="border-primary">Time</Th>
            </Tr>
          </Thead>
          <Tbody>
            {rows.map((s: RaceStanding) => (
              <Tr key={`${race.id}-${s.position}`} _hover={{ bg: 'bg-surface-raised' }}>
                <Td borderColor="border-primary">
                  <HStack spacing="sm">
                    <Box w="4px" h="6" bg={teamColors[s.team] || 'brand.red'} borderRadius="full" />
                    <Text fontWeight="bold" color="text-primary">{s.position}</Text>
                  </HStack>
                </Td>
                <Td borderColor="border-primary">
                  <HStack gap={3}>
                    <Badge colorScheme="red" variant="subtle" fontSize="xs">
                      {driverAbbreviations[s.driver] || s.driverAbbreviation}
                    </Badge>
                    <Text color="text-primary">{s.driver}</Text>
                  </HStack>
                </Td>
                <Td borderColor="border-primary" color="text-secondary">{s.interval || '-'}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <Button onClick={() => setShowAll(v => !v)} colorScheme="red" variant="outline" size="sm">
        {showAll ? 'Show Top 5' : 'Show Top 10'}
      </Button>
    </VStack>
  );
};

export default RaceStandingsTable;
