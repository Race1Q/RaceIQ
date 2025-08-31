import React from 'react';
import styles from './DriverList.module.css';
import { teamColors } from '../../lib/teamColors';

// 1. UPDATED INTERFACE to match the data from the /by-standings API endpoint.
interface ApiDriver {
  id: number;
  full_name: string;
  driver_number: number;
  team_name: string;
}

interface DriverListProps {
  drivers: ApiDriver[];
  selectedDriverId: number | null;
  setSelectedDriverId: (id: number) => void;
}

const DriverList: React.FC<DriverListProps> = ({ drivers, selectedDriverId, setSelectedDriverId }) => {
  if (!drivers || drivers.length === 0) {
    return <div className={styles.driverListContainer}>No drivers available.</div>;
  }

  return (
    <div className={styles.driverListContainer}>
      <h3 className={styles.listTitle}>Select a Driver</h3>
      <ul className={styles.list}>
        {drivers.map((driver) => {
          // Determine if the current driver is the selected one
          const isSelected = driver.id === selectedDriverId;
          const teamColor = teamColors[driver.team_name] || '#666666';

          return (
            <li
              // Create a more unique key to handle potential duplicate IDs from the API
              key={`${driver.id}-${driver.team_name}`}
              className={`${styles.driverItem} ${isSelected ? styles.selected : ''}`}
              // 2. UPDATED onClick to pass the correct numeric driver.id
              onClick={() => setSelectedDriverId(driver.id)}
              style={{ '--team-color-border': teamColor } as React.CSSProperties}
            >
              <div className={styles.driverNumber} style={{ color: teamColor }}>
                {driver.driver_number}
              </div>
              <div className={styles.driverInfo}>
                {/* 3. UPDATED JSX to use the new API field names */}
                <span className={styles.driverName}>{driver.full_name}</span>
                <span className={styles.teamName}>{driver.team_name}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default DriverList;
