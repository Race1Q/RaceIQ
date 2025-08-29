import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import type { Race } from '../../data/types';
import styles from './TrackMap.module.css';

interface TrackMapProps {
  coords: string;
  trackName: string;
  race: Race;
}

const TrackMap: React.FC<TrackMapProps> = ({ coords, trackName, race }) => {
  // Split coordinates into sectors
  const coordArray = coords.split(' ').map(coord => coord.split(',').map(Number));
  const totalPoints = coordArray.length;
  const sector1End = Math.floor(totalPoints / 3);
  const sector2End = Math.floor((totalPoints * 2) / 3);
  
  const sector1Coords = coordArray.slice(0, sector1End).map(([x, y]) => `${x},${y}`).join(' ');
  const sector2Coords = coordArray.slice(sector1End, sector2End).map(([x, y]) => `${x},${y}`).join(' ');
  const sector3Coords = coordArray.slice(sector2End).map(([x, y]) => `${x},${y}`).join(' ');

  return (
    <Box className={styles.container}>
      <Text className={styles.title}>Track Layout</Text>
      
      <Box className={styles.mapContainer}>
        <svg
          viewBox="0 0 400 100"
          className={styles.trackSvg}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Sector 1 - Red */}
          <polyline
            points={sector1Coords}
            className={styles.sector1}
            fill="none"
            strokeWidth="3"
          />
          
          {/* Sector 2 - Blue */}
          <polyline
            points={sector2Coords}
            className={styles.sector2}
            fill="none"
            strokeWidth="3"
          />
          
          {/* Sector 3 - Yellow */}
          <polyline
            points={sector3Coords}
            className={styles.sector3}
            fill="none"
            strokeWidth="3"
          />
          
          {/* Start/Finish line */}
          <line
            x1="10"
            y1="50"
            x2="30"
            y2="50"
            className={styles.startFinish}
            strokeWidth="4"
          />
          
          {/* Track name label */}
          <text x="200" y="95" className={styles.trackLabel}>
            {trackName}
          </text>
        </svg>
      </Box>
      
      <Box className={styles.legend}>
        <Box className={styles.legendItem}>
          <Box className={styles.legendSector1} />
          <Text className={styles.legendText}>Sector 1</Text>
        </Box>
        <Box className={styles.legendItem}>
          <Box className={styles.legendSector2} />
          <Text className={styles.legendText}>Sector 2</Text>
        </Box>
        <Box className={styles.legendItem}>
          <Box className={styles.legendSector3} />
          <Text className={styles.legendText}>Sector 3</Text>
        </Box>
        <Box className={styles.legendItem}>
          <Box className={styles.legendLine} />
          <Text className={styles.legendText}>Start/Finish</Text>
        </Box>
      </Box>
    </Box>
  );
};

export default TrackMap;
