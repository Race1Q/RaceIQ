import React from 'react';
import { Box, Text, HStack, VStack } from '@chakra-ui/react';
import { Flag } from 'lucide-react';
import type { FlagSegment } from '../../data/types.ts';
import styles from './FlagsTimeline.module.css';

interface FlagsTimelineProps {
  timeline: FlagSegment[];
}

const FlagsTimeline: React.FC<FlagsTimelineProps> = ({ timeline }) => {
  const getFlagColor = (type: string) => {
    switch (type) {
      case 'green':
        return styles.green;
      case 'yellow':
        return styles.yellow;
      case 'red':
        return styles.red;
      case 'safety_car':
        return styles.safetyCar;
      case 'virtual_safety_car':
        return styles.virtualSafetyCar;
      default:
        return styles.green;
    }
  };

  const getFlagLabel = (type: string) => {
    switch (type) {
      case 'green':
        return 'Green Flag';
      case 'yellow':
        return 'Yellow Flag';
      case 'red':
        return 'Red Flag';
      case 'safety_car':
        return 'Safety Car';
      case 'virtual_safety_car':
        return 'Virtual Safety Car';
      default:
        return 'Green Flag';
    }
  };

  const totalLaps = timeline.reduce((total, segment) => {
    return Math.max(total, segment.endLap);
  }, 0);

  return (
    <Box className={styles.container}>
      <Text className={styles.title}>Race Timeline</Text>
      
      <Box className={styles.timelineContainer}>
        <HStack className={styles.timeline} spacing={0}>
          {timeline.map((segment, index) => {
            const duration = segment.endLap - segment.startLap + 1;
            const width = (duration / totalLaps) * 100;
            
            return (
              <Box
                key={index}
                className={`${styles.segment} ${getFlagColor(segment.type)}`}
                style={{ width: `${width}%` }}
                title={`${getFlagLabel(segment.type)} - Laps ${segment.startLap}-${segment.endLap}`}
              />
            );
          })}
        </HStack>
        
        <HStack className={styles.labels} justify="space-between">
          <Text className={styles.lapLabel}>Lap 1</Text>
          <Text className={styles.lapLabel}>Lap {totalLaps}</Text>
        </HStack>
      </Box>
      
      <VStack className={styles.legend} spacing={2}>
        <Text className={styles.legendTitle}>Flag Types:</Text>
        <HStack className={styles.legendItems} spacing={4} wrap="wrap">
          <HStack className={styles.legendItem}>
            <Box className={`${styles.legendColor} ${styles.green}`} />
            <Text className={styles.legendText}>Green Flag</Text>
          </HStack>
          <HStack className={styles.legendItem}>
            <Box className={`${styles.legendColor} ${styles.yellow}`} />
            <Text className={styles.legendText}>Yellow Flag</Text>
          </HStack>
          <HStack className={styles.legendItem}>
            <Box className={`${styles.legendColor} ${styles.safetyCar}`} />
            <Text className={styles.legendText}>Safety Car</Text>
          </HStack>
          <HStack className={styles.legendItem}>
            <Box className={`${styles.legendColor} ${styles.virtualSafetyCar}`} />
            <Text className={styles.legendText}>Virtual Safety Car</Text>
          </HStack>
        </HStack>
      </VStack>
    </Box>
  );
};

export default FlagsTimeline;
