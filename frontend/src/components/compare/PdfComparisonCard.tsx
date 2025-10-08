import { forwardRef, useState, useEffect } from 'react';

interface Driver {
  fullName: string;
  imageUrl: string;
  teamColorToken: string;
  teamColorHex?: string;
}

interface ComparisonRow {
  label: string;
  value1: string | number;
  value2: string | number;
  better1?: boolean;
  better2?: boolean;
}

interface Props {
  driver1: Driver;
  driver2: Driver;
  rows: ComparisonRow[];
}

// Helper function to convert image to base64
async function imageToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Failed to convert image:', error);
    return '';
  }
}

const PdfComparisonCard = forwardRef<HTMLDivElement, Props>(({ driver1, driver2, rows }, ref) => {
  const [driver1Image, setDriver1Image] = useState<string>('');
  const [driver2Image, setDriver2Image] = useState<string>('');

  useEffect(() => {
    // Convert images to base64
    imageToBase64(driver1.imageUrl).then(setDriver1Image);
    imageToBase64(driver2.imageUrl).then(setDriver2Image);
  }, [driver1.imageUrl, driver2.imageUrl]);

  const driver1Color = driver1.teamColorHex || driver1.teamColorToken || '#CCCCCC';
  const driver2Color = driver2.teamColorHex || driver2.teamColorToken || '#CCCCCC';

  return (
    <div 
      ref={ref} 
      style={{ 
        backgroundColor: '#0a0a0a',
        padding: '0px',
        minWidth: '800px',
        overflow: 'hidden',
        fontFamily: "'Orbitron', sans-serif"
      }}
    >
      {/* Driver Headshots with Team Color Backgrounds */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0px' }}>
        <div 
          style={{ 
            textAlign: 'center',
            backgroundColor: driver1Color,
            padding: '40px',
            position: 'relative',
            minHeight: '300px'
          }}
        >
          {driver1Image && (
            <img
              src={driver1Image}
              alt={driver1.fullName}
              style={{
                width: '200px',
                height: '200px',
                objectFit: 'cover',
                display: 'block',
                margin: '0 auto 16px',
                border: '4px solid white',
                borderRadius: '12px'
              }}
            />
          )}
          <h2 style={{ 
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold',
            margin: 0,
            fontFamily: "'Orbitron', sans-serif"
          }}>
            {driver1.fullName}
          </h2>
        </div>

        <div 
          style={{ 
            textAlign: 'center',
            backgroundColor: driver2Color,
            padding: '40px',
            position: 'relative',
            minHeight: '300px'
          }}
        >
          {driver2Image && (
            <img
              src={driver2Image}
              alt={driver2.fullName}
              style={{
                width: '200px',
                height: '200px',
                objectFit: 'cover',
                display: 'block',
                margin: '0 auto 16px',
                border: '4px solid white',
                borderRadius: '12px'
              }}
            />
          )}
          <h2 style={{ 
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold',
            margin: 0,
            fontFamily: "'Orbitron', sans-serif"
          }}>
            {driver2.fullName}
          </h2>
        </div>
      </div>

      {/* Head-to-Head Comparison Table */}
      <div style={{ 
        padding: '40px', 
        backgroundColor: '#1a1a1a',
        color: '#ffffff'
      }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '28px',
          fontWeight: 'bold',
          marginBottom: '24px',
          fontFamily: "'Orbitron', sans-serif",
          color: '#ffffff'
        }}>
          Head-to-Head Comparison
        </h2>

        <div style={{
          backgroundColor: '#2a2a2a',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '16px'
          }}>
            <thead style={{ backgroundColor: '#3a3a3a' }}>
              <tr>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  borderBottom: '2px solid #4a4a4a'
                }}>Statistic</th>
                <th style={{
                  padding: '16px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  borderBottom: '2px solid #4a4a4a'
                }}>{driver1.fullName}</th>
                <th style={{
                  padding: '16px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  borderBottom: '2px solid #4a4a4a'
                }}>{driver2.fullName}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx} style={{
                  backgroundColor: idx % 2 === 0 ? '#2a2a2a' : '#1a1a1a'
                }}>
                  <td style={{
                    padding: '16px',
                    fontWeight: 'bold',
                    color: '#ffffff',
                    borderBottom: '1px solid #4a4a4a'
                  }}>{row.label}</td>
                  <td style={{
                    padding: '16px',
                    textAlign: 'center',
                    fontWeight: row.better1 ? 'bold' : 'normal',
                    color: row.better1 ? '#e10600' : '#ffffff',
                    fontSize: '18px',
                    borderBottom: '1px solid #4a4a4a'
                  }}>
                    {row.value1}
                  </td>
                  <td style={{
                    padding: '16px',
                    textAlign: 'center',
                    fontWeight: row.better2 ? 'bold' : 'normal',
                    color: row.better2 ? '#e10600' : '#ffffff',
                    fontSize: '18px',
                    borderBottom: '1px solid #4a4a4a'
                  }}>
                    {row.value2}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

PdfComparisonCard.displayName = 'PdfComparisonCard';

export default PdfComparisonCard;

