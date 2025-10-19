export type TeamId = string;
export type SeasonYear = number;

export type SeasonTeamRatings = Record<TeamId, number>;
export type CSITable = Record<SeasonYear, SeasonTeamRatings>;

// Historical Constructor Strength Index (2000-2025)
// Values represent relative car performance for each season:
//  - 1.30–1.40 → dominant (e.g., Red Bull 2010–2013, Mercedes 2014–2020)
//  - 1.10–1.20 → strong contenders (Ferrari 2002, McLaren 2007, etc.)
//  - 0.90–1.00 → midfield
//  - 0.75–0.85 → backmarkers
//  - 0.65–0.70 → tail-end / newcomers
export const CSI_TABLE: CSITable = {
  2000: { ferrari: 1.35, mclaren: 1.20, williams: 1.00, benetton: 0.90, jaguar: 0.85, sauber: 0.85, jordan: 0.90, arrows: 0.80, prost: 0.75, minardi: 0.70 },
  2001: { ferrari: 1.35, mclaren: 1.15, williams: 1.10, sauber: 0.90, jordan: 0.85, bar: 0.85, jaguar: 0.80, arrows: 0.75, prost: 0.70, minardi: 0.70 },
  2002: { ferrari: 1.40, williams: 1.15, mclaren: 1.10, renault: 1.00, sauber: 0.90, jordan: 0.85, bar: 0.85, jaguar: 0.80, arrows: 0.75, minardi: 0.70 },
  2003: { ferrari: 1.30, williams: 1.20, mclaren: 1.10, renault: 1.00, sauber: 0.90, jordan: 0.85, bar: 0.90, jaguar: 0.85, minardi: 0.70 },
  2004: { ferrari: 1.40, renault: 1.10, bar: 1.10, williams: 1.00, mclaren: 0.95, sauber: 0.90, toyota: 0.85, jaguar: 0.85, jordan: 0.75, minardi: 0.70 },
  2005: { renault: 1.30, mclaren: 1.25, ferrari: 1.00, toyota: 1.00, williams: 0.95, bar: 0.90, sauber: 0.90, red_bull: 0.85, jordan: 0.75, minardi: 0.70 },
  2006: { renault: 1.30, ferrari: 1.25, mclaren: 1.05, honda: 1.00, bmw_sauber: 0.95, toyota: 0.90, red_bull: 0.85, williams: 0.85, toro_rosso: 0.80, spyker: 0.70 },
  2007: { ferrari: 1.30, mclaren: 1.30, bmw_sauber: 1.10, renault: 1.00, williams: 0.95, red_bull: 0.90, toyota: 0.85, toro_rosso: 0.80, honda: 0.75, spyker: 0.70 },
  2008: { ferrari: 1.25, mclaren: 1.25, bmw_sauber: 1.10, renault: 1.00, toyota: 0.95, toro_rosso: 0.90, red_bull: 0.90, williams: 0.85, honda: 0.75, force_india: 0.70 },
  2009: { brawn: 1.35, red_bull: 1.25, mclaren: 1.00, ferrari: 1.00, toyota: 1.00, williams: 0.95, bmw_sauber: 0.90, renault: 0.85, toro_rosso: 0.80, force_india: 0.75 },
  2010: { red_bull: 1.35, mclaren: 1.20, ferrari: 1.15, mercedes: 0.95, renault: 0.90, williams: 0.85, force_india: 0.85, sauber: 0.80, toro_rosso: 0.80, lotus: 0.70, virgin: 0.70, hrt: 0.65 },
  2011: { red_bull: 1.35, mclaren: 1.20, ferrari: 1.10, mercedes: 0.95, renault: 0.90, force_india: 0.85, sauber: 0.85, toro_rosso: 0.80, williams: 0.75, lotus: 0.70, virgin: 0.70, hrt: 0.65 },
  2012: { red_bull: 1.30, ferrari: 1.15, mclaren: 1.15, lotus: 1.10, mercedes: 0.95, sauber: 0.90, force_india: 0.90, williams: 0.90, toro_rosso: 0.80, caterham: 0.70, marussia: 0.70, hrt: 0.65 },
  2013: { red_bull: 1.35, mercedes: 1.15, ferrari: 1.10, lotus: 1.05, mclaren: 0.90, force_india: 0.90, sauber: 0.85, toro_rosso: 0.85, williams: 0.80, caterham: 0.70, marussia: 0.70 },
  2014: { mercedes: 1.40, red_bull: 1.20, williams: 1.10, ferrari: 1.00, force_india: 0.95, mclaren: 0.95, toro_rosso: 0.85, lotus: 0.80, sauber: 0.80, marussia: 0.75, caterham: 0.70 },
  2015: { mercedes: 1.40, ferrari: 1.20, williams: 1.00, red_bull: 0.95, force_india: 0.95, toro_rosso: 0.90, lotus: 0.85, sauber: 0.80, mclaren: 0.75, manor: 0.70 },
  2016: { mercedes: 1.40, red_bull: 1.20, ferrari: 1.10, force_india: 0.95, williams: 0.95, toro_rosso: 0.90, mclaren: 0.85, haas: 0.85, renault: 0.80, sauber: 0.75, manor: 0.70 },
  2017: { mercedes: 1.35, ferrari: 1.25, red_bull: 1.20, force_india: 0.95, williams: 0.90, renault: 0.90, toro_rosso: 0.85, haas: 0.85, mclaren: 0.80, sauber: 0.75 },
  2018: { mercedes: 1.35, ferrari: 1.30, red_bull: 1.20, renault: 1.00, haas: 0.95, force_india: 0.95, mclaren: 0.85, sauber: 0.85, toro_rosso: 0.80, williams: 0.70 },
  2019: { mercedes: 1.40, ferrari: 1.25, red_bull: 1.20, mclaren: 1.00, renault: 0.95, toro_rosso: 0.90, racing_point: 0.90, alfa_romeo: 0.85, haas: 0.80, williams: 0.70 },
  2020: { mercedes: 1.40, red_bull: 1.25, mclaren: 1.05, racing_point: 1.05, renault: 1.00, ferrari: 0.90, alpha_tauri: 0.90, alfa_romeo: 0.80, haas: 0.75, williams: 0.70 },
  2021: { mercedes: 1.35, red_bull: 1.35, ferrari: 1.10, mclaren: 1.05, alpine: 0.95, alpha_tauri: 0.95, aston_martin: 0.90, williams: 0.80, alfa_romeo: 0.75, haas: 0.70 },
  2022: { red_bull: 1.35, ferrari: 1.25, mercedes: 1.15, alpine: 1.00, mclaren: 0.95, alfa_romeo: 0.90, aston_martin: 0.90, haas: 0.85, alpha_tauri: 0.85, williams: 0.75 },
  2023: { red_bull: 1.40, mercedes: 1.10, ferrari: 1.10, mclaren: 1.05, aston_martin: 1.00, alpine: 0.90, williams: 0.85, alpha_tauri: 0.85, alfa_romeo: 0.80, haas: 0.75 },
  2024: { red_bull: 1.30, mclaren: 1.15, ferrari: 1.10, mercedes: 1.00, aston_martin: 0.95, rb: 0.90, haas: 0.85, williams: 0.85, sauber: 0.80, alpine: 0.80 },
  2025: { mclaren: 1.35, red_bull: 1.12, mercedes: 1.12, ferrari: 1.00, aston_martin: 0.95, rb: 0.90, alpine: 0.85, williams: 0.85, haas: 0.82, sauber: 0.80 },
};

