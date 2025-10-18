// frontend/src/components/TeamLogo/TeamLogo.tsx
import React from 'react';
import styles from './TeamLogo.module.css';

// Import all team logos as React components
import MclarenLogo from '../../assets/team_logos/McLaren_Racing_logo.svg?react';
import FerrariLogo from '../../assets/team_logos/Ferrari.svg?react';
import RedBullLogo from '../../assets/team_logos/Red_Bull.svg?react';
import MercedesLogo from '../../assets/team_logos/Mercedes.svg?react';
import WilliamsLogo from '../../assets/team_logos/Williams_Racing.svg?react';
import RbF1TeamLogo from '../../assets/team_logos/RB_F1_Team.svg?react';
import SauberLogo from '../../assets/team_logos/Kick_Sauber.svg?react';
import HaasLogo from '../../assets/team_logos/Haas_F1_Team.svg?react';
import AlpineLogo from '../../assets/team_logos/Alpine_F1_Team.svg?react';
import AstonMartinLogo from '../../assets/team_logos/Aston_Martin.svg?react';

interface TeamLogoProps {
  teamName: string;
}

const TeamLogo: React.FC<TeamLogoProps> = ({ teamName }) => {
  const logoMap: { [key: string]: React.FC<any> } = {
    'McLaren': MclarenLogo,
    'Mercedes': MercedesLogo,
    'Williams': WilliamsLogo,
    'Williams Racing': WilliamsLogo, // Alternative name
    'RB F1 Team': RbF1TeamLogo,
    'Sauber': SauberLogo,
    'Haas F1 Team': HaasLogo,
    'Alpine': AlpineLogo,
    'Alpine F1 Team': AlpineLogo, // Alternative name
    'Aston Martin': AstonMartinLogo,
    'Aston Martin F1 Team': AstonMartinLogo, // Alternative name
    // Exceptions
    'Ferrari': FerrariLogo,
    'Red Bull Racing': RedBullLogo,
    'Red Bull': RedBullLogo, // Alternative name
  };

  const LogoComponent = logoMap[teamName];
  const isHistorical = !LogoComponent;

  // Return F1 logo for historical teams
  if (isHistorical) {
    return (
      <div className={styles.logoContainer}>
        {/* Use asset from public folder to avoid import resolution issues */}
        <img 
          src="/assets/logos/F1LOGO.png" 
          alt="F1 Logo" 
          className={styles.historicalLogo}
        />
      </div>
    );
  }

  const isThemed = !['Ferrari', 'Red Bull Racing'].includes(teamName);
  const isWilliams = teamName === "Williams" || teamName === "Williams Racing";
  
  return (
    <div className={isWilliams ? styles.williamsLogo : styles.logoContainer}>
      <LogoComponent className={isThemed ? styles.themedLogo : styles.untouchedLogo} />
    </div>
  );
};

export default TeamLogo;
