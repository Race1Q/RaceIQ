import React from 'react';
import styles from './F1LoadingSpinner.module.css';

interface F1LoadingSpinnerProps {
  text: string;
}

const F1LoadingSpinner: React.FC<F1LoadingSpinnerProps> = ({ text }) => {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingText}>{text}</div>
      <div className={styles.speedometer}>
        <div className={styles.speedometerDial}>
          <div className={styles.speedometerNeedle}></div>
          <div className={styles.speedometerMarkings}>
            <div className={`${styles.speedometerMarking} ${styles.major}`}></div>
            <div className={styles.speedometerMarking}></div>
            <div className={styles.speedometerMarking}></div>
            <div className={`${styles.speedometerMarking} ${styles.major}`}></div>
            <div className={styles.speedometerMarking}></div>
            <div className={styles.speedometerMarking}></div>
            <div className={`${styles.speedometerMarking} ${styles.major}`}></div>
          </div>
          <div className={styles.speedometerNumbers}>
            <div className={styles.speedometerNumber}>0</div>
            <div className={styles.speedometerNumber}>50</div>
            <div className={styles.speedometerNumber}>100</div>
            <div className={styles.speedometerNumber}>150</div>
            <div className={styles.speedometerNumber}>200</div>
            <div className={styles.speedometerNumber}>250</div>
            <div className={styles.speedometerNumber}>300</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default F1LoadingSpinner;
