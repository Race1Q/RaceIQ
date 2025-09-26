// Map team names to existing files under /public/assets
// Prefer SVG when available; otherwise use provided PNG assets.
export const teamLogoMap: { [key: string]: string } = {
  "Red Bull": "/assets/Red_Bull_Racing_logo.svg.png",
  "Mercedes": "/assets/Mercedes_F1_Logo.svg.png",
  "Ferrari": "/assets/Ferrari-Logo.png",
  "McLaren": "/assets/McLaren_Racing_logo.svg.png",
  "Aston Martin": "/assets/aston-martin-f1-seeklogo.png",
  "Alpine F1 Team": "/assets/Alpine_F1_Team_Logo.svg.png",
  "Williams": "/assets/Williams_Racing_logo.svg.png",
  "Haas F1 Team": "/assets/Haas_F1_Team_Logo.svg.png",
  "RB F1 Team": "/assets/Logotipo_da_RB_F1_Team.png",
  "Sauber": "/assets/Sauber_F1_Team_logo.svg.png",
};

// Normalize varying API names with sponsors to a canonical key used above
export function getTeamLogo(teamName: string | undefined | null): string {
  if (!teamName) return teamLogoMap["Default"];
  const name = teamName.toLowerCase();

  // RB / AlphaTauri variants
  if (name.includes('visa cash app rb') || name.includes('vcarb') || name.includes('RB F1 Team') || name.includes('alphatauri')) {
    return teamLogoMap['RB F1 Team'] || teamLogoMap['Default'];
  }

  // Sauber / Stake / Alfa Romeo variants
  if (name.includes('stake') || name.includes('Sauber') || name.includes('alfa romeo')) {
    return teamLogoMap['Sauber'] || teamLogoMap['Default'];
  }

  // Mercedes variants
  if (name.includes('mercedes')) {
    return teamLogoMap['Mercedes'] || teamLogoMap['Default'];
  }

  // Red Bull variants
  if (name.includes('red bull')) {
    return teamLogoMap['Red Bull Racing'] || teamLogoMap['Default'];
  }

  // Ferrari variants
  if (name.includes('ferrari')) {
    return teamLogoMap['Ferrari'] || teamLogoMap['Default'];
  }

  // McLaren variants
  if (name.includes('mclaren')) {
    return teamLogoMap['McLaren'] || teamLogoMap['Default'];
  }

  // Aston Martin variants
  if (name.includes('aston martin')) {
    return teamLogoMap['Aston Martin'] || teamLogoMap['Default'];
  }

  // Alpine variants
  if (name.includes('alpine')) {
    return teamLogoMap['Alpine'] || teamLogoMap['Default'];
  }

  // Williams variants
  if (name.includes('williams')) {
    return teamLogoMap['Williams'] || teamLogoMap['Default'];
  }

  // Haas variants
  if (name.includes('haas')) {
    return teamLogoMap['Haas F1 Team'] || teamLogoMap['Default'];
  }

  // Default passthrough if we have an exact key
  if (teamLogoMap[teamName]) return teamLogoMap[teamName];
  return teamLogoMap['Default'];
}

