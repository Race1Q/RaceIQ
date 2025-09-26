// src/types/races.ts
// UI-friendly Race type used by the pages and cards.

export type Race = {
  id: number;
  name: string;
  round: number;
  date: string;        // "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm:ss"
  circuit_id: number;  // numeric for consistency in frontend
  season_id: number;   // year (e.g., 2025)
};
