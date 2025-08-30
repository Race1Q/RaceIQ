// frontend/src/components/DriverProfileCard/DriverProfileCard.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import ReactCountryFlag from 'react-country-flag';
import styles from './DriverProfileCard.module.css';
import userIcon from '../../assets/UserIcon.png';
import { getTextColorForBackground } from '../../lib/colorUtils';

// Country code mapping for 3-letter to 2-letter ISO codes
const countryCodeMap: { [key: string]: string } = {
  'NED': 'NL',
  'GBR': 'GB',
  'MON': 'MC',
  'GER': 'DE',
  'FIN': 'FI',
  'FRA': 'FR',
  'ESP': 'ES',
  'ITA': 'IT',
  'AUS': 'AU',
  'CAN': 'CA',
  'USA': 'US',
  'BRA': 'BR',
  'MEX': 'MX',
  'JPN': 'JP',
  'CHN': 'CN',
  'RUS': 'RU',
  'THA': 'TH',
  'KOR': 'KR',
  'IND': 'IN',
  'SGP': 'SG',
  'UAE': 'AE',
  'SAU': 'SA',
  'QAT': 'QA',
  'TUR': 'TR',
  'HUN': 'HU',
  'BEL': 'BE',
  'NLD': 'NL',
  'AUT': 'AT',
  'CHE': 'CH',
  'SWE': 'SE',
  'NOR': 'NO',
  'DEN': 'DK',
  'POL': 'PL',
  'CZE': 'CZ',
  'SVK': 'SK',
  'HRV': 'HR',
  'SVN': 'SI',
  'ROU': 'RO',
  'BGR': 'BG',
  'GRC': 'GR',
  'PRT': 'PT',
  'IRL': 'IE',
  'ISL': 'IS',
  'LUX': 'LU',
  'LVA': 'LV',
  'LTU': 'LT',
  'EST': 'EE',
  'CYP': 'CY',
  'MLT': 'MT',
  'ALB': 'AL',
  'MKD': 'MK',
  'BIH': 'BA',
  'MNE': 'ME',
  'SRB': 'RS',
  'KOS': 'XK',
  'MDA': 'MD',
  'UKR': 'UA',
  'BLR': 'BY',
  'GEO': 'GE',
  'ARM': 'AM',
  'AZE': 'AZ',
  'KAZ': 'KZ',
  'UZB': 'UZ',
  'TKM': 'TM',
  'TJK': 'TJ',
  'KGZ': 'KG',
  'MNG': 'MN',
  'AFG': 'AF',
  'PAK': 'PK',
  'IRN': 'IR',
  'IRQ': 'IQ',
  'SYR': 'SY',
  'LBN': 'LB',
  'ISR': 'IL',
  'PSE': 'PS',
  'JOR': 'JO',
  'YEM': 'YE',
  'OMN': 'OM',
  'KWT': 'KW',
  'BHR': 'BH',
  'EGY': 'EG',
  'LBY': 'LY',
  'TUN': 'TN',
  'DZA': 'DZ',
  'MAR': 'MA',
  'ESH': 'EH',
  'MRT': 'MR',
  'MLI': 'ML',
  'NER': 'NE',
  'TCD': 'TD',
  'SDN': 'SD',
  'SSD': 'SS',
  'ETH': 'ET',
  'ERI': 'ER',
  'DJI': 'DJ',
  'SOM': 'SO',
  'KEN': 'KE',
  'UGA': 'UG',
  'RWA': 'RW',
  'BDI': 'BI',
  'TZA': 'TZ',
  'MOZ': 'MZ',
  'ZWE': 'ZW',
  'ZMB': 'ZM',
  'MWI': 'MW',
  'AGO': 'AO',
  'NAM': 'NA',
  'BWA': 'BW',
  'ZAF': 'ZA',
  'LSO': 'LS',
  'SWZ': 'SZ',
  'MDG': 'MG',
  'COM': 'KM',
  'MUS': 'MU',
  'SYC': 'SC',
  'CPV': 'CV',
  'GMB': 'GM',
  'SEN': 'SN',
  'GIN': 'GN',
  'GNB': 'GW',
  'SLE': 'SL',
  'LBR': 'LR',
  'CIV': 'CI',
  'GHA': 'GH',
  'TGO': 'TG',
  'BEN': 'BJ',
  'NGA': 'NG',
  'CMR': 'CM',
  'CAF': 'CF',
  'GAB': 'GA',
  'COG': 'CG',
  'COD': 'CD',
  'GNQ': 'GQ',
  'STP': 'ST',
  'BFA': 'BF',
  'TCD': 'TD',
  'NER': 'NE',
  'MLI': 'ML',
  'MRT': 'MR',
  'ESH': 'EH',
  'MAR': 'MA',
  'DZA': 'DZ',
  'TUN': 'TN',
  'LBY': 'LY',
  'EGY': 'EG',
  'BHR': 'BH',
  'KWT': 'KW',
  'OMN': 'OM',
  'YEM': 'YE',
  'JOR': 'JO',
  'PSE': 'PS',
  'ISR': 'IL',
  'LBN': 'LB',
  'SYR': 'SY',
  'IRQ': 'IQ',
  'IRN': 'IR',
  'PAK': 'PK',
  'AFG': 'AF',
  'MNG': 'MN',
  'KGZ': 'KG',
  'TJK': 'TJ',
  'TKM': 'TM',
  'UZB': 'UZ',
  'KAZ': 'KZ',
  'AZE': 'AZ',
  'ARM': 'AM',
  'GEO': 'GE',
  'BLR': 'BY',
  'UKR': 'UA',
  'MDA': 'MD',
  'KOS': 'XK',
  'SRB': 'RS',
  'MNE': 'ME',
  'BIH': 'BA',
  'MKD': 'MK',
  'ALB': 'AL',
  'MLT': 'MT',
  'CYP': 'CY',
  'EST': 'EE',
  'LTU': 'LT',
  'LVA': 'LV',
  'LUX': 'LU',
  'ISL': 'IS',
  'IRL': 'IE',
  'PRT': 'PT',
  'GRC': 'GR',
  'BGR': 'BG',
  'ROU': 'RO',
  'SVN': 'SI',
  'HRV': 'HR',
  'SVK': 'SK',
  'CZE': 'CZ',
  'POL': 'PL',
  'DNK': 'DK',
  'NOR': 'NO',
  'SWE': 'SE',
  'CHE': 'CH',
  'AUT': 'AT',
  'NLD': 'NL',
  'BEL': 'BE',
  'HUN': 'HU',
  'TUR': 'TR',
  'QAT': 'QA',
  'SAU': 'SA',
  'UAE': 'AE',
  'SGP': 'SG',
  'IND': 'IN',
  'KOR': 'KR',
  'THA': 'TH',
  'RUS': 'RU',
  'CHN': 'CN',
  'JPN': 'JP',
  'MEX': 'MX',
  'BRA': 'BR',
  'USA': 'US',
  'CAN': 'CA',
  'AUS': 'AU',
  'ITA': 'IT',
  'ESP': 'ES',
  'FRA': 'FR',
  'FIN': 'FI',
  'DEU': 'DE',
  'MCO': 'MC',
  'GBR': 'GB',
  'NED': 'NL'
};

