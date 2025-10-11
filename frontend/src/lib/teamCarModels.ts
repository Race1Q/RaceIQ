// frontend/src/lib/teamCarModels.ts

/**
 * Maps team names to their 3D car model paths
 * These models are used in the F1CockpitXR component
 */
export const teamCarModels: { [key: string]: string } = {
  "Red Bull": "/assets/f1-2021-red-bull-rb16b/source/F1 2021 RedBull RB16b.glb",
  "Mercedes": "/assets/f1-2023-mercedes-w14/source/mercedes_amg_petronas__w14_2023.glb",
  "Ferrari": "/assets/f1-2023-ferrari-sf23/source/F1 2023 Ferrari SF23 S2.glb",
  "McLaren": "/assets/f1-2024-mclaren-mcl38/source/F1 2024 Mclaren MCL38.glb",
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

