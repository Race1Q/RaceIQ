// Map team names to existing files under /public/assets
// Prefer SVG when available; otherwise use provided PNG assets.
export const teamLogoMap: { [key: string]: string } = {
  "Red Bull Racing": "/assets/teamLogos/2025redbullracinglogowhite.png",
  "Mercedes": "/assets/teamLogos/2025mercedeslogowhite.png",
  "Ferrari": "/assets/teamLogos/2025ferrarilogolight.png",
  "McLaren": "/assets/teamLogos/2025mclarenlogowhite.png",
  "Aston Martin": "/assets/teamLogos/2025astonmartinlogowhite.png",
  "Alpine": "/assets/teamLogos/2025alpinelogowhite.png",
  "Williams": "/assets/teamLogos/2025williamslogowhite.png",
  "Haas F1 Team": "/assets/teamLogos/2025haaslogowhite.png",
  "RB F1 Team": "/assets/teamLogos/2025racingbullslogowhite.png",
  "Sauber": "/assets/teamLogos/2025kicksauberlogowhite.png",
  "Default": "/assets/logos/f1-logo.svg"
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

