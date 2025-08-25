import React, { useMemo, useState } from 'react';
import { Box, HStack, VStack, Heading, Select, Button, Table, Thead, Tbody, Tr, Th, Td, Text } from '@chakra-ui/react';
import styles from './RaceStandingsTable.module.css';
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
    <VStack className={styles.container} spacing={4} align="stretch">
      {/* Header */}
      <HStack className={styles.header} justify="space-between">
        <Heading as="h3" className={styles.title}>Race Results</Heading>
        <HStack gap={3}>
          <Select className={styles.select} value={race.id} onChange={(e) => onSelectRace?.(e.target.value)}>
            {allRaces.map(r => (
              <option key={r.id} value={r.id}>{r.trackName}</option>
            ))}
          </Select>
          <Select className={styles.select} defaultValue="interval">
            <option value="interval">Interval</option>
            <option value="time">Time</option>
          </Select>
        </HStack>
      </HStack>

      {/* Table */}
      <Box className={styles.tableWrapper}>
        <Table size="md" variant="simple">
          <Thead>
            <Tr>
              <Th className={styles.th}>Pos</Th>
              <Th className={styles.th}>Driver</Th>
              <Th className={styles.th}>Time</Th>
            </Tr>
          </Thead>
          <Tbody>
            {rows.map((s: RaceStanding) => (
              <Tr key={`${race.id}-${s.position}`} className={styles.row}>
                <Td className={styles.cellPos}>
                  <Box className={styles.teamBar} style={{ backgroundColor: teamColors[s.team] || 'var(--color-primary-red)' }} />
                  <Text className={styles.posText}>{s.position}</Text>
                </Td>
                <Td className={styles.cellDriver}>
                  <HStack gap={3}>
                    <Box className={styles.abbrBadge}>{driverAbbreviations[s.driver] || s.driverAbbreviation}</Box>
                    <Text className={styles.driverName}>{s.driver}</Text>
                  </HStack>
                </Td>
                <Td className={styles.cellTime}>{s.interval || '-'}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <Button className={styles.showAllBtn} onClick={() => setShowAll(v => !v)}>
        {showAll ? 'Show Top 5' : 'Show Top 10'}
      </Button>
    </VStack>
  );
};

export default RaceStandingsTable;