// Mapping from database constructor names to CSI team keys
export const CSI_TEAM_MAPPING: Record<string, string> = {
  // Modern teams (2020-2025)
  'Red Bull Racing': 'red_bull',
  'Red Bull': 'red_bull', 
  'Mercedes': 'mercedes',
  'Ferrari': 'ferrari',
  'McLaren': 'mclaren',
  'Aston Martin': 'aston_martin',
  'Alpine': 'alpine',
  'AlphaTauri': 'alpha_tauri',
  'RB': 'rb',
  'Williams': 'williams',
  'Haas F1 Team': 'haas',
  'Haas': 'haas',
  'Sauber': 'sauber',
  'Alfa Romeo': 'alfa_romeo',
  
  // Historical teams
  'Force India': 'force_india',
  'Racing Point': 'racing_point',
  'Lotus': 'lotus',
  'Toro Rosso': 'toro_rosso',
  'BMW Sauber': 'bmw_sauber',
  'Honda': 'honda',
  'Toyota': 'toyota',
  'Renault': 'renault',
  'BAR': 'bar',
  'Jaguar': 'jaguar',
  'Jordan': 'jordan',
  'Arrows': 'arrows',
  'Prost': 'prost',
  'Minardi': 'minardi',
  'Brawn': 'brawn',
  'Virgin': 'virgin',
  'HRT': 'hrt',
  'Caterham': 'caterham',
  'Marussia': 'marussia',
  'Manor': 'manor',
  'Spyker': 'spyker',
  'Benetton': 'benetton',
};

// --- Helper functions ---
export function clampCSI(v: number, lo = 0.6, hi = 1.6): number {
  return Math.min(hi, Math.max(lo, v));
}

export function getCSI(season: SeasonYear, team: TeamId): number {
  const seasonTable = CSI_TABLE[season];
  if (!seasonTable) return 1.0;
  return clampCSI(seasonTable[team] ?? 1.0);
}

export function getCSIForDriver(season: number, constructorName: string): number {
  const teamKey = CSI_TEAM_MAPPING[constructorName] || constructorName.toLowerCase().replace(/\s+/g, '_');
  return getCSI(season, teamKey);
}

export function getCSIForConstructor(season: number, constructorName: string): number {
  const teamKey = CSI_TEAM_MAPPING[constructorName] || constructorName.toLowerCase().replace(/\s+/g, '_');
  return getCSI(season, teamKey);
}

export function applyCSIDampener(base01: number, csi: number, kind: "higher" | "lower", alpha = 0.3): number {
  if (kind === "higher") {
    // Driver in worse car gets moderate bonus (CSI < 1.0 gets bonus, CSI > 1.0 gets slight penalty)
    return base01 * Math.pow(csi, alpha);
  }
  // For "lower is better" metrics (DNFs), invert the logic
  return 1 - (1 - base01) * Math.pow(1 / csi, alpha);
}
