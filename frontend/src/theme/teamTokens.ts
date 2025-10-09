// src/theme/teamTokens.ts
export type TeamKey =
  | "red_bull" | "ferrari" | "mercedes" | "mclaren" | "aston_martin"
  | "alpine" | "rb" | "sauber" | "williams" | "haas";

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
};