import React from 'react';

const Drivers2 = () => {
  return (
    <div className="container" style={{ paddingTop: '100px', minHeight: '60vh' }}>
      <h1 style={{ color: '#e10600', marginBottom: '30px' }}>F1 Drivers</h1>
      
      <div style={{ 
        background: '#1a1a1a', 
        padding: '40px', 
        borderRadius: '12px',
        border: '1px solid #333'
      }}>
        <h2 style={{ color: '#ffffff', marginBottom: '20px' }}>Current Season Drivers</h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '20px',
          marginTop: '30px'
        }}>
          {/* Dummy driver cards */}
          <div style={{ 
            background: '#0f0f0f', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #333'
          }}>
            <h3 style={{ color: '#e10600', marginBottom: '10px' }}>Max Verstappen</h3>
            <p style={{ color: '#cccccc', marginBottom: '5px' }}><strong>Team:</strong> Red Bull Racing</p>
            <p style={{ color: '#cccccc', marginBottom: '5px' }}><strong>Number:</strong> 1</p>
            <p style={{ color: '#cccccc' }}><strong>Nationality:</strong> Dutch</p>
          </div>

          <div style={{ 
            background: '#0f0f0f', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #333'
          }}>
            <h3 style={{ color: '#e10600', marginBottom: '10px' }}>Lewis Hamilton</h3>
            <p style={{ color: '#cccccc', marginBottom: '5px' }}><strong>Team:</strong> Mercedes</p>
            <p style={{ color: '#cccccc', marginBottom: '5px' }}><strong>Number:</strong> 44</p>
            <p style={{ color: '#cccccc' }}><strong>Nationality:</strong> British</p>
          </div>

          <div style={{ 
            background: '#0f0f0f', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #333'
          }}>
            <h3 style={{ color: '#e10600', marginBottom: '10px' }}>Charles Leclerc</h3>
            <p style={{ color: '#cccccc', marginBottom: '5px' }}><strong>Team:</strong> Ferrari</p>
            <p style={{ color: '#cccccc', marginBottom: '5px' }}><strong>Number:</strong> 16</p>
            <p style={{ color: '#cccccc' }}><strong>Nationality:</strong> Monegasque</p>
          </div>

          <div style={{ 
            background: '#0f0f0f', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #333'
          }}>
            <h3 style={{ color: '#e10600', marginBottom: '10px' }}>Lando Norris</h3>
            <p style={{ color: '#cccccc', marginBottom: '5px' }}><strong>Team:</strong> McLaren</p>
            <p style={{ color: '#cccccc', marginBottom: '5px' }}><strong>Number:</strong> 4</p>
            <p style={{ color: '#cccccc' }}><strong>Nationality:</strong> British</p>
          </div>
        </div>

        <div style={{ 
          marginTop: '40px', 
          padding: '20px', 
          background: '#0f0f0f', 
          borderRadius: '8px',
          border: '1px solid #333'
        }}>
          <h3 style={{ color: '#e10600', marginBottom: '15px' }}>Driver Statistics</h3>
          <p style={{ color: '#cccccc' }}>This page will show detailed driver statistics, performance metrics, and career highlights.</p>
          <p style={{ color: '#cccccc', marginTop: '10px' }}>Coming soon: Driver comparison tools, historical data, and real-time performance tracking.</p>
        </div>
      </div>
    </div>
  );
};

export default Drivers2;
