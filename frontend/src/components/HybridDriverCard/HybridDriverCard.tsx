// frontend/src/components/HybridDriverCard/HybridDriverCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './HybridDriverCard.module.css';
import userIcon from '../../assets/UserIcon.png';

interface Driver {
  id: string;
  name: string;
  number: string;
  team: string;
  nationality: string;
  image: string;
  team_color: string;
}

interface HybridCardProps {
  driver: Driver;
}

const darkenColor = (hex: string, percent: number): string => {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const factor = (100 - percent) / 100;
  const darkenedR = Math.round(Math.max(0, r * factor));
  const darkenedG = Math.round(Math.max(0, g * factor));
  const darkenedB = Math.round(Math.max(0, b * factor));
  return `#${darkenedR.toString(16).padStart(2, '0')}${darkenedG.toString(16).padStart(2, '0')}${darkenedB.toString(16).padStart(2, '0')}`;
};

const HybridDriverCard: React.FC<HybridCardProps> = ({ driver }) => {
  const teamColor = `#${driver.team_color || '666666'}`;
  const cardStyle = {
    '--team-color-start': teamColor,
    '--team-color-end': darkenColor(teamColor, 30),
  } as React.CSSProperties;

  const [firstName, ...lastNameParts] = driver.name.split(' ');
  const lastName = lastNameParts.join(' ');

  return (
    <Link to={`/drivers/${driver.id}`} className={styles.cardLink}>
      <div className={styles.card} style={cardStyle}>
        {/* Top 60% of the card for visuals */}
        <div className={styles.cardTop}>
          <div className={styles.driverNumber}>{driver.number}</div>
          <h2 className={styles.driverName}>
            <span>{firstName}</span>
            <span>{lastName}</span>
          </h2>
          <img
            src={driver.image || userIcon}
            alt={driver.name}
            className={styles.driverImage}
            onError={(e) => { e.currentTarget.src = userIcon; }}
          />
        </div>

        {/* Bottom 40% for info and button */}
        <div className={styles.cardBottom}>
          <div className={styles.infoBlock}>
            <p className={styles.driverDetail}><strong>Team:</strong> {driver.team}</p>
            <p className={styles.driverDetail}><strong>Country:</strong> {driver.nationality}</p>
          </div>
          <div className={styles.viewProfileButton}>
            View Profile
          </div>
        </div>
      </div>
    </Link>
  );
};

export default HybridDriverCard;
