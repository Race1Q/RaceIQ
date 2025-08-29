import React from 'react';
import styles from './InfoBlock.module.css';

type StatValue = string | number | { year: string; event: string };

interface InfoBlockProps {
  label: string;
  value: StatValue;
  icon?: React.ReactNode;
}

const InfoBlock: React.FC<InfoBlockProps> = ({ label, value, icon }) => {
  const renderValue = () => {
    if (typeof value === 'object' && value !== null && 'year' in value) {
      return (
        <span className={`${styles.value} ${styles.valueStructured}`}>
          <span>{value.year}</span>
          <span className={styles.valueEvent}>{value.event}</span>
        </span>
      );
    }
    return <span className={styles.value}>{value}</span>;
  };

  return (
    <div className={styles.infoBlock}>
      {icon ? (
        <div className={styles.iconWrapper}>{icon}</div>
      ) : (
        <div className={styles.iconPlaceholder}></div>
      )}
      <div className={styles.textWrapper}>
        {renderValue()}
        <span className={styles.label}>{label}</span>
      </div>
    </div>
  );
};

export default InfoBlock;


