// frontend/src/components/LegacyDriverCard/LegacyDriverCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './LegacyDriverCard.module.css';
import userIcon from '../../assets/UserIcon.png';

interface Driver {
  id: string;
  name: string;
  team: string;
  nationality: string;
  image: string;
}

interface LegacyCardProps {
  driver: Driver;
}

const LegacyDriverCard: React.FC<LegacyCardProps> = ({ driver }) => {
  return (
    <Link to={`/drivers/${driver.id}`} className={styles.cardLink}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <img
            src={driver.image || userIcon}
            alt={driver.name}
            className={styles.driverImage}
            onError={(e) => { e.currentTarget.src = userIcon; }}
          />
        </div>
        <div className={styles.cardBody}>
          <h2 className={styles.driverName}>{driver.name}</h2>
          <p className={styles.driverDetail}><strong>Team:</strong> {driver.team}</p>
          <p className={styles.driverDetail}><strong>Country:</strong> {driver.nationality}</p>
          <div className={styles.viewProfileButton}>
            View Profile
          </div>
        </div>
      </div>
    </Link>
  );
};

export default LegacyDriverCard;
