import React from 'react';
import styles from './InfoBlock.module.css';

interface InfoBlockProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

const InfoBlock: React.FC<InfoBlockProps> = ({ label, value, icon }) => {
  return (
    <div className={styles.infoBlock}>
      {icon && <div className={styles.iconWrapper}>{icon}</div>}
      <div className={styles.textWrapper}>
        <span className={styles.value}>{value}</span>
        <span className={styles.label}>{label}</span>
      </div>
    </div>
  );
};

export default InfoBlock;


