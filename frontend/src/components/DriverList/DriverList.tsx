import React, { useState } from 'react';
import { VStack, Input, Box, Text } from '@chakra-ui/react';
import { Search } from 'lucide-react';
import styles from './DriverList.module.css';

interface Driver {
  id: string;
  name: string;
  number: string;
  team: string;
  nationality: string;
}

interface DriverListProps {
  drivers: Driver[];
  selectedDriverId: string;
  setSelectedDriverId: (id: string) => void;
}

const DriverList: React.FC<DriverListProps> = ({ drivers, selectedDriverId, setSelectedDriverId }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.team.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box className={styles.container}>
      <Box className={styles.searchContainer}>
        <Box className={styles.searchWrapper}>
          <Search size={20} className={styles.searchIcon} />
          <Input
            placeholder="Search drivers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </Box>
      </Box>
      
      <VStack spacing={2} className={styles.driverList}>
        {filteredDrivers.map((driver) => (
          <Box
            key={driver.id}
            className={`${styles.driverItem} ${driver.id === selectedDriverId ? styles.active : ''}`}
            onClick={() => setSelectedDriverId(driver.id)}
          >
            <Text className={styles.driverNumber}>{driver.number}</Text>
            <Box className={styles.driverInfo}>
              <Text className={styles.driverName}>{driver.name}</Text>
              <Text className={styles.driverTeam}>{driver.team}</Text>
            </Box>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default DriverList;
