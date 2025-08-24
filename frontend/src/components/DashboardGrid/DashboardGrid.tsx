import React from 'react';
import { Grid } from '@chakra-ui/react';
import DriverProfileCard from '../DriverProfileCard/DriverProfileCard';
import StatCard from '../StatCard/StatCard';
import WinsPerSeasonChart from '../WinsPerSeasonChart/WinsPerSeasonChart';
import LapByLapChart from '../LapByLapChart/LapByLapChart';
import { Trophy, Medal, Zap } from 'lucide-react';
import styles from './DashboardGrid.module.css';

interface Driver {
  id: string;
  name: string;
  number: string;
  team: string;
  nationality: string;
  wins: number;
  podiums: number;
  fastestLaps: number;
  points: number;
  image: string;
  winsPerSeason: Array<{ season: string; wins: number }>;
  lapByLapData: Array<{ lap: number; position: number }>;
}

interface DashboardGridProps {
  driver: Driver;
}

const DashboardGrid: React.FC<DashboardGridProps> = ({ driver }) => {
  return (
    <Grid templateColumns="repeat(auto-fit, minmax(350px, 1fr))" gap={6} className={styles.grid}>
      <DriverProfileCard driver={driver} />
      
      <StatCard
        icon={<Trophy />}
        label="Wins"
        value={driver.wins.toString()}
        description="Career victories"
      />
      
      <StatCard
        icon={<Medal />}
        label="Podiums"
        value={driver.podiums.toString()}
        description="Top 3 finishes"
      />
      
      <StatCard
        icon={<Zap />}
        label="Fastest Laps"
        value={driver.fastestLaps.toString()}
        description="Best lap times"
      />
      
      <WinsPerSeasonChart data={driver.winsPerSeason} />
      
      <LapByLapChart data={driver.lapByLapData} />
    </Grid>
  );
};

export default DashboardGrid;
