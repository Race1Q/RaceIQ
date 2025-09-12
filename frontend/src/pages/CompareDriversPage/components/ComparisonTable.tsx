// frontend/src/pages/CompareDriversPage/components/ComparisonTable.tsx
import { Box, Heading, Table, Thead, Tbody, Tr, Th, Td, TableContainer } from '@chakra-ui/react';
import type { DriverDetails } from '../../../hooks/useDriverComparison';

interface Props {
  driver1: DriverDetails;
  driver2: DriverDetails;
}

const stats: { key: keyof DriverDetails; label: string }[] = [
  { key: 'teamName', label: 'Team' },
  { key: 'championshipStanding', label: 'Championship Standing' },
  { key: 'wins', label: 'Career Wins' },
  { key: 'podiums', label: 'Career Podiums' },
  { key: 'points', label: 'Career Points' },
];

export const ComparisonTable: React.FC<Props> = ({ driver1, driver2 }) => (
  <Box bg="bg-surface" p="lg" borderRadius="md">
    <Heading size="xl" textAlign="center" mb="lg" fontFamily="heading">Head-to-Head Comparison</Heading>
    <TableContainer>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Statistic</Th>
            <Th>{driver1.fullName}</Th>
            <Th>{driver2.fullName}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {stats.map(({ key, label }) => (
            <Tr key={key}>
              <Td fontWeight="bold">{label}</Td>
              <Td>{driver1[key]}</Td>
              <Td>{driver2[key]}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  </Box>
);