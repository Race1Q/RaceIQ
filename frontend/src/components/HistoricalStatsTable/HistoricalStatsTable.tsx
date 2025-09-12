// frontend/src/components/HistoricalStatsTable/HistoricalStatsTable.tsx

import React from 'react';
import { Box, Text, Table, Thead, Tbody, Tr, Th, Td, VStack, Heading, HStack } from '@chakra-ui/react';
import { Clock, Trophy } from 'lucide-react';
import type { HistoricalStats } from '../../data/types.ts';

interface HistoricalStatsTableProps {
  stats: HistoricalStats;
}

const HistoricalStatsTable: React.FC<HistoricalStatsTableProps> = ({ stats }) => {
  return (
    <VStack spacing="lg" bg="bg-surface" p="lg" borderRadius="lg" borderWidth="1px" borderColor="border-primary" h="100%">
      <Heading as="h3" size="md" fontFamily="heading" color="text-primary">Historical Statistics</Heading>
      
      <Box w="100%">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th color="text-secondary" borderColor="border-primary">Statistic</Th>
              <Th color="text-secondary" borderColor="border-primary">Value</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr _hover={{ bg: 'bg-surface-raised' }}>
              <Td borderColor="border-primary">
                <HStack spacing="sm">
                  <Box as={Clock} size="16px" color="text-secondary" />
                  <Text color="text-primary">Lap Record</Text>
                </HStack>
              </Td>
              <Td borderColor="border-primary">
                <VStack align="flex-start" spacing="xs">
                  <Text color="text-primary" fontWeight="bold">{stats.lapRecord.time}</Text>
                  <Text color="text-secondary" fontSize="sm">by {stats.lapRecord.driver}</Text>
                </VStack>
              </Td>
            </Tr>
            <Tr _hover={{ bg: 'bg-surface-raised' }}>
              <Td borderColor="border-primary">
                <HStack spacing="sm">
                  <Box as={Trophy} size="16px" color="text-secondary" />
                  <Text color="text-primary">Previous Winner</Text>
                </HStack>
              </Td>
              <Td borderColor="border-primary">
                <Text color="text-primary" fontWeight="bold">{stats.previousWinner}</Text>
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </Box>
    </VStack>
  );
};

export default HistoricalStatsTable;
