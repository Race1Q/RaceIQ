import React from 'react';
import './Admin.css';

const Admin = () => {
  return (
    <div className="admin-container">
      <h1 className="admin-title">Admin Dashboard</h1>
      
      <div className="admin-overview">
        <h2 className="admin-overview__title">System Overview</h2>
        
        <div className="stat-grid">
          {/* Admin stats cards */}
          <div className="stat-card">
            <h3 className="stat-card__title">Total Users</h3>
            <p className="stat-card__value">1,247</p>
            <p className="stat-card__subtitle">+12% this week</p>
          </div>

          <div className="stat-card">
            <h3 className="stat-card__title">Active Sessions</h3>
            <p className="stat-card__value">89</p>
            <p className="stat-card__subtitle">Currently online</p>
          </div>

          <div className="stat-card">
            <h3 className="stat-card__title">API Calls</h3>
            <p className="stat-card__value">45.2K</p>
            <p className="stat-card__subtitle">Today</p>
          </div>

          <div className="stat-card">
            <h3 className="stat-card__title">System Status</h3>
            <p className="stat-card__value stat-card__value--success">Healthy</p>
            <p className="stat-card__subtitle">All systems operational</p>
          </div>
        </div>

        <div className="admin-tools-grid">
          {/* Admin tools */}
          <div className="admin-tool-card">
            <h3 className="admin-tool-card__title">Quick Actions</h3>
            <div className="action-buttons">
              <button className="action-button action-button--primary">
                Refresh Data Cache
              </button>
              <button className="action-button action-button--secondary">
                View System Logs
              </button>
              <button className="action-button action-button--secondary">
                Manage Users
              </button>
            </div>
          </div>

          <div className="admin-tool-card">
            <h3 className="admin-tool-card__title">Recent Activity</h3>
            <div className="activity-list">
              <p className="activity-item">• New user registration: John Doe</p>
              <p className="activity-item">• API rate limit exceeded for IP: 192.168.1.100</p>
              <p className="activity-item">• Database backup completed successfully</p>
              <p className="activity-item">• System maintenance scheduled for 2:00 AM</p>
              <p className="activity-item">• Cache cleared for race data</p>
            </div>
          </div>
        </div>

        <div className="admin-features">
          <h3 className="admin-features__title">Admin Features</h3>
          <p className="admin-features__description">This admin dashboard provides system monitoring, user management, and configuration tools.</p>
          <p className="admin-features__description">Coming soon: Advanced analytics, automated alerts, and performance optimization tools.</p>
        </div>
      </div>
    </div>
  );
};

export default Admin;
