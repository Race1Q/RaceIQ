// src/theme/teamTokens.ts
export type TeamKey =
  | "red_bull" | "ferrari" | "mercedes" | "mclaren" | "aston_martin"
  | "alpine" | "rb" | "sauber" | "williams" | "haas" | "historical";

export const TEAM_META: Record<TeamKey, {
  name: string;
  hex: string;         // primary
  gradient: string;    // bg gradient
  logo?: string;       // optional logo watermark path
  textOn?: string;     // text contrast color
}> = {
  red_bull:     { name:"Red Bull Racing", hex:"#1E41FF", gradient:"linear-gradient(135deg,#0e174a 0%,#1a2b7a 55%,#091235 100%)", textOn:"#E6ECFF", logo:"/assets/logos/Red_Bull.svg" },
  ferrari:      { name:"Ferrari",      hex:"#DC143C", gradient:"linear-gradient(135deg,#3e0b10 0%,#9c0f1c 55%,#4b0d13 100%)", textOn:"#FFF4F4", logo:"/assets/logos/Ferrari.svg" },
  mercedes:     { name:"Mercedes",     hex:"#00D2BE", gradient:"linear-gradient(135deg,#0a1b1b 0%,#0b3a3a 60%,#071212 100%)", textOn:"#E8FFFD", logo:"/assets/logos/Mercedes.svg" },
  mclaren:      { name:"McLaren",      hex:"#FF8700", gradient:"linear-gradient(135deg,#2c1600 0%,#6a3b00 60%,#1a0c00 100%)", textOn:"#FFF4E6", logo:"/assets/logos/McLaren_Racing_logo.svg" },
  aston_martin: { name:"Aston Martin", hex:"#006F62", gradient:"linear-gradient(135deg,#062220 0%,#0f3f39 60%,#081c19 100%)", textOn:"#E9FFFB", logo:"/assets/logos/Aston_Martin.svg" },
  alpine:       { name:"Alpine F1 Team", hex:"#0090FF", gradient:"linear-gradient(135deg,#0B1730 0%,#17366b 60%,#0a1224 100%)", textOn:"#EAF2FF", logo:"/assets/logos/Alpine_F1_Team.svg" },
  rb:           { name:"RB F1 Team",   hex:"#6692FF", gradient:"linear-gradient(135deg,#111425 0%,#2b3773 60%,#0c1023 100%)", textOn:"#EEF0FF", logo:"/assets/logos/RB_F1_Team.svg" },
  sauber:       { name:"Kick Sauber",  hex:"#52C41A", gradient:"linear-gradient(135deg,#0f2014 0%,#1d5a2c 60%,#0b160f 100%)", textOn:"#ECFFF1", logo:"/assets/logos/Kick_Sauber.svg" },
  williams:     { name:"Williams",     hex:"#37A9FF", gradient:"linear-gradient(135deg,#0b1420 0%,#244e7b 60%,#0a121c 100%)", textOn:"#E9F3FF", logo:"/assets/logos/Williams_Racing.svg" },
  haas:         { name:"Haas F1 Team", hex:"#B0B0B0", gradient:"linear-gradient(135deg,#1a1a1a 0%,#3d3d3d 60%,#0f0f0f 100%)", textOn:"#F2F2F2", logo:"/assets/logos/Haas_F1_Team.svg" },
  historical:   { name:"Historical Team", hex:"#8B7355", gradient:"linear-gradient(135deg,#1a1612 0%,#3d2f24 60%,#0f0d0a 100%)", textOn:"#E8DCC8", logo:"/assets/logos/f1Logo.webp" },
};

// Country color schemes for historical teams
export const COUNTRY_COLORS: Record<string, {
  hex: string;
  gradient: string;
  textOn: string;
}> = {
  // European Countries
  'British': { hex: '#00247D', gradient: 'linear-gradient(135deg,#00102e 0%,#001f5c 60%,#000a1a 100%)', textOn: '#E6ECFF' },
  'Italian': { hex: '#009246', gradient: 'linear-gradient(135deg,#002813 0%,#004d23 60%,#00140c 100%)', textOn: '#E8FFE8' },
  'German': { hex: '#DD0000', gradient: 'linear-gradient(135deg,#2e0000 0%,#6b0000 60%,#1a0000 100%)', textOn: '#FFE6E6' },
  'French': { hex: '#0055A4', gradient: 'linear-gradient(135deg,#001528 0%,#00356b 60%,#000c15 100%)', textOn: '#E6F0FF' },
  'Austrian': { hex: '#ED2939', gradient: 'linear-gradient(135deg,#3d0a0f 0%,#8b1420 60%,#1f050a 100%)', textOn: '#FFE8EA' },
  'Swiss': { hex: '#FF0000', gradient: 'linear-gradient(135deg,#330000 0%,#990000 60%,#1a0000 100%)', textOn: '#FFE6E6' },
  'Spanish': { hex: '#AA151B', gradient: 'linear-gradient(135deg,#2b0506 0%,#660d10 60%,#160304 100%)', textOn: '#FFE6E7' },
  'Dutch': { hex: '#FF6600', gradient: 'linear-gradient(135deg,#331400 0%,#994400 60%,#1a0a00 100%)', textOn: '#FFF0E6' },
  
  // Americas
  'American': { hex: '#B22234', gradient: 'linear-gradient(135deg,#2d090d 0%,#6b1420 60%,#17050a 100%)', textOn: '#FFE6E9' },
  'Canadian': { hex: '#FF0000', gradient: 'linear-gradient(135deg,#330000 0%,#990000 60%,#1a0000 100%)', textOn: '#FFE6E6' },
  'Brazilian': { hex: '#009739', gradient: 'linear-gradient(135deg,#002613 0%,#005224 60%,#00130c 100%)', textOn: '#E6FFEF' },
  'Mexican': { hex: '#006847', gradient: 'linear-gradient(135deg,#001a15 0%,#00442c 60%,#000d0b 100%)', textOn: '#E6FFF5' },
  'Argentine': { hex: '#74ACDF', gradient: 'linear-gradient(135deg,#1a2838 0%,#3d5a75 60%,#0d141c 100%)', textOn: '#E6F4FF' },
  
  // Asia & Oceania
  'Japanese': { hex: '#BC002D', gradient: 'linear-gradient(135deg,#2f0009 0%,#6b0017 60%,#180005 100%)', textOn: '#FFE6EB' },
  'Australian': { hex: '#00008B', gradient: 'linear-gradient(135deg,#000023 0%,#000056 60%,#000012 100%)', textOn: '#E6E6FF' },
  'Thai': { hex: '#2D2A4A', gradient: 'linear-gradient(135deg,#0a0912 0%,#1a1829 60%,#050509 100%)', textOn: '#E9E8F0' },
  'Malaysian': { hex: '#CC0001', gradient: 'linear-gradient(135deg,#330000 0%,#800001 60%,#1a0000 100%)', textOn: '#FFE6E6' },
  'Indian': { hex: '#FF9933', gradient: 'linear-gradient(135deg,#33200a 0%,#995c1f 60%,#1a1005 100%)', textOn: '#FFF4E6' },
  
  // Africa & Middle East
  'South African': { hex: '#007A4D', gradient: 'linear-gradient(135deg,#001f16 0%,#00503d 60%,#000f0b 100%)', textOn: '#E6FFF7' },
  
  // Fallback for unknown nationalities
  'default': { hex: '#8B7355', gradient: 'linear-gradient(135deg,#1a1612 0%,#3d2f24 60%,#0f0d0a 100%)', textOn: '#E8DCC8' },
};