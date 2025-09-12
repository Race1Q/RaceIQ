// frontend/src/lib/countryCodeUtils.ts
// This maps the 3-letter ISO country codes from the backend API to 2-letter ISO codes for react-country-flag
export const countryCodeMap: { [key: string]: string } = {
  // Common F1 driver nationalities (3-letter to 2-letter mapping)
  'GBR': 'GB',  // United Kingdom
  'NED': 'NL',  // Netherlands
  'MON': 'MC',  // Monaco
  'GER': 'DE',  // Germany
  'FIN': 'FI',  // Finland
  'FRA': 'FR',  // France
  'ESP': 'ES',  // Spain
  'ITA': 'IT',  // Italy
  'AUS': 'AU',  // Australia
  'CAN': 'CA',  // Canada
  'USA': 'US',  // United States
  'BRA': 'BR',  // Brazil
  'MEX': 'MX',  // Mexico
  'JPN': 'JP',  // Japan
  'CHN': 'CN',  // China
  'RUS': 'RU',  // Russia
  'THA': 'TH',  // Thailand
  'KOR': 'KR',  // South Korea
  'IND': 'IN',  // India
  'SGP': 'SG',  // Singapore
  'UAE': 'AE',  // United Arab Emirates
  'SAU': 'SA',  // Saudi Arabia
  'QAT': 'QA',  // Qatar
  'TUR': 'TR',  // Turkey
  'HUN': 'HU',  // Hungary
  'BEL': 'BE',  // Belgium
  'NLD': 'NL',  // Netherlands (alternative)
  'AUT': 'AT',  // Austria
  'CHE': 'CH',  // Switzerland
  'SWE': 'SE',  // Sweden
  'NOR': 'NO',  // Norway
  'DEN': 'DK',  // Denmark
  'POL': 'PL',  // Poland
  'CZE': 'CZ',  // Czech Republic
  'SVK': 'SK',  // Slovakia
  'HRV': 'HR',  // Croatia
  'SVN': 'SI',  // Slovenia
  'ROU': 'RO',  // Romania
  'BGR': 'BG',  // Bulgaria
  'GRC': 'GR',  // Greece
  'PRT': 'PT',  // Portugal
  'IRL': 'IE',  // Ireland
  'ISL': 'IS',  // Iceland
  'LUX': 'LU',  // Luxembourg
  'LVA': 'LV',  // Latvia
  'LTU': 'LT',  // Lithuania
  'EST': 'EE',  // Estonia
  'CYP': 'CY',  // Cyprus
  'MLT': 'MT',  // Malta
  'ALB': 'AL',  // Albania
  'MKD': 'MK',  // North Macedonia
  'BIH': 'BA',  // Bosnia and Herzegovina
  'MNE': 'ME',  // Montenegro
  'SRB': 'RS',  // Serbia
  'KOS': 'XK',  // Kosovo
  'MDA': 'MD',  // Moldova
  'UKR': 'UA',  // Ukraine
  'BLR': 'BY',  // Belarus
  'GEO': 'GE',  // Georgia
  'ARM': 'AM',  // Armenia
  'AZE': 'AZ',  // Azerbaijan
  'KAZ': 'KZ',  // Kazakhstan
  'UZB': 'UZ',  // Uzbekistan
  'TKM': 'TM',  // Turkmenistan
  'TJK': 'TJ',  // Tajikistan
  'KGZ': 'KG',  // Kyrgyzstan
  'MNG': 'MN',  // Mongolia
  'AFG': 'AF',  // Afghanistan
  'PAK': 'PK',  // Pakistan
  'IRN': 'IR',  // Iran
  'IRQ': 'IQ',  // Iraq
  'SYR': 'SY',  // Syria
  'LBN': 'LB',  // Lebanon
  'ISR': 'IL',  // Israel
  'PSE': 'PS',  // Palestine
  'JOR': 'JO',  // Jordan
  'YEM': 'YE',  // Yemen
  'OMN': 'OM',  // Oman
  'KWT': 'KW',  // Kuwait
  'BHR': 'BH',  // Bahrain
  'EGY': 'EG',  // Egypt
  'LBY': 'LY',  // Libya
  'TUN': 'TN',  // Tunisia
  'DZA': 'DZ',  // Algeria
  'MAR': 'MA',  // Morocco
  'ESH': 'EH',  // Western Sahara
  'MRT': 'MR',  // Mauritania
  'MLI': 'ML',  // Mali
  'NER': 'NE',  // Niger
  'TCD': 'TD',  // Chad
  'SDN': 'SD',  // Sudan
  'SSD': 'SS',  // South Sudan
  'ETH': 'ET',  // Ethiopia
  'ERI': 'ER',  // Eritrea
  'DJI': 'DJ',  // Djibouti
  'SOM': 'SO',  // Somalia
  'KEN': 'KE',  // Kenya
  'UGA': 'UG',  // Uganda
  'RWA': 'RW',  // Rwanda
  'BDI': 'BI',  // Burundi
  'TZA': 'TZ',  // Tanzania
  'MOZ': 'MZ',  // Mozambique
  'ZWE': 'ZW',  // Zimbabwe
  'ZMB': 'ZM',  // Zambia
  'MWI': 'MW',  // Malawi
  'AGO': 'AO',  // Angola
  'NAM': 'NA',  // Namibia
  'BWA': 'BW',  // Botswana
  'ZAF': 'ZA',  // South Africa
  'LSO': 'LS',  // Lesotho
  'SWZ': 'SZ',  // Eswatini
  'MDG': 'MG',  // Madagascar
  'COM': 'KM',  // Comoros
  'MUS': 'MU',  // Mauritius
  'SYC': 'SC',  // Seychelles
  'CPV': 'CV',  // Cape Verde
  'GMB': 'GM',  // Gambia
  'SEN': 'SN',  // Senegal
  'GIN': 'GN',  // Guinea
  'GNB': 'GW',  // Guinea-Bissau
  'SLE': 'SL',  // Sierra Leone
  'LBR': 'LR',  // Liberia
  'CIV': 'CI',  // Ivory Coast
  'GHA': 'GH',  // Ghana
  'TGO': 'TG',  // Togo
  'BEN': 'BJ',  // Benin
  'NGA': 'NG',  // Nigeria
  'CMR': 'CM',  // Cameroon
  'CAF': 'CF',  // Central African Republic
  'GAB': 'GA',  // Gabon
  'COG': 'CG',  // Republic of the Congo
  'COD': 'CD',  // Democratic Republic of the Congo
  'GNQ': 'GQ',  // Equatorial Guinea
  'STP': 'ST',  // São Tomé and Príncipe
  'BFA': 'BF',  // Burkina Faso
  'DEU': 'DE',  // Germany (alternative)
  'MCO': 'MC',  // Monaco (alternative)
};

// Function to get country code for a circuit
export const getCountryCode = (circuitId: number): string => {
  // This is a simplified mapping - you'll need to expand this based on your actual circuit data
  // For now, returning a default or you can create a more comprehensive mapping
  const circuitCountryMap: { [key: number]: string } = {
    // Add your circuit IDs and their corresponding country codes here
    // Example: 1: 'GB', 2: 'IT', etc.
  };
  
  return circuitCountryMap[circuitId] || 'GB'; // Default to GB if not found
};
