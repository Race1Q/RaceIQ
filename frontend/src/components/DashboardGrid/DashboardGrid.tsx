import React from 'react';
import { Grid } from '@chakra-ui/react';
import DriverDetailProfile from '../DriverDetailProfile/DriverDetailProfile';
import StatCard from '../StatCard/StatCard';
import WinsPerSeasonChart from '../WinsPerSeasonChart/WinsPerSeasonChart';
import LapByLapChart from '../LapByLapChart/LapByLapChart';
import { Trophy, Medal, Zap } from 'lucide-react';
import { teamColors } from '../../lib/teamColors';
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
  funFact: string;
  winsPerSeason: Array<{ season: string; wins: number }>;
  lapByLapData: Array<{ lap: number; position: number }>;
}

interface DashboardGridProps {
  driver: Driver;
}

const DashboardGrid: React.FC<DashboardGridProps> = ({ driver }) => {
  const teamColor = teamColors[driver.team] || '#e10600'; // fallback to red if team not found

  return (
    <Grid templateColumns="repeat(auto-fit, minmax(350px, 1fr))" gap={6} className={styles.grid}>
      <DriverDetailProfile driver={driver} />
      
      <StatCard
        icon={<Trophy />}
        label="Wins"
        value={driver.wins.toString()}
        description="Career victories"
        teamColor={teamColor}
      />
      
      <StatCard
        icon={<Medal />}
        label="Podiums"
        value={driver.podiums.toString()}
        description="Top 3 finishes"
        teamColor={teamColor}
      />
      
      <StatCard
        icon={<Zap />}
        label="Fastest Laps"
        value={driver.fastestLaps.toString()}
        description="Best lap times"
        teamColor={teamColor}
      />
      
      <WinsPerSeasonChart data={driver.winsPerSeason} teamColor={teamColor} />
      
      <LapByLapChart data={driver.lapByLapData} teamColor={teamColor} />
    </Grid>
  );
};

export default DashboardGrid;
