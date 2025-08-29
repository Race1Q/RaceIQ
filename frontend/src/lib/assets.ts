export const teamColors: { [key: string]: string } = {
  'Mercedes': '#00D2BE',
  'Red Bull Racing': '#0600EF',
  'Ferrari': '#DC0000',
  'McLaren': '#FF8700',
  'Aston Martin': '#006F62',
  'Alpine': '#0090FF',
  'Williams': '#005AFF',
  'Haas F1 Team': '#FFFFFF',
  'AlphaTauri': '#2B4562',
  'Alfa Romeo': '#900000',
};

// Simple SVG logo URLs from Wikimedia Commons
export const teamLogos: { [key: string]: string } = {
  'Mercedes': 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Logo_of_Mercedes-Benz_in_flat_design.svg',
  'Red Bull Racing': 'https://upload.wikimedia.org/wikipedia/en/6/6d/Red_Bull_Racing_logo.svg',
  'Ferrari': 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Ferrari-Logo.svg',
  'McLaren': 'https://upload.wikimedia.org/wikipedia/en/4/4e/McLaren_logo.svg',
  'Aston Martin': 'https://upload.wikimedia.org/wikipedia/en/5/5f/Aston_Martin_F1_Team_logo.svg',
  'Alpine': 'https://upload.wikimedia.org/wikipedia/en/4/45/Alpine_F1_Team_logo.svg',
  'Williams': 'https://upload.wikimedia.org/wikipedia/en/d/d5/Williams_logo_17.svg',
  'Haas F1 Team': 'https://upload.wikimedia.org/wikipedia/en/8/8a/Haas_F1_Team_logo.svg',
  'AlphaTauri': 'https://upload.wikimedia.org/wikipedia/en/8/8a/Scuderia_AlphaTauri_logo.svg',
  'Alfa Romeo': 'https://upload.wikimedia.org/wikipedia/en/7/7d/Alfa_Romeo_Racing_logo.svg',
};

// A utility function to get country flag URLs
export const getCountryFlagUrl = (countryCode: string) => {
  return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
};

// Driver abbreviations mapping
export const driverAbbreviations: { [key: string]: string } = {
  'Max Verstappen': 'VER',
  'Lewis Hamilton': 'HAM',
  'Charles Leclerc': 'LEC',
  'Lando Norris': 'NOR',
  'Carlos Sainz': 'SAI',
  'George Russell': 'RUS',
  'Fernando Alonso': 'ALO',
  'Oscar Piastri': 'PIA',
  'Lance Stroll': 'STR',
  'Pierre Gasly': 'GAS',
  'Esteban Ocon': 'OCO',
  'Alexander Albon': 'ALB',
  'Yuki Tsunoda': 'TSU',
  'Valtteri Bottas': 'BOT',
  'Nico Hulkenberg': 'HUL',
  'Sergio Perez': 'PER',
  'Daniel Ricciardo': 'RIC',
  'Zhou Guanyu': 'ZHO',
  'Kevin Magnussen': 'MAG',
  'Logan Sargeant': 'SAR',
};
