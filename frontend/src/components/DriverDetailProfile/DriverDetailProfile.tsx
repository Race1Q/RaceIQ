// src/components/DriverDetailProfile/DriverDetailProfile.tsx

import React from 'react';
import styles from './DriverDetailProfile.module.css';
import userIcon from '../../assets/UserIcon.png';
import { Quote } from 'lucide-react';

interface Driver {
  name: string;
  team: string;
  image: string;
  funFact: string;
}

interface DriverDetailProfileProps {
  driver: Driver;
}

const DriverDetailProfile: React.FC<DriverDetailProfileProps> = ({ driver }) => {
  return (
    <div className={styles.profileCard}>
      <div className={styles.imageContainer}>
        <img
          src={driver.image || userIcon}
          alt={driver.name}
          className={styles.driverImage}
          onError={(e) => { e.currentTarget.src = userIcon; }}
        />
      </div>
      <div className={styles.infoContainer}>
        <h2 className={styles.driverName}>{driver.name}</h2>
        <p className={styles.teamName}>{driver.team}</p>
      </div>
      <div className={styles.funFactContainer}>
        <Quote className={styles.quoteIcon} size={20} />
        <p className={styles.funFactText}>{driver.funFact}</p>
      </div>
    </div>
  );
};

export default DriverDetailProfile;
