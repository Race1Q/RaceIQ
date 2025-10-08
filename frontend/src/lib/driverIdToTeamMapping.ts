// frontend/src/lib/driverIdToTeamMapping.ts
// Driver ID to Team Name Mapping for 2025 F1 Season

export const driverIdToTeamMapping: { [driverId: string]: string } = {
  // Based on fallback data and current 2025 season
  "1": "Red Bull Racing",      // Max Verstappen
  "2": "McLaren",              // Lando Norris
  "3": "Ferrari",              // Charles Leclerc
  "4": "McLaren",              // Oscar Piastri
  "5": "Ferrari",              // Carlos Sainz
  "6": "Ferrari",              // Lewis Hamilton
  "7": "Mercedes",             // George Russell
  "8": "Aston Martin",         // Fernando Alonso
  "9": "Aston Martin",         // Lance Stroll
  "10": "Alpine",              // Pierre Gasly
  "11": "Alpine",              // Jack Doohan
  "12": "Williams",            // Alexander Albon
  "13": "Williams",            // Carlos Sainz (moved to Williams)
  "14": "Haas",                // Oliver Bearman
  "15": "Haas",                // Esteban Ocon
  "16": "Sauber",              // Nico Hulkenberg
  "17": "Sauber",              // Gabriel Bortoleto
  "18": "RB F1 Team",          // Yuki Tsunoda
  "19": "RB F1 Team",          // Isack Hadjar
  "20": "Red Bull Racing",     // Liam Lawson
  
  // Additional drivers from fallback data
  "609": "McLaren",            // Oscar Piastri (fallback ID)
  
  // 2024 drivers (for historical data)
  "21": "Red Bull Racing",     // Sergio Perez
  "22": "Williams",            // Logan Sargeant
  "23": "Haas",                // Kevin Magnussen
  "24": "Sauber",              // Valtteri Bottas
  "25": "Sauber",              // Zhou Guanyu
  "26": "RB F1 Team",          // Daniel Ricciardo
  "27": "Williams",            // Franco Colapinto
};

// Function to get team name from driver ID
export function getTeamNameFromDriverId(driverId: string | undefined): string {
  if (!driverId) return "Default";
  return driverIdToTeamMapping[driverId] || "Default";
}