interface Driver {
  id: string;
  name: string;
  number: string;
  team: string;
  nationality: string;
  image: string;
  team_color: string;
}

interface DriverProfileCardProps {
  driver: Driver;
}

const darkenColor = (hex: string, percent: number): string => {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const factor = (100 - percent) / 100;
  const darkenedR = Math.round(Math.max(0, r * factor));
  const darkenedG = Math.round(Math.max(0, g * factor));
  const darkenedB = Math.round(Math.max(0, b * factor));
  return `#${darkenedR.toString(16).padStart(2, '0')}${darkenedG.toString(16).padStart(2, '0')}${darkenedB.toString(16).padStart(2, '0')}`;
};

const DriverProfileCard: React.FC<DriverProfileCardProps> = ({ driver }) => {
  const teamColor = `#${driver.team_color || '666666'}`;
  const cardStyle = {
    '--team-color-start': teamColor,
    '--team-color-end': darkenColor(teamColor, 20),
  } as React.CSSProperties;

  const textColorMode = getTextColorForBackground(driver.team_color);
  const cardClasses = `${styles.card} ${textColorMode === 'dark' ? styles.useDarkText : ''}`;

  const [firstName, ...lastNameParts] = driver.name.split(' ');
  const lastName = lastNameParts.join(' ');

  return (
    <Link to={`/drivers/${driver.id}`} className={styles.cardLink}>
      <div className={cardClasses} style={cardStyle}>
        <div className={styles.cardTop}>
          <div className={styles.driverInfo}>
            <h2 className={styles.driverName}>
              <span className={styles.firstName}>{firstName}</span>
              <span className={styles.lastName}>{lastName}</span>
            </h2>
            <p className={styles.teamName}>{driver.team}</p>
            <p className={styles.driverNumber}>{driver.number}</p>
          </div>

          <img
            src={driver.image || userIcon}
            alt={driver.name}
            className={styles.driverImage}
            onError={(e) => { e.currentTarget.src = userIcon; }}
          />
          
          <div className={styles.flagWrapper}>
            <ReactCountryFlag
              countryCode={countryCodeMap[driver.nationality] || ''}
              svg
              className={styles.flagImage}
              title={driver.nationality}
            />
          </div>
        </div>
        
        <div className={styles.cardBottom}>
          <span>View Profile</span>
        </div>
      </div>
    </Link>
  );
};

export default DriverProfileCard;
