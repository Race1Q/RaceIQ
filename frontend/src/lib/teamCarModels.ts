// frontend/src/lib/teamCarModels.ts

/**
 * Maps team names to their 3D car model paths
 * These models are used in the F1CockpitXR component
 */
export const teamCarModels: { [key: string]: string } = {
  "Red Bull": "/assets/car-models/f1-2025-red-bull-rb21/source/f1-2025_redbull_rb21.glb",
  "Mercedes": "/assets/car-models/f1-2023-mercedes-w14/source/mercedes_amg_petronas__w14_2023.glb",
  "Ferrari": "/assets/car-models/f1-2023-ferrari-sf23/source/F1 2023 Ferrari SF23 S2.glb",
  "McLaren": "/assets/car-models/f1-2024-mclaren-mcl38/source/F1 2024 Mclaren MCL38.glb",
  "Aston Martin": "/assets/car-models/f1-2023-aston-martin-amr23/source/aston_martin_f1_amr23_2023.glb",
  "Alpine F1 Team": "/assets/car-models/f1-2025-alpine-a525/source/f1-2025_alpine_a525.glb",
  "Williams": "/assets/car-models/f1-2022-williams-fw44/source/f1_2022_williams_fw44.glb",
  "RB F1 Team": "/assets/car-models/f1-2024-rb-vcarb01/source/visa_cash_app_red_bull_racing_vcarb01.glb",
  "Sauber": "/assets/car-models/f1-2024-kick-sauber-c44/source/Kick_Sauber_C44.glb",
  "Haas F1 Team": "/assets/car-models/f1-2022-haas-vf22/source/f1_2022_haas_vf22.glb",
};

/**
 * Get the 3D model path for a team
 * Falls back to Red Bull model if team not found
 */
export function getTeamCarModel(teamName: string | undefined): string {
  if (!teamName) {
    return teamCarModels["Red Bull"];
  }
  
  return teamCarModels[teamName] || teamCarModels["Red Bull"];
}

