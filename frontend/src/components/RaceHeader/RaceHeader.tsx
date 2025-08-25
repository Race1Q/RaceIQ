import React from 'react';
import { Box, Heading, Text, HStack } from '@chakra-ui/react';
import { Calendar, MapPin } from 'lucide-react';
import type { Race } from '../../data/types';
import { getCountryFlagUrl } from '../../lib/assets';
import styles from './RaceHeader.module.css';

interface RaceHeaderProps {
  race: Race;
}

const RaceHeader: React.FC<RaceHeaderProps> = ({ race }) => {
  return (
    <Box className={styles.container}>
      <Box className={styles.headerContent}>
        <Box className={styles.titleSection}>
          <Heading className={styles.trackName}>{race.trackName}</Heading>
          <HStack className={styles.metaInfo} spacing={4}>
            <HStack className={styles.metaItem} spacing={2}>
              <img 
                src={getCountryFlagUrl(race.countryCode)} 
                alt={`${race.country} flag`}
                className={styles.countryFlag}
              />
              <Text className={styles.metaText}>{race.country}</Text>
            </HStack>
            <HStack className={styles.metaItem} spacing={2}>
              <Calendar size={16} className={styles.icon} />
              <Text className={styles.metaText}>
                {new Date(race.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </HStack>
          </HStack>
        </Box>
      </Box>
    </Box>
  );
};

export default RaceHeader;
