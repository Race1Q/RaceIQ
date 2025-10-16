// frontend/src/components/DriverDetailProfile/DriverDetailProfile.tsx

import React from 'react';
import styles from './DriverDetailProfile.module.css';
import userIcon from '../../assets/UserIcon.png'; // Fallback icon

interface DriverDetailProfileProps {
  name: string;
  team: string;
  imageUrl: string | null;
  funFact: string;
}

const DriverDetailProfile: React.FC<DriverDetailProfileProps> = ({ name, team, imageUrl, funFact }) => {
  // CRITICAL FIX: Add a defensive check.
  // If 'name' is undefined or not a string, default to an empty string to prevent the .split() crash.
  const nameToSplit = typeof name === 'string' ? name : '';
  const [firstName, ...lastNameParts] = nameToSplit.split(' ');
  const lastName = lastNameParts.join(' ');

  // DEBUG: Track image URL in component
  console.log(`🖼️ DriverDetailProfile image debug for ${nameToSplit}:`, {
    imageUrl,
    hasImageUrl: !!imageUrl,
    fallbackIcon: userIcon
  });

  return (
    <div className={styles.profileCard}>
      <div className={styles.imageContainer}>
        <img 
          src={imageUrl || userIcon} 
          alt={nameToSplit} 
          className={styles.driverImage}
          onLoad={() => console.log(`✅ DriverDetailProfile image loaded: ${imageUrl || userIcon}`)}
          onError={(e) => { 
            console.log(`❌ DriverDetailProfile image failed, using fallback: ${imageUrl}`, e);
            e.currentTarget.src = userIcon; 
          }}
        />
      </div>
      <div className={styles.infoContainer}>
        <h3 className={styles.driverName}>
          <span className={styles.firstName}>{firstName || 'Driver'}</span>
          <span className={styles.lastName}>{lastName || 'Name'}</span>
        </h3>
        <p className={styles.teamName}>{team || 'Unknown Team'}</p>
        <p className={styles.funFact}>{funFact || "Driver information is being loaded..."}</p>
      </div>
    </div>
  );
};

export default DriverDetailProfile;
