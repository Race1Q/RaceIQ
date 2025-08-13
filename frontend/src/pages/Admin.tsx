import React from 'react';

const Admin = () => {
  return (
    <div className="container" style={{ paddingTop: '100px', minHeight: '60vh' }}>
      <h1 style={{ color: '#e10600', marginBottom: '30px' }}>Admin Dashboard</h1>
      
      <div style={{ 
        background: '#1a1a1a', 
        padding: '40px', 
        borderRadius: '12px',
        border: '1px solid #333'
      }}>
        <h2 style={{ color: '#ffffff', marginBottom: '20px' }}>System Overview</h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px',
          marginBottom: '40px'
        }}>
          {/* Admin stats cards */}
          <div style={{ 
            background: '#0f0f0f', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #333',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#e10600', marginBottom: '10px' }}>Total Users</h3>
            <p style={{ color: '#ffffff', fontSize: '2rem', fontWeight: 'bold' }}>1,247</p>
            <p style={{ color: '#888', fontSize: '0.9rem' }}>+12% this week</p>
          </div>

          <div style={{ 
            background: '#0f0f0f', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #333',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#e10600', marginBottom: '10px' }}>Active Sessions</h3>
            <p style={{ color: '#ffffff', fontSize: '2rem', fontWeight: 'bold' }}>89</p>
            <p style={{ color: '#888', fontSize: '0.9rem' }}>Currently online</p>
          </div>

          <div style={{ 
            background: '#0f0f0f', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #333',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#e10600', marginBottom: '10px' }}>API Calls</h3>
            <p style={{ color: '#ffffff', fontSize: '2rem', fontWeight: 'bold' }}>45.2K</p>
            <p style={{ color: '#888', fontSize: '0.9rem' }}>Today</p>
          </div>

          <div style={{ 
            background: '#0f0f0f', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #333',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#e10600', marginBottom: '10px' }}>System Status</h3>
            <p style={{ color: '#00ff00', fontSize: '1.2rem', fontWeight: 'bold' }}>Healthy</p>
            <p style={{ color: '#888', fontSize: '0.9rem' }}>All systems operational</p>
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: '30px'
        }}>
          {/* Admin tools */}
          <div style={{ 
            background: '#0f0f0f', 
            padding: '25px', 
            borderRadius: '8px',
            border: '1px solid #333'
          }}>
            <h3 style={{ color: '#e10600', marginBottom: '20px' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button style={{ 
                background: '#e10600', 
                color: '#ffffff', 
                border: 'none', 
                padding: '10px 15px', 
                borderRadius: '5px',
                cursor: 'pointer'
              }}>
                Refresh Data Cache
              </button>
              <button style={{ 
                background: '#333', 
                color: '#ffffff', 
                border: 'none', 
                padding: '10px 15px', 
                borderRadius: '5px',
                cursor: 'pointer'
              }}>
                View System Logs
              </button>
              <button style={{ 
                background: '#333', 
                color: '#ffffff', 
                border: 'none', 
                padding: '10px 15px', 
                borderRadius: '5px',
                cursor: 'pointer'
              }}>
                Manage Users
              </button>
            </div>
          </div>

          <div style={{ 
            background: '#0f0f0f', 
            padding: '25px', 
            borderRadius: '8px',
            border: '1px solid #333'
          }}>
            <h3 style={{ color: '#e10600', marginBottom: '20px' }}>Recent Activity</h3>
            <div style={{ color: '#cccccc' }}>
              <p style={{ marginBottom: '10px' }}>• New user registration: John Doe</p>
              <p style={{ marginBottom: '10px' }}>• API rate limit exceeded for IP: 192.168.1.100</p>
              <p style={{ marginBottom: '10px' }}>• Database backup completed successfully</p>
              <p style={{ marginBottom: '10px' }}>• System maintenance scheduled for 2:00 AM</p>
              <p>• Cache cleared for race data</p>
            </div>
          </div>
        </div>

        <div style={{ 
          marginTop: '40px', 
          padding: '20px', 
          background: '#0f0f0f', 
          borderRadius: '8px',
          border: '1px solid #333'
        }}>
          <h3 style={{ color: '#e10600', marginBottom: '15px' }}>Admin Features</h3>
          <p style={{ color: '#cccccc' }}>This admin dashboard provides system monitoring, user management, and configuration tools.</p>
          <p style={{ color: '#cccccc', marginTop: '10px' }}>Coming soon: Advanced analytics, automated alerts, and performance optimization tools.</p>
        </div>
      </div>
    </div>
  );
};

export default Admin;
