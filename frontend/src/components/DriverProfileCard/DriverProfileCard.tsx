// frontend/src/components/DriverProfileCard/DriverProfileCard.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import ReactCountryFlag from 'react-country-flag';
import styles from './DriverProfileCard.module.css';
import userIcon from '../../assets/UserIcon.png';
import { getTextColorForBackground } from '../../lib/colorUtils';

interface Driver {
  id: string;
  name: string;
  number: string;
  team: string;
  nationality: string;
  image: string;
  team_color: string;
}

interface DriverProfileCardProps {
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

const DriverProfileCard: React.FC<DriverProfileCardProps> = ({ driver }) => {
  const teamColor = `#${driver.team_color || '666666'}`;
  const cardStyle = {
    '--team-color-start': teamColor,
    '--team-color-end': darkenColor(teamColor, 20), // Use a less intense darken for a brighter gradient
  } as React.CSSProperties;

  // 1. Determine the correct text color mode
  const textColorMode = getTextColorForBackground(driver.team_color);

  // 2. Conditionally add a class based on the result
  const cardClasses = `${styles.card} ${textColorMode === 'dark' ? styles.useDarkText : ''}`;

  // Split name for styling
  const [firstName, ...lastNameParts] = driver.name.split(' ');
  const lastName = lastNameParts.join(' ');

  return (
    <Link to={`/drivers/${driver.id}`} className={styles.cardLink}>
      {/* 3. Apply the conditional classes to the card */}
      <div className={cardClasses} style={cardStyle}>
        
        {/* The entire top section is now a single visual block */}
        <div className={styles.cardTop}>
          <div className={styles.driverInfo}>
            <h2 className={styles.driverName}>
              <span>{firstName}</span>
              <span>{lastName}</span>
            </h2>
            <p className={styles.teamName}>{driver.team}</p>
            <p className={styles.driverNumber}>{driver.number}</p>
          </div>

          <img
            src={driver.image || userIcon}
            alt={driver.name}
            className={styles.driverImage}
            onError={(e) => { e.currentTarget.src = userIcon; }}
          />
          
          <div className={styles.flagWrapper}>
            <img 
                src={`https://flagsapi.com/${driver.nationality}/flat/64.png`} 
                alt={`${driver.nationality} flag`}
                className={styles.flagImage}
            />
          </div>
        </div>
        
        {/* The "View Profile" button is now just a visual indicator */}
        <div className={styles.cardBottom}>
          <span>View Profile</span>
        </div>
      </div>
    </Link>
  );
};

export default DriverProfileCard;