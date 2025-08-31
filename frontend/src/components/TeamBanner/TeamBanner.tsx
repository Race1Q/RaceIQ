// frontend/src/components/TeamBanner/TeamBanner.tsx
import React, { useState } from 'react';
import styles from './TeamBanner.module.css';

interface TeamBannerProps {
  teamName: string;
  logoUrl: string;
  teamColor: string;
}

const TeamBanner: React.FC<TeamBannerProps> = ({ teamName, logoUrl, teamColor }) => {
  const [logoError, setLogoError] = useState(false);
  
  const bannerStyle = {
    '--team-color': `#${teamColor}`,
  } as React.CSSProperties;

  const handleLogoError = () => {
    setLogoError(true);
  };

  return (
    <div className={styles.bannerContainer} style={bannerStyle}>
      <h2 className={styles.teamName}>{teamName}</h2>
      {!logoError && logoUrl ? (
        <img 
          src={logoUrl} 
          alt={`${teamName} Logo`} 
          className={styles.teamLogo} 
          onError={handleLogoError}
        />
      ) : (
        <div className={styles.logoPlaceholder}>
          <span className={styles.placeholderText}>{teamName.charAt(0)}</span>
        </div>
      )}
    </div>
  );
};

export default TeamBanner;
