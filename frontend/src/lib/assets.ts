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

// Import the local team logo map to avoid CORS issues
export { teamLogoMap } from './teamAssets';

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
