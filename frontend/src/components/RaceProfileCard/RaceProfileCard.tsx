import React from 'react';
import ReactCountryFlag from 'react-country-flag';
import styles from './RaceProfileCard.module.css';
import type { Race } from '../../types/races';

interface RaceProfileCardProps {
  race: Race;
}

const RaceProfileCard: React.FC<RaceProfileCardProps> = ({ race }) => {
  // Create a gradient based on the race round/season
  const gradientStart = `hsl(${(race.round * 20) % 360}, 70%, 50%)`;
  const gradientEnd = `hsl(${(race.round * 20 + 30) % 360}, 70%, 30%)`;
  
  const cardStyle = {
    '--race-color-start': gradientStart,
    '--race-color-end': gradientEnd,
  } as React.CSSProperties;

  // Get country code for flag display based on circuit ID
  const getCountryCode = (circuitId: number | string): string => {
    // A comprehensive mapping of circuit IDs to their corresponding country codes
    const circuitCountryMap: { [key: number]: string } = {
      // 2024/2025 F1 Season Circuits
      1: 'AU', // Australia - Albert Park
      2: 'BH', // Bahrain - Bahrain International Circuit
      3: 'SA', // Saudi Arabia - Jeddah Corniche Circuit
      4: 'JP', // Japan - Suzuka International Racing Course
      5: 'CN', // China - Shanghai International Circuit
      6: 'US', // USA - Miami International Autodrome
      7: 'IT', // Italy - Autodromo Enzo e Dino Ferrari (Imola)
      8: 'MC', // Monaco - Circuit de Monaco
      9: 'CA', // Canada - Circuit Gilles Villeneuve
      10: 'ES', // Spain - Circuit de Barcelona-Catalunya
      11: 'AT', // Austria - Red Bull Ring
      12: 'GB', // Great Britain - Silverstone Circuit
      13: 'HU', // Hungary - Hungaroring
      14: 'BE', // Belgium - Circuit de Spa-Francorchamps
      15: 'NL', // Netherlands - Circuit Zandvoort
      16: 'IT', // Italy - Autodromo Nazionale Monza
      17: 'AZ', // Azerbaijan - Baku City Circuit
      18: 'SG', // Singapore - Marina Bay Street Circuit // USA - Circuit of the Americas
      20: 'MX', // Mexico - Autódromo Hermanos Rodríguez
      21: 'BR', // Brazil - Autódromo José Carlos Pace (Interlagos)
      22: 'US', // USA - Las Vegas Street Circuit
      23: 'QA', // Qatar - Lusail International Circuit
      24: 'AE', // UAE - Yas Marina Circuit
      
      // Additional circuits that might be in the database from provided CSV
      25: 'FR', // France - Circuit Paul Ricard
      26: 'DE', // Germany - Hockenheimring
      27: 'RU', // Russia - Sochi Autodrom
      28: 'TR', // Turkey - Istanbul Park
      29: 'IN', // India - Buddh International Circuit
      30: 'KR', // South Korea - Korean International Circuit
      31: 'MY', // Malaysia - Sepang International Circuit
      32: 'TH', // Thailand - Chang International Circuit
      33: 'VN', // Vietnam - Hanoi Street Circuit
      34: 'PT', // Portugal - Autódromo Internacional do Algarve
      35: 'CH', // Switzerland - Dijon-Prenois (historic)
      36: 'AR', // Argentina - Autódromo Oscar Alfredo Gálvez
      37: 'ZA', // South Africa - Kyalami Grand Prix Circuit
      38: 'MA', // Morocco - Circuit International Automobile Moulay El Hassan
      272: 'AU', // Adelaide Street Circuit
      273: 'MA', // Ain Diab
      274: 'GB', // Aintree
      275: 'AU', // Albert Park Grand Prix Circuit
      276: 'US', // Circuit of the Americas
      277: 'SE', // Scandinavian Raceway
      278: 'DE', // AVUS
      279: 'BH', // Bahrain International Circuit
      280: 'AZ', // Baku City Circuit
      281: 'PT', // Circuito da Boavista
      282: 'GB', // Brands Hatch
      283: 'CH', // Circuit Bremgarten
      334: 'CN', // Shanghai International Circuit
      335: 'GB', // Silverstone Circuit
      336: 'RU', // Sochi Autodrom
      337: 'BE', // Circuit de Spa-Francorchamps
      338: 'JP', // Suzuka Circuit
      339: 'CA', // Circuit Mont-Tremblant
      340: 'ES', // Valencia Street Circuit
      341: 'US', // Las Vegas Strip Street Circuit
      342: 'CA', // Circuit Gilles Villeneuve
      343: 'US', // Watkins Glen
      344: 'AE', // Yas Marina Circuit
    };
    
    // The circuit IDs in the data might be strings, so we convert them to numbers for lookup.
    const numericId = typeof circuitId === 'string' ? parseInt(circuitId, 10) : circuitId;
    return circuitCountryMap[numericId] || 'XX';
  };

  const countryCode = getCountryCode(race.circuit_id);
  
  // Debug logging
  console.log('Race:', race.name, 'Circuit ID:', race.circuit_id, 'Country Code:', countryCode);
  
  // Format race name for display
  const formatRaceName = (name: string): { shortName: string; fullName: string } => {
    const shortName = name.replace(/Grand Prix|GP/g, '').trim();
    const fullName = name;
    return { shortName, fullName };
  };

  const { shortName, fullName } = formatRaceName(race.name);

  return (
    <div className={styles.cardLink}>
      <div className={styles.card} style={cardStyle}>
        <div className={styles.cardTop}>
          <div className={styles.raceInfo}>
            <h2 className={styles.raceName}>
              <span className={styles.shortName}>{shortName}</span>
              <span className={styles.fullName}>{fullName}</span>
            </h2>
            <p className={styles.raceRound}>Round {race.round}</p>
          </div>

          <div className={styles.flagWrapper}>
            {countryCode !== 'XX' ? (
              <ReactCountryFlag
                countryCode={countryCode}
                svg={true}
                className={styles.flagImage}
                title={countryCode}
                style={{ fontSize: '2em' }}
              />
            ) : (
              <div className={styles.flagImage} style={{ 
                backgroundColor: '#666', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                ?
              </div>
            )}
          </div>
        </div>
        
        <div className={styles.cardBottom}>
          <div className={styles.raceDate}>
            {new Date(race.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
          <span className={styles.viewText}>View Details</span>
        </div>
      </div>
    </div>
  );
};

export default RaceProfileCard;
