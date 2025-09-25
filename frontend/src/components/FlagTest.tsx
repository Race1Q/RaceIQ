import React from 'react';
import ReactCountryFlag from 'react-country-flag';

export const FlagTest = () => (
  <div style={{ padding: '40px', backgroundColor: 'white', margin: '20px' }}>
    <p style={{ color: 'black', fontSize: '24px' }}>
      Below this text, a US flag should be visible:
    </p>
    <ReactCountryFlag
      countryCode="us"
      svg
      style={{
        width: '100px',
        height: '75px',
      }}
      title="United States"
    />
  </div>
);

export default FlagTest;

