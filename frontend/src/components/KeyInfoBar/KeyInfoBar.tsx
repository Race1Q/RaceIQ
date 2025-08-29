import React from 'react';
import { Link } from 'react-router-dom';
import InfoBlock from '../InfoBlock/InfoBlock';
import styles from './KeyInfoBar.module.css';
import { Trophy, TrendingUp, Calendar, ArrowLeft, Star } from 'lucide-react';

type FirstRace = { year: string; event: string };

interface DriverData {
  team: string;
  teamLogoUrl: string;
  teamLogoWhiteUrl: string;
  championshipStanding: string;
  points: number;
  wins: number;
  podiums: number;
  firstRace: FirstRace;
}

interface KeyInfoBarProps {
  driver: DriverData;
}

const KeyInfoBar: React.FC<KeyInfoBarProps> = ({ driver }) => {
  const handleLogoError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const tried = img.getAttribute('data-tried') || '0';
    if (tried === '0') {
      const alt = img.getAttribute('data-fallback');
      if (alt) {
        img.setAttribute('data-tried', '1');
        img.src = alt;
        return;
      }
    }
    img.src = '/gauge.svg';
    img.setAttribute('data-tried', '2');
  };
  return (
    <div className={styles.keyInfoBar}>
      <Link to="/drivers" className={styles.backButton} aria-label="Back to all drivers">
        <ArrowLeft size={24} />
      </Link>

      <div className={styles.teamLogoWrapper}>
        <img
          src={driver.teamLogoUrl}
          data-fallback={driver.teamLogoWhiteUrl}
          data-tried="0"
          alt={`${driver.team} logo`}
          className={`${styles.teamLogo} ${styles.logoColor}`}
          onError={handleLogoError}
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          loading="lazy"
        />
        <img
          src={driver.teamLogoWhiteUrl}
          data-fallback={driver.teamLogoUrl}
          data-tried="0"
          alt={`${driver.team} logo`}
          className={`${styles.teamLogo} ${styles.logoWhite}`}
          onError={handleLogoError}
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          loading="lazy"
        />
      </div>

      <div className={styles.statsContainer}>
        <h3 className={styles.statsTitle}>Career Stats</h3>
        <div className={styles.statsGrid}>
          <InfoBlock label="First Race" value={driver.firstRace} icon={<Calendar size={20} />} />
          <InfoBlock label="Wins" value={driver.wins} icon={<Trophy size={24} />} />
          <InfoBlock label="Podiums" value={driver.podiums} icon={<Star size={24} />} />
          <InfoBlock label="Points" value={driver.points} icon={<TrendingUp size={24} />} />
          <InfoBlock label="Standing" value={driver.championshipStanding} icon={<Trophy size={24} />} />
        </div>
      </div>
    </div>
  );
};

export default KeyInfoBar;


