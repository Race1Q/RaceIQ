import React from 'react';
import { Link } from 'react-router-dom';
import InfoBlock from '../InfoBlock/InfoBlock';
import styles from './KeyInfoBar.module.css';
import { Trophy, TrendingUp, Calendar, ArrowLeft } from 'lucide-react';

interface DriverData {
  team: string;
  teamLogoUrl: string;
  teamLogoWhiteUrl: string;
  championshipStanding: string;
  points: number;
  wins: number;
  podiums: number;
  firstRace: string;
}

interface KeyInfoBarProps {
  driver: DriverData;
}

const KeyInfoBar: React.FC<KeyInfoBarProps> = ({ driver }) => {
  return (
    <div className={styles.keyInfoBar}>
      <Link to="/drivers" className={styles.backButton} aria-label="Back to all drivers">
        <ArrowLeft size={24} />
      </Link>

      <div className={styles.teamLogoWrapper}>
        <img src={driver.teamLogoUrl} alt={`${driver.team} logo`} className={`${styles.teamLogo} ${styles.logoColor}`} />
        <img src={driver.teamLogoWhiteUrl} alt={`${driver.team} logo`} className={`${styles.teamLogo} ${styles.logoWhite}`} />
      </div>

      <div className={styles.statsContainer}>
        <h3 className={styles.statsTitle}>Career Stats</h3>
        <div className={styles.statsGrid}>
          <InfoBlock label="Championship" value={driver.championshipStanding} icon={<Trophy size={24} />} />
          <InfoBlock label="Points" value={driver.points} icon={<TrendingUp size={24} />} />
          <InfoBlock label="Wins" value={driver.wins} />
          <InfoBlock label="Podiums" value={driver.podiums} />
          <InfoBlock label="First Race" value={driver.firstRace} icon={<Calendar size={20} />} />
        </div>
      </div>
    </div>
  );
};

export default KeyInfoBar;


