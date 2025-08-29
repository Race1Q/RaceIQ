import React, { useState } from 'react';
import { VStack, Box, Text, Input, InputGroup, InputLeftElement } from '@chakra-ui/react';
import { Search, ChevronLeft } from 'lucide-react';
import type { Race } from '../../data/types';
import { teamColors } from '../../lib/assets';
import styles from './RaceList.module.css';

interface RaceListProps {
  races: Race[];
  selectedRaceId: string;
  onRaceSelect: (raceId: string) => void;
}

const RaceList: React.FC<RaceListProps> = ({ races, selectedRaceId, onRaceSelect }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isHovered, setIsHovered] = useState(false);

  const filteredRaces = races.filter(race =>
    race.trackName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    race.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTeamColor = (race: Race) => {
    const winner = race.standings[0];
    return teamColors[winner.team] || '#666666';
  };

  return (
    <Box 
      className={`${styles.container} ${isHovered ? styles.expanded : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Left Arrow Trigger */}
      <Box className={styles.arrowTrigger}>
        <ChevronLeft size={20} className={styles.arrowIcon} />
      </Box>

      {/* Sidebar Content */}
      <Box className={styles.sidebarContent}>
        <Text className={styles.title}>Races</Text>
        
        <InputGroup className={styles.searchContainer}>
          <InputLeftElement>
            <Search size={16} className={styles.searchIcon} />
          </InputLeftElement>
          <Input
            placeholder="Search races..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </InputGroup>

        <VStack className={styles.raceList} spacing={0}>
          {filteredRaces.map((race) => (
            <Box
              key={race.id}
              className={`${styles.raceItem} ${race.id === selectedRaceId ? styles.selected : ''}`}
              onClick={() => onRaceSelect(race.id)}
            >
              <Box 
                className={styles.teamColorBar}
                style={{ backgroundColor: getTeamColor(race) }}
              />
              <Box className={styles.raceContent}>
                <Text className={styles.trackName}>{race.trackName}</Text>
                <Text className={styles.country}>{race.country}</Text>
                <Text className={styles.date}>{new Date(race.date).toLocaleDateString()}</Text>
              </Box>
            </Box>
          ))}
        </VStack>
      </Box>
    </Box>
  );
};

export default RaceList;
