import React from 'react';
import { Box, Text, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
import { Clock, Trophy } from 'lucide-react';
import type { HistoricalStats } from '../../data/types.ts';
import styles from './HistoricalStatsTable.module.css';

interface HistoricalStatsTableProps {
  stats: HistoricalStats;
}

const HistoricalStatsTable: React.FC<HistoricalStatsTableProps> = ({ stats }) => {
  return (
    <Box className={styles.container}>
      <Text className={styles.title}>Historical Statistics</Text>
      
      <Box className={styles.tableContainer}>
        <Table className={styles.table} variant="simple">
          <Thead>
            <Tr>
              <Th className={styles.headerCell}>Statistic</Th>
              <Th className={styles.headerCell}>Value</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td className={styles.cell}>
                <Box className={styles.cellContent}>
                  <Clock size={16} className={styles.icon} />
                  <Text className={styles.cellText}>Lap Record</Text>
                </Box>
              </Td>
              <Td className={styles.cell}>
                <Box className={styles.cellContent}>
                  <Text className={styles.cellValue}>{stats.lapRecord.time}</Text>
                  <Text className={styles.cellSubtext}>by {stats.lapRecord.driver}</Text>
                </Box>
              </Td>
            </Tr>
            <Tr>
              <Td className={styles.cell}>
                <Box className={styles.cellContent}>
                  <Trophy size={16} className={styles.icon} />
                  <Text className={styles.cellText}>Previous Winner</Text>
                </Box>
              </Td>
              <Td className={styles.cell}>
                <Text className={styles.cellValue}>{stats.previousWinner}</Text>
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default HistoricalStatsTable;
