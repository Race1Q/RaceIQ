import React from 'react';
import styles from './Admin.module.css';

const Admin = () => {
  return (
    <div className={styles.adminContainer}>
      <h1 className={styles.adminTitle}>Admin Dashboard</h1>
      
      <div className={styles.adminOverview}>
        <h2 className={styles.adminOverviewTitle}>System Overview</h2>
        
        <div className={styles.statGrid}>
          {/* Admin stats cards */}
          <div className={styles.statCard}>
            <h3 className={styles.statCardTitle}>Total Users</h3>
            <p className={styles.statCardValue}>1,247</p>
            <p className={styles.statCardSubtitle}>+12% this week</p>
          </div>

          <div className={styles.statCard}>
            <h3 className={styles.statCardTitle}>Active Sessions</h3>
            <p className={styles.statCardValue}>89</p>
            <p className={styles.statCardSubtitle}>Currently online</p>
          </div>

          <div className={styles.statCard}>
            <h3 className={styles.statCardTitle}>API Calls</h3>
            <p className={styles.statCardValue}>45.2K</p>
            <p className={styles.statCardSubtitle}>Today</p>
          </div>

          <div className={styles.statCard}>
            <h3 className={styles.statCardTitle}>System Status</h3>
            <p className={`${styles.statCardValue} ${styles.statCardValueSuccess}`}>Healthy</p>
            <p className={styles.statCardSubtitle}>All systems operational</p>
          </div>
        </div>

        <div className={styles.adminToolsGrid}>
          {/* Admin tools */}
          <div className={styles.adminToolCard}>
            <h3 className={styles.adminToolCardTitle}>Quick Actions</h3>
            <div className={styles.actionButtons}>
              <button className={`${styles.actionButton} ${styles.actionButtonPrimary}`}>
                Refresh Data Cache
              </button>
              <button className={`${styles.actionButton} ${styles.actionButtonSecondary}`}>
                View System Logs
              </button>
              <button className={`${styles.actionButton} ${styles.actionButtonSecondary}`}>
                Manage Users
              </button>
            </div>
          </div>

          <div className={styles.adminToolCard}>
            <h3 className={styles.adminToolCardTitle}>Recent Activity</h3>
            <div className={styles.activityList}>
              <p className={styles.activityItem}>• New user registration: John Doe</p>
              <p className={styles.activityItem}>• API rate limit exceeded for IP: 192.168.1.100</p>
              <p className={styles.activityItem}>• Database backup completed successfully</p>
              <p className={styles.activityItem}>• System maintenance scheduled for 2:00 AM</p>
              <p className={styles.activityItem}>• Cache cleared for race data</p>
            </div>
          </div>
        </div>

        <div className={styles.adminFeatures}>
          <h3 className={styles.adminFeaturesTitle}>Admin Features</h3>
          <p className={styles.adminFeaturesDescription}>This admin dashboard provides system monitoring, user management, and configuration tools.</p>
          <p className={styles.adminFeaturesDescription}>Coming soon: Advanced analytics, automated alerts, and performance optimization tools.</p>
        </div>
      </div>
    </div>
  );
};

export default Admin;
