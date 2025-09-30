// frontend/src/components/DashboardGrid/DashboardGrid.tsx

import React from 'react';
import { Grid } from '@chakra-ui/react';
import DriverDetailProfile from '../DriverDetailProfile/DriverDetailProfile';
import StatCard from '../StatCard/StatCard';
import WinsPerSeasonChart from '../WinsPerSeasonChart/WinsPerSeasonChart';
import { Trophy, Medal, Zap } from 'lucide-react';
import { teamColors } from '../../lib/teamColors';
// No longer need to import the CSS module
// import styles from './DashboardGrid.module.css'; 

interface DashboardGridProps {
  driver: any;
}

const DashboardGrid: React.FC<DashboardGridProps> = ({ driver }) => {
  // --- Data handling logic remains unchanged ---
  const driverName = driver.fullName || driver.name || '';
  const teamName = driver.teamName || driver.team || 'Unknown Team';
  const imageUrl = driver.imageUrl || null;
  const funFact = driver.funFact || "No fun fact available.";
  
  const wins = driver.wins || 0;
  const podiums = driver.podiums || 0;
  const fastestLaps = driver.fastestLaps || 0;
  const winsPerSeason = driver.winsPerSeason || [];
  
  const teamColor = teamColors[teamName] || '#e10600';

  return (
    <Grid
      // --- All styles are now theme-aware Chakra props ---
      w="100%"
      minH="100vh"
      p="lg" // Use theme token for padding
      gap="lg" // Use theme token for gap
      templateColumns="repeat(auto-fit, minmax(350px, 1fr))"
      // No className needed
    >
      
      <DriverDetailProfile 
        name={driverName}
        team={teamName} 
        imageUrl={imageUrl}
        funFact={funFact} 
      />
      
      <StatCard
        icon={<Trophy />}
        label="Wins"
        value={wins.toString()}
        description="Career victories"
        teamColor={teamColor}
      />
      
      <StatCard
        icon={<Medal />}
        label="Podiums"
        value={podiums.toString()}
        description="Top 3 finishes"
        teamColor={teamColor}
      />
      
      <StatCard
        icon={<Zap />}
        label="Fastest Laps"
        value={fastestLaps > 0 ? fastestLaps.toString() : 'N/A'}
        description={fastestLaps > 0 ? "Career fastest laps" : "Data not available"}
        teamColor={teamColor}
      />
      
      {winsPerSeason.length > 0 && (
        <WinsPerSeasonChart data={winsPerSeason} teamColor={teamColor} />
      )}
    </Grid>
  );
};

export default DashboardGrid;